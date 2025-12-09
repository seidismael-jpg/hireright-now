import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ManageServices() {
  const navigate = useNavigate();
  const { providerProfile } = useAuth();
  const { categories } = useCategories();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const { data: services, isLoading } = useQuery({
    queryKey: ['provider-services', providerProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_services')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('provider_id', providerProfile!.id);

      if (error) throw error;
      return data;
    },
    enabled: !!providerProfile,
  });

  const saveService = useMutation({
    mutationFn: async () => {
      if (editingService) {
        const { error } = await supabase
          .from('provider_services')
          .update({
            category_id: categoryId,
            price: parseFloat(price) || null,
            description: description || null,
          })
          .eq('id', editingService.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('provider_services')
          .insert({
            provider_id: providerProfile!.id,
            category_id: categoryId,
            price: parseFloat(price) || null,
            description: description || null,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setDialogOpen(false);
      resetForm();
      toast.success(editingService ? 'Service updated!' : 'Service added!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save service');
    },
  });

  const deleteService = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('provider_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      toast.success('Service removed!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove service');
    },
  });

  const resetForm = () => {
    setEditingService(null);
    setCategoryId('');
    setPrice('');
    setDescription('');
  };

  const openEditDialog = (service: any) => {
    setEditingService(service);
    setCategoryId(service.category_id);
    setPrice(service.price?.toString() || '');
    setDescription(service.description || '');
    setDialogOpen(true);
  };

  const header = (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        onClick={() => navigate('/profile')}
        className="touch-button rounded-full hover:bg-accent transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="font-semibold text-lg">Manage Services</h1>
    </div>
  );

  return (
    <MobileLayout header={header}>
      <div className="space-y-4">
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full">
              <Plus className="w-5 h-5 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Leave blank for 'Quote'"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your service..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <Button
                className="w-full"
                onClick={() => saveService.mutate()}
                disabled={!categoryId || saveService.isPending}
              >
                {saveService.isPending ? 'Saving...' : 'Save Service'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 skeleton-pulse rounded-2xl" />
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="bg-card rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{service.category?.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                    )}
                    <p className="text-primary font-semibold mt-2">
                      {service.price ? `$${service.price.toFixed(0)}` : 'Quote on request'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(service)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteService.mutate(service.id)}
                      disabled={deleteService.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services added yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add services to let customers know what you offer
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
