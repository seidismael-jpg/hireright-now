import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';

export default function Chat() {
  const { recipientId } = useParams<{ recipientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: recipient } = useQuery({
    queryKey: ['profile', recipientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', recipientId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId,
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', user?.id, recipientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user!.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user!.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!recipientId,
  });

  // Mark messages as read
  useEffect(() => {
    if (user && recipientId) {
      supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', recipientId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        });
    }
  }, [user, recipientId, queryClient]);

  // Real-time subscription
  useEffect(() => {
    if (!user || !recipientId) return;

    const channel = supabase
      .channel(`messages-${user.id}-${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${recipientId}),and(sender_id=eq.${recipientId},receiver_id=eq.${user.id}))`,
        },
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, recipientId, refetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!newMessage.trim()) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user!.id,
          receiver_id: recipientId!,
          content: newMessage.trim(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage('');
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage.mutate();
    }
  };

  const initials = recipient?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const header = (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        onClick={() => navigate('/messages')}
        className="touch-button rounded-full hover:bg-accent transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <Avatar className="w-10 h-10">
        <AvatarImage src={recipient?.avatar_url || undefined} />
        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">{recipient?.full_name}</p>
      </div>
    </div>
  );

  const footer = (
    <form onSubmit={handleSend} className="flex items-center gap-2 p-4 glass border-t border-divider safe-bottom">
      <Input
        ref={inputRef}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 h-12"
      />
      <Button
        type="submit"
        size="icon"
        className="h-12 w-12 shrink-0"
        disabled={!newMessage.trim() || sendMessage.isPending}
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  );

  return (
    <MobileLayout header={header} footer={footer}>
      <div className="flex flex-col min-h-full">
        {messages && messages.length > 0 ? (
          <div className="space-y-3 pb-4">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === user?.id;
              const showDate = index === 0 || 
                new Date(message.created_at).toDateString() !== 
                new Date(messages[index - 1].created_at).toDateString();

              return (
                <React.Fragment key={message.id}>
                  {showDate && (
                    <div className="flex justify-center">
                      <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                        {isToday(new Date(message.created_at))
                          ? 'Today'
                          : isYesterday(new Date(message.created_at))
                          ? 'Yesterday'
                          : format(new Date(message.created_at), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {format(new Date(message.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
