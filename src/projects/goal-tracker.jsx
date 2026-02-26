import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { id: "health",   label: "Health",   color: "#00e5a0", glow: "rgba(0,229,160,0.3)"  },
  { id: "career",   label: "Career",   color: "#3b9eff", glow: "rgba(59,158,255,0.3)" },
  { id: "finance",  label: "Finance",  color: "#f7c948", glow: "rgba(247,201,72,0.3)" },
  { id: "personal", label: "Personal", color: "#e05cff", glow: "rgba(224,92,255,0.3)" },
  { id: "learning", label: "Learning", color: "#ff6b3d", glow: "rgba(255,107,61,0.3)" },
];

const INITIAL_GOALS = [
  { id: 1, title: "Run 100km this month",       category: "health",   target: 100, current: 67,  unit: "km",      deadline: "2026-02-28" },
  { id: 2, title: "Launch side project",         category: "career",   target: 10,  current: 7,   unit: "tasks",   deadline: "2026-03-15" },
  { id: 3, title: "Save emergency fund",         category: "finance",  target: 5000, current: 3200, unit: "$",    deadline: "2026-06-01" },
  { id: 4, title: "Read 12 books this year",     category: "personal", target: 12,  current: 3,   unit: "books",   deadline: "2026-12-31" },
  { id: 5, title: "Complete React course",       category: "learning", target: 40,  current: 28,  unit: "hrs",     deadline: "2026-03-01" },
  { id: 6, title: "Meditate 30 days streak",     category: "health",   target: 30,  current: 22,  unit: "days",    deadline: "2026-03-10" },
  { id: 7, title: "Grow Twitter to 1k followers",category: "career",   target: 1000,current: 412, unit: "follows", deadline: "2026-05-01" },
  { id: 8, title: "Pay off credit card",         category: "finance",  target: 2400, current: 2400, unit: "$",    deadline: "2026-02-28" },
];

function PieChart({ goals, categories, size = 200 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  const catData = categories.map(cat => {
    const catGoals = goals.filter(g => g.category === cat.id);
    const avg = catGoals.length ? catGoals.reduce((s, g) => s + Math.min(g.current / g.target, 1), 0) / catGoals.length : 0;
    return { ...cat, value: catGoals.length, avg, count: catGoals.length };
  }).filter(c => c.count > 0);

  const total = catData.reduce((s, c) => s + c.count, 0);
  const cx = size / 2, cy = size / 2;
  const r = size * 0.38, innerR = size * 0.22;
  let cumulAngle = -Math.PI / 2;
  const gap = 0.04;

  const slices = catData.map(cat => {
    const fraction = cat.count / total;
    const angle = fraction * 2 * Math.PI - gap;
    const startA = cumulAngle + gap / 2;
    const endA = startA + angle;
    cumulAngle += fraction * 2 * Math.PI;

    const x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
    const x2 = cx + r * Math.cos(endA),   y2 = cy + r * Math.sin(endA);
    const ix1 = cx + innerR * Math.cos(endA), iy1 = cy + innerR * Math.sin(endA);
    const ix2 = cx + innerR * Math.cos(startA), iy2 = cy + innerR * Math.sin(startA);
    const large = angle > Math.PI ? 1 : 0;
    const midA = startA + angle / 2;

    return { ...cat, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`, midA, fraction };
  });

  const completedCount = goals.filter(g => g.current >= g.target).length;
  const overallPct = Math.round(goals.reduce((s, g) => s + Math.min(g.current / g.target, 1), 0) / goals.length * 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        {catData.map(cat => (
          <filter key={cat.id} id={`glow-${cat.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        ))}
      </defs>
      {slices.map((slice, i) => (
        <path key={slice.id} d={slice.path} fill={slice.color}
          filter={`url(#glow-${slice.id})`}
          style={{ opacity: animated ? 0.9 : 0, transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.3s ease`, transformOrigin: `${cx}px ${cy}px`, cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
      ))}
      <circle cx={cx} cy={cy} r={innerR - 2} fill="#060d1a" />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#e8f4ff" fontSize="26" fontWeight="700" fontFamily="'Syne', sans-serif">{overallPct}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#4a6580" fontSize="10" fontFamily="'IBM Plex Mono', monospace" letterSpacing="1">OVERALL</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="#4a6580" fontSize="10" fontFamily="'IBM Plex Mono', monospace" letterSpacing="1">{completedCount}/{goals.length} DONE</text>
    </svg>
  );
}

function ProgressBar({ current, target, color, glow, animated }) {
  const pct = Math.min(current / target * 100, 100);
  const [width, setWidth] = useState(0);
  useEffect(() => { if (animated) setTimeout(() => setWidth(pct), 50); }, [animated, pct]);

  return (
    <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 99, width: `${width}%`,
        background: `linear-gradient(90deg, ${color}99, ${color})`,
        boxShadow: `0 0 10px ${glow}`,
        transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        position: "relative",
      }}>
        {pct > 5 && <div style={{ position: "absolute", right: 0, top: -2, width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />}
      </div>
    </div>
  );
}

function GoalCard({ goal, cat, onUpdate, onDelete, index }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(goal.current);
  const [animated, setAnimated] = useState(false);
  const pct = Math.min(Math.round(goal.current / goal.target * 100), 100);
  const done = goal.current >= goal.target;
  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date(2026, 1, 22)) / 86400000);

  useEffect(() => { setTimeout(() => setAnimated(true), index * 80 + 100); }, []);

  const save = () => { onUpdate(goal.id, parseFloat(val) || 0); setEditing(false); };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      border: `1px solid ${done ? cat.color + "60" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 16, padding: "20px 22px",
      boxShadow: done ? `0 0 20px ${cat.glow}` : "none",
      opacity: animated ? 1 : 0,
      transform: animated ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s`,
      position: "relative", overflow: "hidden",
    }}>
      {done && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: cat.color, background: cat.color + "18", padding: "2px 8px", borderRadius: 20, letterSpacing: "0.08em", fontWeight: 600 }}>
              {cat.label.toUpperCase()}
            </span>
            {done && <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "#00e5a0", background: "#00e5a018", padding: "2px 8px", borderRadius: 20, letterSpacing: "0.08em" }}>✓ COMPLETE</span>}
          </div>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#e8f4ff", lineHeight: 1.4, margin: 0 }}>{goal.title}</h3>
        </div>
        <button onClick={() => onDelete(goal.id)} style={{ border: "none", background: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", fontSize: 16, padding: "0 0 0 8px", lineHeight: 1, transition: "color 0.15s", flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = "#ff4d6d"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.15)"}>×</button>
      </div>

      <ProgressBar current={goal.current} target={goal.target} color={cat.color} glow={cat.glow} animated={animated} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          {editing ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="number" value={val} onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
                style={{ width: 70, background: "rgba(255,255,255,0.08)", border: `1px solid ${cat.color}`, borderRadius: 6, padding: "3px 8px", color: "#e8f4ff", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, outline: "none" }}
                autoFocus />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#4a6580" }}>/ {goal.target} {goal.unit}</span>
              <button onClick={save} style={{ background: cat.color, border: "none", borderRadius: 5, padding: "3px 8px", color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>OK</button>
            </div>
          ) : (
            <button onClick={() => { setVal(goal.current); setEditing(true); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "baseline", gap: 4, padding: 0 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: cat.color, lineHeight: 1 }}>{goal.current.toLocaleString()}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#4a6580" }}>/ {goal.target.toLocaleString()} {goal.unit}</span>
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: daysLeft < 7 && !done ? "#ff6b3d" : "#4a6580" }}>
            {done ? "✓" : daysLeft < 0 ? "OVERDUE" : `${daysLeft}d left`}
          </span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: done ? cat.color : "#e8f4ff" }}>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

export default function GoalTracker() {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "health", target: "", current: "", unit: "", deadline: "" });
  const [sortBy, setSortBy] = useState("progress");

  const updateGoal = (id, val) => setGoals(prev => prev.map(g => g.id === id ? { ...g, current: Math.min(val, g.target * 2) } : g));
  const deleteGoal = (id) => setGoals(prev => prev.filter(g => g.id !== id));

  const addGoal = () => {
    if (!form.title || !form.target) return;
    setGoals(prev => [...prev, { id: Date.now(), ...form, target: parseFloat(form.target), current: parseFloat(form.current) || 0, deadline: form.deadline || "2026-12-31" }]);
    setForm({ title: "", category: "health", target: "", current: "", unit: "", deadline: "" });
    setShowForm(false);
  };

  const filtered = goals
    .filter(g => filter === "all" ? true : filter === "done" ? g.current >= g.target : filter === "active" ? g.current < g.target : g.category === filter)
    .sort((a, b) => {
      if (sortBy === "progress") return (b.current / b.target) - (a.current / a.target);
      if (sortBy === "deadline") return new Date(a.deadline) - new Date(b.deadline);
      return 0;
    });

  const statsTotal = goals.length;
  const statsDone = goals.filter(g => g.current >= g.target).length;
  const statsAvg = Math.round(goals.reduce((s, g) => s + Math.min(g.current / g.target, 1), 0) / goals.length * 100);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", background: "#060d1a", minWidth:'100vw', minHeight: "100vh", color: "#e8f4ff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1a2a3a; border-radius: 2px; }
        .filter-btn { border: 1px solid rgba(255,255,255,0.08); background: none; border-radius: 8px; padding: 6px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.05em; color: #4a6580; cursor: pointer; transition: all 0.15s; }
        .filter-btn:hover { border-color: rgba(255,255,255,0.2); color: #e8f4ff; }
        .filter-btn.active { background: rgba(59,158,255,0.15); border-color: #3b9eff; color: #3b9eff; }
        .form-input { width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #e8f4ff; font-family: 'IBM Plex Mono', monospace; font-size: 13px; outline: none; transition: border-color 0.15s; }
        .form-input:focus { border-color: #3b9eff; background: rgba(59,158,255,0.05); }
        .form-input::placeholder { color: #2a4060; }
        select.form-input option { background: #0d1b2e; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>


      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 32px", display: "flex", alignItems: "center", gap: 20, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", align: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00e5a0", boxShadow: "0 0 8px #00e5a0", animation: "pulse 2s infinite", marginTop: 5 }} />
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#e8f4ff", lineHeight: 1 }}>MISSION CONTROL</h1>
            <p style={{ fontSize: 10, color: "#2a4060", letterSpacing: "0.15em", marginTop: 2 }}>GOAL TRACKING SYSTEM · FEB 2026</p>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 24, marginLeft: 32 }}>
          {[
            { label: "TOTAL", value: statsTotal, color: "#3b9eff" },
            { label: "DONE", value: statsDone, color: "#00e5a0" },
            { label: "AVG", value: `${statsAvg}%`, color: "#f7c948" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#2a4060", letterSpacing: "0.12em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button onClick={() => setShowForm(s => !s)} style={{ marginLeft: "auto", padding: "10px 20px", background: showForm ? "rgba(255,77,109,0.15)" : "rgba(59,158,255,0.15)", border: `1px solid ${showForm ? "#ff4d6d" : "#3b9eff"}`, borderRadius: 10, color: showForm ? "#ff4d6d" : "#3b9eff", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.2s" }}>
          {showForm ? "✕ CANCEL" : "+ NEW GOAL"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, minHeight: "calc(100vh - 73px)" }}>

        {/* Left panel */}
        <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Pie chart */}
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a4060", marginBottom: 16 }}>DISTRIBUTION</p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <PieChart goals={goals} categories={CATEGORIES} size={200} />
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
              {CATEGORIES.map(cat => {
                const catGoals = goals.filter(g => g.category === cat.id);
                if (!catGoals.length) return null;
                const avg = Math.round(catGoals.reduce((s, g) => s + Math.min(g.current / g.target, 1), 0) / catGoals.length * 100);
                return (
                  <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setFilter(f => f === cat.id ? "all" : cat.id)}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, boxShadow: `0 0 6px ${cat.color}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: filter === cat.id ? cat.color : "#4a6580", flex: 1, letterSpacing: "0.05em" }}>{cat.label}</span>
                    <span style={{ fontSize: 11, fontFamily: "'Syne', sans-serif", fontWeight: 600, color: cat.color }}>{avg}%</span>
                    <span style={{ fontSize: 10, color: "#2a4060" }}>{catGoals.length}g</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall progress ring */}
          <div style={{ padding: "18px", background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a4060", marginBottom: 14 }}>OVERALL PROGRESS</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CATEGORIES.map(cat => {
                const catGoals = goals.filter(g => g.category === cat.id);
                if (!catGoals.length) return null;
                const avg = catGoals.reduce((s, g) => s + Math.min(g.current / g.target, 1), 0) / catGoals.length;
                return (
                  <div key={cat.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: "#4a6580", letterSpacing: "0.05em" }}>{cat.label}</span>
                      <span style={{ fontSize: 10, color: cat.color, fontWeight: 600 }}>{Math.round(avg * 100)}%</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${avg * 100}%`, background: `linear-gradient(90deg, ${cat.color}80, ${cat.color})`, borderRadius: 99, boxShadow: `0 0 6px ${cat.glow}`, transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ padding: "28px 32px", overflowY: "auto" }}>

          {/* Add form */}
          {showForm && (
            <div style={{ background: "rgba(59,158,255,0.05)", border: "1px solid rgba(59,158,255,0.2)", borderRadius: 16, padding: "24px", marginBottom: 28, animation: "fadeIn 0.2s ease" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "#3b9eff", marginBottom: 18 }}>NEW GOAL</p>
              <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <input className="form-input" placeholder="Goal title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                </div>
                <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <input className="form-input" placeholder="Unit (km, $, books...)" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
                <input className="form-input" type="number" placeholder="Target value" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
                <input className="form-input" type="number" placeholder="Current progress" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} />
                <input className="form-input" type="date" placeholder="Deadline" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                <button onClick={addGoal} disabled={!form.title || !form.target} style={{ padding: "10px", borderRadius: 10, border: "none", background: form.title && form.target ? "#3b9eff" : "rgba(59,158,255,0.2)", color: form.title && form.target ? "#000" : "#2a4060", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: "0.05em" }}>
                  LAUNCH GOAL →
                </button>
              </div>
            </div>
          )}

          {/* Filters + sort */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { id: "all", label: "ALL" },
              { id: "active", label: "ACTIVE" },
              { id: "done", label: "COMPLETED" },
            ].map(f => (
              <button key={f.id} className={`filter-btn ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>{f.label}</button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#2a4060", letterSpacing: "0.1em" }}>SORT:</span>
              {["progress", "deadline"].map(s => (
                <button key={s} onClick={() => setSortBy(s)} style={{ border: `1px solid ${sortBy === s ? "#f7c948" : "rgba(255,255,255,0.08)"}`, background: sortBy === s ? "rgba(247,201,72,0.1)" : "none", borderRadius: 6, padding: "4px 10px", fontSize: 10, color: sortBy === s ? "#f7c948" : "#4a6580", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.05em", textTransform: "uppercase" }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Goal grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {filtered.map((goal, i) => {
              const cat = CATEGORIES.find(c => c.id === goal.category);
              return <GoalCard key={goal.id} goal={goal} cat={cat} onUpdate={updateGoal} onDelete={deleteGoal} index={i} />;
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "span 2", textAlign: "center", padding: "60px 0", color: "#2a4060" }}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>◎</div>
                <p style={{ fontSize: 12, letterSpacing: "0.1em" }}>NO GOALS FOUND</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
