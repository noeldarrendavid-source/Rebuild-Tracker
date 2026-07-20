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

export default function App() {
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem("rebuild-completed");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("rebuild-completed", JSON.stringify(completed));
  }, [completed]);

  const toggle = (id) => {
    if (completed.includes(id)) {
      setCompleted(completed.filter((x) => x !== id));
    } else {
      setCompleted([...completed, id]);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20, maxWidth: 500 }}>
      <h1>Rebuild Tracker</h1>
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
