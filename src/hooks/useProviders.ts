import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProviderProfile, Profile } from '@/types/database';

interface UseProvidersOptions {
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
}

export const useProviders = (options: UseProvidersOptions = {}) => {
  const { categoryId, searchQuery, limit = 20 } = options;
  const [providers, setProviders] = useState<(ProviderProfile & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        let providerQuery = supabase
          .from('provider_profiles')
          .select('*')
          .eq('status', 'approved')
          .order('avg_rating', { ascending: false })
          .limit(limit);

        if (categoryId) {
          const { data: providerIds } = await supabase
            .from('provider_services')
            .select('provider_id')
            .eq('category_id', categoryId);
          
          if (providerIds && providerIds.length > 0) {
            providerQuery = providerQuery.in('id', providerIds.map(p => p.provider_id));
          } else {
            setProviders([]);
            setLoading(false);
            return;
          }
        }

        const { data: providerData, error: providerError } = await providerQuery;
        
        if (providerError) throw providerError;
        if (!providerData || providerData.length === 0) {
          setProviders([]);
          setLoading(false);
          return;
        }

        // Fetch profiles separately
        const userIds = providerData.map(p => p.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        // Combine data
        const combined = providerData.map(provider => ({
          ...provider,
          profile: profilesData?.find(p => p.user_id === provider.user_id) || undefined
        }));

        let filtered = combined;
        
        if (searchQuery) {
          const search = searchQuery.toLowerCase();
          filtered = combined.filter(p => 
            p.profile?.full_name?.toLowerCase().includes(search) ||
            p.bio?.toLowerCase().includes(search) ||
            p.profile?.location?.toLowerCase().includes(search)
          );
        }
        
        setProviders(filtered);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching providers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [categoryId, searchQuery, limit]);

  return { providers, loading, error };
};
