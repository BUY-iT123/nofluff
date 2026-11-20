export default function ProjectsCard({ projects = [], selectedId, onNew, onSelect, variant = "sidebar" }) {
  const isDrawer = variant === "drawer";
  return (
    <section className={isDrawer ? "flex min-h-0 w-full flex-1 flex-col" : "max-h-[calc(100dvh-280px)] w-full rounded-card border border-border bg-card p-2 shadow-card"}>
      <header className={`flex shrink-0 items-center justify-between ${isDrawer ? "h-11" : "h-12 px-3"}`}>
        <h2 className={`${isDrawer ? "text-empty leading-6" : "text-user leading-5"} font-medium text-text`}>Projects</h2>
        <button type="button" onClick={onNew} className={`flex items-center gap-1 font-medium text-brand ${isDrawer ? "h-11 rounded-card bg-selected px-4 text-empty" : "h-9 rounded-button px-2 text-user"}`}><span aria-hidden="true">+</span><span>New</span></button>
      </header>
      {isDrawer && !projects.length && <p className="mt-4 text-user leading-6 text-muted">Sign in and your saved writing shows up here.</p>}
      <div className={isDrawer ? "min-h-0 flex-1 overflow-y-auto pt-2" : "max-h-[calc(100dvh-400px)] overflow-y-auto"}>
        {projects.map((project) => (
          <div key={project.id} className={`project-row group relative flex h-12 min-w-0 items-center gap-2 rounded-row border-l-[3px] px-3 ${project.id === selectedId ? "border-brand bg-selected" : "border-transparent"}`}>
            <button type="button" onClick={() => onSelect(project)} aria-current={project.id === selectedId ? "page" : undefined} className="flex h-full min-w-0 flex-1 items-center justify-between gap-2 text-left">
              <span className="min-w-0 flex-1 truncate text-user font-medium leading-5 text-text">{project.title}</span>
              <span className="shrink-0 text-small text-muted">Today</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
