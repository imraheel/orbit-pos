import React, { useState, useEffect } from 'react';
import { db, ICategory } from '../../db';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#3b82f6' });

  // Delete Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null);

  const fetchCategories = async () => {
    const data = await db.categories.toArray();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: ICategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, color: category.color || '#3b82f6' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', color: '#3b82f6' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCategory && editingCategory.id) {
      await db.categories.update(editingCategory.id, formData);
    } else {
      await db.categories.add(formData);
    }

    setIsModalOpen(false);
    fetchCategories();
  };

  const handleDelete = (category: ICategory) => {
    setCategoryToDelete(category);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete?.id) {
      await db.categories.delete(categoryToDelete.id);
      fetchCategories();
      setIsConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-1">
      <div className="mb-6 flex justify-end">
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-lg shadow-sm flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: category.color }}
              >
                {category.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{category.name}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => handleOpenModal(category)} className="text-slate-400 dark:text-slate-500 hover:text-blue-600">
                <Edit2 size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(category)} className="text-slate-400 dark:text-slate-500 hover:text-red-600">
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Add New Card Placeholder */}
        <button
            onClick={() => handleOpenModal()}
            className="flex h-[82px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 transition-all"
        >
            <div className="flex items-center gap-2 font-medium">
                <Plus size={20} />
                <span>New Category</span>
            </div>
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl p-6 shadow-2xl dark:border dark:border-slate-700/50"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Category Name
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Beverages"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Color Tag
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'].map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={cn(
                              "h-8 w-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                              formData.color === color ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100 scale-110" : ""
                          )}
                          style={{ backgroundColor: color }}
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save size={18} className="mr-2" />
                    Save
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Category"
        description={`Are you sure you want to delete ${categoryToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};