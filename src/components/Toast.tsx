import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { Toast } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className="bg-black border border-pr-yellow/30 text-white px-4 py-3 rounded-lg flex items-center gap-3 shadow-lg animate-slide-up min-w-[280px] font-sans"
          >
            <Icon size={18} className="text-pr-yellow flex-shrink-0" />
            <p className="text-sm flex-1">{t.message}</p>
            <button onClick={() => onRemove(t.id)} className="text-white/50 hover:text-white">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
