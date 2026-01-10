import React, { useState, useEffect } from 'react';
import { db, IOrder } from '../db';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  DollarSign,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockItems: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [allOrders, allCustomers, allProducts] = await Promise.all([
      db.orders.toArray(),
      db.customers.toArray(),
      db.products.toArray(),
    ]);

    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);
    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const lowStock = allProducts.filter(p => p.stock < 10).length;

    setStats({
      todaySales,
      totalOrders: allOrders.length,
      totalCustomers: allCustomers.length,
      lowStockItems: lowStock,
    });

    setRecentOrders(allOrders.reverse().slice(0, 5));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: "Today's Sales", value: `$${stats.todaySales.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Low Stock Items', value: stats.lowStockItems, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
            <p className="mt-1 text-3xl font-black text-gray-800">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-800">Recent Orders</h3>
            <button className="text-sm font-bold text-blue-600 hover:underline">View All History</button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl border border-gray-50 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Order #{order.id}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">${order.total.toFixed(2)}</p>
                  <p className="text-xs text-green-500 font-bold">Completed</p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <p>No orders yet today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions or Tips */}
        <div className="space-y-6">
           <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-100">
              <h3 className="text-xl font-black">Sales Goal</h3>
              <p className="mt-2 text-blue-100">You've reached 85% of your daily goal. Keep it up!</p>
              <div className="mt-6 h-3 w-full rounded-full bg-blue-500/50">
                <div className="h-full w-[85%] rounded-full bg-white shadow-sm shadow-blue-400"></div>
              </div>
           </div>
           
           <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-black text-gray-800 mb-4">Popular Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <button className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4 font-bold text-gray-700 hover:bg-gray-50 transition-all">
                  <TrendingUp size={20} className="text-blue-600" />
                  Inventory Report
                </button>
                <button className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4 font-bold text-gray-700 hover:bg-gray-50 transition-all">
                  <DollarSign size={20} className="text-green-600" />
                  Settlement
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};