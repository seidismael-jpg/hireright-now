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

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const header = (
    <div className="px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar 
          className="w-12 h-12 cursor-pointer ring-2 ring-background shadow-soft transition-transform duration-200 hover:scale-105 active:scale-95" 
          onClick={() => navigate('/profile')}
        >
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-foreground text-background font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="animate-fade-in">
          <p className="text-sm text-muted-foreground font-medium">{getGreeting()}</p>
          <p className="text-heading-sm text-foreground">{firstName}</p>
        </div>
      </div>
      <button 
        className="icon-btn w-11 h-11"
        onClick={() => navigate('/notifications')}
      >
        <Bell className="w-5 h-5 text-foreground" strokeWidth={1.75} />
      </button>
    </div>
  );

  return (
    <MobileLayout header={header} footer={<BottomNav />}>
      <div className="px-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {/* Search Bar */}
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-4 h-14 px-5 bg-secondary rounded-2xl mb-8 transition-all duration-200 hover:bg-muted active:scale-[0.98]"
        >
          <Search className="w-5 h-5 text-muted-foreground" strokeWidth={1.75} />
          <span className="text-muted-foreground font-medium">What service do you need?</span>
        </button>

        {/* Categories */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-heading">Categories</h2>
            <button 
              onClick={() => navigate('/search')}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              See all
            </button>
          </div>
          <CategoryGrid categories={categories} loading={categoriesLoading} />
        </section>

        {/* Top Providers */}
        <section className="pb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-heading">Top Rated</h2>
            <button 
              onClick={() => navigate('/search')}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              See all
            </button>
          </div>
          
          {providersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 skeleton" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          ) : providers.length > 0 ? (
            <div className="space-y-3 stagger-children">
              {providers.map((provider) => (
                <ProviderCard 
                  key={provider.id} 
                  provider={provider}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-medium">No providers available yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
}