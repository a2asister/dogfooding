import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-dark-light border border-dark-light rounded-lg p-4 shadow-lg',
        onClick && 'cursor-pointer hover:border-primary/50 transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
