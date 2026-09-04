import React, { useState, useEffect } from 'react';
import { useCart } from '../../store/useCart';
import { db, ICustomer } from '../../db';
import { Trash2, Plus, Minus, UserPlus, X, CreditCard, PauseCircle, PlayCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useSettings } from '../../store/useSettings';
import { calculateGrossPrice } from '../../lib/utils';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface CartSidebarProps {
  onCheckout: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onCheckout, onModalStateChange }) => {
  const { items, customer, setCustomer, updateQuantity, removeItem, clearCart, subtotal, tax, total, holdCart, heldCarts, resumeCart, deleteHeldCart } = useCart();
  const { currencySymbol } = useSettings();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isHeldCartsOpen, setIsHeldCartsOpen] = useState(false);

  // Handle Escape key for modals
  useEscapeKey({ onClose: () => setIsHeldCartsOpen(false), enabled: isHeldCartsOpen });
  useEscapeKey({ onClose: () => setIsCustomerModalOpen(false), enabled: isCustomerModalOpen });

  // Notify parent when any modal state changes
  useEffect(() => {
    onModalStateChange?.(isHeldCartsOpen || isCustomerModalOpen);
  }, [isHeldCartsOpen, isCustomerModalOpen, onModalStateChange]);

  useEffect(() => {
    db.customers.toArray().then(setCustomers);
  }, [isCustomerModalOpen]);

  return (
    <aside className="flex h-full w-96 flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 dark:backdrop-blur-xl shadow-2xl shadow-black/20 z-10">
      {/* Header / Customer */}
      <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50 z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Current Order</h2>
          <div className="flex items-center gap-2">
            {heldCarts.length > 0 && (
              <Button 
                onClick={() => setIsHeldCartsOpen(true)}
                variant="outline"
                size="sm"
                className="relative text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 dark:hover:bg-amber-500/30"
              >
                <PauseCircle size={16} className="mr-1" />
                Hold
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] text-white font-bold">
                  {heldCarts.length}
                </span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-500/20">
                Clear
            </Button>
          </div>
        </div>
        
        <div>
          {customer ? (
            <div className="flex items-center justify-between rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/20 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/30 dark:text-blue-400">
                  <UserPlus size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{customer.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{customer.phone || 'No phone'}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCustomer(null)} className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                <X size={16} />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
            >
              <UserPlus size={18} />
              Add Customer to Order
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
       <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/30">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              className="mb-3 flex gap-3 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 p-3 shadow-sm dark:shadow-lg dark:shadow-black/10"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</h3>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{currencySymbol}{calculateGrossPrice(item).toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => updateQuantity(item.id!, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all"
                  >
                    <Minus size={14} />
                  </button>
                   <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-slate-100">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id!, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id!)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {items.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-slate-300 dark:text-slate-600">
            <ShoppingCart size={48} strokeWidth={1} />
            <p className="mt-4 font-medium text-slate-400 dark:text-slate-500">Cart is empty</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Scan items or select from grid</p>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-20">
        <div className="space-y-3 pb-6">
           <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
             <span>Subtotal (excl. tax)</span>
             <span className="font-medium text-slate-900 dark:text-slate-100">{currencySymbol}{subtotal().toFixed(2)}</span>
           </div>
           <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
             <span>Tax</span>
             <span className="font-medium text-slate-900 dark:text-slate-100">{currencySymbol}{tax().toFixed(2)}</span>
           </div>
           <div className="flex justify-between border-t border-dashed border-slate-200 dark:border-slate-700 pt-3">
             <span className="text-base font-bold text-slate-800 dark:text-slate-100">Total</span>
             <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currencySymbol}{total().toFixed(2)}</span>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button
            disabled={items.length === 0}
            onClick={holdCart}
            variant="outline"
            title="Hold Order (Ctrl+H)"
            className="col-span-1 h-14 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30"
          >
            <PauseCircle size={20} />
          </Button>
          <Button
            disabled={items.length === 0}
            onClick={onCheckout}
            title="Checkout (Ctrl+Enter)"
            className="col-span-2 h-14 text-lg shadow-lg shadow-blue-500/20 dark:shadow-lg dark:shadow-blue-500/30"
          >
            <CreditCard size={20} className="mr-2" />
            Charge
          </Button>
        </div>
      </div>

      {/* Held Carts Modal */}
      <AnimatePresence>
        {isHeldCartsOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl p-6 shadow-2xl dark:border dark:border-slate-700/50"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Held Orders</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsHeldCartsOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                {heldCarts.map((hc) => (
                  <div
                    key={hc.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/10 transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        {hc.customer?.name || 'Walk-in Customer'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-normal">
                            {hc.items.length} items
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-normal">
                             {currencySymbol}{hc.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        Saved: {new Date(hc.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          resumeCart(hc);
                          setIsHeldCartsOpen(false);
                        }}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 border-0"
                      >
                        <PlayCircle size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteHeldCart(hc.id)}
                        className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 border-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {heldCarts.length === 0 && (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500">No held orders.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Selection Modal */}
      <AnimatePresence>
        {isCustomerModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl p-6 shadow-2xl dark:border dark:border-slate-700/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Select Customer</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsCustomerModalOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCustomer(c);
                      setIsCustomerModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700/50 p-4 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">{c.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{c.phone || 'No phone'}</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-500" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
};
