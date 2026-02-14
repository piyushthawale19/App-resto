import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Plus, Trash2, Edit, Search, X } from 'lucide-react';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [form, setForm] = useState({
        name: '', price: '', offerPrice: '', description: '', category: 'Main Course',
        imageUrl: '', isVeg: true, preparationTime: '',
    });

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'products'), (snap) => {
            const loaded = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Product));
            setProducts(loaded);
            setLoading(false);
        });
        return unsub;
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data: any = {
            name: form.name,
            price: Number(form.price),
            description: form.description,
            category: form.category,
            imageUrl: form.imageUrl,
            isVeg: form.isVeg,
            isAvailable: true,
        };

        // Only add optional fields if they have values
        if (form.offerPrice) {
            data.offerPrice = Number(form.offerPrice);
        }
        if (form.preparationTime) {
            data.preparationTime = Number(form.preparationTime);
        }

        if (editProduct) {
            await updateDoc(doc(db, 'products', editProduct.id), data);
        } else {
            await addDoc(collection(db, 'products'), data);
        }
        resetForm();
    };

    const resetForm = () => {
        setForm({ name: '', price: '', offerPrice: '', description: '', category: 'Main Course', imageUrl: '', isVeg: true, preparationTime: '' });
        setEditProduct(null);
        setShowForm(false);
    };

    const handleEdit = (p: Product) => {
        setForm({
            name: p.name,
            price: String(p.price),
            offerPrice: p.offerPrice ? String(p.offerPrice) : '',
            description: p.description,
            category: p.category,
            imageUrl: p.imageUrl,
            isVeg: p.isVeg,
            preparationTime: p.preparationTime ? String(p.preparationTime) : '',
        });
        setEditProduct(p);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this product?')) {
            await deleteDoc(doc(db, 'products', id));
        }
    };

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Products ({products.length})</h1>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-brand-maroon text-white px-4 py-2 rounded-lg hover:bg-brand-burgundy transition"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Search */}
            {!loading && (
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-maroon/20"
                    />
                </div>
            )}

            {loading && (
                <div className="text-center py-8 text-gray-500">Loading products...</div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600" title="Close" aria-label="Close modal">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-3">
                                <input className="w-full border rounded-lg px-3 py-2" placeholder="Price (₹)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                                <input className="w-full border rounded-lg px-3 py-2" placeholder="Offer Price (₹)" type="number" value={form.offerPrice} onChange={e => setForm({ ...form, offerPrice: e.target.value })} />
                            </div>
                            <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required />
                            <select className="w-full border rounded-lg px-3 py-2" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} title="Select category" aria-label="Select category">
                                {['Main Course', 'Rice & Biryani', 'Starters', 'Breads', 'Desserts', 'Beverages', 'Snacks'].map(c => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Image URL" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} required />
                            <input className="w-full border rounded-lg px-3 py-2" placeholder="Prep Time (min)" type="number" value={form.preparationTime} onChange={e => setForm({ ...form, preparationTime: e.target.value })} />
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.isVeg} onChange={e => setForm({ ...form, isVeg: e.target.checked })} className="rounded" />
                                <span className="text-sm">Vegetarian</span>
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-brand-maroon text-white py-2 rounded-lg hover:bg-brand-burgundy">
                                    {editProduct ? 'Update' : 'Add'}
                                </button>
                                <button type="button" onClick={resetForm} className="flex-1 border border-gray-200 py-2 rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products Table */}
            {!loading && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="font-medium text-sm">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className="font-semibold">₹{p.offerPrice || p.price}</span>
                                        {p.offerPrice && <span className="text-gray-400 line-through ml-2">₹{p.price}</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${p.isVeg ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            <span className={`w-2 h-2 rounded-full ${p.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {p.isVeg ? 'Veg' : 'Non-Veg'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-blue-500 p-1" title="Edit product" aria-label="Edit product"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500 p-1 ml-2" title="Delete product" aria-label="Delete product"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
