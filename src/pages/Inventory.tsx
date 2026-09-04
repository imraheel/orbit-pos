import React, { useState } from 'react';
import { Package, Tag, ClipboardList } from 'lucide-react';
import { ProductList } from '../components/inventory/ProductList';
import { CategoryList } from '../components/inventory/CategoryList';
import { StockMovementList } from '../components/inventory/StockMovementList';
import { StockAdjustModal } from '../components/inventory/StockAdjustModal';
import { usePermission } from '../hooks/usePermission';
import { cn } from '../lib/utils';

export const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'stock'>('products');
  const [isStockAdjustOpen, setIsStockAdjustOpen] = useState(false);
  const { hasPermission } = usePermission();
  const canManageStock = hasPermission('manage_inventory');

  const tabs = [
    { key: 'products' as const, label: 'Products', icon: Package },
    { key: 'categories' as const, label: 'Categories', icon: Tag },
    { key: 'stock' as const, label: 'Stock', icon: ClipboardList },
  ];

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Inventory Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your products, stock levels, and categories.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                  activeTab === tab.key
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'products' && <ProductList />}
        {activeTab === 'categories' && <CategoryList />}
        {activeTab === 'stock' && <StockMovementList onAdjustClick={canManageStock ? () => setIsStockAdjustOpen(true) : undefined} />}
      </div>

      <StockAdjustModal
        isOpen={isStockAdjustOpen}
        onClose={() => setIsStockAdjustOpen(false)}
        onSuccess={() => setIsStockAdjustOpen(false)}
      />
    </div>
  );
};
