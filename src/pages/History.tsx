import React, { useState, useEffect } from 'react';
import { db, IOrder, ICustomer, IUser } from '../db';
import { Search, Eye, Receipt, User, Clock, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useSettings } from '../store/useSettings';
import { calculateGrossPrice } from '../lib/utils';

export const History: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [customers, setCustomers] = useState<Record<number, ICustomer>>({});
  const [users, setUsers] = useState<Record<number, IUser>>({});
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const { currencySymbol } = useSettings();

  const fetchOrders = async () => {
    const [allOrders, allCustomers, allUsers] = await Promise.all([
      db.orders.orderBy('createdAt').reverse().toArray(),
      db.customers.toArray(),
      db.users.toArray(),
    ]);

    setOrders(allOrders);
    
    const custMap = allCustomers.reduce((acc, c) => ({ ...acc, [c.id!]: c }), {});
    setCustomers(custMap);

    const userMap = allUsers.reduce((acc, u) => ({ ...acc, [u.id!]: u }), {});
    setUsers(userMap);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const customerName = o.customerId ? customers[o.customerId]?.name : 'Walk-in Customer';
    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toString().includes(search)
    );
  });

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Order History</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">View and manage past transactions.</p>
        </div>
        <div className="w-80">
          <Input
            icon={<Search size={18} />}
            placeholder="Search by Order ID or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/50">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">#{order.id}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
                        {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={12} className="text-slate-400 dark:text-slate-500" />
                        {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      <User size={14} />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {order.customerId ? customers[order.customerId]?.name : 'Walk-in Customer'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{currencySymbol}{order.total.toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/20"
                    >
                        <Eye size={16} className="mr-2" />
                        View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                        No orders found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl p-6 shadow-2xl dark:border dark:border-slate-700/50"
            >
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Order Details</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-700/50">
                   <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                         <Receipt size={20} />
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Order ID</p>
                          <p className="font-mono font-bold text-slate-900 dark:text-slate-100">#{selectedOrder.id}</p>
                      </div>
                   </div>
                   <div className="text-right">
                       <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Processed By</p>
                       <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{users[selectedOrder.userId]?.username || 'System'}</p>
                   </div>
                 </div>

                 <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Items Purchased
                   </h3>
                    <div className="max-h-48 overflow-y-auto space-y-0 rounded-lg border border-slate-100 dark:border-slate-700/50">
                     {selectedOrder.items.map((item, idx) => (
                       <div key={idx} className="flex justify-between text-sm p-3 bg-white dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                          <div className="flex gap-2">
                              <span className="font-bold text-slate-500 dark:text-slate-400">{item.quantity}x</span>
                              <span className="text-slate-700 dark:text-slate-300">{item.productName}</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{currencySymbol}{(calculateGrossPrice(item as any) * item.quantity).toFixed(2)}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                  <div className="space-y-2 border-t border-slate-200 dark:border-slate-700/50 pt-4">
                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Subtotal (excl. tax)</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{currencySymbol}{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Tax</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{currencySymbol}{selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black text-slate-900 dark:text-slate-100 pt-2">
                      <span>Total</span>
                      <span className="text-blue-600 dark:text-blue-400">{currencySymbol}{selectedOrder.total.toFixed(2)}</span>
                    </div>
                 </div>
              </div>

              <div className="mt-8">
                  <Button className="w-full h-12 text-lg shadow-lg shadow-blue-500/20 dark:shadow-lg dark:shadow-blue-500/30">
                    <Receipt size={20} className="mr-2" />
                    Print Receipt
                  </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};