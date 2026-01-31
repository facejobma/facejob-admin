import React from 'react';
import { cn } from '@/lib/utils';

interface TruncatedCellProps {
  content: string | null | undefined;
  maxWidth?: string;
  className?: string;
}

export const TruncatedCell: React.FC<TruncatedCellProps> = ({
  content,
  maxWidth = "200px",
  className
}) => {
  const displayContent = content || 'N/A';
  
  return (
    <div 
      className={cn("truncate", className)}
      style={{ maxWidth }}
      title={displayContent}
    >
      {displayContent}
    </div>
  );
};