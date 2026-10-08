import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  const [render, setRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setIsClosing(false);
    } else if (render) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!render) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden my-8 ${
          isClosing ? 'animate-modal-out' : 'animate-modal-in'
        }`}
      >
        {/* Modal Header */}
        <div className="bg-slate-100 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
