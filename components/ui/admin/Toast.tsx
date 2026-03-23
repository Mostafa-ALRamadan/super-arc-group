'use client';

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  locale?: string;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000,
  locale = 'en'
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  const isRTL = locale === 'ar';

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Trigger slide-down animation
      setTimeout(() => setAnimationClass('translate-y-0 opacity-100'), 10);

      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [isVisible, autoClose, duration]);

  const handleClose = () => {
    // Trigger slide-up animation
    setAnimationClass('-translate-y-full opacity-0');
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300);
  };

  if (!shouldRender) return null;

  const toastStyles = {
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-700 shadow-green-500/25',
    error: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-700 shadow-red-500/25'
  };

  const iconStyles = {
    success: '✓',
    error: '✕'
  };

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={`
          ${toastStyles[type]}
          ${animationClass}
          -translate-y-full opacity-0
          transform transition-all duration-500 ease-out
          pointer-events-auto
          flex items-center gap-4 px-8 py-5 rounded-2xl shadow-2xl border backdrop-blur-sm
          min-w-[320px] max-w-lg
          ${isRTL ? 'flex-row-reverse' : ''}
        `}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-lg font-bold shadow-lg">
          {iconStyles[type]}
        </div>
        <div className="flex-1 text-base font-semibold leading-tight">
          {message}
        </div>
        <button
          onClick={handleClose}
          className={`
            flex-shrink-0 w-7 h-7 text-white hover:bg-white hover:bg-opacity-25 rounded-full flex items-center justify-center text-lg font-light transition-all duration-200 shadow-md hover:shadow-lg
            ${isRTL ? 'mr-3 ml-0' : ''}
          `}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
