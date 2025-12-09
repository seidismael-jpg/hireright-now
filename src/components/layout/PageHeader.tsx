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
        "flex items-center justify-between h-14 px-5",
        className
      )}
    >
      <div className="w-10">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center touch-scale -ml-2"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
          </button>
        )}
      </div>
      
      {title && (
        <h1 className="text-[17px] font-semibold text-foreground">
          {title}
        </h1>
      )}
      
      <div className="w-10 flex justify-end">
        {rightAction}
      </div>
    </div>
  );
};
