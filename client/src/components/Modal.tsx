import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-backdrop animate-bounce-in"
      onClick={handleBackdropClick}
    >
      <div className="modal-content">
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-plant-100 dark:border-plant-800">
            <h2 className="text-lg font-semibold text-plant-800 dark:text-plant-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-plant-100 dark:hover:bg-plant-800 rounded-lg transition-colors text-plant-500 dark:text-plant-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}