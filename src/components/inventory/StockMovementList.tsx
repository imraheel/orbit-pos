import React, { useState, useEffect } from 'react';
import { db, IStockMovement, IProduct, IUser } from '../../db';
import { getRecentMovements } from '../../db/stockService';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Search, ArrowUpCircle, ArrowDownCircle, RefreshCw, ShoppingCart, RotateCcw, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

type MovementType = IStockMovement['type'];

const movementTypeConfig: Record<MovementType, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' | 'default'; icon: React.ReactNode }> = {
  addition: { label: 'Added', variant: 'success', icon: <ArrowUpCircle size={14} /> },
  removal: { label: 'Removed', variant: 'destructive', icon: <ArrowDownCircle size={14} /> },
  adjustment: { label: 'Adjusted', variant: 'warning', icon: <RefreshCw size={14} /> },
  sale: { label: 'Sale', variant: 'secondary', icon: <ShoppingCart size={14} /> },
  return: { label: 'Return', variant: 'default', icon: <RotateCcw size={14} /> },
};

interface StockMovementListProps {
  onAdjustClick?: () => void;
}

export const StockMovementList: React.FC<StockMovementListProps> = ({ onAdjustClick }) => {
  const [movements, setMovements] = useState<IStockMovement[]>([]);
  const [products, setProducts] = useState<Record<number, IProduct>>({});
  const [users, setUsers] = useState<Record<number, IUser>>({});
  const [search, setSearch] = useState('');
  const [filterProductId, setFilterProductId] = useState<number | 'all'>('all');

  const fetchData = async () => {
    const [allMovements, allProducts, allUsers] = await Promise.all([
      getRecentMovements(200),
      db.products.toArray(),
      db.users.toArray(),
    ]);
    setMovements(allMovements);
    setProducts(Object.fromEntries(allProducts.map(p => [p.id!, p])));
    setUsers(Object.fromEntries(allUsers.map(u => [u.id!, u])));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMovements = movements.filter(m => {
    const product = products[m.productId];
    const matchesSearch = !search ||
      product?.name.toLowerCase().includes(search.toLowerCase()) ||
      product?.barcode.includes(search);
    const matchesProduct = filterProductId === 'all' || m.productId === filterProductId;
    return matchesSearch && matchesProduct;
  });

  const productList = Object.values(products);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-100/50 dark:bg-slate-800/50">
        <div className="flex flex-1 items-center gap-3">
          <Input
            icon={<Search size={18} />}
            placeholder="Search by product name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs bg-white dark:bg-slate-800"
          />
          <select
            value={filterProductId}
            onChange={(e) => setFilterProductId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Products</option>
            {productList.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {onAdjustClick && (
          <Button onClick={onAdjustClick}>
            <Plus size={18} className="mr-2" />
            Adjust Stock
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/50">
            <tr>
              <th className="px-6 py-4">Date/Time</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Qty</th>
              <th className="px-6 py-4 text-right">Before → After</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredMovements.map((movement) => {
              const product = products[movement.productId];
              const user = users[movement.userId];
              const config = movementTypeConfig[movement.type];
              const isNegative = movement.type === 'removal' || movement.type === 'sale';

              return (
                <tr key={movement.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(movement.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {product?.name || `Product #${movement.productId}`}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={config.variant} className="gap-1">
                      {config.icon}
                      {config.label}
                    </Badge>
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-right font-medium",
                    isNegative
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  )}>
                    {isNegative ? '-' : '+'}{movement.quantity}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
                    {movement.stockBefore} → {movement.stockAfter}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {user?.username || `User #${movement.userId}`}
                  </td>
                  <td className="px-6 py-4 text-slate-400 dark:text-slate-500 max-w-[200px] truncate">
                    {movement.note || '—'}
                  </td>
                </tr>
              );
            })}
            {filteredMovements.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  No stock movements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
