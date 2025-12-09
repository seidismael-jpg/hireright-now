import React from 'react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className,
  header,
  footer,
  noPadding = false,
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {header && (
        <header className="sticky top-0 z-50 glass border-b border-divider/50 safe-top">
          {header}
        </header>
      )}
      
      <main 
        className={cn(
          "flex-1 overflow-y-auto",
          !noPadding && "py-5",
          footer && "pb-28",
          className
        )}
      >
        {children}
      </main>
      
      {footer && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
          {footer}
        </footer>
      )}
    </div>
  );
};