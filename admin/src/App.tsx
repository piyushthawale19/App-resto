import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import DeliveryBoys from './pages/DeliveryBoys';
import LiveTracking from './pages/LiveTracking';
import Offers from './pages/Offers';
import Coupons from './pages/Coupons';
import Settings from './pages/Settings';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAdmin, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-brand-maroon font-semibold text-lg">Loading...</p></div>;
    if (!isAdmin) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="orders" element={<Orders />} />
                <Route path="delivery-boys" element={<DeliveryBoys />} />
                <Route path="live-tracking" element={<LiveTracking />} />
                <Route path="offers" element={<Offers />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}
