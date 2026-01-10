import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Package, Tag } from 'lucide-react';
import { ProductList } from '../components/inventory/ProductList';
import { CategoryList } from '../components/inventory/CategoryList';

export const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('products')}
            className={clsx(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
              activeTab === 'products'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Package size={18} />
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={clsx(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
              activeTab === 'categories'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Tag size={18} />
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
