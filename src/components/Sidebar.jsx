import Logo from "./Logo";
import ProjectsCard from "./ProjectsCard";
import UserBlock from "./UserBlock";

export default function Sidebar({
  signedIn,
  user,
  onSignInToggle,
  projects,
  selectedProjectId,
  onNewProject,
  onSelectProject,
}) {
  return (
    <aside className="app-sidebar h-full w-sidebar shrink-0 flex-col p-10">
      <Logo wordmark />
      {signedIn && projects.length > 0 && (
        <div className="mt-10 w-full pt-3">
          <ProjectsCard
            projects={projects}
            selectedId={selectedProjectId}
            onNew={onNewProject}
            onSelect={onSelectProject}
          />
        </div>
      )}
      <div className="mt-auto w-full">
        <UserBlock signedIn={signedIn} user={user} onToggle={onSignInToggle} />
      </div>
    </aside>
  );
}
