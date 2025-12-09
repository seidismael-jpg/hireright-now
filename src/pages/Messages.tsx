import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(*),
          receiver_profile:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by other user
      const conversationMap = new Map<string, any>();
      
      messages?.forEach((msg) => {
        const otherId = msg.sender_id === user!.id ? msg.receiver_id : msg.sender_id;
        const otherProfile = msg.sender_id === user!.id ? msg.receiver_profile : msg.sender_profile;
        
        if (!conversationMap.has(otherId)) {
          conversationMap.set(otherId, {
            otherUserId: otherId,
            otherUserProfile: otherProfile,
            lastMessage: msg,
            unreadCount: 0,
          });
        }
        
        // Count unread messages
        if (msg.receiver_id === user!.id && !msg.is_read) {
          const conv = conversationMap.get(otherId);
          conv.unreadCount++;
        }
      });

      return Array.from(conversationMap.values());
    },
    enabled: !!user,
  });

  return (
    <MobileLayout 
      header={<PageHeader title="Messages" />} 
      footer={<BottomNav />}
    >
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 skeleton-pulse rounded-2xl" />
          ))}
        </div>
      ) : conversations && conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const initials = conv.otherUserProfile?.full_name
              ?.split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase() || '?';

            return (
              <button
                key={conv.otherUserId}
                onClick={() => navigate(`/messages/${conv.otherUserId}`)}
                className="w-full flex items-center gap-3 p-3 bg-card rounded-2xl text-left transition-all hover:shadow-md"
              >
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={conv.otherUserProfile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{conv.otherUserProfile?.full_name}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${
                    conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {conv.lastMessage.sender_id === user?.id && 'You: '}
                    {conv.lastMessage.content}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start a conversation with a provider
          </p>
        </div>
      )}
    </MobileLayout>
  );
}
