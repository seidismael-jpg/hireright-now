import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Bus, User, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isProvider } = useAuth();

  const items: NavItem[] = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: FileText, label: 'Bookings', path: '/bookings' },
    { icon: Bus, label: 'Services', path: '/search' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-xl border-t border-border/50 safe-bottom">
      <div className="flex items-center justify-around px-4 py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-2 py-2.5 px-4 rounded-full transition-all duration-300 touch-scale",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground"
              )}
            >
              <Icon 
                className={cn("w-5 h-5", isActive && "w-[18px] h-[18px]")} 
                strokeWidth={isActive ? 2.5 : 1.75} 
              />
              {isActive && (
                <span className="text-sm font-semibold">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
