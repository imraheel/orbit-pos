import React, { useState, useEffect } from 'react';
import { db, IProduct } from '../../db';
import { recordMovement } from '../../db/stockService';
import { useAuth } from '../../store/useAuth';
import { X, PackagePlus, PackageMinus, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const user = useAuth((state) => state.user);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      db.products.toArray().then(setProducts);
      setSelectedProduct(null);
      setQuantity(0);
      setNote('');
      setError('');
      setSearch('');
    }
  }, [isOpen]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  const handleSubmit = async (type: 'addition' | 'removal') => {
    if (!selectedProduct || !user || quantity <= 0) return;

    setIsProcessing(true);
    setError('');

    try {
      await recordMovement({
        productId: selectedProduct.id!,
        type,
        quantity,
        userId: user.id!,
        note: note || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update stock');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xl p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key="stock-adjust"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl p-6 shadow-2xl dark:border dark:border-slate-700/50"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Adjust Stock</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Product Search/Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Product</label>
              {selectedProduct ? (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-500/20 p-3 rounded-lg border border-blue-100 dark:border-blue-500/30">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{selectedProduct.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Current stock: {selectedProduct.stock} | Barcode: {selectedProduct.barcode}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 h-8 px-2">
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    icon={<Search size={18} />}
                    placeholder="Search products by name or barcode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/50">
                      {filteredProducts.map(product => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(product);
                            setSearch('');
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <p className="font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Stock: {product.stock} | {product.barcode}
                          </p>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No products found</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Input */}
            {selectedProduct && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Enter quantity..."
                />
              </div>
            )}

            {/* Note Input */}
            {selectedProduct && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Note (optional)</label>
                <Input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reason for adjustment..."
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            {selectedProduct && (
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => handleSubmit('addition')}
                  disabled={isProcessing || quantity <= 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                  Add Stock
                </Button>
                <Button
                  onClick={() => handleSubmit('removal')}
                  disabled={isProcessing || quantity <= 0}
                  variant="destructive"
                  className="flex-1"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackageMinus className="mr-2 h-4 w-4" />}
                  Remove Stock
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
