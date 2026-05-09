import React, { useEffect } from 'react';

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '14px 24px',
        backgroundColor: bgColor,
        color: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: '500',
        animation: 'slideIn 0.3s ease'
      }}
      onClick={onClose}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span>{message}</span>
    </div>
  );
}

export default Toast;
