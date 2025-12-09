import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, MessageCircle, Phone, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BookingStatus } from '@/types/database';

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning', icon: <AlertCircle className="w-4 h-4" /> },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success', icon: <CheckCircle className="w-4 h-4" /> },
  declined: { label: 'Declined', color: 'bg-destructive/10 text-destructive', icon: <XCircle className="w-4 h-4" /> },
  completed: { label: 'Completed', color: 'bg-primary/10 text-primary', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground', icon: <XCircle className="w-4 h-4" /> },
};

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isProvider } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data, error } = await supabase
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
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      // Fetch customer profile separately
      if (data) {
        const { data: customerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.customer_id)
          .maybeSingle();
        return { ...data, customer_profile: customerProfile };
      }
      return data;
    },
    enabled: !!id,
  });

  const { data: existingReview } = useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', id)
        .maybeSingle();
      return data;
    },
    enabled: !!id && booking?.status === 'completed',
  });

  const updateStatus = useMutation({
    mutationFn: async (status: BookingStatus) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking updated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update booking');
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: id!,
          customer_id: user!.id,
          provider_id: booking!.provider_id,
          rating,
          comment: reviewComment || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review', id] });
      setReviewDialogOpen(false);
      toast.success('Review submitted!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });

  const header = (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        onClick={() => navigate('/bookings')}
        className="touch-button rounded-full hover:bg-accent transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="font-semibold text-lg">Booking Details</h1>
    </div>
  );

  if (isLoading) {
    return (
      <MobileLayout header={header}>
        <div className="space-y-4">
          <div className="h-32 skeleton-pulse rounded-2xl" />
          <div className="h-48 skeleton-pulse rounded-2xl" />
        </div>
      </MobileLayout>
    );
  }

  if (!booking) {
    return (
      <MobileLayout header={header}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Booking not found</p>
        </div>
      </MobileLayout>
    );
  }

  const status = statusConfig[booking.status as BookingStatus];
  const otherParty = isProvider ? booking.customer_profile : booking.provider?.profile;
  const initials = otherParty?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?';

  const canReview = !isProvider && booking.status === 'completed' && !existingReview;

  return (
    <MobileLayout header={header}>
      {/* Status Banner */}
      <div className={`rounded-2xl p-4 mb-4 ${status.color}`}>
        <div className="flex items-center gap-2">
          {status.icon}
          <span className="font-semibold">{status.label}</span>
        </div>
      </div>

      {/* Party Info */}
      <div className="bg-card rounded-2xl p-4 mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          {isProvider ? 'Customer' : 'Provider'}
        </p>
        <div className="flex items-center gap-3">
          <Avatar className="w-14 h-14">
            <AvatarImage src={otherParty?.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-lg">{otherParty?.full_name}</p>
            {otherParty?.phone && (
              <p className="text-sm text-muted-foreground">{otherParty.phone}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/messages/${isProvider ? booking.customer_id : booking.provider?.user_id}`)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          {otherParty?.phone && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(`tel:${otherParty.phone}`)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
          )}
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-card rounded-2xl p-4 mb-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{format(new Date(booking.scheduled_at), 'MMMM d, yyyy')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">{format(new Date(booking.scheduled_at), 'h:mm a')}</p>
          </div>
        </div>

        {booking.address && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{booking.address}</p>
            </div>
          </div>
        )}

        {booking.service && (
          <div className="pt-2 border-t border-divider">
            <p className="text-sm text-muted-foreground">Service</p>
            <p className="font-medium">{booking.service.category?.name}</p>
          </div>
        )}

        {booking.description && (
          <div className="pt-2 border-t border-divider">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm mt-1">{booking.description}</p>
          </div>
        )}

        {booking.total_price && (
          <div className="pt-2 border-t border-divider">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-bold">${booking.total_price.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Existing Review */}
      {existingReview && (
        <div className="bg-card rounded-2xl p-4 mb-4">
          <p className="text-sm text-muted-foreground mb-2">Your Review</p>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < existingReview.rating 
                    ? 'text-warning fill-warning' 
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          {existingReview.comment && (
            <p className="text-sm">{existingReview.comment}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pb-6">
        {isProvider && booking.status === 'pending' && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => updateStatus.mutate('declined')}
              disabled={updateStatus.isPending}
            >
              Decline
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => updateStatus.mutate('accepted')}
              disabled={updateStatus.isPending}
            >
              Accept
            </Button>
          </div>
        )}

        {isProvider && booking.status === 'accepted' && (
          <Button
            size="lg"
            className="w-full"
            onClick={() => updateStatus.mutate('completed')}
            disabled={updateStatus.isPending}
          >
            Mark as Completed
          </Button>
        )}

        {!isProvider && booking.status === 'pending' && (
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => updateStatus.mutate('cancelled')}
            disabled={updateStatus.isPending}
          >
            Cancel Booking
          </Button>
        )}

        {canReview && (
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full">
                <Star className="w-4 h-4 mr-2" />
                Leave a Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rate Your Experience</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="touch-button"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= rating 
                            ? 'text-warning fill-warning' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Share your experience (optional)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
                <Button
                  className="w-full"
                  onClick={() => submitReview.mutate()}
                  disabled={submitReview.isPending}
                >
                  {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MobileLayout>
  );
}
