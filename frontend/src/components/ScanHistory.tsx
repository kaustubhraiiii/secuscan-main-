import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Loader2 } from "lucide-react";
import type { ScanHistoryItem } from "../types";

interface ScanHistoryProps {
  history: ScanHistoryItem[];
  isLoading: boolean;
  onSelectScan: (id: number) => void;
  onDeleteScan: (id: number) => void;
  activeScanId: number | null;
}

const SEV_DOT: Record<string, string> = {
  CRITICAL: "bg-noir-red",
  HIGH: "bg-orange-400",
  MEDIUM: "bg-noir-amber",
  LOW: "bg-cyan-400",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ScanHistory({
  history,
  isLoading,
  onSelectScan,
  onDeleteScan,
  activeScanId,
}: ScanHistoryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-noir-border bg-noir-surface shrink-0">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-noir-surface-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown size={14} className="text-noir-text-dim" />
          ) : (
            <ChevronUp size={14} className="text-noir-text-dim" />
          )}
          <span className="text-[11px] font-mono uppercase tracking-widest text-noir-text-dim">
            Scan History
          </span>
          <span className="px-1.5 py-0 text-[10px] font-mono text-noir-cyan border border-noir-cyan/20 bg-noir-cyan/5">
            {history.length}
          </span>
        </div>
        {isLoading && (
          <Loader2 size={12} className="animate-spin text-noir-text-dim" />
        )}
      </button>

      {/* Drawer content */}
      {open && (
        <div className="animate-drawer-up border-t border-noir-border">
          {history.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-noir-text-dim/50 font-mono">
              No scans yet
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-noir-border text-noir-text-dim/50 text-[10px] uppercase tracking-widest">
                    <th className="text-left px-4 py-2 font-normal">File</th>
                    <th className="text-left px-2 py-2 font-normal">Date</th>
                    <th className="text-center px-2 py-2 font-normal">Vulns</th>
                    <th className="text-left px-2 py-2 font-normal">Severity</th>
                    <th className="w-8 px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => {
                    const isActive = activeScanId === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => onSelectScan(item.id)}
                        className={`border-b border-noir-border cursor-pointer transition-colors ${
                          isActive
                            ? "bg-noir-cyan/5"
                            : "hover:bg-noir-surface-2"
                        }`}
                      >
                        <td className="px-4 py-2 text-[#e2e2e8] truncate max-w-[160px]">
                          {item.filename}
                        </td>
                        <td className="px-2 py-2 text-noir-text-dim">
                          {formatDate(item.scanned_at)}
                        </td>
                        <td className="px-2 py-2 text-center text-[#e2e2e8]">
                          {item.total_vulnerabilities}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-1">
                            {(
                              Object.entries(item.severity_breakdown) as [string, number][]
                            ).map(
                              ([sev, count]) =>
                                count > 0 && (
                                  <span
                                    key={sev}
                                    className={`inline-flex items-center justify-center w-4 h-4 text-[9px] text-noir-bg font-bold ${SEV_DOT[sev]}`}
                                    title={`${count} ${sev.toLowerCase()}`}
                                  >
                                    {count}
                                  </span>
                                )
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteScan(item.id);
                            }}
                            className="p-1 text-noir-text-dim/30 hover:text-noir-red transition-colors"
                            title="Delete scan"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
