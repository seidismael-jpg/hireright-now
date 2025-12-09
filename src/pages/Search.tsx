import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProviderCard } from '@/components/home/ProviderCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import { useProviders } from '@/hooks/useProviders';
import { cn } from '@/lib/utils';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );

  const { categories, loading: categoriesLoading } = useCategories();
  const { providers, loading: providersLoading } = useProviders({
    categoryId: selectedCategory || undefined,
    searchQuery: query,
  });

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSearchParams({});
    } else {
      setSelectedCategory(categoryId);
      setSearchParams({ category: categoryId });
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setQuery('');
    setSearchParams({});
  };

  const header = (
    <div className="px-4 py-3 space-y-3">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services or providers..."
          className="h-12 pl-12 pr-4 rounded-xl border-0 bg-secondary"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {/* Active filters */}
      {(selectedCategory || query) && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {selectedCategoryName && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              {selectedCategoryName}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {(selectedCategory || query) && (
            <button 
              onClick={clearFilters}
              className="text-xs text-primary font-medium whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <MobileLayout header={header} footer={<BottomNav />}>
      {/* Categories horizontal scroll */}
      {!selectedCategory && !query && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Browse Categories</h2>
          <CategoryGrid categories={categories} loading={categoriesLoading} />
        </section>
      )}

      {/* All Categories List */}
      {!selectedCategory && !query && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">All Services</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  "bg-secondary hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Search Results */}
      {(selectedCategory || query) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedCategoryName || 'Search Results'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {providers.length} {providers.length === 1 ? 'provider' : 'providers'}
            </span>
          </div>
          
          {providersLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 skeleton-pulse rounded-2xl" />
              ))}
            </div>
          ) : providers.length > 0 ? (
            <div className="space-y-3">
              {providers.map((provider) => (
                <ProviderCard 
                  key={provider.id} 
                  provider={provider}
                  categoryName={selectedCategoryName}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No providers found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          )}
        </section>
      )}
    </MobileLayout>
  );
}
