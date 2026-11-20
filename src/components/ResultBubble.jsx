import { useEffect, useState } from "react";

function ResultText({ segs, showChanges }) {
  return segs.map((segment, index) => segment.c && showChanges
    ? <mark key={index} className="change-highlight">{segment.t}</mark>
    : <span key={index}>{segment.t}</span>);
}

function CopyIcon({ copied }) {
  return copied ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5L9.5 17L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v10A1.5 1.5 0 0 0 5.5 17H8" stroke="currentColor" strokeWidth="2" /></svg>
  );
}

export default function ResultBubble({ result, showChanges, onToggleChanges, onCompare }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex min-w-0 items-start gap-2 max-mobile:flex-col max-mobile:gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-row bg-brand text-[11px] font-bold text-white max-mobile:ml-4 max-mobile:size-5">NF</span>
      <div className="min-w-0 flex-1 max-mobile:w-full">
        <article className="relative w-full max-w-[85%] rounded-card border border-border bg-card p-4 text-input leading-[26px] text-text shadow-card max-mobile:max-w-[92%]">
          <button type="button" onClick={handleCopy} aria-label={copied ? "Copied" : "Copy"} className={`absolute right-2 top-2 flex size-10 items-center justify-center rounded-button ${copied ? "text-brand" : "text-text"}`}>
            <CopyIcon copied={copied} />
          </button>
          <p className="pr-10">{result.changed > 0 ? <ResultText segs={result.segs} showChanges={showChanges} /> : result.text}</p>
        </article>
        {result.checks?.length > 0 && (
          <aside className="mt-2 max-w-[85%] rounded-card border border-selected-border bg-selected px-4 py-3 text-small leading-[18px] text-muted max-mobile:ml-4 max-mobile:max-w-[92%]" aria-label="Please check this part">
            <p className="mb-1 font-medium text-text">Please check this part</p>
            <div className="space-y-1">
              {result.checks.map((check, index) => <p key={`${index}-${check}`}>{check}</p>)}
            </div>
          </aside>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-small leading-[18px] text-muted max-mobile:gap-x-2 max-mobile:px-4">
          <span>{result.changed > 0 ? `${result.changed} ${result.changed === 1 ? "word" : "words"} changed` : result.label ?? "This already reads clearly. No changes made."}</span>
          {result.changed > 0 && <div className="flex shrink-0 items-center gap-3 max-mobile:gap-2">
            <button type="button" onClick={onCompare} className="font-medium text-brand">Compare</button>
            <span>Show changes</span>
            <button type="button" aria-pressed={showChanges} aria-label="Show changes" onClick={onToggleChanges} className={`relative flex h-6 w-11 items-center rounded-full ${showChanges ? "bg-brand" : "bg-border-strong"}`}>
              <span className={`size-5 rounded-full bg-card shadow-card ${showChanges ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>}
        </div>
      </div>
    </div>
  );
}
