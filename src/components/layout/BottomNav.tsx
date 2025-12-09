import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, MessageCircle, User, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items: NavItem[] = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-t border-border/50 safe-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200 touch-scale min-w-[56px]",
                isActive && "bg-primary/10"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} 
                strokeWidth={isActive ? 2 : 1.75} 
              />
              <span className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
