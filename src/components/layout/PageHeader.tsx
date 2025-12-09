import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  transparent = false,
  className,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between h-14 px-4",
        !transparent && "bg-background",
        className
      )}
    >
      <div className="w-10">
        {showBack && (
          <button
            onClick={handleBack}
            className="touch-button rounded-full hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {title && (
        <h1 className="text-lg font-semibold text-foreground">
          {title}
        </h1>
      )}
      
      <div className="w-10 flex justify-end">
        {rightAction}
      </div>
    </div>
  );
};
