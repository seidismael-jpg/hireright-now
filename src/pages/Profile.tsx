import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronRight, Camera, Briefcase, Star, Clock } from 'lucide-react';
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
    {
      icon: <User className="w-5 h-5" strokeWidth={1.75} />,
      label: 'Edit Profile',
      onClick: () => navigate('/profile/edit'),
    },
    ...(isProvider ? [
      {
        icon: <Briefcase className="w-5 h-5" strokeWidth={1.75} />,
        label: 'Manage Services',
        onClick: () => navigate('/profile/services'),
      },
    ] : []),
    {
      icon: <Settings className="w-5 h-5" strokeWidth={1.75} />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <MobileLayout 
      header={<PageHeader title="Profile" />} 
      footer={<BottomNav />}
    >
      <div className="px-5 animate-fade-in">
        {/* Profile Card */}
        <div className="card-floating p-6 mb-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="w-20 h-20 ring-4 ring-background shadow-medium">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-foreground text-background font-bold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button 
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-foreground rounded-full flex items-center justify-center shadow-soft transition-transform active:scale-90"
                onClick={() => navigate('/profile/edit')}
              >
                <Camera className="w-4 h-4 text-background" strokeWidth={2} />
              </button>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-heading-lg truncate">{profile?.full_name}</h2>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={isProvider ? "default" : "secondary"} className="rounded-full px-3">
                  {isProvider ? 'Provider' : 'Customer'}
                </Badge>
                {isProvider && providerProfile?.status === 'approved' && (
                  <Badge variant="outline" className="rounded-full px-3 border-success text-success">
                    Verified
                  </Badge>
                )}
                {isProvider && providerProfile?.status === 'pending' && (
                  <Badge variant="outline" className="rounded-full px-3 border-warning text-warning">
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Provider Stats */}
          {isProvider && providerProfile && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-divider">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Star className="w-5 h-5 text-warning fill-warning" />
                  <span className="text-display text-2xl">{providerProfile.avg_rating?.toFixed(1) || '0.0'}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-1">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-display text-2xl">{providerProfile.total_reviews || 0}</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">Reviews</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-display text-2xl">{providerProfile.experience_years || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-1">Years</p>
              </div>
            </div>
          )}

          {/* Provider Availability Toggle */}
          {isProvider && providerProfile?.status === 'approved' && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-divider">
              <div>
                <p className="font-semibold">Available for work</p>
                <p className="text-sm text-muted-foreground">
                  {providerProfile.is_available 
                    ? 'Customers can book you' 
                    : 'You are currently unavailable'}
                </p>
              </div>
              <Switch
                checked={providerProfile.is_available || false}
                onCheckedChange={() => toggleAvailability.mutate()}
                disabled={toggleAvailability.isPending}
              />
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="card-floating overflow-hidden mb-5">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center gap-4 p-4 text-left transition-all duration-200 hover:bg-secondary/50 active:bg-secondary ${
                index < menuItems.length - 1 ? 'border-b border-divider' : ''
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                {item.icon}
              </div>
              <span className="flex-1 font-semibold">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" strokeWidth={1.75} />
            </button>
          ))}
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          size="lg"
          className="w-full rounded-2xl h-14 font-semibold text-base"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-2" strokeWidth={1.75} />
          Sign Out
        </Button>
      </div>
    </MobileLayout>
  );
}