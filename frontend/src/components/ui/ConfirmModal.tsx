import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl shadow-elevated w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">{title}</h2>
          <p className="text-muted text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 border-t border-border bg-surface-2/50">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-surface-2 border border-border text-ink hover:bg-surface rounded-xl font-bold transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-error text-white font-bold rounded-xl hover:bg-error/90 shadow-lg shadow-error/20 transition-colors"
          >
            {confirmText}
          </button>
        </div>
        
      </div>
    </div>
  );
}
