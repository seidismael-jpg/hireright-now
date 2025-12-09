import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceCategory } from '@/types/database';
import { 
  Zap, Droplets, Sparkles, Hammer, Palette, Truck, 
  Trees, Wind, GraduationCap, Camera, Car, Dumbbell,
  Dog, Monitor, Scissors, ChefHat, LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Zap,
  Droplets,
  Sparkles,
  Hammer,
  Palette,
  Truck,
  Trees,
  Wind,
  GraduationCap,
  Camera,
  Car,
  Dumbbell,
  Dog,
  Monitor,
  Scissors,
  ChefHat,
};

interface CategoryGridProps {
  categories: ServiceCategory[];
  loading?: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl skeleton-pulse" />
            <div className="w-12 h-3 mt-2 rounded skeleton-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.slice(0, 8).map((category) => {
        const Icon = iconMap[category.icon] || Zap;
        
        return (
          <button
            key={category.id}
            onClick={() => navigate(`/search?category=${category.id}`)}
            className="flex flex-col items-center group"
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center",
              "bg-secondary transition-all duration-200",
              "group-hover:bg-primary group-hover:text-primary-foreground",
              "group-active:scale-95"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-2 text-center line-clamp-1">
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
