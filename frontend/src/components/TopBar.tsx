import { Shield } from "lucide-react";

interface TopBarProps {
  apiOnline: boolean | null;
}

export default function TopBar({ apiOnline }: TopBarProps) {
  const statusColor =
    apiOnline === null
      ? "bg-noir-text-dim"
      : apiOnline
        ? "bg-noir-green"
        : "bg-noir-red";

  const statusText =
    apiOnline === null
      ? "Checking..."
      : apiOnline
        ? "API Connected"
        : "API Offline";

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-noir-border bg-noir-surface shrink-0">
      <div className="flex items-center gap-3">
        <Shield size={20} className="text-noir-cyan" strokeWidth={2.5} />
        <h1 className="font-display text-xl font-bold tracking-wide text-[#e2e2e8] uppercase">
          SecuScan
        </h1>
        <span className="ml-1 px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase border border-noir-border text-noir-text-dim">
          v1.0
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-noir-text-dim">
        <span
          className={`inline-block w-2 h-2 ${statusColor} ${apiOnline ? "animate-pulse-dot" : ""}`}
        />
        <span>{statusText}</span>
      </div>
    </header>
  );
}
