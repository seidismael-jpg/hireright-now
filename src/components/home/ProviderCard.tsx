import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { ProviderProfile, Profile } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ProviderCardProps {
  provider: ProviderProfile & { profile?: Profile };
  categoryName?: string;
  compact?: boolean;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ 
  provider, 
  categoryName,
  compact = false 
}) => {
  const navigate = useNavigate();
  const profile = provider.profile;
  
  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <button
      onClick={() => navigate(`/provider/${provider.id}`)}
      className="card-elevated w-full text-left p-4 flex items-center gap-4 touch-scale"
    >
      <Avatar className="w-14 h-14 ring-2 ring-background shadow-sm">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-gradient-accent text-white font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">
            {profile?.full_name || 'Service Provider'}
          </h3>
          {provider.is_available && (
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          )}
        </div>
        
        {categoryName && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {categoryName}
          </p>
        )}
        
        <div className="flex items-center gap-3 mt-2">
          {provider.avg_rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="text-sm font-semibold">{provider.avg_rating.toFixed(1)}</span>
            </div>
          )}
          
          {profile?.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-sm truncate">{profile.location}</span>
            </div>
          )}
        </div>
      </div>
      
      {provider.hourly_rate && (
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-foreground">${provider.hourly_rate}</p>
          <p className="text-xs text-muted-foreground font-medium">/hour</p>
        </div>
      )}
    </button>
  );
};
