import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxW?: string;
}

export default function Modal({ open, onClose, title, children, maxW = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`relative w-full ${maxW} rounded-3xl border border-border/60 bg-surface/80 backdrop-blur-xl shadow-card p-6 max-h-[90vh] overflow-y-auto`}
        style={{ animation: 'fadeInUp 200ms ease-out' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-text-2" />
          </button>
        </div>
        {children}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
