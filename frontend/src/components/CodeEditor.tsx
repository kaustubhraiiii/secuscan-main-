import { useState, useRef, useCallback, useEffect } from "react";
import { Scan, Loader2 } from "lucide-react";

interface CodeEditorProps {
  onScan: (code: string, filename: string) => void;
  isScanning: boolean;
}

const SAMPLE_CODE = `import sqlite3
import os

# Hardcoded credentials
password = "admin123"
secret_key = "sk-12345-abcde"

def get_user(user_input):
    conn = sqlite3.connect("app.db")
    query = "SELECT * FROM users WHERE name = '" + user_input + "'"
    conn.execute(query)

def run_command(cmd):
    os.system(cmd)

eval(input("Enter expression: "))`;

export default function CodeEditor({ onScan, isScanning }: CodeEditorProps) {
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("untitled.py");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = Math.max(
    (code || SAMPLE_CODE).split("\n").length,
    20
  );
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleScroll = useCallback(() => {
    const gutterEl = document.getElementById("line-gutter");
    if (gutterEl && textareaRef.current) {
      gutterEl.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleScan = useCallback(() => {
    const text = code || SAMPLE_CODE;
    if (text.trim() && !isScanning) {
      if (!code) setCode(SAMPLE_CODE);
      onScan(text, filename);
    }
  }, [code, filename, isScanning, onScan]);

  // Cmd/Ctrl+Enter keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleScan();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleScan]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-noir-border">
      {/* Filename bar */}
      <div className="flex items-center gap-3 px-4 h-11 border-b border-noir-border bg-noir-surface">
        <label className="text-[11px] uppercase tracking-widest text-noir-text-dim hidden sm:block">
          File
        </label>
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent border-b border-noir-border text-sm text-noir-text font-mono px-1 py-0.5 outline-none focus:border-noir-cyan transition-colors min-w-0"
        />
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-mono uppercase tracking-wider bg-noir-cyan/10 text-noir-cyan border border-noir-cyan/30 hover:bg-noir-cyan/20 hover:border-noir-cyan/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
          title="Scan (Cmd+Enter)"
        >
          {isScanning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span className="hidden sm:inline">Scanning</span>
            </>
          ) : (
            <>
              <Scan size={14} />
              <span className="hidden sm:inline">Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers gutter */}
        <div
          id="line-gutter"
          className="w-12 shrink-0 overflow-hidden bg-noir-surface border-r border-noir-border select-none pt-4 pb-4"
        >
          {lines.map((n) => (
            <div
              key={n}
              className="text-right pr-3 text-[12px] leading-[21px] text-noir-text-dim/50 font-mono"
            >
              {n}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          placeholder={SAMPLE_CODE}
          className="flex-1 bg-transparent resize-none outline-none p-4 text-sm leading-[21px] font-mono text-noir-text placeholder:text-noir-text-dim/30 overflow-auto"
        />
      </div>
    </div>
  );
}
