// Pure calculation functions for "The Runway" financial logic.
// No UI, no storage, no side effects — math in, math out.
// Any component (or any app) can import this same brain
// and build its own face on top of it.

export const uid = () => Math.random().toString(36).slice(2, 9);

export const fmt = (n) => "$" + (Math.round(n) || 0).toLocaleString("en-US");

export const MONTHS_PER_WEEK = 52 / 12; // 4.333 weeks per month

export const CATS = ["Housing", "Food", "Transport", "Bills", "Baby", "Debt", "Fun", "Other"];

export const DEFAULT_RUNWAY_DATA = {
  jobs: [{ id: uid(), name: "Security (warehouse)", rate: 20, hours: 40 }],
  takeHomePct: 75,
  expenses: [
    { id: uid(), name: "Rent (after moving out)", amount: 1400, cat: "Housing" },
    { id: uid(), name: "Groceries", amount: 400, cat: "Food" },
    { id: uid(), name: "Car / gas / insurance", amount: 350, cat: "Transport" },
    { id: uid(), name: "Phone + internet", amount: 120, cat: "Bills" },
  ],
  goals: [
    { id: uid(), name: "Moving fund (deposit + first month)", target: 3500, saved: 0 },
    { id: uid(), name: "Baby fund (gear, medical, first months)", target: 4000, saved: 0 },
    { id: uid(), name: "Emergency cushion", target: 3000, saved: 0 },
  ],
  currentSavings: 0,
  dueDate: "2027-04-01",
};

// Takes raw runway data in, returns every derived number the UI needs.
// No React, no storage — just math. This makes it easy to test on its own.
export function calculateRunway(data) {
  const grossMonthly = data.jobs.reduce(
    (s, j) => s + (Number(j.rate) || 0) * (Number(j.hours) || 0) * MONTHS_PER_WEEK,
    0
  );
  const netMonthly = grossMonthly * ((Number(data.takeHomePct) || 0) / 100);
  const monthlyExpenses = data.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const surplus = netMonthly - monthlyExpenses;

  const now = new Date();
  const due = new Date(data.dueDate + "T00:00:00");
  const msLeft = due - now;
  const weeksLeft = Math.max(0, Math.round(msLeft / (7 * 24 * 3600 * 1000)));
  const monthsLeft = Math.max(0, msLeft / (30.44 * 24 * 3600 * 1000));

  const goalTarget = data.goals.reduce((s, g) => s + (Number(g.target) || 0), 0);
  const alreadySaved =
    (Number(data.currentSavings) || 0) +
    data.goals.reduce((s, g) => s + (Number(g.saved) || 0), 0);
  const projectedAtDue = alreadySaved + Math.max(0, surplus) * monthsLeft;
  const runwayPct = goalTarget > 0 ? Math.min(100, (projectedAtDue / goalTarget) * 100) : 0;
  const savedPct = goalTarget > 0 ? Math.min(100, (alreadySaved / goalTarget) * 100) : 0;
  const onTrack = projectedAtDue >= goalTarget;
  const neededMonthly = monthsLeft > 0 ? Math.max(0, (goalTarget - alreadySaved) / monthsLeft) : 0;

  const catTotals = CATS.map((c) => ({
    cat: c,
    total: data.expenses
      .filter((e) => e.cat === c)
      .reduce((s, e) => s + (Number(e.amount) || 0), 0),
  })).filter((c) => c.total > 0);

  return {
    grossMonthly, netMonthly, monthlyExpenses, surplus,
    weeksLeft, monthsLeft, goalTarget, alreadySaved, projectedAtDue,
    runwayPct, savedPct, onTrack, neededMonthly, catTotals,
  };
}
