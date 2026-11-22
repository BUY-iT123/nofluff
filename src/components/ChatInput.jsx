import { useState } from "react";

export default function ChatInput({ remaining = 5, hasResult = false, compareOpen = false, isReading = false, errorMessage = "", onValueChange, onSend, onEditSend }) {
  const [value, setValue] = useState("");
  const [editCancelled, setEditCancelled] = useState(false);
  const newlines = (value.match(/\n/g) ?? []).length;
  const rows = Math.min(8, Math.max(1, newlines + 1 + Math.floor(value.length / 70)));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = value.trim();
    if (!text || remaining <= 0 || isReading) return;
    const succeeded = hasResult && !editCancelled && !compareOpen
      ? await onEditSend?.(text)
      : await onSend?.(text);
    if (succeeded === false) return;
    setValue("");
    onValueChange?.("");
    setEditCancelled(false);
  };

  const cancelEdit = () => {
    setEditCancelled(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const showEditBar = hasResult && !compareOpen && !editCancelled && value.trim() && remaining > 0;

  return (
    <div className="input-dock shrink-0">
      <div className="mx-auto w-full max-w-conversation">
        {remaining <= 0 ? (
          <div className="rounded-card border border-border bg-card p-4 text-input leading-[26px] text-muted">You've used today's 5 requests. They reset tomorrow.</div>
        ) : (
          <>
            {showEditBar && (
              <div className="edit-mode-bar mb-2 flex min-h-10 items-center gap-2 rounded-card border border-selected-border bg-selected py-2 pl-3 pr-0.5 max-mobile:min-h-11">
                <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center rounded-row bg-brand text-[8px] font-bold text-white">NF</span>
                <p className="min-w-0 flex-1 text-small leading-4 text-text">Edit mode is on for the text above. Tap × to start a new rewrite instead. Edit feature coming soon.</p>
                <button type="button" onClick={cancelEdit} aria-label="Cancel edit" className="flex size-10 shrink-0 items-center justify-center rounded-button text-text max-mobile:size-11">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className={`input-shell relative min-h-[56px] w-full overflow-hidden rounded-input bg-card ${showEditBar ? "input-shell-edit" : ""}`}>
              <textarea
                rows={rows}
                value={value}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setValue(nextValue);
                  onValueChange?.(nextValue);
                }}
                onKeyDown={handleKeyDown}
                disabled={isReading}
                placeholder="Paste your writing here"
                aria-label="Paste your writing here"
                className="block min-h-[54px] w-full resize-none bg-transparent py-3 pl-4 pr-[56px] text-input text-text placeholder:text-muted focus:outline-none"
              />
              <button type="submit" disabled={!value.trim() || isReading} aria-label="Send writing" className="absolute bottom-2 right-2 flex size-send items-center justify-center rounded-button bg-brand text-white shadow-send disabled:cursor-default disabled:opacity-40 disabled:shadow-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </form>
          </>
        )}
        {errorMessage && <p role="alert" className="mt-2 px-1 text-small text-text">{errorMessage}</p>}
        <p className={`input-counter text-small ${remaining <= 5 ? "text-brand font-medium" : "text-muted"}`} aria-live="polite">
          {remaining} left today{remaining <= 5 && <button type="button" className="ml-2 text-brand">Get more</button>}
        </p>
      </div>
    </div>
  );
}
