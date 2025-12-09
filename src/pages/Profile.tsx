import React, { useState } from 'react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, providerProfile, isProvider, signOut, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

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
      icon: <User className="w-5 h-5" />,
      label: 'Edit Profile',
      onClick: () => navigate('/profile/edit'),
    },
    ...(isProvider ? [
      {
        icon: <Briefcase className="w-5 h-5" />,
        label: 'Manage Services',
        onClick: () => navigate('/profile/services'),
      },
    ] : []),
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <MobileLayout 
      header={<PageHeader title="Profile" />} 
      footer={<BottomNav />}
    >
      {/* Profile Card */}
      <div className="bg-card rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button 
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
              onClick={() => navigate('/profile/edit')}
            >
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          
          <div className="flex-1">
            <h2 className="font-bold text-xl">{profile?.full_name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={isProvider ? "default" : "secondary"}>
                {isProvider ? 'Provider' : 'Customer'}
              </Badge>
              {isProvider && providerProfile?.status === 'approved' && (
                <Badge variant="outline" className="border-success text-success">
                  Verified
                </Badge>
              )}
              {isProvider && providerProfile?.status === 'pending' && (
                <Badge variant="outline" className="border-warning text-warning">
                  Pending Approval
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Provider Stats */}
        {isProvider && providerProfile && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-divider">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-bold text-lg">{providerProfile.avg_rating?.toFixed(1) || '0.0'}</span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{providerProfile.total_reviews || 0}</p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-bold text-lg">{providerProfile.experience_years || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Years Exp.</p>
            </div>
          </div>
        )}

        {/* Provider Availability Toggle */}
        {isProvider && providerProfile?.status === 'approved' && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-divider">
            <div>
              <p className="font-medium">Available for work</p>
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
      <div className="bg-card rounded-2xl overflow-hidden mb-4">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/50 ${
              index < menuItems.length - 1 ? 'border-b border-divider' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              {item.icon}
            </div>
            <span className="flex-1 font-medium">{item.label}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sign Out
      </Button>
    </MobileLayout>
  );
}
