import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-dark-card border border-dark-border rounded-xl w-full max-w-[480px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-dark-border pb-3.5 mb-5">
          <h3 className="font-heading text-base font-semibold text-dark-text">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-2xl text-dark-muted hover:text-dark-text cursor-pointer leading-none"
          >
            &times;
          </button>
        </div>

        {/* Modal Content */}
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
