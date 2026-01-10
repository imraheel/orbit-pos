import React, { useState, useEffect } from 'react';
import { useCart } from '../../store/useCart';
import { db, ICustomer } from '../../db';
import { Trash2, Plus, Minus, UserPlus, X, CreditCard, PauseCircle, PlayCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartSidebarProps {
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onCheckout }) => {
  const { items, customer, setCustomer, updateQuantity, removeItem, clearCart, subtotal, tax, total, holdCart, heldCarts, resumeCart, deleteHeldCart } = useCart();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isHeldCartsOpen, setIsHeldCartsOpen] = useState(false);

  useEffect(() => {
    db.customers.toArray().then(setCustomers);
  }, [isCustomerModalOpen]);

  return (
    <div className="flex h-full w-96 flex-col border-l border-gray-200 bg-white shadow-xl">
      {/* Header / Customer */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
          <div className="flex items-center gap-2">
            {heldCarts.length > 0 && (
              <button 
                onClick={() => setIsHeldCartsOpen(true)}
                className="relative flex items-center justify-center rounded-lg bg-orange-50 p-2 text-orange-600 hover:bg-orange-100"
              >
                <PauseCircle size={20} />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] text-white">
                  {heldCarts.length}
                </span>
              </button>
            )}
            <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear All</button>
          </div>
        </div>
        
        <div className="mt-4">
          {customer ? (
            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3 text-blue-700">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <UserPlus size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold">{customer.name}</p>
                  <p className="text-xs opacity-70">{customer.phone || 'No phone'}</p>
                </div>
              </div>
              <button onClick={() => setCustomer(null)} className="text-blue-400 hover:text-blue-600">
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-3 text-sm font-medium text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              <UserPlus size={18} />
              Select Customer
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-4 flex gap-3 rounded-xl border border-gray-100 p-2 transition-shadow hover:shadow-sm"
            >
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                <p className="text-sm text-blue-600 font-bold">${item.price.toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => updateQuantity(item.id!, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white hover:shadow-sm"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id!, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white hover:shadow-sm"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id!)}
                  className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {items.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-gray-400 opacity-50">
            <ShoppingCart size={64} strokeWidth={1} />
            <p className="mt-4 font-medium">Cart is empty</p>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 bg-gray-50 p-6">
        <div className="space-y-2 pb-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (10%)</span>
            <span>${tax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-xl font-bold text-gray-900">
            <span>Total</span>
            <span className="text-blue-600">${total().toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            disabled={items.length === 0}
            onClick={holdCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-orange-200 bg-orange-50 py-4 font-bold text-orange-600 hover:bg-orange-100 disabled:opacity-50 transition-all"
          >
            <PauseCircle size={20} />
            Hold
          </button>
          <button
            disabled={items.length === 0}
            onClick={onCheckout}
            className="flex-[2] flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 disabled:bg-gray-300 disabled:shadow-none transition-all"
          >
            <CreditCard size={24} />
            Place Order
          </button>
        </div>
      </div>

      {/* Held Carts Modal */}
      <AnimatePresence>
        {isHeldCartsOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Held Carts</h3>
                <button onClick={() => setIsHeldCartsOpen(false)} className="text-gray-400">
                  <X size={24} />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {heldCarts.map((hc) => (
                  <div
                    key={hc.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-4 hover:border-orange-200 transition-all"
                  >
                    <div>
                      <p className="font-bold text-gray-800">
                        {hc.customer?.name || 'Walk-in Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {hc.items.length} items • ${hc.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(hc.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          resumeCart(hc);
                          setIsHeldCartsOpen(false);
                        }}
                        className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                        title="Resume"
                      >
                        <PlayCircle size={20} />
                      </button>
                      <button
                        onClick={() => deleteHeldCart(hc.id)}
                        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Selection Modal */}
      <AnimatePresence>
        {isCustomerModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Select Customer</h3>
                <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400">
                  <X size={24} />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCustomer(c);
                      setIsCustomerModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-4 hover:bg-blue-50 hover:border-blue-200 transition-all"
                  >
                    <div className="text-left">
                      <p className="font-bold text-gray-800">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.phone || 'No phone'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
