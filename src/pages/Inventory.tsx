import React, { useState } from 'react';
import { Package, Tag } from 'lucide-react';
import { ProductList } from '../components/inventory/ProductList';
import { CategoryList } from '../components/inventory/CategoryList';
import { cn } from '../lib/utils';

export const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Inventory Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your products, stock levels, and categories.</p>
        </div>

        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('products')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
              activeTab === 'products'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            )}
          >
            <Package size={16} />
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
              activeTab === 'categories'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            )}
          >
            <Tag size={16} />
            Categories
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'products' ? <ProductList /> : <CategoryList />}
      </div>
    </div>
  );
};