import { useLayoutEffect, useRef } from "react";
import ResultBubble from "./ResultBubble";
import UserBubble from "./UserBubble";

function CompareText({ result, showChanges }) {
  return result.segs.map((segment, index) => segment.c && showChanges
    ? <mark key={index} className="change-highlight">{segment.t}</mark>
    : <span key={index}>{segment.t}</span>);
}

function CompareView({ pair, showChanges, onClose }) {
  return (
    <div className="mx-auto w-full max-w-conversation px-4 py-4">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-user font-medium text-text">Compare</h2>
        <button type="button" onClick={onClose} className="min-h-10 rounded-button px-3 text-user font-medium text-brand">Close</button>
      </header>
      <div className="grid grid-cols-2 gap-4 max-mobile:grid-cols-1">
        <article className="min-h-32 rounded-card border border-border bg-card p-4 text-input leading-[26px] text-text shadow-card">
          <div className="mb-2 text-small text-muted">Your text</div>{pair.sourceText}
        </article>
        <article className="min-h-32 rounded-card border border-selected-border bg-card p-4 text-input leading-[26px] text-text shadow-card">
          <div className="mb-2 flex items-center gap-2 text-small text-brand"><span className="flex size-4 items-center justify-center rounded-row bg-brand text-[8px] font-bold text-white">NF</span>NoFluff</div>
          <CompareText result={pair.result} showChanges={showChanges} />
        </article>
      </div>
      <p className="mt-4 text-small text-muted">{pair.result.label ? `${pair.result.label} ` : `${pair.result.changed} ${pair.result.changed === 1 ? "word" : "words"} changed. `}Your tone, your jokes and your meaning are kept.</p>
    </div>
  );
}

function ReadingReply() {
  return (
    <div className="flex w-full items-start justify-start gap-2 text-left" role="status" aria-live="polite">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-row bg-brand text-[11px] font-bold text-white max-mobile:ml-4 max-mobile:size-5">NF</span>
      <div className="flex min-h-12 flex-col items-start justify-center gap-1 text-left text-small font-medium text-muted">
        <span>NoFluff</span>
        <span className="flex items-center text-text">Reading how you write<span className="reading-dots ml-1" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></span>
      </div>
    </div>
  );
}

export default function ConversationView({ conversation, isReading, onSignInSave, onNewProject, signedIn, showChanges, onToggleChanges, comparePair, onCompare, onCloseCompare, inputHasText, onMakePostReady, postReadyRemaining }) {
  const scrollRef = useRef(null);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (element && !comparePair) element.scrollTop = element.scrollHeight;
  });

  return (
    <section ref={scrollRef} className="conversation-scroll relative min-h-0 flex-1 overflow-y-auto">
      {comparePair ? <CompareView pair={comparePair} showChanges={showChanges} onClose={onCloseCompare} /> : (
        <div className="mx-auto flex w-full max-w-conversation flex-col gap-4 pb-4 pt-20">
          <UserBubble text={conversation.original} />
          {isReading || !conversation.result ? <ReadingReply /> : (
            <div>
              <ResultBubble result={conversation.result} showChanges={showChanges} onToggleChanges={onToggleChanges} onCompare={() => onCompare({ sourceText: conversation.original, result: conversation.result })} onMakePostReady={onMakePostReady} postReadyRemaining={postReadyRemaining} isLoading={isReading} />
            </div>
          )}
          {(conversation.followUps ?? []).map((followUp, index) => (
            <div key={`${index}-${followUp.instruction}`} className="flex flex-col gap-4">
              <UserBubble text={followUp.instruction} />
              <ResultBubble result={followUp.result} showChanges={showChanges} onToggleChanges={onToggleChanges} onCompare={() => onCompare({ sourceText: followUp.source, result: followUp.result })} onMakePostReady={onMakePostReady} postReadyRemaining={postReadyRemaining} isLoading={isReading} />
            </div>
          ))}
          {!signedIn && <button type="button" onClick={onSignInSave} className="mt-1 ml-8 min-h-10 self-start rounded-button px-2 text-small font-medium text-brand max-mobile:ml-4">Sign in to save this</button>}
        </div>
      )}
      {!comparePair && inputHasText === false && <button type="button" aria-label="New project" onClick={onNewProject} className="new-project-fab flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-send">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>}
    </section>
  );
}
