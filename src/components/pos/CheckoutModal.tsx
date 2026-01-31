import React, { useState } from 'react';
import { useCart } from '../../store/useCart';
import { db, IOrder, IOrderItem, ICustomer } from '../../db';
import { useAuth } from '../../store/useAuth';
import { X, CheckCircle2, Banknote, CreditCard, Loader2, User, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { cn, calculateGrossPrice } from '../../lib/utils';
import { useSettings } from '../../store/useSettings';
import { Input } from '../ui/Input';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { items, customer, setCustomer, total, subtotal, tax, clearCart } = useCart();
  const { currencySymbol } = useSettings();
  const user = useAuth((state) => state.user);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simplified Customer State
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const finalTotal = total();
  const change = amountReceived ? Number(amountReceived) - finalTotal : 0;

  const handlePhoneBlur = async () => {
    if (!phoneInput.trim()) return;
    
    // Auto-search on blur
    const existing = await db.customers.where('phone').equals(phoneInput.trim()).first();
    if (existing) {
        setCustomer(existing);
        setPhoneInput('');
        setNameInput('');
        setShowNameInput(false);
    } else {
        // Not found, prepare for creation
        // We do NOT set customer to null here necessarily, but the UI should show the inputs if no customer is selected
        // If a customer was already selected, and user types a new number that isn't found, 
        // we might want to clear the selection or just switch context. 
        // Let's assume if they are typing in the phone box, they want to switch.
        setCustomer(null);
        setShowNameInput(true);
    }
  };

  const handleRemoveCustomer = () => {
      setCustomer(null);
      setPhoneInput('');
      setNameInput('');
      setShowNameInput(false);
  };

  const handleCompleteOrder = async () => {
    if (paymentMethod === 'cash' && Number(amountReceived) < finalTotal) {
      alert('Amount received is less than total');
      return;
    }

    // Validation for new customer
    if (!customer && showNameInput && (!nameInput || !phoneInput)) {
        alert('Please enter customer name or clear phone number for Walk-in.');
        return;
    }

    setIsProcessing(true);

    try {
      let orderCustomerId = customer?.id;

      // Create new customer if needed
      if (!customer && showNameInput && phoneInput && nameInput) {
           const existing = await db.customers.where('phone').equals(phoneInput.trim()).first();
           if (existing) {
               orderCustomerId = existing.id;
           } else {
               orderCustomerId = await db.customers.add({
                   name: nameInput,
                   phone: phoneInput.trim(),
                   totalSpent: 0
               } as ICustomer);
           }
      }

      const orderItems: IOrderItem[] = items.map(item => {
        const itemTax = item.taxType === 'percentage' 
          ? (item.price * item.quantity) * (item.taxValue / 100)
          : item.taxType === 'fixed' 
            ? item.taxValue * item.quantity 
            : 0;
        
        return {
          productId: item.id!,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: 0,
          taxType: item.taxType || 'none',
          taxValue: item.taxValue || 0,
          taxAmount: Math.round(itemTax * 100) / 100,
        };
      });

      const order: IOrder = {
        customerId: orderCustomerId,
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
      if (orderCustomerId) {
        const currentCustomer = await db.customers.get(orderCustomerId);
        if (currentCustomer) {
            await db.customers.update(orderCustomerId, {
                totalSpent: currentCustomer.totalSpent + finalTotal
            });
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        clearCart();
        setIsSuccess(false);
        setAmountReceived('');
        setPhoneInput('');
        setNameInput('');
        setShowNameInput(false);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xl p-4">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl shadow-2xl overflow-hidden dark:border dark:border-slate-700/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-8 py-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Checkout</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                <X size={24} />
              </Button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Customer & Summary */}
              <div className="space-y-6">
                  {/* Customer Section */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 bg-white dark:bg-slate-800/50">
                      <h3 className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <User size={16} /> Customer
                      </h3>
                      
                      {customer ? (
                          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-500/20 p-3 rounded-lg border border-blue-100 dark:border-blue-500/30">
                              <div>
                                  <p className="font-bold text-slate-900 dark:text-slate-100">{customer.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{customer.phone || 'No Phone'}</p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={handleRemoveCustomer} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 h-8 px-2">
                                  Change
                              </Button>
                          </div>
                      ) : (
                          <div className="space-y-3">
                              <div className="space-y-1">
                                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone Number</label>
                                  <Input 
                                    placeholder="Enter phone to search..." 
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                    onBlur={handlePhoneBlur}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePhoneBlur()}
                                  />
                              </div>

                              <AnimatePresence>
                                {showNameInput && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1 overflow-hidden"
                                    >
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Full Name (New Customer)</label>
                                        <Input 
                                            placeholder="Enter customer name..." 
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            autoFocus
                                        />
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            <UserPlus size={12} className="inline mr-1"/>
                                            New customer will be created on checkout.
                                        </p>
                                    </motion.div>
                                )}
                              </AnimatePresence>
                              
                               {!showNameInput && !phoneInput && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                                        Leave empty for Walk-in Customer
                                    </p>
                                )}
                          </div>
                      )}
                  </div>

                  {/* Order Summary */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-700/50 h-fit">
                    <h3 className="mb-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order Summary</h3>
                    <div className="max-h-40 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{item.quantity}x <span className="text-slate-800 dark:text-slate-200">{item.name}</span></span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{currencySymbol}{(calculateGrossPrice(item) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Subtotal (excl. tax)</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{currencySymbol}{subtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Tax</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{currencySymbol}{tax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 mt-2">
                        <span>Total</span>
                        <span className="text-blue-600 dark:text-blue-400">{currencySymbol}{finalTotal.toFixed(2)}</span>
                    </div>
                    </div>
                  </div>
              </div>

              {/* Payment Input */}
              <div className="flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                         className={cn(
                           "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all",
                           paymentMethod === 'cash'
                             ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 dark:border-blue-500"
                             : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
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
                             ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 dark:border-blue-500"
                             : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
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
                      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Amount Received</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400 dark:text-slate-500">{currencySymbol}</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={amountReceived}
                          onChange={(e) => setAmountReceived(e.target.value)}
                          className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 py-3 pl-10 pr-4 text-2xl font-bold text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all"
                          autoFocus
                        />
                      </div>
                      {change > 0 && (
                        <div className="mt-4 flex justify-between rounded-lg bg-emerald-50 dark:bg-emerald-500/20 p-4 border border-emerald-100 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm">
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
                  className="mt-8 w-full text-lg h-14 shadow-lg shadow-blue-500/20 dark:shadow-lg dark:shadow-blue-500/30"
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
            className="flex flex-col items-center justify-center rounded-3xl bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl p-16 shadow-2xl text-center dark:border dark:border-slate-700/50"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={64} strokeWidth={2} />
            </div>
            <h2 className="mb-2 text-3xl font-black text-slate-800 dark:text-slate-100">Payment Successful!</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs">Order has been saved and stock levels have been updated.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};