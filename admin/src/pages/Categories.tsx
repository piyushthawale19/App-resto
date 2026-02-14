import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { Category } from '../types';
import { Plus, Trash2, Edit, X, ArrowUp, ArrowDown } from 'lucide-react';

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [form, setForm] = useState({
        name: '',
        imageUrl: '',
        icon: '',
        order: '',
    });

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'categories'), orderBy('order', 'asc')),
            (snap) => {
                const loaded = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Category));
                setCategories(loaded);
                setLoading(false);
            },
            (error) => {
                console.error('Error loading categories:', error);
                setLoading(false);
            }
        );
        return unsub;
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data: any = {
            name: form.name,
        };

        if (form.imageUrl) {
            data.imageUrl = form.imageUrl;
        }
        if (form.icon) {
            data.icon = form.icon;
        }
        if (form.order) {
            data.order = Number(form.order);
        } else {
            // Auto-assign order if not provided
            const maxOrder = categories.length > 0 
                ? Math.max(...categories.map(c => c.order ?? 0))
                : 0;
            data.order = maxOrder + 1;
        }

        if (editCategory) {
            await updateDoc(doc(db, 'categories', editCategory.id), data);
        } else {
            await addDoc(collection(db, 'categories'), data);
        }
        resetForm();
    };

    const resetForm = () => {
        setForm({ name: '', imageUrl: '', icon: '', order: '' });
        setEditCategory(null);
        setShowForm(false);
    };

    const handleEdit = (cat: Category) => {
        setForm({
            name: cat.name,
            imageUrl: cat.imageUrl || '',
            icon: cat.icon || '',
            order: String(cat.order ?? ''),
        });
        setEditCategory(cat);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this category? Products using this category will need to be updated.')) {
            await deleteDoc(doc(db, 'categories', id));
        }
    };

    const moveOrder = async (category: Category, direction: 'up' | 'down') => {
        const currentIndex = categories.findIndex(c => c.id === category.id);
        if (currentIndex === -1) return;

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= categories.length) return;

        const targetCategory = categories[targetIndex];
        const currentOrder = category.order ?? 0;
        const targetOrder = targetCategory.order ?? 0;

        // Swap orders using a single atomic batch commit
        const docRefA = doc(db, 'categories', category.id);
        const docRefB = doc(db, 'categories', targetCategory.id);
        const batch = writeBatch(db);
        batch.update(docRefA, { order: targetOrder });
        batch.update(docRefB, { order: currentOrder });
        await batch.commit();
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Categories ({categories.length})</h1>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-brand-maroon text-white px-4 py-2 rounded-lg hover:bg-brand-burgundy transition"
                >
                    <Plus size={18} /> Add Category
                </button>
            </div>

            {loading && (
                <div className="text-center py-8 text-gray-500">Loading categories...</div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">{editCategory ? 'Edit Category' : 'Add Category'}</h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600" title="Close" aria-label="Close modal">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                className="w-full border rounded-lg px-3 py-2" 
                                placeholder="Category Name" 
                                value={form.name} 
                                onChange={e => setForm({ ...form, name: e.target.value })} 
                                required 
                            />
                            <input 
                                className="w-full border rounded-lg px-3 py-2" 
                                placeholder="Image URL (optional)" 
                                value={form.imageUrl} 
                                onChange={e => setForm({ ...form, imageUrl: e.target.value })} 
                            />
                            <input 
                                className="w-full border rounded-lg px-3 py-2" 
                                placeholder="Icon (optional)" 
                                value={form.icon} 
                                onChange={e => setForm({ ...form, icon: e.target.value })} 
                            />
                            <input 
                                className="w-full border rounded-lg px-3 py-2" 
                                placeholder="Order (optional, for sorting)" 
                                type="number"
                                value={form.order} 
                                onChange={e => setForm({ ...form, order: e.target.value })} 
                            />
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-brand-maroon text-white py-2 rounded-lg hover:bg-brand-burgundy">
                                    {editCategory ? 'Update' : 'Add'}
                                </button>
                                <button type="button" onClick={resetForm} className="flex-1 border border-gray-200 py-2 rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories Table */}
            {!loading && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Image</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Icon</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat, index) => (
                                <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-600">{cat.order ?? index + 1}</span>
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => moveOrder(cat, 'up')}
                                                    disabled={index === 0}
                                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Move up"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <button
                                                    onClick={() => moveOrder(cat, 'down')}
                                                    disabled={index === categories.length - 1}
                                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Move down"
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-sm">{cat.name}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {cat.imageUrl ? (
                                            <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />
                                        ) : (
                                            <span className="text-xs text-gray-400">No image</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {cat.icon ? (
                                            <span className="text-lg">{cat.icon}</span>
                                        ) : (
                                            <span className="text-xs text-gray-400">No icon</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-blue-500 p-1" title="Edit category" aria-label="Edit category">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-500 p-1 ml-2" title="Delete category" aria-label="Delete category">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        No categories found. Add your first category to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
