import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProviderCard } from '@/components/home/ProviderCard';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useProviders } from '@/hooks/useProviders';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { providers, loading: providersLoading } = useProviders({ limit: 5 });

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const header = (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar 
          className="w-10 h-10 cursor-pointer" 
          onClick={() => navigate('/profile')}
        >
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-muted-foreground">Good morning</p>
          <p className="font-semibold text-foreground">{firstName}</p>
        </div>
      </div>
      <button 
        className="touch-button rounded-full hover:bg-accent transition-colors"
        onClick={() => navigate('/notifications')}
      >
        <Bell className="w-5 h-5 text-foreground" />
      </button>
    </div>
  );

  return (
    <MobileLayout header={header} footer={<BottomNav />}>
      {/* Search Bar */}
      <button
        onClick={() => navigate('/search')}
        className="w-full flex items-center gap-3 h-12 px-4 bg-secondary rounded-xl mb-6"
      >
        <Search className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground">What service do you need?</span>
      </button>

      {/* Categories */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button 
            onClick={() => navigate('/search')}
            className="text-sm text-primary font-medium"
          >
            See all
          </button>
        </div>
        <CategoryGrid categories={categories} loading={categoriesLoading} />
      </section>

      {/* Top Providers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Top Rated Providers</h2>
          <button 
            onClick={() => navigate('/search')}
            className="text-sm text-primary font-medium"
          >
            See all
          </button>
        </div>
        
        {providersLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 skeleton-pulse rounded-2xl" />
            ))}
          </div>
        ) : providers.length > 0 ? (
          <div className="space-y-3">
            {providers.map((provider) => (
              <ProviderCard 
                key={provider.id} 
                provider={provider}
                compact
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No providers available yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}
      </section>
    </MobileLayout>
  );
}
