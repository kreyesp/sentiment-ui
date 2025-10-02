"use client";

import { useState } from "react";

type PredictResponse = {
  request_id: string;
  model_backend: string;
  model_version: string;
  latency_ms: number;
  label: "positive" | "negative" | string;
  score: number;
  probs?: Record<string, number>;
  tokens?: Array<{ token: string; attr?: number }>;
  truncated?: boolean; // in case you add this later
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);

  async function handleAnalyze() {
    setError(null);
    setResult(null);
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please paste some text.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predict/plain`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: trimmed, // raw text (handles quotes/newlines)
      });
      if (!res.ok) {
        const raw = await res.text();
        throw new Error(`${res.status} ${raw}`);
      }
      const data: PredictResponse = await res.json();
      setResult(data);
    } catch (e: unknown) {
    const msg =
      e instanceof Error ? e.message :
      typeof e === "string" ? e :
      JSON.stringify(e);
    setError(msg || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px", fontFamily: "Inter, system-ui, Arial" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Sentiment Analyzer</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Paste a review below and click Analyze. This calls your FastAPI backend at <code>{API_BASE}</code>.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder='Paste multi-paragraph text here. Quotes "like this" and blank lines are OK.'
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
          outline: "none",
          resize: "vertical",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <div style={{ color: "#666", fontSize: 12 }}>{text.length} chars</div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: loading ? "#aaa" : "#111",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#ffecec", color: "#b00020", whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 12,
            border: "1px solid #eee",
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: result.label === "positive" ? "#e6ffed" : "#ffecec",
                color: result.label === "positive" ? "#0c7a43" : "#b00020",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {result.label}
            </span>
            <span style={{ color: "#666" }}>
              score: <strong>{result.score.toFixed(3)}</strong> • latency: <strong>{result.latency_ms} ms</strong>
            </span>
          </div>

          {result.probs && (
            <div style={{ color: "#444", fontSize: 14, marginTop: 6 }}>
              {Object.entries(result.probs).map(([k, v]) => (
                <div key={k}>
                  {k}: {v.toFixed(4)}
                </div>
              ))}
            </div>
          )}

          {result.truncated && (
            <div style={{ marginTop: 8, color: "#b36b00" }}>
              Note: input was truncated to the model&apos;s maximum length.
            </div>
          )}

          <div style={{ marginTop: 12, color: "#666", fontSize: 12 }}>
            request: <code>{result.request_id}</code> • model: <code>{result.model_backend}</code> • version:{" "}
            <code>{result.model_version}</code>
          </div>
        </div>
      )}
    </main>
  );
}
