import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] animate-toast-in">
      <div className="flex items-center gap-3 px-4 py-3 bg-noir-red/10 border border-noir-red/30 text-noir-red text-xs font-mono">
        <AlertTriangle size={14} className="shrink-0" />
        <span className="text-[#e2e2e8]">{message}</span>
        <button
          onClick={onDismiss}
          className="ml-2 p-0.5 text-noir-text-dim/50 hover:text-[#e2e2e8] transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
