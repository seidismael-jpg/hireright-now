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
        "flex items-center justify-between h-16 px-5",
        !transparent && "bg-background",
        className
      )}
    >
      <div className="w-11">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center touch-scale"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
          </button>
        )}
      </div>
      
      {title && (
        <h1 className="text-lg font-semibold text-foreground">
          {title}
        </h1>
      )}
      
      <div className="w-11 flex justify-end">
        {rightAction}
      </div>
    </div>
  );
};
