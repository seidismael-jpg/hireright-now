import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { BookingStatus } from '@/types/database';

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning', icon: <AlertCircle className="w-4 h-4" /> },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success', icon: <CheckCircle className="w-4 h-4" /> },
  declined: { label: 'Declined', color: 'bg-destructive/10 text-destructive', icon: <XCircle className="w-4 h-4" /> },
  completed: { label: 'Completed', color: 'bg-primary/10 text-primary', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground', icon: <XCircle className="w-4 h-4" /> },
};

export default function Bookings() {
  const navigate = useNavigate();
  const { user, isProvider, providerProfile } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', user?.id, isProvider],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          provider:provider_profiles(
            *,
            profile:profiles!provider_profiles_user_id_fkey(*)
          ),
          service:provider_services(
            *,
            category:service_categories(*)
          ),
          customer_profile:profiles!bookings_customer_id_fkey(*)
        `)
        .order('scheduled_at', { ascending: false });

      if (isProvider && providerProfile) {
        query = query.eq('provider_id', providerProfile.id);
      } else {
        query = query.eq('customer_id', user!.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const activeBookings = bookings?.filter(b => ['pending', 'accepted'].includes(b.status)) || [];
  const pastBookings = bookings?.filter(b => ['completed', 'declined', 'cancelled'].includes(b.status)) || [];

  const BookingCard = ({ booking }: { booking: any }) => {
    const status = statusConfig[booking.status as BookingStatus];
    const otherParty = isProvider ? booking.customer_profile : booking.provider?.profile;
    const initials = otherParty?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || '?';

    return (
      <button
        onClick={() => navigate(`/bookings/${booking.id}`)}
        className="w-full bg-card rounded-2xl p-4 text-left transition-all hover:shadow-md"
      >
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={otherParty?.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold truncate">{otherParty?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.service?.category?.name || 'General Service'}
                </p>
              </div>
              <Badge className={status.color} variant="secondary">
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </Badge>
            </div>
            
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(booking.scheduled_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(booking.scheduled_at), 'h:mm a')}</span>
              </div>
              {booking.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{booking.address}</span>
                </div>
              )}
            </div>

            {booking.total_price && (
              <div className="mt-3 pt-3 border-t border-divider">
                <span className="font-semibold">${booking.total_price.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <MobileLayout 
      header={<PageHeader title={isProvider ? "Jobs" : "My Bookings"} />} 
      footer={<BottomNav />}
    >
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="active" className="flex-1">
            Active ({activeBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-32 skeleton-pulse rounded-2xl" />
            ))
          ) : activeBookings.length > 0 ? (
            activeBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No active bookings</p>
              {!isProvider && (
                <button 
                  onClick={() => navigate('/search')}
                  className="text-primary font-medium mt-2"
                >
                  Find a provider
                </button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-32 skeleton-pulse rounded-2xl" />
            ))
          ) : pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No past bookings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MobileLayout>
  );
}
