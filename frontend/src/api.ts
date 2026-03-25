import axios from "axios";
import type { ScanResult, ScanHistoryItem } from "./types";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 60000,
});

export async function scanCode(code: string, filename: string): Promise<ScanResult> {
  const { data } = await client.post<ScanResult>("/api/scan", { code, filename });
  return data;
}

export async function fetchHistory(): Promise<ScanHistoryItem[]> {
  const { data } = await client.get<ScanHistoryItem[]>("/api/history");
  return data;
}

export async function fetchScanDetail(id: number): Promise<ScanResult> {
  const { data } = await client.get<ScanResult>(`/api/scan/${id}`);
  return data;
}

export async function deleteScan(id: number): Promise<void> {
  await client.delete(`/api/history/${id}`);
}

export async function checkHealth(): Promise<boolean> {
  try {
    const { data } = await client.get("/api/health", { timeout: 3000 });
    return data.status === "ok" && data.database === "connected";
  } catch {
    return false;
  }
}
