import { useState, useEffect, useCallback } from "react";
import TopBar from "./components/TopBar";
import CodeEditor from "./components/CodeEditor";
import ResultsPanel from "./components/ResultsPanel";
import ScanHistory from "./components/ScanHistory";
import ErrorToast from "./components/ErrorToast";
import { scanCode, fetchHistory, fetchScanDetail, deleteScan, checkHealth } from "./api";
import type { ScanResult, ScanHistoryItem } from "./types";

function App() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch {
      // silent — history is non-critical
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Check API health + load history on mount
  useEffect(() => {
    checkHealth().then(setApiOnline);
    loadHistory();
  }, [loadHistory]);

  const handleScan = async (code: string, filename: string) => {
    setIsScanning(true);
    setResult(null);
    setError(null);

    try {
      const data = await scanCode(code, filename);
      setResult(data);
      loadHistory();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Scan failed — is the backend running?";
      setError(message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectScan = async (id: number) => {
    setIsScanning(true);
    setResult(null);
    setError(null);

    try {
      const data = await fetchScanDetail(id);
      setResult(data);
    } catch {
      setError("Failed to load scan details");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteScan = async (id: number) => {
    try {
      await deleteScan(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (result?.id === id) {
        setResult(null);
      }
    } catch {
      setError("Failed to delete scan");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-noir-bg">
      {error && <ErrorToast message={error} onDismiss={() => setError(null)} />}

      <TopBar apiOnline={apiOnline} />

      <div className="flex flex-col md-panel:flex-row flex-1 overflow-hidden">
        <div className="w-full md-panel:w-[60%] h-1/2 md-panel:h-full shrink-0">
          <CodeEditor onScan={handleScan} isScanning={isScanning} />
        </div>
        <div className="w-full md-panel:w-[40%] h-1/2 md-panel:h-full">
          <ResultsPanel result={result} isScanning={isScanning} />
        </div>
      </div>

      <ScanHistory
        history={history}
        isLoading={historyLoading}
        onSelectScan={handleSelectScan}
        onDeleteScan={handleDeleteScan}
        activeScanId={result?.id ?? null}
      />
    </div>
  );
}

export default App;
