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

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <MobileLayout footer={<BottomNav />} noPadding>
      <div className="relative min-h-screen">
        {/* Gradient Header Background */}
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-header -z-10" />
        
        <div className="px-5 safe-top">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <Avatar 
                className="w-11 h-11 cursor-pointer ring-2 ring-white shadow-sm" 
                onClick={() => navigate('/profile')}
              >
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-accent text-white font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[13px] text-muted-foreground">{getGreeting()}</p>
                <p className="font-semibold text-foreground">{firstName}</p>
              </div>
            </div>
            <button 
              className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center touch-scale"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-5 h-5 text-foreground" strokeWidth={1.75} />
            </button>
          </div>

          {/* Search Bar */}
          <button
            onClick={() => navigate('/search')}
            className="w-full mt-5 animate-fade-up stagger-1"
          >
            <div className="flex items-center bg-white shadow-sm rounded-2xl px-4 py-3.5">
              <Search className="w-5 h-5 text-muted-foreground mr-3" strokeWidth={1.75} />
              <span className="text-muted-foreground text-[15px]">What service do you need?</span>
            </div>
          </button>

          {/* Categories Section */}
          <div className="mt-8 animate-fade-up stagger-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Categories</h2>
              <button 
                onClick={() => navigate('/search')}
                className="text-[13px] font-medium text-primary"
              >
                See all
              </button>
            </div>
            <CategoryGrid categories={categories} loading={categoriesLoading} />
          </div>

          {/* Top Providers Section */}
          <div className="mt-10 animate-fade-up stagger-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Top Providers</h2>
              <button 
                onClick={() => navigate('/search')}
                className="text-[13px] font-medium text-primary"
              >
                See all
              </button>
            </div>
            
            {providersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 skeleton" />
                ))}
              </div>
            ) : providers.length > 0 ? (
              <div className="space-y-3">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} compact />
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 text-center">
                <p className="text-muted-foreground text-[15px]">No providers available yet</p>
                <p className="text-[13px] text-muted-foreground mt-1">Check back soon!</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-10 mb-8 animate-fade-up stagger-4">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/bookings')}
                className="card-elevated p-4 text-left touch-scale"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-card flex items-center justify-center mb-3">
                  <span className="text-lg">📅</span>
                </div>
                <p className="font-semibold text-[15px]">My Bookings</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">View your appointments</p>
              </button>
              <button 
                onClick={() => navigate('/messages')}
                className="card-elevated p-4 text-left touch-scale"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-card flex items-center justify-center mb-3">
                  <span className="text-lg">💬</span>
                </div>
                <p className="font-semibold text-[15px]">Messages</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Chat with providers</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
