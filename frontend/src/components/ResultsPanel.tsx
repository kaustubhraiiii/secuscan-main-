import {
  ShieldAlert,
  ShieldX,
  ShieldQuestion,
  ShieldCheck,
  TerminalSquare,
  Database,
} from "lucide-react";
import type { ScanResult, Vulnerability } from "../types";

interface ResultsPanelProps {
  result: ScanResult | null;
  isScanning: boolean;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    bg: "bg-noir-red/15",
    border: "border-noir-red/40",
    text: "text-noir-red",
    pillBg: "bg-noir-red/20",
    icon: ShieldX,
    label: "CRIT",
  },
  HIGH: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    pillBg: "bg-orange-500/20",
    icon: ShieldAlert,
    label: "HIGH",
  },
  MEDIUM: {
    bg: "bg-noir-amber/10",
    border: "border-noir-amber/30",
    text: "text-noir-amber",
    pillBg: "bg-noir-amber/20",
    icon: ShieldQuestion,
    label: "MED",
  },
  LOW: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    pillBg: "bg-cyan-500/20",
    icon: ShieldCheck,
    label: "LOW",
  },
} as const;

function SeverityBadge({ severity }: { severity: Vulnerability["severity"] }) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;
  const pulse = severity === "CRITICAL" ? "animate-severity-pulse" : "";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border ${config.bg} ${config.border} ${config.text} ${pulse}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function SeverityPill({
  label,
  count,
  config,
}: {
  label: string;
  count: number;
  config: (typeof SEVERITY_CONFIG)[keyof typeof SEVERITY_CONFIG];
}) {
  if (count === 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono border ${config.pillBg} ${config.border} ${config.text}`}
    >
      {count} {label}
    </span>
  );
}

function VulnCard({ vuln, index }: { vuln: Vulnerability; index: number }) {
  const config = SEVERITY_CONFIG[vuln.severity];
  const isCritical = vuln.severity === "CRITICAL";
  return (
    <div
      className={`border-l-2 ${config.border} bg-noir-surface p-4 border border-noir-border animate-fade-up ${isCritical ? "animate-severity-pulse" : ""}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-mono text-[#e2e2e8] font-medium">
          {vuln.vulnerability}
        </h3>
        <SeverityBadge severity={vuln.severity} />
      </div>

      {vuln.line_number && (
        <div className="text-[11px] font-mono text-noir-cyan mb-2">
          Line {vuln.line_number}
        </div>
      )}

      <p className="text-xs text-noir-text-dim leading-relaxed mb-3">
        {vuln.description}
      </p>

      <div className="border-t border-noir-border pt-2">
        <p className="text-[11px] text-noir-text-dim">
          <span className="text-noir-cyan/70 uppercase tracking-wider mr-2">
            Fix:
          </span>
          {vuln.recommendation}
        </p>
      </div>
    </div>
  );
}

export default function ResultsPanel({ result, isScanning }: ResultsPanelProps) {
  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-noir-text-dim">
        <div className="w-6 h-6 border-2 border-noir-cyan/30 border-t-noir-cyan animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest">
          Analyzing code...
        </span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
        <TerminalSquare size={40} className="text-noir-text-dim/20" strokeWidth={1.5} />
        <div className="text-center">
          <p className="text-sm text-noir-text-dim mb-1">No scan results</p>
          <p className="text-xs text-noir-text-dim/50">
            Paste code and hit Scan to analyze for vulnerabilities
          </p>
        </div>
      </div>
    );
  }

  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const v of result.vulnerabilities) {
    counts[v.severity]++;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Results header */}
      <div className="px-4 h-11 flex items-center border-b border-noir-border bg-noir-surface shrink-0">
        <span className="text-[11px] uppercase tracking-widest text-noir-text-dim">
          Results
        </span>
        <span className="ml-2 text-[11px] font-mono text-noir-cyan">
          {result.filename}
        </span>
        {result.is_duplicate && (
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-noir-cyan border border-noir-cyan/20 bg-noir-cyan/5">
            <Database size={10} />
            cached
          </span>
        )}
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-noir-border">
        <span className="text-xs font-mono text-[#e2e2e8]">
          {result.total_vulnerabilities} vulns
        </span>
        <span className="text-noir-text-dim/30 mx-1">|</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <SeverityPill label="crit" count={counts.CRITICAL} config={SEVERITY_CONFIG.CRITICAL} />
          <SeverityPill label="high" count={counts.HIGH} config={SEVERITY_CONFIG.HIGH} />
          <SeverityPill label="med" count={counts.MEDIUM} config={SEVERITY_CONFIG.MEDIUM} />
          <SeverityPill label="low" count={counts.LOW} config={SEVERITY_CONFIG.LOW} />
        </div>
      </div>

      {/* Vulnerability cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {result.vulnerabilities.map((vuln, i) => (
          <VulnCard key={vuln.id} vuln={vuln} index={i} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-noir-border text-[10px] text-noir-text-dim/40 font-mono shrink-0">
        {result.total_vulnerabilities} vulnerabilities found
      </div>
    </div>
  );
}
