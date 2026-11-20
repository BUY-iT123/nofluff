import ProjectsCard from "./ProjectsCard";
import UserBlock from "./UserBlock";

export default function MobileDrawer({
  signedIn,
  user,
  projects,
  selectedProjectId,
  onClose,
  onNewProject,
  onSelectProject,
  onSignInToggle,
}) {
  return (
    <div className="mobile-drawer-overlay fixed inset-0 z-50 bg-overlay" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Projects"
        onClick={(event) => event.stopPropagation()}
        className="mobile-project-drawer flex h-full w-[85vw] max-w-[320px] flex-col bg-card px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 shadow-drawer"
      >
        <div className="min-h-0 flex-1">
          <ProjectsCard
            variant="drawer"
            projects={signedIn ? projects : []}
            selectedId={selectedProjectId}
            onNew={onNewProject}
            onSelect={onSelectProject}
          />
        </div>
        <UserBlock
          signedIn={signedIn}
          user={user}
          compact
          onToggle={onSignInToggle}
        />
      </aside>
    </div>
  );
}
