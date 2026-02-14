import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Truck, MapPin,
    Tag, Ticket, Users as UsersIcon, Settings, LogOut, ChefHat, FolderTree,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'order_admin', 'delivery_admin'] },
    { to: '/categories', icon: FolderTree, label: 'Categories', roles: ['super_admin'] },
    { to: '/products', icon: Package, label: 'Products', roles: ['super_admin'] },
    { to: '/orders', icon: ShoppingCart, label: 'Orders', roles: ['super_admin', 'order_admin'] },
    { to: '/delivery-boys', icon: Truck, label: 'Delivery Boys', roles: ['super_admin', 'delivery_admin'] },
    { to: '/live-tracking', icon: MapPin, label: 'Live Tracking', roles: ['super_admin', 'delivery_admin'] },
    { to: '/offers', icon: Tag, label: 'Offers', roles: ['super_admin'] },
    { to: '/coupons', icon: Ticket, label: 'Coupons', roles: ['super_admin'] },
    { to: '/settings', icon: Settings, label: 'Settings', roles: ['super_admin'] },
];

export default function Layout() {
    const { adminUser, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const filteredNav = NAV_ITEMS.filter((item) =>
        item.roles.includes(adminUser?.role || '')
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-maroon text-white flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <ChefHat size={28} className="text-brand-yellow" />
                        <div>
                            <h1 className="text-xl font-bold">Yummyfi</h1>
                            <p className="text-xs text-white/60">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {filteredNav.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-white/15 text-brand-yellow'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                            {adminUser?.name?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{adminUser?.name}</p>
                            <p className="text-xs text-white/50 capitalize">{adminUser?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors w-full"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
