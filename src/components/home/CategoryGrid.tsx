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
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl skeleton" style={{ animationDelay: `${i * 50}ms` }} />
            <div className="w-12 h-3 mt-3 rounded-full skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {categories.slice(0, 8).map((category, index) => {
        const Icon = iconMap[category.icon] || Zap;
        
        return (
          <button
            key={category.id}
            onClick={() => navigate(`/search?category=${category.id}`)}
            className="flex flex-col items-center group animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center",
              "bg-secondary transition-all duration-300 ease-smooth",
              "group-hover:bg-foreground group-hover:text-background",
              "group-active:scale-90"
            )}>
              <Icon className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <span className="text-xs font-semibold mt-3 text-center line-clamp-1 text-foreground/80 group-hover:text-foreground transition-colors">
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};