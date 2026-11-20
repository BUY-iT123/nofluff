export default function Logo({ size = 48, wordmark = false }) {
  if (wordmark) {
    return (
      <img
        src="/no-fluff-logo.png"
        alt="NoFluff"
        className="block w-auto shrink-0 object-contain"
        style={{ height: size }}
      />
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div
        className="flex shrink-0 items-center justify-center rounded-card bg-brand font-bold leading-none text-white"
        style={{ width: size, height: size, fontSize: size * 0.48 }}
        aria-hidden="true"
      >
        NF
      </div>
    </div>
  );
}
