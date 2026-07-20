import { useState, useEffect } from "react";

const PHASES = [
  { id: 0, name: "Phase 0 — Clean Slate & Foundations", weeks: 1 },
  { id: 1, name: "Phase 1 — TC1 Rebuild (ECS Fargate)", weeks: 3 },
  { id: 2, name: "Phase 2 — TC2 Rebuild (EKS)", weeks: 3 },
  { id: 3, name: "Phase 3 — TC3 Rebuild (Terraform + Ansible)", weeks: 2 },
  { id: 4, name: "Phase 4 — DevSecOps Pipeline", weeks: 2 },
  { id: 5, name: "Phase 5 — AWS Security Monitoring", weeks: 2 },
  { id: 6, name: "Phase 6 — ML Inference on EKS (Flagship)", weeks: 3 },
  { id: 7, name: "Phase 7 — Scaling & Optimization", weeks: 1 },
  { id: 8, name: "Phase 8 — Portfolio & Career System", weeks: 1 },
];

const WEEKLY_TARGET_HOURS = 37;

const load = (key, fallback) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

export default function App() {
  const [completed, setCompleted] = useState(() => load("rebuild-completed", []));
  const [sessions, setSessions] = useState(() => load("rebuild-sessions", []));
  const [timerStart, setTimerStart] = useState(() => load("rebuild-timer", null));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem("rebuild-completed", JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem("rebuild-sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("rebuild-timer", JSON.stringify(timerStart));
  }, [timerStart]);

  useEffect(() => {
    if (timerStart === null) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [timerStart]);

  const startTimer = () => {
    setNow(Date.now());
    setTimerStart(Date.now());
  };

  const stopTimer = () => {
    const end = Date.now();
    const seconds = Math.round((end - timerStart) / 1000);
    setSessions([...sessions, { id: end, start: timerStart, end, seconds }]);
    setTimerStart(null);
  };

  const toggle = (id) => {
    if (completed.includes(id)) {
      setCompleted(completed.filter((x) => x !== id));
    } else {
      setCompleted([...completed, id]);
    }
  };

  const fmtTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const startOfWeek = () => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d.getTime();
  };

  const elapsed = timerStart ? Math.floor((now - timerStart) / 1000) : 0;
  const weekSeconds =
    sessions
      .filter((s) => s.end >= startOfWeek())
      .reduce((sum, s) => sum + s.seconds, 0) + elapsed;
  const weekHours = weekSeconds / 3600;
  const pct = Math.min(100, (weekHours / WEEKLY_TARGET_HOURS) * 100);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20, maxWidth: 500 }}>
      <h1>Rebuild Tracker</h1>

      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Study Timer</h2>
        <p style={{ fontSize: 32, fontFamily: "monospace", margin: "8px 0" }}>
          {fmtTime(elapsed)}
        </p>
        {timerStart === null ? (
          <button onClick={startTimer}>Start session</button>
        ) : (
          <button onClick={stopTimer}>Stop & log</button>
        )}
        <p>
          This week: {weekHours.toFixed(1)} / {WEEKLY_TARGET_HOURS} hrs
        </p>
        <div style={{ background: "#eee", borderRadius: 4, height: 10 }}>
          <div
            style={{
              width: pct + "%",
              background: "#4a7",
              height: "100%",
              borderRadius: 4,
            }}
          />
        </div>
        <p style={{ color: "#666", fontSize: 13 }}>
          {sessions.length} sessions logged
        </p>
      </div>

      <p>
        {completed.length} of {PHASES.length} phases complete
      </p>
      {PHASES.map((phase) => (
        <label key={phase.id} style={{ display: "block", padding: 8 }}>
          <input
            type="checkbox"
            checked={completed.includes(phase.id)}
            onChange={() => toggle(phase.id)}
          />{" "}
          {phase.name} ({phase.weeks} wk)
        </label>
      ))}
    </div>
  );
}
