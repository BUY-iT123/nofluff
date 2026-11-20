export default function UserBubble({ text }) {
  return (
    <div className="flex items-start justify-end gap-2 max-mobile:flex-col-reverse max-mobile:items-end max-mobile:gap-2">
      <div className="max-w-[75%] rounded-card border border-border bg-card p-4 text-input leading-[26px] text-text shadow-card max-mobile:max-w-[85%]">
        {text}
      </div>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-selected text-small font-bold text-muted max-mobile:size-5">
        U
      </span>
    </div>
  );
}
