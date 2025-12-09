import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';
import { ProviderProfile, Profile } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
        compact ? "flex items-center gap-3" : "space-y-3"
      )}
    >
      <div className={cn(
        "flex items-start gap-3",
        !compact && "w-full"
      )}>
        <Avatar className={cn(compact ? "w-12 h-12" : "w-14 h-14")}>
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {profile?.full_name || 'Service Provider'}
            </h3>
            {provider.is_available && (
              <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
            )}
          </div>
          
          {categoryName && (
            <p className="text-sm text-muted-foreground truncate">
              {categoryName}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-1">
            {provider.avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{provider.avg_rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({provider.total_reviews})
                </span>
              </div>
            )}
            
            {profile?.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="text-sm truncate">{profile.location}</span>
              </div>
            )}
          </div>
        </div>
        
        {provider.hourly_rate && (
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-foreground">
              ${provider.hourly_rate}
            </p>
            <p className="text-xs text-muted-foreground">/hour</p>
          </div>
        )}
      </div>
      
      {!compact && provider.bio && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {provider.bio}
        </p>
      )}
      
      {!compact && provider.experience_years > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {provider.experience_years}+ years exp.
          </Badge>
        </div>
      )}
    </button>
  );
};
