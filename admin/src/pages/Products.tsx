import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Product, Category } from '../types';
import { Plus, Trash2, Edit, Search, X, Image as ImageIcon, Upload, Link, Loader2, IndianRupee, Percent, Clock, AlignLeft, Type, Tag, Leaf, Save } from 'lucide-react';

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

    // Image Upload State
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setUploadError("File too large (max 10MB)");
            return;
        }

        setIsUploading(true);
        setUploadError('');
        setUploadSuccess(false);

        try {
            // Create a unique filename to avoid collisions
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const storageRef = ref(storage, `products/${timestamp}_${safeName}`);

            // Upload file to Firebase Storage
            const snapshot = await uploadBytes(storageRef, file);

            // Get the public download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            setForm(prev => ({ ...prev, imageUrl: downloadURL }));
            setUploadSuccess(true);
        } catch (err: any) {
            console.error('Upload Error:', err);
            setUploadError(err.message || 'Upload failed. Check Firebase Storage rules.');
        } finally {
            setIsUploading(false);
        }
    };

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
        setUploadMode('file');
        setUploadError('');
        setUploadSuccess(false);
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

            {/* Premium Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    {editProduct ? <Edit className="w-5 h-5 text-brand-maroon" /> : <Plus className="w-5 h-5 text-brand-maroon" />}
                                    {editProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">Fill in the details to add to your menu</p>
                            </div>
                            <button
                                onClick={resetForm}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                                {/* Product Name */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                        <Type size={16} className="text-brand-maroon" /> Product Name
                                    </label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-maroon focus:ring-4 focus:ring-brand-maroon/10 outline-none transition-all placeholder:text-gray-400"
                                        placeholder="e.g. Maharaja Mac Burger"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Category & Veg/Non-Veg Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                            <Tag size={16} className="text-brand-maroon" /> Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-brand-maroon focus:ring-4 focus:ring-brand-maroon/10 outline-none transition-all appearance-none bg-white font-medium text-gray-700"
                                                value={form.category}
                                                onChange={e => setForm({ ...form, category: e.target.value })}
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
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer" onClick={() => setForm({ ...form, isVeg: !form.isVeg })}>
                                            <Leaf size={16} className={form.isVeg ? "text-green-500" : "text-gray-400"} />
                                            Dietary Type
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, isVeg: !form.isVeg })}
                                            className={`relative inline-flex h-8 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-maroon/20 focus:ring-offset-2 ${form.isVeg ? 'bg-green-100' : 'bg-red-100'}`}
                                        >
                                            <span
                                                className={`inline-block h-6 w-6 transform rounded-full shadow-sm transition duration-200 ease-in-out bg-white border-2 ${form.isVeg ? 'translate-x-16 border-green-500' : 'translate-x-1 border-red-500'}`}
                                            />
                                            <span className={`absolute text-xs font-bold pointer-events-none ${form.isVeg ? 'left-3 text-green-700' : 'right-3 text-red-700'}`}>
                                                {form.isVeg ? 'VEG' : 'NON'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Pricing Section */}
                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pricing Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                                <IndianRupee size={15} className="text-brand-maroon" /> Base Price
                                            </label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-maroon focus:ring-4 focus:ring-brand-maroon/10 outline-none transition-all"
                                                placeholder="0.00"
                                                type="number"
                                                min="0"
                                                value={form.price}
                                                onChange={e => setForm({ ...form, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                                <Percent size={15} className="text-brand-maroon" /> Discount
                                            </label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-maroon focus:ring-4 focus:ring-brand-maroon/10 outline-none transition-all"
                                                placeholder="0"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={form.discount}
                                                onChange={e => setForm({ ...form, discount: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Final Price Calculator */}
                                    {form.price && Number(form.price) > 0 && (
                                        <div className="mt-2 bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between shadow-sm">
                                            <span className="text-sm text-gray-500 font-medium">Customer Pays:</span>
                                            <div className="flex items-center gap-3">
                                                {form.discount && Number(form.discount) > 0 ? (
                                                    <>
                                                        <span className="text-gray-400 line-through text-sm">₹{form.price}</span>
                                                        <span className="font-bold text-xl text-green-600">
                                                            ₹{Math.round(Number(form.price) - (Number(form.price) * Number(form.discount) / 100))}
                                                        </span>
                                                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-bold self-center">
                                                            {form.discount}% OFF
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="font-bold text-xl text-brand-maroon">₹{form.price}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                        <AlignLeft size={16} className="text-brand-maroon" /> Description
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-maroon focus:ring-4 focus:ring-brand-maroon/10 outline-none transition-all placeholder:text-gray-400 min-h-[100px]"
                                        placeholder="Describe the taste, ingredients, etc."
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Image Upload Section */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                        <ImageIcon size={16} className="text-brand-maroon" /> Product Image
                                    </label>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex bg-gray-200/50 p-1 rounded-lg mb-4">
                                            <button
                                                type="button"
                                                onClick={() => setUploadMode('file')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all shadow-sm ${uploadMode === 'file' ? 'bg-white text-brand-maroon shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <Upload size={14} /> Upload File
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUploadMode('url')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${uploadMode === 'url' ? 'bg-white text-brand-maroon shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <Link size={14} /> Image URL
                                            </button>
                                        </div>

                                        {uploadMode === 'file' ? (
                                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors relative bg-white ${form.imageUrl ? 'border-green-300 bg-green-50/10' : 'border-gray-200 hover:border-brand-maroon/30'}`}>
                                                <input
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                                    onChange={handleFileUpload}
                                                    disabled={isUploading}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                                />

                                                {isUploading ? (
                                                    <div className="flex flex-col items-center justify-center py-2">
                                                        <Loader2 className="w-10 h-10 text-brand-maroon animate-spin mb-3" />
                                                        <p className="text-sm font-medium text-gray-600">Uploading image...</p>
                                                    </div>
                                                ) : form.imageUrl ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-full max-w-[200px] aspect-video rounded-lg overflow-hidden mb-3 border border-gray-200 shadow-md relative group">
                                                            <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-white text-xs font-bold bg-black/20 backdrop-blur-Md px-3 py-1 rounded-full border border-white/30">Change Image</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-bold text-green-700 flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                            Image Uploaded Successfully
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center py-4">
                                                        <div className="w-14 h-14 rounded-full bg-brand-maroon/5 flex items-center justify-center mb-4 text-brand-maroon">
                                                            <Upload className="w-7 h-7" />
                                                        </div>
                                                        <p className="font-bold text-gray-800 text-lg mb-1">Click to upload image</p>
                                                        <p className="text-xs text-gray-500">Supports: PNG, JPG, WebP (max 10MB)</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        className="w-full px-4 pl-10 py-2.5 rounded-xl border border-gray-200 focus:border-brand-maroon focus:ring-4 focus:ring-brand-maroon/10 outline-none transition-all"
                                                        placeholder="https://example.com/image.jpg"
                                                        value={form.imageUrl}
                                                        onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                                                    />
                                                </div>
                                                {form.imageUrl && (
                                                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm w-fit">
                                                        <img src={form.imageUrl} alt="Preview" className="h-24 w-auto object-cover" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {uploadError && (
                                            <div className="text-xs text-red-600 mt-3 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-1">
                                                <X size={14} className="text-red-500" />
                                                {uploadError}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Prep Time */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                        <Clock size={16} className="text-brand-maroon" /> Preparation Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-maroon focus:ring-4 focus:ring-brand-maroon/10 outline-none transition-all"
                                            placeholder="e.g. 20"
                                            type="number"
                                            min="0"
                                            value={form.preparationTime}
                                            onChange={e => setForm({ ...form, preparationTime: e.target.value })}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">minutes</span>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Sticky Footer */}
                        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="productForm"
                                className="px-8 py-2.5 rounded-xl bg-brand-maroon text-white font-semibold shadow-lg shadow-brand-maroon/20 hover:bg-brand-burgundy hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                {editProduct ? 'Update Product' : 'Save Product'}
                            </button>
                        </div>
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
