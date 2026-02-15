import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category } from '../types';
import { Plus, Trash2, Edit, Search, X } from 'lucide-react';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [form, setForm] = useState({
        name: '', price: '', discount: '', description: '', category: '',
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

    // ─── Subscribe to Categories ───
    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'categories'), orderBy('order', 'asc')),
            (snap) => {
                const loaded = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Category));
                setCategories(loaded);
                setCategoriesLoading(false);
                // Set default category if form is empty and categories are loaded
                setForm(prev => {
                    if (!prev.category && loaded.length > 0) {
                        return { ...prev, category: loaded[0].name };
                    }
                    return prev;
                });
            },
            (error) => {
                console.error('Error loading categories:', error);
                setCategoriesLoading(false);
            }
        );
        return unsub;
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const basePrice = Number(form.price);
        const data: any = {
            name: form.name,
            price: basePrice,
            description: form.description,
            category: form.category,
            imageUrl: form.imageUrl,
            isVeg: form.isVeg,
            isAvailable: true,
        };

        // Calculate offer price from discount percentage
        if (form.discount && Number(form.discount) > 0) {
            const discountPercent = Number(form.discount);
            const offerPrice = Math.round(basePrice - (basePrice * discountPercent / 100));
            data.offerPrice = offerPrice;
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
        const defaultCategory = categories.length > 0 ? categories[0].name : '';
        setForm({ name: '', price: '', discount: '', description: '', category: defaultCategory, imageUrl: '', isVeg: true, preparationTime: '' });
        setEditProduct(null);
        setShowForm(false);
    };

    const handleEdit = (p: Product) => {
        // Calculate discount percentage from offerPrice
        let discountPercent = '';
        if (p.offerPrice && p.price > 0) {
            const discount = ((p.price - p.offerPrice) / p.price) * 100;
            discountPercent = String(Math.round(discount));
        }

        setForm({
            name: p.name,
            price: String(p.price),
            discount: discountPercent,
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
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Price (₹)</label>
                                    <input
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="Original Price"
                                        type="number"
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Discount (%)</label>
                                    <input
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="e.g. 10"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.discount}
                                        onChange={e => setForm({ ...form, discount: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Final Price Display */}
                            {form.price && Number(form.price) > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Final Price:</span>
                                        <div className="flex items-center gap-2">
                                            {form.discount && Number(form.discount) > 0 ? (
                                                <>
                                                    <span className="font-bold text-green-700">
                                                        ₹{Math.round(Number(form.price) - (Number(form.price) * Number(form.discount) / 100))}
                                                    </span>
                                                    <span className="text-gray-400 line-through text-xs">₹{form.price}</span>
                                                    <span className="bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                        {form.discount}% OFF
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="font-bold text-gray-700">₹{form.price}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Category</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    title="Select category"
                                    aria-label="Select category"
                                    required
                                    disabled={categoriesLoading || categories.length === 0}
                                >
                                    {categoriesLoading ? (
                                        <option>Loading categories...</option>
                                    ) : categories.length === 0 ? (
                                        <option>No categories available</option>
                                    ) : (
                                        categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))
                                    )}
                                </select>
                                {categories.length === 0 && !categoriesLoading && (
                                    <p className="text-xs text-amber-600 mt-1">⚠️ Add categories first in the Categories page</p>
                                )}
                            </div>

                            <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required />
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
                                        {p.offerPrice ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 line-through text-xs">₹{p.price}</span>
                                                <span className="font-semibold text-green-600">₹{p.offerPrice}</span>
                                                <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium">
                                                    {Math.round(((p.price - p.offerPrice) / p.price) * 100)}% OFF
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-semibold">₹{p.price}</span>
                                        )}
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
