import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, LogOut, ChevronRight, 
  CreditCard, Bell, Shield, HelpCircle, Briefcase
} from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, providerProfile, isProvider, signOut } = useAuth();

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', onClick: () => navigate('/profile/edit') },
        { icon: Bell, label: 'Notifications', onClick: () => {} },
        { icon: Shield, label: 'Privacy & Security', onClick: () => {} },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: CreditCard, label: 'Payment Methods', onClick: () => {} },
        ...(isProvider ? [{ icon: Briefcase, label: 'Manage Services', onClick: () => navigate('/profile/services') }] : []),
        { icon: Settings, label: 'Settings', onClick: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', onClick: () => {} },
      ],
    },
  ];

  return (
    <MobileLayout 
      header={<PageHeader title="Profile" />} 
      footer={<BottomNav />}
      noPadding
    >
      <div className="px-5 animate-fade-up">
        {/* Profile Header */}
        <div className="flex items-center gap-4 py-2">
          <Avatar className="w-16 h-16 ring-2 ring-white shadow-md">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-accent text-white font-bold text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{profile?.full_name || 'User'}</h2>
            <p className="text-[13px] text-muted-foreground truncate">{user?.email}</p>
            {isProvider && (
              <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
                Service Provider
              </span>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/profile/edit')}
            className="text-[13px] font-medium text-primary"
          >
            Edit
          </button>
        </div>

        {/* Stats for Providers */}
        {isProvider && providerProfile && (
          <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-secondary rounded-2xl animate-fade-up stagger-1">
            <div className="text-center">
              <p className="text-xl font-bold">{providerProfile.avg_rating?.toFixed(1) || '0.0'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Rating</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-xl font-bold">{providerProfile.total_reviews || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{providerProfile.experience_years || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Years</p>
            </div>
          </div>
        )}

        {/* Menu Sections */}
        <div className="mt-6 space-y-6 animate-fade-up stagger-2">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {section.title}
              </p>
              <div className="card-elevated overflow-hidden">
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-4 py-3.5 text-left touch-scale",
                        index < section.items.length - 1 && "border-b border-border"
                      )}
                    >
                      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                        <Icon className="w-[18px] h-[18px] text-foreground" strokeWidth={1.75} />
                      </div>
                      <span className="flex-1 text-[15px] font-medium">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 mt-8 mb-6 py-3.5 text-destructive font-medium touch-scale animate-fade-up stagger-3"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
          <span>Sign Out</span>
        </button>
      </div>
    </MobileLayout>
  );
}
