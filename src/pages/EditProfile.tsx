import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, profile, providerProfile, isProvider, refreshProfile } = useAuth();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(providerProfile?.bio || '');
  const [experienceYears, setExperienceYears] = useState(providerProfile?.experience_years?.toString() || '0');
  const [hourlyRate, setHourlyRate] = useState(providerProfile?.hourly_rate?.toString() || '');

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const updateProfile = useMutation({
    mutationFn: async () => {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
          location: location || null,
        })
        .eq('user_id', user!.id);

      if (profileError) throw profileError;

      // Update provider profile if applicable
      if (isProvider && providerProfile) {
        const { error: providerError } = await supabase
          .from('provider_profiles')
          .update({
            bio: bio || null,
            experience_years: parseInt(experienceYears) || 0,
            hourly_rate: parseFloat(hourlyRate) || null,
          })
          .eq('id', providerProfile.id);

        if (providerError) throw providerError;
      }
    },
    onSuccess: () => {
      refreshProfile();
      toast.success('Profile updated!');
      navigate('/profile');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const header = (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        onClick={() => navigate('/profile')}
        className="touch-button rounded-full hover:bg-accent transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="font-semibold text-lg">Edit Profile</h1>
    </div>
  );

  return (
    <MobileLayout header={header}>
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Provider-specific fields */}
        {isProvider && (
          <div className="space-y-4 pt-4 border-t border-divider">
            <h3 className="font-semibold">Provider Details</h3>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell customers about yourself and your work..."
                rows={4}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        )}

        <Button
          size="lg"
          className="w-full"
          onClick={() => updateProfile.mutate()}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </MobileLayout>
  );
}
