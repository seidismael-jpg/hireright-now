import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';
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
      className={cn(
        "card-pressed w-full text-left p-4",
        compact ? "flex items-center gap-4" : "space-y-4"
      )}
    >
      <div className={cn(
        "flex items-start gap-4",
        !compact && "w-full"
      )}>
        <Avatar className={cn(
          "ring-2 ring-background shadow-soft",
          compact ? "w-14 h-14" : "w-16 h-16"
        )}>
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-foreground text-background font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {profile?.full_name || 'Service Provider'}
            </h3>
            {provider.is_available && (
              <span className="status-dot-success animate-pulse-subtle" />
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
                <span className="text-sm text-muted-foreground">
                  ({provider.total_reviews})
                </span>
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
            <p className="text-xl font-bold text-foreground">
              ${provider.hourly_rate}
            </p>
            <p className="text-xs text-muted-foreground font-medium">/hour</p>
          </div>
        )}
      </div>
      
      {!compact && provider.bio && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {provider.bio}
        </p>
      )}
      
      {!compact && provider.experience_years > 0 && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            {provider.experience_years}+ years
          </div>
        </div>
      )}
    </button>
  );
};