export type AppRole = 'admin' | 'customer' | 'provider';
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
export type ProviderStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  created_at: string;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number;
  hourly_rate: number | null;
  status: ProviderStatus;
  avg_rating: number;
  total_reviews: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  profile?: Profile;
  services?: ProviderService[];
}

export interface ProviderService {
  id: string;
  provider_id: string;
  category_id: string;
  price: number | null;
  description: string | null;
  // Joined fields
  category?: ServiceCategory;
}

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string | null;
  status: BookingStatus;
  scheduled_at: string;
  description: string | null;
  address: string | null;
  total_price: number | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  provider?: ProviderProfile;
  service?: ProviderService;
  customer_profile?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joined fields
  sender_profile?: Profile;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined fields
  customer_profile?: Profile;
}

export interface Conversation {
  otherUserId: string;
  otherUserProfile: Profile;
  lastMessage: Message;
  unreadCount: number;
}
