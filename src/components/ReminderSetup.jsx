import { useState } from "react";

const daysOfWeek = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

export default function ReminderSetup({ email, onBack, onSave }) {
  const [weeks, setWeeks] = useState(1);
  const [days, setDays] = useState([]);
  const [time, setTime] = useState("18:00");
  const [timeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Lagos");
  const [backupType, setBackupType] = useState("");
  const [backupValue, setBackupValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const toggleDay = (day) => setDays((current) => current.includes(day)
    ? current.filter((value) => value !== day)
    : [...current, day]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!days.length) {
      setError("Choose at least one day.");
      return;
    }
    if (backupType && !backupValue.trim()) {
      setError(backupType === "linkedin" ? "Add your LinkedIn profile, or remove it." : "Add your WhatsApp number, or remove it.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        weeks,
        days,
        time,
        timeZone,
        backup: backupType ? { type: backupType, value: backupValue.trim() } : null,
      });
      setSaved(true);
    } catch (saveError) {
      setError(saveError.message || "Your schedule could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-[560px]">
        {saved ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-selected text-2xl text-brand" aria-hidden="true">✓</span>
            <h1 className="text-2xl font-bold text-text">Your reminders are set</h1>
            <p className="mt-2 text-user leading-6 text-muted">We’ll email you on the days and times you chose.</p>
            <button type="button" onClick={onBack} className="mt-8 min-h-12 rounded-button bg-brand px-6 font-medium text-white">Back to NoFluff</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <button type="button" onClick={onBack} className="mb-7 min-h-10 rounded-button px-2 text-user font-medium text-brand">← Back</button>
            <h1 className="text-2xl font-bold tracking-tight text-text">Choose a posting rhythm</h1>
            <p className="mt-2 text-user leading-6 text-muted">Pick what feels doable. You can change it later.</p>

            <fieldset className="mt-7">
              <legend className="mb-3 text-user font-medium text-text">How long?</legend>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((week) => (
                  <button key={week} type="button" aria-pressed={weeks === week} onClick={() => setWeeks(week)} className={`min-h-12 rounded-button border text-user font-medium transition-colors ${weeks === week ? "border-selected-border bg-selected text-brand" : "border-border bg-card text-text hover:bg-row-hover"}`}>
                    {week} {week === 1 ? "week" : "weeks"}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="mb-3 text-user font-medium text-text">Which days work for you?</legend>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {daysOfWeek.map((day) => {
                  const selected = days.includes(day.value);
                  return <button key={day.value} type="button" aria-pressed={selected} onClick={() => toggleDay(day.value)} className={`min-h-11 rounded-button border text-small font-medium transition-colors ${selected ? "border-selected-border bg-selected text-brand" : "border-border bg-card text-muted hover:bg-row-hover"}`}>{day.label}</button>;
                })}
              </div>
            </fieldset>

            <label className="mt-6 block text-user font-medium text-text" htmlFor="reminder-time">What time should we remind you?</label>
            <div className="mt-2 flex items-center gap-3">
              <input id="reminder-time" type="time" min="08:00" max="22:00" step="900" value={time} onChange={(event) => setTime(event.target.value)} className="min-h-12 rounded-button border border-border-strong bg-card px-3 text-user text-text focus:border-brand focus:outline-none" />
              <span className="text-small text-muted">Your local time</span>
            </div>

            <section className="mt-7 rounded-card border border-border bg-card p-4 shadow-card">
              <h2 className="text-user font-medium text-text">Email reminders</h2>
              <p className="mt-1 text-small text-muted">We’ll send reminders to your sign-in email.</p>
              <p className="mt-3 truncate text-user text-text">{email || "Your account email"}</p>
            </section>

            <section className="mt-4 rounded-card border border-border bg-card p-4 shadow-card">
              <h2 className="text-user font-medium text-text">Can’t remember?</h2>
              <p className="mt-1 text-small leading-5 text-muted">Add LinkedIn or WhatsApp as a backup. We’ll send those reminders by hand.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" aria-pressed={backupType === "linkedin"} onClick={() => { setBackupType(backupType === "linkedin" ? "" : "linkedin"); setBackupValue(""); }} className={`min-h-10 rounded-button border px-3 text-small font-medium ${backupType === "linkedin" ? "border-selected-border bg-selected text-brand" : "border-border text-muted"}`}>LinkedIn</button>
                <button type="button" aria-pressed={backupType === "whatsapp"} onClick={() => { setBackupType(backupType === "whatsapp" ? "" : "whatsapp"); setBackupValue(""); }} className={`min-h-10 rounded-button border px-3 text-small font-medium ${backupType === "whatsapp" ? "border-selected-border bg-selected text-brand" : "border-border text-muted"}`}>WhatsApp</button>
              </div>
              {backupType && <label className="mt-3 block">
                <span className="sr-only">{backupType === "linkedin" ? "LinkedIn profile" : "WhatsApp number"}</span>
                <input type={backupType === "linkedin" ? "url" : "tel"} value={backupValue} onChange={(event) => setBackupValue(event.target.value)} placeholder={backupType === "linkedin" ? "https://linkedin.com/in/your-profile" : "+234 800 000 0000"} className="min-h-12 w-full rounded-button border border-border-strong bg-card px-3 text-user text-text placeholder:text-muted focus:border-brand focus:outline-none" />
              </label>}
            </section>

            {error && <p role="alert" className="mt-4 rounded-button bg-selected px-3 py-2 text-small text-text">{error}</p>}
            <button type="submit" disabled={saving || !days.length || !email} className="mt-6 min-h-12 w-full rounded-button bg-brand px-5 text-user font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "Saving your schedule…" : "Start reminders"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
