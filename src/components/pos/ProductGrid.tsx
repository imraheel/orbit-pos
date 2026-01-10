import React, { useState, useEffect } from 'react';
import { db, IProduct, ICategory } from '../../db';
import { Search, Tag } from 'lucide-react';
import { clsx } from 'clsx';

interface ProductGridProps {
  onProductSelect: (product: IProduct) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ onProductSelect }) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchData = async () => {
      const [p, c] = await Promise.all([
        db.products.toArray(),
        db.categories.toArray(),
      ]);
      setProducts(p);
      setCategories(c);
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.barcode.includes(search);
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search and Categories */}
      <div className="space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={clsx(
              'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all',
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id!)}
              className={clsx(
                'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all',
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => onProductSelect(product)}
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-all hover:border-blue-500 hover:shadow-lg active:scale-95"
            >
              <div className="aspect-square w-full bg-gray-50 flex items-center justify-center relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-200">
                    <Tag size={32} />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 rounded-lg bg-gray-900/80 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                   Stock: {product.stock}
                </div>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                  {product.name}
                </h3>
                <p className="mt-1 text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center text-gray-400">
            <Package size={48} strokeWidth={1} />
            <p className="mt-2">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

import { Package } from 'lucide-react';
