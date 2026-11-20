import Logo from "./Logo";

export default function EmptyState({ isReading = false }) {
  return (
    <section className="flex min-h-0 flex-1 items-center justify-center">
      <div className="flex -translate-y-4 flex-col items-center gap-4 px-4 text-center">
        <Logo />
        {isReading ? (
          <p className="flex items-center text-empty font-medium text-text" role="status" aria-live="polite">
            Reading how you write
            <span className="reading-dots ml-1" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>
          </p>
        ) : (
          <p className="text-empty font-medium text-text">Let's make your note clearer.</p>
        )}
      </div>
    </section>
  );
}
