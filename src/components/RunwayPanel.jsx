import { useState, useEffect } from "react";
import {
  calculateRunway,
  fmt,
  uid,
  CATS,
  DEFAULT_RUNWAY_DATA,
} from "../lib/runwayMath";

const load = (key, fallback) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

export default function RunwayPanel() {
  const [data, setData] = useState(() => load("rebuild-runway", DEFAULT_RUNWAY_DATA));
  const [open, setOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem("rebuild-runway", JSON.stringify(data));
  }, [data]);

  const r = calculateRunway(data);

  const upd = (patch) => setData((d) => ({ ...d, ...patch }));
  const updItem = (key, id, patch) =>
    setData((d) => ({
      ...d,
      [key]: d[key].map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  const rmItem = (key, id) =>
    setData((d) => ({ ...d, [key]: d[key].filter((x) => x.id !== id) }));

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>Financial Runway</h2>
        <button onClick={() => setOpen(!open)}>{open ? "Hide" : "Show"}</button>
      </div>

      {open && (
        <>
          <p>
            {r.weeksLeft} weeks until due date —{" "}
            {r.onTrack ? "on pace ✅" : "short of target ⚠️"}
          </p>

          <div style={{ background: "#eee", borderRadius: 4, height: 10, marginBottom: 8 }}>
            <div
              style={{
                width: r.savedPct + "%",
                background: "#4a7",
                height: "100%",
                borderRadius: 4,
              }}
            />
          </div>
          <p style={{ fontSize: 13, color: "#666" }}>
            Saved: {fmt(r.alreadySaved)} / Target: {fmt(r.goalTarget)} (projected: {fmt(r.projectedAtDue)})
          </p>

          <p>
            Net income: {fmt(r.netMonthly)}/mo &nbsp;|&nbsp; Expenses: {fmt(r.monthlyExpenses)}/mo &nbsp;|&nbsp; Surplus: {fmt(r.surplus)}/mo
          </p>

          <h3>Due date</h3>
          <input
            type="date"
            value={data.dueDate}
            onChange={(e) => upd({ dueDate: e.target.value })}
          />

          <h3>Income</h3>
          {data.jobs.map((j) => (
            <div key={j.id} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input
                value={j.name}
                placeholder="Job name"
                onChange={(e) => updItem("jobs", j.id, { name: e.target.value })}
              />
              <input
                type="number"
                value={j.rate}
                onChange={(e) => updItem("jobs", j.id, { rate: e.target.value })}
                style={{ width: 70 }}
              />
              <input
                type="number"
                value={j.hours}
                onChange={(e) => updItem("jobs", j.id, { hours: e.target.value })}
                style={{ width: 70 }}
              />
              <button onClick={() => rmItem("jobs", j.id)}>×</button>
            </div>
          ))}
          <button
            onClick={() =>
              setData((d) => ({
                ...d,
                jobs: [...d.jobs, { id: uid(), name: "", rate: 0, hours: 0 }],
              }))
            }
          >
            + Add job
          </button>

          <h3>Expenses</h3>
          {data.expenses.map((x) => (
            <div key={x.id} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input
                value={x.name}
                placeholder="Expense"
                onChange={(e) => updItem("expenses", x.id, { name: e.target.value })}
              />
              <select
                value={x.cat}
                onChange={(e) => updItem("expenses", x.id, { cat: e.target.value })}
              >
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                value={x.amount}
                onChange={(e) => updItem("expenses", x.id, { amount: e.target.value })}
                style={{ width: 70 }}
              />
              <button onClick={() => rmItem("expenses", x.id)}>×</button>
            </div>
          ))}
          <button
            onClick={() =>
              setData((d) => ({
                ...d,
                expenses: [...d.expenses, { id: uid(), name: "", amount: 0, cat: "Other" }],
              }))
            }
          >
            + Add expense
          </button>

          <h3>Goals</h3>
          <label style={{ display: "block", marginBottom: 8 }}>
            Savings already in bank:{" "}
            <input
              type="number"
              value={data.currentSavings}
              onChange={(e) => upd({ currentSavings: e.target.value })}
              style={{ width: 90 }}
            />
          </label>
          {data.goals.map((g) => (
            <div key={g.id} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input
                value={g.name}
                onChange={(e) => updItem("goals", g.id, { name: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                value={g.target}
                onChange={(e) => updItem("goals", g.id, { target: e.target.value })}
                style={{ width: 80 }}
              />
              <input
                type="number"
                value={g.saved}
                onChange={(e) => updItem("goals", g.id, { saved: e.target.value })}
                style={{ width: 80 }}
              />
              <button onClick={() => rmItem("goals", g.id)}>×</button>
            </div>
          ))}
          <button
            onClick={() =>
              setData((d) => ({
                ...d,
                goals: [...d.goals, { id: uid(), name: "New goal", target: 1000, saved: 0 }],
              }))
            }
          >
            + Add goal
          </button>
        </>
      )}
    </div>
  );
}
