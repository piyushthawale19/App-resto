/* eslint-disable */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || functions.config().razorpay?.key_id,
  key_secret:
    process.env.RAZORPAY_KEY_SECRET || functions.config().razorpay?.key_secret,
});

// ===== CREATE RAZORPAY ORDER =====
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth)
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be logged in",
    );

  const { amount, orderId } = data;
  if (!amount || !orderId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Amount and orderId are required",
    );
  }

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: orderId,
      notes: { firestoreOrderId: orderId, userId: context.auth.uid },
    });

    // Store Razorpay order ID in Firestore
    await db.collection("orders").doc(orderId).update({
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "created",
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    };
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Payment order creation failed",
    );
  }
});

// ===== VERIFY RAZORPAY PAYMENT =====
exports.verifyRazorpayPayment = functions.https.onCall(
  async (data, context) => {
    if (!context.auth)
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = data;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing payment verification data",
      );
    }

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET ||
      functions.config().razorpay?.key_secret;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await db.collection("orders").doc(orderId).update({
        paymentStatus: "failed",
        paymentError: "Signature verification failed",
      });
      throw new functions.https.HttpsError(
        "permission-denied",
        "Payment verification failed",
      );
    }

    // Payment verified — update order
    await db.collection("orders").doc(orderId).update({
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Payment verified successfully" };
  },
);

// ===== RAZORPAY WEBHOOK =====
exports.razorpayWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      functions.config().razorpay?.webhook_secret;
    const signature = req.headers["x-razorpay-signature"];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Webhook signature mismatch");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    try {
      switch (event) {
        case "payment.captured": {
          const payment = payload.payment.entity;
          const orderId = payment.notes?.firestoreOrderId;
          if (orderId) {
            await db.collection("orders").doc(orderId).update({
              paymentStatus: "paid",
              razorpayPaymentId: payment.id,
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
          break;
        }
        case "payment.failed": {
          const payment = payload.payment.entity;
          const orderId = payment.notes?.firestoreOrderId;
          if (orderId) {
            await db.collection("orders").doc(orderId).update({
              paymentStatus: "failed",
              paymentError: payment.error_description,
            });
          }
          break;
        }
      }
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// ===== ORDER STATUS NOTIFICATION (Firestore trigger) =====
exports.onOrderStatusChange = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    if (before.status !== after.status) {
      console.log(`Order ${orderId}: ${before.status} → ${after.status}`);

      // Auto-assign timing metadata
      const updates = {};
      if (after.status === "confirmed" && !after.confirmedAt) {
        updates.confirmedAt = admin.firestore.FieldValue.serverTimestamp();
      }
      if (after.status === "delivered" && !after.deliveredAt) {
        updates.deliveredAt = admin.firestore.FieldValue.serverTimestamp();
      }

      if (Object.keys(updates).length > 0) {
        await change.after.ref.update(updates);
      }

      // Clean up tracking on delivery/cancel
      if (["delivered", "cancelled"].includes(after.status)) {
        try {
          await db.collection("tracking").doc(orderId).delete();
        } catch (_e) {
          /* tracking doc may not exist */
        }
      }
    }
  });

// ===== ADMIN ROLE MANAGEMENT =====
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  if (!context.auth)
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Not authenticated",
    );

  // Only super_admin can set roles
  const callerDoc = await db.collection("admins").doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== "super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only super admins can manage roles",
    );
  }

  const { uid, role, email } = data;
  if (!uid || !role || !email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "uid, role, and email are required",
    );
  }

  await db.collection("admins").doc(uid).set({
    email,
    role,
    addedBy: context.auth.uid,
    addedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

// ===== CREATE ORDER WITH COUPON ATOMICALLY =====
exports.createOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

  const order = data?.order;
  if (!order) throw new functions.https.HttpsError('invalid-argument', 'Order data required');

  const couponCode = order.couponCode;

  try {
    // If couponCode provided, resolve coupon doc reference
    let couponRef = null;
    if (couponCode) {
      const couponQ = await db.collection('coupons').where('code', '==', couponCode).limit(1).get();
      if (couponQ.empty) {
        throw new functions.https.HttpsError('not-found', 'Coupon not found');
      }
      couponRef = couponQ.docs[0].ref;
    }

    const result = await db.runTransaction(async (tx) => {
      if (couponRef) {
        const snap = await tx.get(couponRef);
        if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Coupon not found');
        const data = snap.data();
        const usedCount = data.usedCount || 0;
        const usageLimit = data.usageLimit || 0;
        if (usedCount >= usageLimit) {
          throw new functions.https.HttpsError('failed-precondition', 'Coupon usage limit reached');
        }
        tx.update(couponRef, { usedCount: admin.firestore.FieldValue.increment(1) });
      }

      const orderRef = db.collection('orders').doc();
      const serverOrder = {
        ...order,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      tx.set(orderRef, serverOrder);
      return orderRef.id;
    });

    return { orderId: result };
  } catch (error) {
    console.error('createOrder error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Failed to create order');
  }
});
