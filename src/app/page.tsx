"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

type PredictResponse = {
  request_id: string;
  model_backend: string;
  model_version: string;
  latency_ms: number;
  label: "positive" | "negative" | string;
  score: number;
  probs?: Record<string, number>;
  tokens?: Array<{ token: string; attr?: number }>;
  truncated?: boolean;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://kreyesp-sentiment-calculator.onrender.com";
const MAX_CHARS = Number(process.env.NEXT_PUBLIC_MAX_CHARS ?? 50000);

// Small helper to render probability bars
function ProbBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(Math.max(value, 0), 1) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">{value.toFixed(3)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-2 rounded-full bg-sky-500 dark:bg-sky-400 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);

  const overLimit = text.length > MAX_CHARS;

  async function handleAnalyze() {
    setError(null);
    setResult(null);
    const trimmed = text.trim();
    if (!trimmed) return setError("Please paste some text.");
    if (overLimit) return setError(`Input exceeds ${MAX_CHARS.toLocaleString()} characters.`);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predict/plain`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: trimmed,
      });
      if (!res.ok) {
        const raw = await res.text();
        throw new Error(`${res.status} ${raw}`);
      }
      const data: PredictResponse = await res.json();
      setResult(data);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
      setError(msg || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="
  min-h-dvh w-full bg-background text-foreground
  [background-image:radial-gradient(28rem_28rem_at_120%_-10%,color-mix(in oklab,var(--color-primary) 12%,transparent),transparent_60%)]
">
  <div className="mx-auto w-full max-w-3xl px-6 sm:px-8 py-10">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
              💬
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Sentiment Analyzer</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Paste a review and click <span className="font-medium">Analyze</span>. Requests go to{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {API_BASE}
                </code>
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Input card */}
        <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/70">
          <label htmlFor="review" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Review text
          </label>

         <textarea
  id="review"
  value={text}
  onChange={(e) => setText(e.target.value)}
  rows={10}
  placeholder='Enter a movie review to analyze!'
  className="
    w-full resize-y rounded-xl border border-border 
    bg-[color:var(--color-muted)] dark:bg-[#1a1f29]
    px-4 py-3 text-sm text-foreground placeholder:text-foreground/50
    shadow-sm outline-none ring-0 transition
    focus-visible:border-[color:var(--color-primary)]
    focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]/25
  "
/>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={overLimit ? "text-rose-600 font-medium" : "text-slate-600 dark:text-slate-400"}>
              {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
            </span>
            {result?.truncated && (
              <span className="text-amber-700 dark:text-amber-400">Note: input was truncated on server.</span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
           <button
              onClick={handleAnalyze}
              disabled={loading || overLimit}
              className={`
                inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition shadow-sm
                ${loading || overLimit
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-600)] active:scale-[.99]"}
              `}
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>

            <button
              onClick={() => {
                setText("");
                setError(null);
                setResult(null);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300/80 bg-white/70 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
              <span>⚠️</span>
              <p className="whitespace-pre-wrap">{error}</p>
            </div>
          )}
        </section>

        {/* Result card */}
        {result && (
          <section className="rounded-2xl border border-border bg-surface/90 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1
                ${result.label === "positive"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-900/40"
                  : "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-900/40"}`}
              >
                {result.label === "positive" ? "😊" : "🙁"} {result.label}
              </span>

              <span className="text-sm text-slate-700 dark:text-slate-300">
                score: <strong className="tabular-nums">{result.score.toFixed(3)}</strong> • latency:{" "}
                <strong className="tabular-nums">{result.latency_ms} ms</strong>
              </span>
            </div>

            {result.probs && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.entries(result.probs).map(([k, v]) => (
                  <ProbBar key={k} label={k} value={v} />
                ))}
              </div>
            )}

            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              request: <code className="select-all">{result.request_id}</code> • model:{" "}
              <code>{result.model_backend}</code> • version: <code>{result.model_version}</code>
            </div>
          </section>
        )}

        <footer className="mt-10 text-center text-xs text-slate-500 dark:text-slate-400">
          Built by <span className="font-medium">kreyesp</span>. Deployed on Vercel + Render.
        </footer>
      </div>
    </main>
  );
}
