import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const rewriteReactions = [
  { value: "sad", emoji: "😞", label: "Sad" },
  { value: "angry", emoji: "😠", label: "Angry" },
  { value: "like", emoji: "👍", label: "Like" },
  { value: "happy", emoji: "😄", label: "Happy" },
];

function RewriteFeedback({ selected, onSelect, onStartSchedule, onDismiss }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reactionOpen, setReactionOpen] = useState(true);
  const [offerVisible, setOfferVisible] = useState(false);
  const offerTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(offerTimer.current), []);

  const handleSelect = async (value) => {
    if (saving || selected) return;
    setSaving(true);
    setError("");
    try {
      await onSelect(value);
      setReactionOpen(false);
      offerTimer.current = window.setTimeout(() => setOfferVisible(true), 2200);
    } catch (feedbackError) {
      setError(feedbackError.message || "Your feedback couldn’t be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!reactionOpen && !offerVisible) return null;
  return createPortal(
    <div className="feedback-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && offerVisible) { setOfferVisible(false); onDismiss(); } }}>
      {reactionOpen && <section className="feedback-modal w-full max-w-[420px] rounded-card border border-border bg-card p-6 text-center text-text shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="rewrite-feedback-title">
        <p className="text-small font-medium text-muted">Your first NoFluff rewrite</p>
        <h2 id="rewrite-feedback-title" className="mt-2 text-lg font-semibold">How did it feel?</h2>
        <div className="mt-5 flex items-start justify-center gap-2">
          {rewriteReactions.map((reaction) => {
            const isSelected = selected === reaction.value;
            return <button type="button" key={reaction.value} aria-label={reaction.label} aria-pressed={isSelected} disabled={saving || Boolean(selected)} onClick={() => handleSelect(reaction.value)} className={`flex min-h-[76px] min-w-16 flex-1 flex-col items-center justify-center gap-2 rounded-button border px-1 py-2 transition-colors disabled:cursor-default ${isSelected ? "border-selected-border bg-selected" : "border-border bg-card hover:bg-selected"}`}>
              <span className="text-3xl leading-none" aria-hidden="true">{reaction.emoji}</span>
              <span className="text-[11px] leading-3 text-muted">{reaction.label}</span>
            </button>;
          })}
        </div>
        {saving && <p className="mt-3 text-small text-muted" role="status">Saving your feedback…</p>}
        {error && <p className="mt-3 text-small text-text" role="alert">{error}</p>}
      </section>}
      {offerVisible && <section className="feedback-modal w-full max-w-[420px] rounded-card border border-border bg-card p-6 text-center text-text shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="posting-plan-title">
        <h2 id="posting-plan-title" className="text-lg font-semibold">Want a simple posting plan?</h2>
        <p className="mt-2 text-user leading-6 text-muted">Pick your days and times, and we'll remind you when it's time to post.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={onStartSchedule} className="min-h-11 rounded-button bg-brand px-5 text-user font-medium text-white">Set my schedule</button>
          <button type="button" onClick={() => { setOfferVisible(false); onDismiss(); }} className="min-h-11 rounded-button px-5 text-user font-medium text-muted hover:bg-row-hover">Not now</button>
        </div>
      </section>}
    </div>,
    document.body,
  );
}

export default function ResultBubble({ result, showChanges, onToggleChanges, onCompare, onMakePostReady, postReadyRemaining = 5, isLoading = false, showFeedback = false, onSubmitFeedback, onFeedbackFlowDone, onStartSchedule }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [postReadyText, setPostReadyText] = useState(null);
  const [postReadyLoading, setPostReadyLoading] = useState(false);
  const [postReadyError, setPostReadyError] = useState("");

  const canShowPostReady = shouldShowPostReady(result.text, isLoading);
  const isPostReady = postReadyText !== null;
  const displayText = isPostReady ? postReadyText : result.text;

  useEffect(() => {
    setPostReadyText(null);
    setPostReadyError("");
    setFeedback(null);
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
        {showFeedback && !isLoading && <RewriteFeedback selected={feedback} onSelect={async (value) => {
          await onSubmitFeedback(value);
          setFeedback(value);
        }} onStartSchedule={onStartSchedule} onDismiss={() => { onFeedbackFlowDone(); }} />}
      </div>
    </div>
  );
}
