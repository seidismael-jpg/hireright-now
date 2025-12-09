import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isProvider } = useAuth();

  const customerItems: NavItem[] = [
    { icon: <Home className="w-[22px] h-[22px]" strokeWidth={1.75} />, label: 'Home', path: '/' },
    { icon: <Search className="w-[22px] h-[22px]" strokeWidth={1.75} />, label: 'Search', path: '/search' },
    { icon: <Calendar className="w-[22px] h-[22px]" strokeWidth={1.75} />, label: 'Bookings', path: '/bookings' },
    { icon: <MessageCircle className="w-[22px] h-[22px]" strokeWidth={1.75} />, label: 'Messages', path: '/messages' },
    { icon: <User className="w-[22px] h-[22px]" strokeWidth={1.75} />, label: 'Profile', path: '/profile' },
  ];

  const providerItems: NavItem[] = [
    { icon: <Home className="w-[22px] h-[22px]" strokeWidth={1.75} />, label: 'Dashboard', path: '/' },
    { icon: <Calendar className="w-[22px] h-[22px]" strokeWidth={1.75} />, label: 'Jobs', path: '/bookings' },
    { icon: <MessageCircle className="w-[22px] h-[22px]" strokeWidth={1.75} />, label: 'Messages', path: '/messages' },
    { icon: <User className="w-[22px] h-[22px]" strokeWidth={1.75} />, label: 'Profile', path: '/profile' },
  ];

  const items = isProvider ? providerItems : customerItems;

  return (
    <nav className="glass border-t border-divider/50 safe-bottom">
      <div className="flex items-center justify-around py-2 px-3">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-5 rounded-2xl transition-all duration-300 ease-smooth touch-target",
                isActive 
                  ? "text-foreground bg-secondary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "transition-transform duration-200",
                isActive && "scale-110"
              )}>
                {item.icon}
              </div>
              <span className={cn(
                "text-[10px] font-semibold mt-1 transition-all duration-200",
                isActive ? "opacity-100" : "opacity-70"
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