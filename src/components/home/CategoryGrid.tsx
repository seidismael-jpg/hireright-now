import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceCategory } from '@/types/database';
import { 
  Car, Truck, Bus, Bike, LucideIcon,
  Zap, Droplets, Sparkles, Hammer, Palette,
  Trees, Wind, GraduationCap, Camera, Dumbbell,
  Dog, Monitor, Scissors, ChefHat
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Car, Truck, Bus, Bike, Zap, Droplets, Sparkles, Hammer, Palette,
  Trees, Wind, GraduationCap, Camera, Dumbbell, Dog, Monitor, Scissors, ChefHat,
};

// Default categories matching the mockup
const defaultCategories = [
  { id: 'car', name: 'Car', icon: 'Car' },
  { id: 'taxi', name: 'Taxi', icon: 'Truck' },
  { id: 'bus', name: 'Bus', icon: 'Bus' },
  { id: 'bike', name: 'Bike', icon: 'Bike' },
];

interface CategoryGridProps {
  categories: ServiceCategory[];
  loading?: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, loading }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  if (loading) {
    return (
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl skeleton" />
            <div className="w-10 h-3 mt-2 rounded-full skeleton" />
          </div>
        ))}
      </div>
    );
  }

  const displayCategories = categories.length > 0 
    ? categories.slice(0, 4) 
    : defaultCategories;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
      {displayCategories.map((category, index) => {
        const Icon = iconMap[category.icon] || Car;
        const isActive = index === activeIndex;
        
        return (
          <button
            key={category.id}
            onClick={() => {
              setActiveIndex(index);
              navigate(`/search?category=${category.id}`);
            }}
            className="flex flex-col items-center touch-scale"
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "bg-secondary text-foreground"
            )}>
              <Icon className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <span className={cn(
              "text-xs font-medium mt-2 transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}>
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
