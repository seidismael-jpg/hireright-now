import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function Booking() {
  const { providerId } = useParams<{ providerId: string }>();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1);

  const { data: provider } = useQuery({
    queryKey: ['provider', providerId],
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
        .eq('id', providerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });

  const selectedServiceData = provider?.services?.find((s: any) => s.id === serviceId);
  const price = selectedServiceData?.price || provider?.hourly_rate;

  const createBooking = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime || !user) {
        throw new Error('Missing required fields');
      }

      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          provider_id: providerId!,
          service_id: serviceId || null,
          scheduled_at: scheduledAt.toISOString(),
          address: address || null,
          description: description || null,
          total_price: price || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking request sent!');
      navigate(`/bookings/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });

  const header = (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
        className="touch-button rounded-full hover:bg-accent transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="font-semibold text-lg">Book Service</h1>
    </div>
  );

  const isStep1Valid = selectedDate && selectedTime;
  const isStep2Valid = true; // Address and description are optional

  return (
    <MobileLayout header={header}>
      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-secondary'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-lg mb-2">Select Date</h2>
            <div className="bg-card rounded-2xl p-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">Select Time</h2>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                    selectedTime === time
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={!isStep1Valid}
            onClick={() => setStep(2)}
          >
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-lg mb-2">Service Location</h2>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">Description (Optional)</h2>
            <Textarea
              placeholder="Describe the job or any special requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => setStep(3)}
          >
            Review Booking
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="font-semibold text-lg">Review Your Booking</h2>

          <div className="bg-card rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                </p>
              </div>
            </div>

            {address && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{address}</p>
                </div>
              </div>
            )}

            {selectedServiceData && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedServiceData.category?.name}</p>
                </div>
              </div>
            )}

            {description && (
              <div className="pt-2 border-t border-divider">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm mt-1">{description}</p>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="bg-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estimated Total</span>
              <span className="text-xl font-bold">
                ${price?.toFixed(2) || 'Quote on arrival'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Final price may vary based on job requirements
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => createBooking.mutate()}
            disabled={createBooking.isPending}
          >
            {createBooking.isPending ? 'Submitting...' : 'Confirm Booking'}
          </Button>
        </div>
      )}
    </MobileLayout>
  );
}
