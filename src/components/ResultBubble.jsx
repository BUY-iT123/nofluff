import { useEffect, useState } from "react";
import { getCheckNotes, shouldShowPostReady } from "../utils/postReady";

function ResultText({ segs, showChanges }) {
  return segs.map((segment, index) => segment.c && showChanges
    ? <mark key={index} className="change-highlight">{segment.t}</mark>
    : <span key={index}>{segment.t}</span>);
}

function PostReadyText({ text, segs, showChanges }) {
  if (!showChanges || !segs?.length) return text;
  const changeFlags = [];
  for (const segment of segs) {
    for (const character of segment.t) {
      if (!/\s/u.test(character)) changeFlags.push(Boolean(segment.c));
    }
  }

  let characterIndex = 0;
  return text.split(/(\s+)/u).map((part, partIndex) => {
    if (!part) return null;
    if (/^\s+$/u.test(part)) return <span key={partIndex}>{part}</span>;
    const groups = [];
    for (const character of part) {
      const changed = Boolean(changeFlags[characterIndex]);
      characterIndex += 1;
      const last = groups.at(-1);
      if (last?.changed === changed) last.text += character;
      else groups.push({ changed, text: character });
    }
    return <span key={partIndex}>{groups.map((group, groupIndex) => group.changed
      ? <mark key={groupIndex} className="change-highlight">{group.text}</mark>
      : <span key={groupIndex}>{group.text}</span>)}</span>;
  });
}

function CopyIcon({ copied }) {
  return copied ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5L9.5 17L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v10A1.5 1.5 0 0 0 5.5 17H8" stroke="currentColor" strokeWidth="2" /></svg>
  );
}

export default function ResultBubble({ result, showChanges, onToggleChanges, onCompare, onMakePostReady, postReadyRemaining = 5, isLoading = false }) {
  const [copied, setCopied] = useState(false);
  const [postReadyText, setPostReadyText] = useState(null);
  const [postReadyLoading, setPostReadyLoading] = useState(false);
  const [postReadyError, setPostReadyError] = useState("");

  const canShowPostReady = shouldShowPostReady(result.text, isLoading);
  const isPostReady = postReadyText !== null;
  const displayText = isPostReady ? postReadyText : result.text;

  useEffect(() => {
    setPostReadyText(null);
    setPostReadyError("");
  }, [result.text]);

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleMakePostReady = async () => {
    if (postReadyLoading || postReadyRemaining <= 0) return;
    setPostReadyLoading(true);
    setPostReadyError("");
    try {
      const payload = await onMakePostReady(result.text);
      if (payload.formatted) {
        setPostReadyText(payload.result);
      } else {
        setPostReadyText(null);
        setPostReadyError(payload.error || "Couldn't format this one. Try again.");
      }
    } catch (error) {
      setPostReadyText(null);
      setPostReadyError(error.message || "Couldn't format this one. Try again.");
    } finally {
      setPostReadyLoading(false);
    }
  };

  const handleBackToCleanup = () => {
    setPostReadyText(null);
    setPostReadyError("");
  };

  const checks = getCheckNotes(result);
  const hasChecks = checks.length > 0;

  return (
    <div className="flex min-w-0 items-start gap-2 max-mobile:flex-col max-mobile:gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-row bg-brand text-[11px] font-bold text-white max-mobile:ml-4 max-mobile:size-5">NF</span>
      <div className="min-w-0 flex-1 max-mobile:w-full">
        {hasChecks && (
          <p className="mb-2 max-w-[85%] text-small leading-[18px] text-muted max-mobile:ml-4 max-mobile:max-w-[92%]">
            You still have {checks.length} {checks.length === 1 ? "thing" : "things"} to check.
          </p>
        )}
        <article className="relative w-full max-w-[85%] rounded-card border border-border bg-card p-4 text-input leading-[26px] text-text shadow-card max-mobile:max-w-[92%]">
          <button type="button" onClick={handleCopy} aria-label={copied ? "Copied" : "Copy"} className={`absolute right-2 top-2 flex size-10 items-center justify-center rounded-button ${copied ? "text-brand" : "text-text"}`}>
            <CopyIcon copied={copied} />
          </button>
          <p className={`pr-10 ${isPostReady ? "whitespace-pre-wrap" : ""}`}>
            {isPostReady
              ? <PostReadyText text={displayText} segs={result.segs} showChanges={showChanges} />
              : result.changed > 0 ? <ResultText segs={result.segs} showChanges={showChanges} /> : result.text}
          </p>
        </article>
        {hasChecks && (
          <aside className="mt-2 max-w-[85%] rounded-card border border-selected-border bg-selected px-4 py-3 text-small leading-[18px] text-muted max-mobile:ml-4 max-mobile:max-w-[92%]" aria-label="Please check this part">
            <p className="mb-1 font-medium text-text">Please check this part</p>
            <div className="space-y-1">
              {checks.map((check, index) => <p key={`${index}-${check}`}>{check}</p>)}
            </div>
          </aside>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-small leading-[18px] text-muted max-mobile:gap-x-2 max-mobile:px-4">
          <span>{result.changed > 0 ? `${result.changed} ${result.changed === 1 ? "word" : "words"} changed` : result.label ?? "This already reads clearly. No changes made."}</span>
          {(result.changed > 0 || canShowPostReady || isPostReady) && <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 max-mobile:gap-x-2">
            {result.changed > 0 && <>
              <button type="button" onClick={onCompare} className="font-medium text-brand">Compare</button>
              <span>Show changes</span>
              <button type="button" aria-pressed={showChanges} aria-label="Show changes" onClick={onToggleChanges} className={`relative flex h-6 w-11 items-center rounded-full ${showChanges ? "bg-brand" : "bg-border-strong"}`}>
                <span className={`size-5 rounded-full bg-card shadow-card ${showChanges ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </>}
            {canShowPostReady && !isPostReady && <button type="button" onClick={handleMakePostReady} disabled={postReadyLoading || postReadyRemaining <= 0} className="font-medium text-brand disabled:cursor-not-allowed disabled:opacity-50">
              {postReadyLoading ? <span role="status">Making post-ready…</span> : "Make post-ready"}
            </button>}
            {canShowPostReady && isPostReady && <button type="button" onClick={handleBackToCleanup} className="font-medium text-brand">Back to cleanup</button>}
            {canShowPostReady && <span className={`text-small ${postReadyRemaining <= 5 ? "font-medium text-brand" : "text-muted"}`}>
              {postReadyRemaining} post-ready left today
            </span>}
          </div>}
        </div>
        {postReadyError && <p role="alert" className="mt-2 max-w-[85%] text-small leading-[18px] text-text max-mobile:ml-4 max-mobile:max-w-[92%]">{postReadyError}</p>}
      </div>
    </div>
  );
}
