export interface Vulnerability {
  id: number;
  vulnerability: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  line_number: number | null;
  description: string;
  recommendation: string;
}

export interface ScanResult {
  id: number;
  filename: string;
  scanned_at: string;
  vulnerabilities: Vulnerability[];
  total_vulnerabilities: number;
  is_duplicate: boolean;
}

export interface ScanHistoryItem {
  id: number;
  filename: string;
  scanned_at: string;
  total_vulnerabilities: number;
  severity_breakdown: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}
