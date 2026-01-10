import React, { useState } from 'react';
import { useCart } from '../../store/useCart';
import { db, IOrder, IOrderItem } from '../../db';
import { useAuth } from '../../store/useAuth';
import { X, CheckCircle2, Banknote, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { items, customer, total, subtotal, tax, clearCart } = useCart();
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="mb-4 font-bold text-gray-700">Order Summary</h3>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                      <span className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black text-blue-600 pt-2">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Input */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 font-bold text-gray-700">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                        paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      <Banknote size={32} />
                      <span className="font-bold">Cash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                        paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      <CreditCard size={32} />
                      <span className="font-bold">Card</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="mb-2 block text-sm font-bold text-gray-700">Amount Received</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        className="w-full rounded-2xl border-2 border-gray-100 py-4 pl-10 pr-4 text-2xl font-bold focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    {change > 0 && (
                      <div className="mt-4 flex justify-between rounded-xl bg-green-50 p-4 text-green-700 font-bold">
                        <span>Change Due:</span>
                        <span>${change.toFixed(2)}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                <button
                  disabled={isProcessing || (paymentMethod === 'cash' && !amountReceived)}
                  onClick={handleCompleteOrder}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-xl font-bold text-white shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 disabled:bg-gray-200 disabled:shadow-none transition-all"
                >
                  {isProcessing ? 'Processing...' : 'Complete Sale'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 shadow-2xl"
          >
            <div className="mb-6 text-green-500">
              <CheckCircle2 size={120} strokeWidth={1.5} />
            </div>
            <h2 className="mb-2 text-3xl font-black text-gray-800">Payment Successful!</h2>
            <p className="text-gray-500">Order has been saved and stock updated.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
