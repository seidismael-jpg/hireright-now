import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProviderProfile, Profile, ProviderService, ServiceCategory, Review } from '@/types/database';

interface ProviderWithDetails extends ProviderProfile {
  profile: Profile;
  services: (ProviderService & { category: ServiceCategory })[];
}

export default function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_profiles')
        .select(`
          *,
          profile:profiles!provider_profiles_user_id_fkey(*),
          services:provider_services(
            *,
            category:service_categories(*)
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as ProviderWithDetails;
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['provider-reviews', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customer_profile:profiles!reviews_customer_id_fkey(*)
        `)
        .eq('provider_id', id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const header = (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        onClick={() => navigate(-1)}
        className="touch-button rounded-full hover:bg-accent transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="font-semibold text-lg">Provider Details</h1>
    </div>
  );

  if (isLoading) {
    return (
      <MobileLayout header={header}>
        <div className="space-y-4">
          <div className="h-32 skeleton-pulse rounded-2xl" />
          <div className="h-24 skeleton-pulse rounded-2xl" />
          <div className="h-48 skeleton-pulse rounded-2xl" />
        </div>
      </MobileLayout>
    );
  }

  if (!provider) {
    return (
      <MobileLayout header={header}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Provider not found</p>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const initials = provider.profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <MobileLayout header={header}>
      {/* Profile Header */}
      <div className="bg-card rounded-2xl p-4 mb-4">
        <div className="flex gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={provider.profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">{provider.profile?.full_name}</h2>
              {provider.status === 'approved' && (
                <CheckCircle className="w-4 h-4 text-success" />
              )}
            </div>
            
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-medium">{provider.avg_rating?.toFixed(1) || '0.0'}</span>
              <span className="text-muted-foreground">({provider.total_reviews || 0} reviews)</span>
            </div>
            
            {provider.profile?.location && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{provider.profile.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{provider.experience_years || 0} years experience</span>
            </div>
          </div>
        </div>
        
        {provider.bio && (
          <p className="text-muted-foreground text-sm mt-4">{provider.bio}</p>
        )}
        
        {/* Availability Badge */}
        <div className="mt-4">
          <Badge variant={provider.is_available ? "default" : "secondary"}>
            {provider.is_available ? "Available Now" : "Currently Unavailable"}
          </Badge>
        </div>
      </div>

      {/* Services */}
      <div className="bg-card rounded-2xl p-4 mb-4">
        <h3 className="font-semibold mb-3">Services Offered</h3>
        {provider.services?.length > 0 ? (
          <div className="space-y-2">
            {provider.services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedService === service.id 
                    ? 'bg-primary/10 border-2 border-primary' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{service.category?.name}</p>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{service.description}</p>
                    )}
                  </div>
                  <p className="font-semibold text-primary">
                    ${service.price?.toFixed(0) || provider.hourly_rate?.toFixed(0) || 'Quote'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No services listed yet.</p>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-card rounded-2xl p-4 mb-24">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Reviews</h3>
          {reviews && reviews.length > 0 && (
            <button className="text-sm text-primary font-medium">See all</button>
          )}
        </div>
        
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="border-b border-divider pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={review.customer_profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-secondary text-xs">
                      {review.customer_profile?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{review.customer_profile?.full_name}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating 
                              ? 'text-warning fill-warning' 
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-divider p-4 safe-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate(`/messages/${provider.user_id}`)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => navigate(`/book/${provider.id}${selectedService ? `?service=${selectedService}` : ''}`)}
            disabled={!provider.is_available}
          >
            Book Now
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
