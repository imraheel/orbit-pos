import React, { useState, useEffect } from 'react';
import { db, IProduct, ICategory } from '../../db';
import { Plus, Edit2, Trash2, Search, X, Save, AlertCircle, Package, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { ImageUpload } from '../ui/ImageUpload';
import { cn, calculateGrossPrice } from '../../lib/utils';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useSettings } from '../../store/useSettings';
import { printBarcode } from '../barcode/BarcodePrint';

interface ProductImageProps {
  imageUrl: string
  className?: string
}

const ProductImage: React.FC<ProductImageProps> = ({ imageUrl, className }) => {
  const [src, setSrc] = React.useState<string>('')

  React.useEffect(() => {
    if (imageUrl) {
      window.electronAPI.getProductImage(imageUrl).then((base64) => {
        if (base64) setSrc(base64)
      })
    }
  }, [imageUrl])

  if (!src) return null

  return <img src={src} alt="" className={className} />
}

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const { currencySymbol } = useSettings();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  
  const [formData, setFormData] = useState<Partial<IProduct>>({
    name: '',
    barcode: '',
    price: 0,
    stock: 0,
    categoryId: 0,
    taxType: 'none',
    taxValue: 0,
    imageUrl: undefined,
  });

  const [tempImage, setTempImage] = useState<string | null>(null);

  // Delete Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);

  const fetchData = async () => {
    const [allProducts, allCategories] = await Promise.all([
      db.products.toArray(),
      db.categories.toArray(),
    ]);
    setProducts(allProducts);
    setCategories(allCategories);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.barcode.includes(search);
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product?: IProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
      setTempImage(null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        barcode: '',
        price: 0,
        stock: 0,
        categoryId: categories[0]?.id || 0,
        taxType: 'none',
        taxValue: 0,
        imageUrl: undefined,
      });
      setTempImage(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) return;

    let finalImageUrl = formData.imageUrl;

    if (tempImage && tempImage.startsWith('temp:')) {
      const [, base64, extension] = tempImage.split(':');
      const productId = editingProduct?.id || Date.now();
      finalImageUrl = await window.electronAPI.saveProductImage(base64, productId, extension);
    }

    const payload = {
      ...formData,
      imageUrl: finalImageUrl,
      price: Number(formData.price),
      stock: Number(formData.stock),
      categoryId: Number(formData.categoryId),
      taxValue: Number(formData.taxValue),
    } as IProduct;

    if (editingProduct && editingProduct.id) {
      await db.products.update(editingProduct.id, payload);
    } else {
      await db.products.add(payload);
    }

    setIsModalOpen(false);
    setTempImage(null);
    fetchData();
  };

  const handleDelete = (product: IProduct) => {
    setProductToDelete(product);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete?.id) {
      if (productToDelete.imageUrl) {
        await window.electronAPI.deleteProductImage(productToDelete.imageUrl);
      }
      await db.products.delete(productToDelete.id);
      fetchData();
      setIsConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-100/50 dark:bg-slate-800/50">
        <div className="flex flex-1 items-center gap-3">
            <Input
                icon={<Search size={18} />}
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs bg-white dark:bg-slate-800"
            />
            
            <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
            <option value="all">All Categories</option>
            {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            </select>
        </div>

        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" />
          Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/50">
            <tr>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Barcode</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-right">Stock</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredProducts.map((product) => {
              const category = categories.find(c => c.id === product.categoryId);
              return (
                <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    {product.imageUrl ? (
                      <ProductImage imageUrl={product.imageUrl} className="w-10 h-10" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{product.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs">{product.barcode}</td>
                  <td className="px-6 py-4">
                    <Badge 
                        variant="secondary"
                        style={{ 
                            backgroundColor: category?.color ? `${category.color}20` : undefined, 
                            color: category?.color || undefined,
                            borderColor: category?.color ? `${category.color}40` : undefined,
                        }}
                        className="border"
                    >
                      {category?.name || 'Uncategorized'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">{currencySymbol}{calculateGrossPrice(product).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {product.stock < 10 && <AlertCircle size={14} className="text-amber-500" />}
                        <span className={cn("font-medium", product.stock < 10 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300')}>
                            {product.stock}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => printBarcode(product.barcode, product.name, product.price, currencySymbol)}
                          className="text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-500 dark:hover:text-purple-400 dark:hover:bg-purple-500/20"
                          title="Print Barcode"
                        >
                        <Printer size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/20">
                        <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-500/20">
                        <Trash2 size={16} />
                        </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredProducts.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                        No products found matching your criteria.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl p-6 shadow-2xl dark:border dark:border-slate-700/50"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Product Image</label>
                    <ImageUpload
                      value={tempImage ? tempImage : (formData.imageUrl || null)}
                      onChange={(value) => setTempImage(value)}
                    />
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Product Name</label>
                        <Input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Wireless Mouse"
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Barcode</label>
                        <Input
                            type="text"
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            placeholder="Scan or type..."
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                            className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 text-sm dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                        >
                            <option value={0} disabled>Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Price ({currencySymbol})</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Type</label>
                        <select
                            value={formData.taxType || 'none'}
                            onChange={(e) => setFormData({ ...formData, taxType: e.target.value as any })}
                            className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 text-sm dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                        >
                            <option value="none">None</option>
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ({currencySymbol})</option>
                        </select>
                    </div>

                    {formData.taxType && formData.taxType !== 'none' && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Tax Value {formData.taxType === 'percentage' ? '(%)' : `(${currencySymbol})`}
                            </label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={formData.taxValue}
                                onChange={(e) => setFormData({ ...formData, taxValue: Number(e.target.value) })}
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Stock Level</label>
                        <Input
                            type="number"
                            min="0"
                            required
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save size={18} className="mr-2" />
                    Save Product
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Product"
        description={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};