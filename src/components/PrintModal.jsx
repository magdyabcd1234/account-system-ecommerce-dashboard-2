import React, { useState, useEffect } from 'react';
import { Printer, X } from 'lucide-react';

export const PrintModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "max-w-4xl", 
  icon: Icon = Printer,
  buttonColor = "bg-emerald-600 hover:bg-emerald-500"
}) => {
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

  const handlePrint = () => {
    window.print();
  };

  if (!render) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Modal Container with max-height & flex-col to avoid clipping */}
      <div 
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto ${
          isClosing ? 'animate-modal-out' : 'animate-modal-in'
        }`}
      >
        
        {/* Modal Controls Header (Hidden during Print) */}
        <div className="bg-slate-100 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print flex-shrink-0">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className={`flex items-center gap-1.5 ${buttonColor} text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition active:scale-95`}
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 p-0">
          {children}
        </div>

      </div>
    </div>
  );
};
