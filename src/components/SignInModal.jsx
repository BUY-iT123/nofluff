import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

export default function SignInModal({ onClose, onComplete, onGoogleCredential }) {
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);
  const googleButton = useRef(null);
  const closeRef = useRef(onClose);
  const credentialHandlerRef = useRef(onGoogleCredential);
  closeRef.current = onClose;
  credentialHandlerRef.current = onGoogleCredential;

  useEffect(() => {
    if (emailMode) return undefined;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setGoogleError("Google sign-in needs a Google client ID in the frontend .env file.");
      return undefined;
    }

    let cancelled = false;
    const renderGoogleButton = () => {
      if (cancelled || !googleButton.current || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setGoogleBusy(true);
          setGoogleError("");
          try {
            await credentialHandlerRef.current(credential);
            closeRef.current();
          } catch (error) {
            setGoogleError(error.message || "Google sign-in could not be completed. Please try again.");
            setGoogleBusy(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "rectangular", width: Math.min(352, Math.floor(googleButton.current.getBoundingClientRect().width)),
      });
    };

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      script.onerror = () => setGoogleError("Google sign-in could not load. Check your internet connection and try again.");
      document.head.appendChild(script);
    }
    return () => { cancelled = true; };
  }, [emailMode]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const handleEmailSubmit = (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay max-mobile:items-end"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-in-title"
        aria-describedby="sign-in-description"
        className="relative flex w-full max-w-[400px] flex-col items-center rounded-sign-in bg-card p-6 text-center shadow-sign-in max-mobile:max-h-[calc(100dvh-24px)] max-mobile:max-w-none max-mobile:overflow-y-auto max-mobile:rounded-b-none max-mobile:rounded-t-phone-sheet max-mobile:px-4 max-mobile:pb-[calc(24px+env(safe-area-inset-bottom))]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 hidden h-1 w-9 rounded-full bg-border-strong max-mobile:block" aria-hidden="true" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in"
          className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-button text-muted focus-visible:outline-none"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        <Logo size={40} />
        <h2 id="sign-in-title" className="mt-4 text-[20px] font-medium leading-7 text-text">Save your work</h2>
        <p id="sign-in-description" className="mt-2 text-[15px] leading-[22px] text-muted">
          Sign in to keep this and find it later.
        </p>

        {!emailMode ? (
          <>
            <div className={`mt-6 flex min-h-11 w-full justify-center ${googleBusy ? "pointer-events-none opacity-60" : ""}`} ref={googleButton} />
            {googleBusy && <p className="mt-2 text-small text-muted" role="status">Signing in with Google…</p>}
            {googleError && <p className="mt-2 text-small text-red-600" role="alert">{googleError}</p>}
            <button type="button" onClick={() => setEmailMode(true)} className="mt-4 min-h-10 rounded-button px-2 text-small font-medium text-brand focus-visible:outline-none">Use email instead</button>
          </>
        ) : (
          <form onSubmit={handleEmailSubmit} className="mt-6 flex w-full flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="Email address"
              placeholder="you@email.com"
              className="h-12 w-full rounded-button border border-border-strong bg-card px-4 text-input text-text placeholder:text-muted focus:border-brand focus:outline-none"
            />
            <button type="submit" className="h-12 w-full rounded-button bg-brand text-user font-medium text-white">Send me a link</button>
          </form>
        )}

      </section>
    </div>
  );
}
