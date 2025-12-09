import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceCategory } from '@/types/database';

export const useCategories = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('service_categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setCategories(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
