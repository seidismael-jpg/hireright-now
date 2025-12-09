import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MapPin } from 'lucide-react';
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

  const firstName = profile?.full_name?.split(' ')[0] || 'Muhammad';

  return (
    <MobileLayout footer={<BottomNav />} noPadding>
      <div className="relative min-h-screen">
        {/* Gradient Header Background */}
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-header -z-10" />
        
        <div className="px-5 safe-top">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <Avatar 
                className="w-12 h-12 cursor-pointer ring-2 ring-background shadow-md" 
                onClick={() => navigate('/profile')}
              >
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-accent text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold text-foreground">100.00 $</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Top up credit
                </p>
              </div>
            </div>
            <button 
              className="w-12 h-12 rounded-full bg-card shadow-md flex items-center justify-center touch-scale"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-5 h-5 text-foreground" strokeWidth={1.75} />
            </button>
          </div>

          {/* Greeting */}
          <div className="mt-4 animate-fade-up stagger-1">
            <h1 className="text-heading text-foreground">
              Hello {firstName},
            </h1>
            <p className="text-2xl font-medium text-primary mt-1">
              Where to go?
            </p>
          </div>

          {/* Search Bar */}
          <button
            onClick={() => navigate('/search')}
            className="w-full mt-6 animate-fade-up stagger-2"
          >
            <div className="relative flex items-center bg-card shadow-md rounded-2xl px-5 py-4">
              <Search className="w-5 h-5 text-muted-foreground mr-4" strokeWidth={1.75} />
              <span className="text-muted-foreground font-medium flex-1 text-left">Enter destination</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
            </div>
          </button>

          {/* Categories */}
          <div className="mt-8 animate-fade-up stagger-3">
            <CategoryGrid categories={categories} loading={categoriesLoading} />
          </div>

          {/* Location Cards */}
          <div className="mt-8 animate-fade-up stagger-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="card-elevated p-4">
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <p className="font-bold text-lg">PITX</p>
                <p className="text-xs text-muted-foreground">Parañaque City</p>
              </div>
              <div className="card-elevated p-4">
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <p className="font-bold text-lg">Cubao</p>
                <p className="text-xs text-muted-foreground">Quezon City</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="card-elevated p-4">
                <p className="text-xs text-muted-foreground mb-1">Departing on</p>
                <p className="font-semibold">Select Date</p>
              </div>
              <div className="card-elevated p-4">
                <p className="text-xs text-muted-foreground mb-1">Passengers</p>
                <p className="font-semibold">1 Passenger</p>
              </div>
            </div>

            {/* Search Button */}
            <button className="w-full mt-6 bg-foreground text-background py-4 rounded-2xl font-semibold text-base touch-scale">
              Search
            </button>
          </div>

          {/* Promo Card */}
          <div className="mt-8 mb-8 animate-fade-up stagger-5">
            <div className="bg-gradient-to-br from-purple-200/80 to-blue-200/80 rounded-3xl p-5 relative overflow-hidden">
              <div className="absolute right-4 top-4 w-20 h-20 bg-white/30 rounded-2xl" />
              <h3 className="text-lg font-semibold text-foreground relative z-10">Ready for</h3>
              <p className="text-xl font-bold text-foreground relative z-10">Great Service?</p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
