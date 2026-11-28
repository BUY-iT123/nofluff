import { useState } from "react";

export default function ScheduledPost({ reminder, onRewrite }) {
  const [draft, setDraft] = useState(reminder?.draftText || "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleRewrite = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      await onRewrite(draft.trim(), reminder.scheduledAt);
    } catch (rewriteError) {
      setError(rewriteError.message || "NoFluff couldn’t start that rewrite. Please try again.");
      setSending(false);
    }
  };

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto grid min-h-full w-full max-w-[1050px] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)] lg:gap-12">
        <div className="scheduled-copy-enter text-center lg:text-left">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-row bg-brand text-lg font-bold text-white lg:mx-0">NF</div>
          <p className="text-small font-medium text-brand">Your posting day is here</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text sm:text-3xl">Your words are ready.</h1>
          <p className="mx-auto mt-3 max-w-md text-user leading-6 text-muted lg:mx-0">Take one last look, then send them through NoFluff for a final cleanup.</p>
        </div>

        <div className="scheduled-draft-enter rounded-card border border-selected-border bg-card p-4 shadow-card sm:p-5">
          <label htmlFor="scheduled-post-draft" className="mb-3 block text-user font-medium text-text">Your writing</label>
          <textarea
            id="scheduled-post-draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={13}
            maxLength={10000}
            className="min-h-[280px] w-full resize-y rounded-input border border-border-strong bg-page p-4 text-input leading-6 text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 sm:min-h-[360px]"
            aria-label="Edit your scheduled writing"
          />
          {error && <p role="alert" className="mt-3 text-small text-text">{error}</p>}
          <button type="button" onClick={handleRewrite} disabled={sending || !draft.trim()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-button bg-brand px-5 text-user font-medium text-white shadow-send transition hover:bg-brand-pressed disabled:cursor-not-allowed disabled:opacity-55">
            {sending ? "Starting your rewrite…" : "Rewrite with NoFluff"}
            {!sending && <span aria-hidden="true">→</span>}
          </button>
        </div>
      </div>
    </section>
  );
}
