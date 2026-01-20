import React, { useState, useEffect } from 'react';
import { db, IOrder } from '../db';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  DollarSign,
  Package,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../store/useSettings';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currencySymbol } = useSettings();
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
    { label: "Today's Sales", value: `${currencySymbol}${stats.todaySales.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Low Stock Items', value: stats.lowStockItems, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of your store's performance today.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchStats()}>
                Refresh
            </Button>
            <Button onClick={() => navigate('/pos')}>
                Open POS
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={cn("border transition-all hover:shadow-md", card.border)}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{card.label}</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                        </div>
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", card.bg, card.color)}>
                            <card.icon size={24} />
                        </div>
                    </div>
                </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50">
                    View All <ArrowRight size={16} className="ml-2" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                        <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">Order #{order.id}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                                <span>•</span>
                                <span>{order.items.length} items</span>
                            </div>
                        </div>
                        </div>
                        <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{currencySymbol}{order.total.toFixed(2)}</p>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-100 ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-400/20">
                            Completed
                        </span>
                        </div>
                    </div>
                    ))}
                    {recentOrders.length === 0 && (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                        <Package size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No orders yet today.</p>
                    </div>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Quick Actions or Tips */}
        <div className="space-y-6">
           <Card className="bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-200 dark:shadow-blue-900">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">Daily Goal</h3>
                <p className="text-blue-100 mb-6">You've reached 85% of your daily sales goal. Keep pushing!</p>
                <div className="h-3 w-full rounded-full bg-blue-900/30">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-white shadow-sm" 
                    />
                </div>
                <div className="mt-2 flex justify-between text-xs text-blue-200 font-medium">
                    <span>{currencySymbol}0</span>
                    <span>Goal: {currencySymbol}1000</span>
                </div>
              </CardContent>
           </Card>
           
           <Card>
              <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <button onClick={() => navigate('/inventory')} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700 p-4 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 transition-all text-left">
                  <div className="h-8 w-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                    <TrendingUp size={18} />
                  </div>
                  <span>Inventory Report</span>
                </button>
                <button className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700 p-4 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 transition-all text-left">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                  <span>End of Day Settlement</span>
                </button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};
