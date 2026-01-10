import React, { useState, useEffect } from 'react';
import { db, IOrder, ICustomer, IUser } from '../db';
import { Search, Eye, Receipt, User, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const History: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [customers, setCustomers] = useState<Record<number, ICustomer>>({});
  const [users, setUsers] = useState<Record<number, IUser>>({});
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

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
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700 z-10">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b bg-white hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-blue-600">#{order.id}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <User size={14} />
                    </div>
                    <span className="font-medium text-gray-700">
                      {order.customerId ? customers[order.customerId]?.name : 'Walk-in Customer'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-black text-gray-900">${order.total.toFixed(2)}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-800">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
                   <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                         <Receipt size={20} />
                      </div>
                      <div>
                         <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Order ID</p>
                         <p className="font-mono font-bold text-gray-800">#{selectedOrder.id}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold text-right">Processed By</p>
                      <p className="font-bold text-gray-800">{users[selectedOrder.userId]?.username || 'System'}</p>
                   </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                     <Clock size={16} /> Items
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                        <span className="text-gray-600">{item.quantity}x {item.productName}</span>
                        <span className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black text-blue-600">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 font-bold text-white hover:bg-gray-800 transition-all">
                <Receipt size={20} />
                Print Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
