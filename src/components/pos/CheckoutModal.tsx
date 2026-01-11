import React, { useState } from 'react';
import { useCart } from '../../store/useCart';
import { db, IOrder, IOrderItem } from '../../db';
import { useAuth } from '../../store/useAuth';
import { X, CheckCircle2, Banknote, CreditCard, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useSettings } from '../../store/useSettings';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { items, customer, total, subtotal, tax, clearCart } = useCart();
  const { currencySymbol } = useSettings();
  const user = useAuth((state) => state.user);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const finalTotal = total();
  const change = amountReceived ? Number(amountReceived) - finalTotal : 0;

  const handleCompleteOrder = async () => {
    if (paymentMethod === 'cash' && Number(amountReceived) < finalTotal) {
      alert('Amount received is less than total');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems: IOrderItem[] = items.map(item => ({
        productId: item.id!,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        discount: 0,
      }));

      const order: IOrder = {
        customerId: customer?.id,
        userId: user?.id!,
        items: orderItems,
        subtotal: subtotal(),
        tax: tax(),
        total: finalTotal,
        discount: 0,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 1. Save Order
      await db.orders.add(order);

      // 2. Update Stock Levels
      for (const item of items) {
        const product = await db.products.get(item.id!);
        if (product) {
          await db.products.update(item.id!, {
            stock: Math.max(0, product.stock - item.quantity)
          });
        }
      }

      // 3. Update Customer Total Spent
      if (customer?.id) {
        await db.customers.update(customer.id, {
          totalSpent: customer.totalSpent + finalTotal
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        clearCart();
        setIsSuccess(false);
        setAmountReceived('');
        onSuccess();
      }, 2000);

    } catch (err) {
      console.error('Failed to save order:', err);
      alert('Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
              <h2 className="text-xl font-bold text-slate-800">Checkout</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </Button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div className="rounded-xl bg-slate-50 p-6 border border-slate-100 h-fit">
                <h3 className="mb-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Order Summary</h3>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">{item.quantity}x <span className="text-slate-800">{item.name}</span></span>
                      <span className="font-bold text-slate-700">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-700">{currencySymbol}{subtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax</span>
                    <span className="font-medium text-slate-700">{currencySymbol}{tax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black text-slate-900 pt-2 border-t border-dashed border-slate-200 mt-2">
                    <span>Total</span>
                    <span className="text-blue-600">{currencySymbol}{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Input */}
              <div className="flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-slate-500 uppercase tracking-wider">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all",
                          paymentMethod === 'cash' 
                            ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                            : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <Banknote size={28} />
                        <span className="font-bold text-sm">Cash</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all",
                          paymentMethod === 'card' 
                            ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                            : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <CreditCard size={28} />
                        <span className="font-bold text-sm">Card</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'cash' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <label className="mb-2 block text-sm font-bold text-slate-700">Amount Received</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">{currencySymbol}</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={amountReceived}
                          onChange={(e) => setAmountReceived(e.target.value)}
                          className="w-full rounded-xl border-2 border-slate-200 py-3 pl-10 pr-4 text-2xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                          autoFocus
                        />
                      </div>
                      {change > 0 && (
                        <div className="mt-4 flex justify-between rounded-lg bg-emerald-50 p-4 border border-emerald-100 text-emerald-700 font-bold shadow-sm">
                          <span>Change Due:</span>
                          <span>{currencySymbol}{change.toFixed(2)}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                <Button
                  size="lg"
                  disabled={isProcessing || (paymentMethod === 'cash' && (!amountReceived || Number(amountReceived) < finalTotal))}
                  onClick={handleCompleteOrder}
                  className="mt-8 w-full text-lg h-14 shadow-lg shadow-blue-200 hover:shadow-blue-300"
                >
                  {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isProcessing ? 'Processing...' : `Pay ${currencySymbol}${finalTotal.toFixed(2)}`}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 shadow-2xl text-center"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={64} strokeWidth={2} />
            </div>
            <h2 className="mb-2 text-3xl font-black text-slate-800">Payment Successful!</h2>
            <p className="text-slate-500 max-w-xs">Order has been saved and stock levels have been updated.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};