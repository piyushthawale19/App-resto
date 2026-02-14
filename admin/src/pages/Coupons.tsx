import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Coupon } from '../types';
import { Plus, Trash2, Edit, Ticket, Copy } from 'lucide-react';

export default function Coupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
    const [form, setForm] = useState({
        code: '', discountPercent: '', maxDiscount: '', minOrderAmount: '',
        validFrom: '', validTo: '', usageLimit: '', description: '',
    });

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'coupons'), (snap) => {
            setCoupons(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Coupon)));
        });
        return unsub;
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const rawData = {
            code: form.code.toUpperCase(),
            discountPercent: Number(form.discountPercent),
            maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
            minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
            validFrom: form.validFrom,
            validTo: form.validTo,
            usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
            usedCount: editCoupon?.usedCount || 0,
            description: form.description,
            isActive: true,
        };

        const data = Object.fromEntries(
            Object.entries(rawData).filter(([, v]) => v !== undefined)
        );

        if (editCoupon) {
            await updateDoc(doc(db, 'coupons', editCoupon.id), data as any);
        } else {
            await addDoc(collection(db, 'coupons'), data as any);
        }
        resetForm();
    };

    const resetForm = () => {
        setForm({ code: '', discountPercent: '', maxDiscount: '', minOrderAmount: '', validFrom: '', validTo: '', usageLimit: '', description: '' });
        setEditCoupon(null);
        setShowForm(false);
    };

    const handleEdit = (c: Coupon) => {
        setForm({
            code: c.code,
            discountPercent: String(c.discountPercent),
            maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
            minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : '',
            validFrom: c.validFrom || '',
            validTo: c.validTo || '',
            usageLimit: c.usageLimit ? String(c.usageLimit) : '',
            description: c.description || '',
        });
        setEditCoupon(c);
        setShowForm(true);
    };

    const toggleActive = async (c: Coupon) => {
        await updateDoc(doc(db, 'coupons', c.id), { isActive: !c.isActive });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this coupon?')) await deleteDoc(doc(db, 'coupons', id));
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Coupons ({coupons.length})</h1>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-brand-maroon text-white px-4 py-2 rounded-lg hover:bg-brand-burgundy">
                    <Plus size={18} /> Add Coupon
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4">{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input className="w-full border rounded-lg px-3 py-2 uppercase" placeholder="Coupon Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            <div className="grid grid-cols-3 gap-3">
                                <input className="border rounded-lg px-3 py-2" placeholder="Discount %" type="number" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} required />
                                <input className="border rounded-lg px-3 py-2" placeholder="Max ₹ Off" type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} />
                                <input className="border rounded-lg px-3 py-2" placeholder="Min Order ₹" type="number" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500">Valid From</label>
                                    <input type="date" className="w-full border rounded-lg px-3 py-2" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} title="Valid from date" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Valid Until</label>
                                    <input type="date" className="w-full border rounded-lg px-3 py-2" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} title="Valid until date" />
                                </div>
                            </div>
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Usage Limit (leave empty for unlimited)" type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-brand-maroon text-white py-2 rounded-lg">{editCoupon ? 'Update' : 'Create'}</button>
                                <button type="button" onClick={resetForm} className="flex-1 border py-2 rounded-lg">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Discount</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Usage</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Validity</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((c) => (
                            <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Ticket size={14} className="text-brand-maroon" />
                                        <span className="font-mono font-bold text-sm">{c.code}</span>
                                        <button onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-gray-600" title="Copy code" aria-label="Copy code"><Copy size={12} /></button>
                                    </div>
                                    {c.description && <p className="text-xs text-gray-500 mt-1">{c.description}</p>}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {c.discountPercent}% {c.maxDiscount && `(max ₹${c.maxDiscount})`}
                                    {c.minOrderAmount > 0 && <p className="text-xs text-gray-400">Min ₹{c.minOrderAmount}</p>}
                                </td>
                                <td className="px-4 py-3 text-sm">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                    {c.validFrom && <span>{c.validFrom}</span>}
                                    {c.validTo && <span> — {c.validTo}</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleActive(c)} className={`text-xs font-medium px-2 py-1 rounded-full ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {c.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => handleEdit(c)} className="text-gray-400 hover:text-blue-500 p-1" title="Edit coupon" aria-label="Edit coupon"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500 p-1 ml-2" title="Delete coupon" aria-label="Delete coupon"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
