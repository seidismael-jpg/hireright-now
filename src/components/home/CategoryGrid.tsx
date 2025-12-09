import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceCategory } from '@/types/database';
import { 
  Zap, Droplets, Sparkles, Hammer, Paintbrush, Truck,
  Scissors, GraduationCap, LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Zap, Droplets, Sparkles, Hammer, Paintbrush, Truck, Scissors, GraduationCap
};

// Default service categories
const defaultCategories = [
  { id: 'electrical', name: 'Electrical', icon: 'Zap' },
  { id: 'plumbing', name: 'Plumbing', icon: 'Droplets' },
  { id: 'cleaning', name: 'Cleaning', icon: 'Sparkles' },
  { id: 'repair', name: 'Repair', icon: 'Hammer' },
];

interface CategoryGridProps {
  categories: ServiceCategory[];
  loading?: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, loading }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl skeleton" />
            <div className="w-10 h-2.5 mt-2 rounded-full skeleton" />
          </div>
        ))}
      </div>
    );
  }

  const displayCategories = categories.length > 0 
    ? categories.slice(0, 4) 
    : defaultCategories;

  return (
    <div className="grid grid-cols-4 gap-3">
      {displayCategories.map((category, index) => {
        const Icon = iconMap[category.icon] || Sparkles;
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
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-secondary text-foreground"
            )}>
              <Icon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <span className={cn(
              "text-[11px] font-medium mt-2 transition-colors",
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
