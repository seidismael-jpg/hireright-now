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
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
    { icon: <Search className="w-5 h-5" />, label: 'Search', path: '/search' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Bookings', path: '/bookings' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Messages', path: '/messages' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/profile' },
  ];

  const providerItems: NavItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Jobs', path: '/bookings' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Messages', path: '/messages' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/profile' },
  ];

  const items = isProvider ? providerItems : customerItems;

  return (
    <nav className="glass border-t border-divider safe-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 touch-button",
                isActive 
                  ? "text-primary bg-primary/5" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="text-2xs font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
