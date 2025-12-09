import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronRight, Camera, Briefcase, Star, MapPin, Globe } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, providerProfile, isProvider, signOut, refreshProfile } = useAuth();

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const toggleAvailability = useMutation({
    mutationFn: async () => {
      if (!providerProfile) return;
      
      const { error } = await supabase
        .from('provider_profiles')
        .update({ is_available: !providerProfile.is_available })
        .eq('id', providerProfile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      refreshProfile();
      toast.success(providerProfile?.is_available ? 'You are now unavailable' : 'You are now available');
    },
    onError: () => {
      toast.error('Failed to update availability');
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const menuItems = [
    { icon: User, label: 'Edit Profile', onClick: () => navigate('/profile/edit') },
    ...(isProvider ? [{ icon: Briefcase, label: 'Manage Services', onClick: () => navigate('/profile/services') }] : []),
    { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
  ];

  return (
    <MobileLayout 
      header={<PageHeader title="Drivers Details" showBack />} 
      footer={<BottomNav />}
    >
      <div className="px-5 animate-fade-up">
        {/* Profile Card */}
        <div className="card-elevated p-6 text-center">
          <div className="relative inline-block">
            <Avatar className="w-28 h-28 ring-4 ring-background shadow-lg mx-auto">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-accent text-white font-bold text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button 
              className="absolute -bottom-1 -right-1 w-9 h-9 bg-foreground rounded-full flex items-center justify-center shadow-md touch-scale"
              onClick={() => navigate('/profile/edit')}
            >
              <Camera className="w-4 h-4 text-background" strokeWidth={2} />
            </button>
          </div>
          
          <h2 className="text-xl font-bold mt-5">{profile?.full_name || 'Carlos Santos'}</h2>
          
          {/* Tags */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              {profile?.location || 'Philippine'}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="w-4 h-4 text-destructive" />
              English
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold">1,600km</p>
              <p className="text-xs text-muted-foreground mt-1">Ride Experience</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{providerProfile?.avg_rating?.toFixed(1) || '4.9'}</p>
              <p className="text-xs text-muted-foreground mt-1">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{providerProfile?.experience_years || '4'} Years</p>
              <p className="text-xs text-muted-foreground mt-1">Experience</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Reviews</h3>
              <span className="text-sm text-muted-foreground">({providerProfile?.total_reviews || 160})</span>
            </div>
            <button className="text-sm font-medium text-muted-foreground">View All</button>
          </div>

          {/* Review Cards */}
          <div className="space-y-4">
            <div className="card-elevated p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-secondary text-sm font-semibold">DL</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Devon Lane</p>
                    <p className="text-xs text-muted-foreground">Passenger</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="font-semibold text-sm">5.0</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                "I requested expedited service, and the driver arrived for pickup quicker than I expected. Overall, it was a fantastic experience!"
              </p>
            </div>

            <div className="card-elevated p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-secondary text-sm font-semibold">AF</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Albert Flores</p>
                    <p className="text-xs text-muted-foreground">Passenger</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="font-semibold text-sm">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8 mb-6">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border touch-scale">
            <span className="text-lg">📞</span>
            <span className="font-medium">Call</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground touch-scale">
            <span className="text-lg">💬</span>
            <span className="font-medium">Chat</span>
          </button>
          <button className="w-12 h-12 rounded-xl border border-green-500 flex items-center justify-center touch-scale">
            <span className="text-xl">📱</span>
          </button>
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          size="lg"
          className="w-full rounded-2xl h-14 font-semibold text-base mb-4"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-2" strokeWidth={1.75} />
          Sign Out
        </Button>
      </div>
    </MobileLayout>
  );
}
