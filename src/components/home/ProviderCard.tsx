import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { ProviderProfile, Profile } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
      className="card-elevated w-full text-left p-3.5 flex items-center gap-3.5 touch-scale"
    >
      <Avatar className="w-12 h-12 ring-1 ring-border">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-gradient-accent text-white font-semibold text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-[15px] text-foreground truncate">
            {profile?.full_name || 'Service Provider'}
          </h3>
          {provider.is_available && (
            <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          {provider.avg_rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-warning text-warning" />
              <span className="text-[13px] font-medium">{provider.avg_rating.toFixed(1)}</span>
            </div>
          )}
          
          {profile?.location && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <MapPin className="w-3 h-3" strokeWidth={2} />
              <span className="text-[12px] truncate">{profile.location}</span>
            </div>
          )}
        </div>
      </div>
      
      {provider.hourly_rate && (
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-foreground">${provider.hourly_rate}</p>
          <p className="text-[11px] text-muted-foreground">/hr</p>
        </div>
      )}
    </button>
  );
};
