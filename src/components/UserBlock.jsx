export default function UserBlock({ signedIn, user, onToggle, compact = false }) {
  if (signedIn) {
    return (
      <div className="flex h-user-block w-full items-center gap-3 rounded-card border border-border bg-card px-4 text-left shadow-card">
        {user?.picture ? <img src={user.picture} alt="" className="size-10 shrink-0 rounded-full" referrerPolicy="no-referrer" /> : <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-selected font-bold text-brand">{user?.name?.[0]?.toUpperCase() || "Y"}</span>}
        <span className="min-w-0">
          <span className="block truncate text-user font-medium text-text">{user?.name || "Your name"}</span>
          <span className="block truncate text-small text-muted">{user?.email || "you@email.com"}</span>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Sign in to save your work"
      className="flex h-user-block w-full items-center gap-3 rounded-card border border-border bg-card px-4 text-left shadow-card"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-selected font-bold text-brand">N</span>
      <span className="min-w-0">
        {compact ? <span className="block text-user font-medium text-text">Sign in to save your work</span> : <>
          <span className="block text-user font-medium text-text">Sign in</span>
          <span className="block text-small text-muted">Save your work</span>
        </>}
      </span>
    </button>
  );
}
