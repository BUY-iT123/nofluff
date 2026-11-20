import Logo from "./Logo";

export default function MobileHeader({ onOpenProjects, projectsOpen = false }) {
  return (
    <header className="mobile-header relative h-mobile-header shrink-0 items-center justify-between px-4">
      <button
        type="button"
        aria-label="Open Projects"
        aria-expanded={projectsOpen}
        onClick={onOpenProjects}
        className="flex size-11 shrink-0 items-center justify-center rounded-button text-text"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Logo size={28} wordmark />
      </div>
      <span className="size-11 shrink-0" aria-hidden="true" />
    </header>
  );
}
