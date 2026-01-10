import React, { useState, useEffect } from 'react';
import { db, IProduct, ICategory } from '../../db';
import { Search, Tag, Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search) {
      const product = products.find((p) => p.barcode === search);
      if (product) {
        onProductSelect(product);
        setSearch('');
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
      {/* Search and Categories */}
      <div className="space-y-4 p-4 border-b border-slate-200 bg-white">
        <Input
          icon={<Search size={18} />}
          placeholder="Search products by name or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="bg-slate-50"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all border',
              selectedCategory === 'all'
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            )}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id!)}
              className={cn(
                'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all border',
                selectedCategory === cat.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => onProductSelect(product)}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all hover:border-blue-500 hover:shadow-md active:scale-95 active:ring-2 active:ring-blue-500/20"
            >
              <div className="aspect-square w-full bg-slate-100 flex items-center justify-center relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                    <Tag size={32} />
                  </div>
                )}
                <div className="absolute bottom-2 right-2">
                   <Badge variant={product.stock <= 5 ? "destructive" : "secondary"} className="bg-white/90 backdrop-blur shadow-sm text-xs border border-slate-100">
                     {product.stock} left
                   </Badge>
                </div>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                  {product.name}
                </h3>
                <p className="mt-1 text-base font-bold text-slate-900">${product.price.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <Package size={64} strokeWidth={1} className="text-slate-300" />
            <p className="mt-4 font-medium text-slate-500">No products found</p>
            <p className="text-sm">Try adjusting your search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
};