import { useEffect, useState } from "react";
import ChatInput from "./components/ChatInput";
import EmptyState from "./components/EmptyState";
import MobileHeader from "./components/MobileHeader";
import Sidebar from "./components/Sidebar";
import ConversationView from "./components/ConversationView";
import MobileDrawer from "./components/MobileDrawer";
import SignInModal from "./components/SignInModal";

function makeProjectTitle(text = "") {
  return text.trim().split(/\s+/).slice(0, 5).join(" ").replace(/[.,!?;:]+$/, "");
}

function asText(result) {
  return result.segs.map(({ t }) => t).join("");
}

function makeResult(segs, changed, label) {
  return { segs, changed, text: segs.map(({ t }) => t).join(""), label };
}

function separateCheckNotes(text, returnedChecks = []) {
  const lines = text.split(/\r?\n/);
  const isCheckMarker = (line) => /^\s*[`*_~]*\s*-{2,}\s*CHECK\s*-{2,}\s*[`*_~]*\s*$/i.test(line);
  const marker = lines.findIndex(isCheckMarker);
  let rewriteText = text;
  let extractedChecks = [];

  if (marker >= 0) {
    rewriteText = lines.slice(0, marker).join("\n").trim();
    extractedChecks = lines.slice(marker + 1).map((line) => line.trim()).filter(Boolean);
  } else {
    const inlineMarker = /-{2,}\s*CHECK\s*-{2,}/i.exec(text);
    if (inlineMarker) {
      rewriteText = text.slice(0, inlineMarker.index).trim();
      extractedChecks = text.slice(inlineMarker.index + inlineMarker[0].length)
        .split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    }
  }

  const checks = [...(Array.isArray(returnedChecks) ? returnedChecks : []), ...extractedChecks]
    .map((check) => String(check).trim())
    .filter(Boolean);
  return { rewriteText, checks: [...new Set(checks)] };
}

function makeApiResult(source, text, checks = []) {
  const tokenize = (value) => value.match(/\s+|[\p{L}\p{N}’']+|[^\s\p{L}\p{N}’']+/gu) ?? [];
  const sourceTokens = tokenize(source);
  const outputTokens = tokenize(text);
  const sourceWords = sourceTokens.map((token, index) => ({ token, index })).filter(({ token }) => /^[\p{L}\p{N}’']+$/u.test(token));
  const outputWords = outputTokens.map((token, index) => ({ token, index })).filter(({ token }) => /^[\p{L}\p{N}’']+$/u.test(token));
  const rows = sourceWords.length + 1;
  const cols = outputWords.length + 1;
  const lcs = Array.from({ length: rows }, () => new Uint16Array(cols));

  for (let i = sourceWords.length - 1; i >= 0; i -= 1) {
    for (let j = outputWords.length - 1; j >= 0; j -= 1) {
      lcs[i][j] = sourceWords[i].token === outputWords[j].token
        ? lcs[i + 1][j + 1] + 1
        : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const unchangedOutput = new Set();
  const unchangedSource = new Set();
  let sourceIndex = 0;
  let outputIndex = 0;
  while (sourceIndex < sourceWords.length && outputIndex < outputWords.length) {
    if (sourceWords[sourceIndex].token === outputWords[outputIndex].token) {
      unchangedOutput.add(outputWords[outputIndex].index);
      unchangedSource.add(sourceIndex);
      sourceIndex += 1;
      outputIndex += 1;
    } else if (lcs[sourceIndex + 1][outputIndex] >= lcs[sourceIndex][outputIndex + 1]) {
      sourceIndex += 1;
    } else {
      outputIndex += 1;
    }
  }

  const removedWords = sourceWords.length - unchangedSource.size;
  let changed = 0;
  const segs = outputTokens.map((token, index) => {
    const isWord = /^[\p{L}\p{N}’']+$/u.test(token);
    const changedWord = isWord && !unchangedOutput.has(index);
    if (changedWord) changed += 1;
    return { t: token, c: changedWord };
  });
  for (let index = 0; index < segs.length; index += 1) {
    if (!/^\s+$/u.test(segs[index].t)) continue;
    segs[index].c = Boolean(segs[index - 1]?.c && segs[index + 1]?.c);
  }

  changed = Math.max(changed, removedWords);
  return { ...makeResult(segs, changed, changed ? undefined : "This already reads clearly. No changes made."), checks };
}

function mockEdit(previousText, instruction) {
  if (/short|trim|cut|tight/i.test(instruction)) {
    const sentences = previousText.match(/[^.!?]+[.!?]?/g)?.map((part) => part.trim()).filter(Boolean) ?? [];
    const text = sentences.length > 2 ? `${sentences[0]} ${sentences.at(-1)}` : (sentences[0] ?? previousText.trim());
    return makeResult([{ t: text, c: false }], 0, "Shortened. Your wording is untouched.");
  }
  const text = "In the real NoFluff, this would change the text the way you asked. This demo only understands “make it shorter”.";
  return makeResult([{ t: text, c: false }], 0, "Demo note");
}

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [accountUser, setAccountUser] = useState(null);
  const [remaining, setRemaining] = useState(5);
  const [conversation, setConversation] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [inputKey, setInputKey] = useState(0);
  const [inputHasText, setInputHasText] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [showChanges, setShowChanges] = useState(true);
  const [comparePair, setComparePair] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let active = true;
    const loadAccount = async () => {
      try {
        const sessionResponse = await fetch("/api/auth/me");
        const session = sessionResponse.ok ? await sessionResponse.json() : null;
        if (!session?.user || !active) return;
        setAccountUser(session.user);
        setSignedIn(true);

        const [usageResponse, projectsResponse] = await Promise.all([
          fetch("/api/usage"),
          fetch("/api/projects"),
        ]);
        if (!active) return;
        if (usageResponse.ok) {
          const usage = await usageResponse.json();
          setRemaining(usage.remaining);
        }
        if (projectsResponse.ok) {
          const data = await projectsResponse.json();
          setProjects(Array.isArray(data.projects) ? data.projects : []);
        }
      } catch {
        // Keep the app usable if account data cannot be reached temporarily.
      }
    };
    loadAccount();
    return () => { active = false; };
  }, []);

  const persistConversation = async (nextConversation, isNew) => {
    if (!signedIn) throw new Error("Sign in with Google to save your writing.");
    const createProject = isNew || !selectedProjectId;
    const response = await fetch(createProject ? "/api/projects" : `/api/projects/${encodeURIComponent(selectedProjectId)}`, {
      method: createProject ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: makeProjectTitle(nextConversation.original) || "Untitled",
        conversation: nextConversation,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.project) {
      throw new Error(payload.error || "Your writing could not be saved. Please try again.");
    }
    const project = payload.project;
    if (createProject) {
      setProjects((existing) => [project, ...existing.filter((item) => item.id !== project.id)]);
      setSelectedProjectId(project.id);
    } else {
      setProjects((existing) => existing.map((item) => item.id === project.id ? project : item));
    }
    return project;
  };

  const handleSend = async (original) => {
    if (!signedIn) {
      setRequestError("Sign in with Google to use your daily rewrite requests.");
      setSignInOpen(true);
      return false;
    }
    setRequestError("");
    setConversation({ original, result: null, followUps: [] });
    setComparePair(null);
    setIsReading(true);
    const startedAt = Date.now();
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: original }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "NoFluff couldn't rewrite that text. Please try again.");

      // Keep the branded reading state visible long enough to be noticed on fast replies.
      const readingTimeLeft = 650 - (Date.now() - startedAt);
      if (readingTimeLeft > 0) await new Promise((resolve) => window.setTimeout(resolve, readingTimeLeft));

      const { rewriteText, checks } = separateCheckNotes(payload.result, payload.checks);
      const result = makeApiResult(original, rewriteText, checks);
      const nextConversation = { original, result, followUps: [] };
      setConversation(nextConversation);
      setRemaining(payload.remaining);
      setComparePair(null);
      try {
        await persistConversation(nextConversation, true);
      } catch {
        setRequestError("Your rewrite is ready, but it couldn't be saved to your account. Please try again.");
      }
      return true;
    } catch (error) {
      setConversation(null);
      setRequestError(error instanceof TypeError
        ? "Couldn't reach NoFluff. Make sure the local backend is running."
        : error.message);
      return false;
    } finally {
      setIsReading(false);
    }
  };

  const handleEditSend = async (instruction) => {
    if (!conversation) return false;
    const previous = conversation.followUps?.at(-1)?.result ?? conversation.result;
    const result = mockEdit(asText(previous), instruction);
    const nextConversation = {
      ...conversation,
      followUps: [...(conversation.followUps ?? []), { instruction, result, source: asText(previous) }],
    };
    setConversation(nextConversation);
    setRemaining((count) => Math.max(0, count - 1));
    setComparePair(null);
    try {
      await persistConversation(nextConversation, false);
    } catch {
      setRequestError("Your update is ready, but it couldn't be saved to your account. Please try again.");
    }
    return true;
  };

  const resetComposer = () => {
    setInputKey((key) => key + 1);
    setInputHasText(false);
    setComparePair(null);
  };

  const handleNewProject = () => {
    setConversation(null);
    setSelectedProjectId(null);
    resetComposer();
    setProjectsOpen(false);
  };

  const handleSelectProject = (project) => {
    setConversation(project.conversation ?? null);
    setSelectedProjectId(project.id);
    resetComposer();
    setProjectsOpen(false);
  };

  const openSignIn = () => {
    setProjectsOpen(false);
    setSignInOpen(true);
  };

  const handleGoogleCredential = async (credential) => {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Google sign-in could not be completed. Please try again.");
    setRequestError("");
    setAccountUser(payload.user);
    setSignedIn(true);
    const [usageResponse, projectsResponse] = await Promise.all([
      fetch("/api/usage"),
      fetch("/api/projects"),
    ]);
    if (usageResponse.ok) {
      const usage = await usageResponse.json();
      setRemaining(usage.remaining);
    }
    if (projectsResponse.ok) {
      const data = await projectsResponse.json();
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    }
  };

  return (
    <div className="app-shell flex h-dvh w-full overflow-hidden bg-page font-sans text-text">
      <Sidebar signedIn={signedIn} user={accountUser} onSignInToggle={openSignIn} projects={projects} selectedProjectId={selectedProjectId} onNewProject={handleNewProject} onSelectProject={handleSelectProject} />
      {projectsOpen && <MobileDrawer signedIn={signedIn} user={accountUser} projects={projects} selectedProjectId={selectedProjectId} onClose={() => setProjectsOpen(false)} onNewProject={handleNewProject} onSelectProject={handleSelectProject} onSignInToggle={openSignIn} />}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <MobileHeader onOpenProjects={() => setProjectsOpen(true)} projectsOpen={projectsOpen} />
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {conversation ? (
            <ConversationView
              key={selectedProjectId ?? "new-conversation"}
              conversation={conversation}
              isReading={isReading}
              signedIn={signedIn}
              showChanges={showChanges}
              onToggleChanges={() => setShowChanges((value) => !value)}
              comparePair={comparePair}
              onCompare={setComparePair}
              onCloseCompare={() => setComparePair(null)}
              onSignInSave={openSignIn}
              onNewProject={handleNewProject}
              inputHasText={inputHasText}
            />
          ) : <EmptyState isReading={isReading} />}
          <ChatInput
            key={inputKey}
            remaining={remaining}
            hasResult={Boolean(conversation)}
            compareOpen={Boolean(comparePair)}
            isReading={isReading}
            errorMessage={requestError}
            onValueChange={(value) => setInputHasText(Boolean(value.trim()))}
            onSend={handleSend}
            onEditSend={handleEditSend}
          />
        </main>
      </div>
      {signInOpen && <SignInModal onClose={() => setSignInOpen(false)} onGoogleCredential={handleGoogleCredential} />}
    </div>
  );
}
