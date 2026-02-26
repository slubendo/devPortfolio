import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { id: "math",     label: "Mathematics", icon: "∑", color: "#f472b6", glow: "rgba(244,114,182,0.4)" },
  { id: "science",  label: "Science",     icon: "⚗", color: "#34d399", glow: "rgba(52,211,153,0.4)" },
  { id: "history",  label: "History",     icon: "📜", color: "#fb923c", glow: "rgba(251,146,60,0.4)"  },
  { id: "lang",     label: "Languages",   icon: "語", color: "#60a5fa", glow: "rgba(96,165,250,0.4)"  },
  { id: "cs",       label: "Comp Sci",    icon: "</>" , color: "#a78bfa", glow: "rgba(167,139,250,0.4)"},
  { id: "lit",      label: "Literature",  icon: "✍",  color: "#fbbf24", glow: "rgba(251,191,36,0.4)"  },
  { id: "art",      label: "Art & Music", icon: "♪",  color: "#f87171", glow: "rgba(248,113,113,0.4)" },
  { id: "other",    label: "Other",       icon: "◎",  color: "#94a3b8", glow: "rgba(148,163,184,0.4)" },
];

const POMODORO_MODES = [
  { id: "focus",    label: "Focus",      minutes: 25, color: "#a78bfa" },
  { id: "short",    label: "Short Break",minutes: 5,  color: "#34d399" },
  { id: "long",     label: "Long Break", minutes: 15, color: "#60a5fa" },
  { id: "custom",   label: "Custom",     minutes: 45, color: "#fb923c" },
];

const MOTIVATIONAL_QUOTES = [
  "Every expert was once a beginner. Keep going 🚀",
  "The more you learn, the more stars you unlock ✨",
  "Small steps every day build great minds 🌙",
  "Your future self is cheering you on right now 🔥",
  "Difficult roads lead to beautiful destinations 🪐",
  "Focus is your superpower. Use it wisely ⚡",
  "One session at a time — you're building something great 🌟",
  "The universe rewards the curious 🌌",
];

const XP_PER_MINUTE = 10;
const LEVEL_XP = (lvl) => 500 * lvl;

function getLevel(xp) {
  let lvl = 1, total = 0;
  while (total + LEVEL_XP(lvl) <= xp) { total += LEVEL_XP(lvl); lvl++; }
  return { level: lvl, current: xp - total, needed: LEVEL_XP(lvl) };
}

function fmtTime(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function fmtHours(mins) {
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? (mins % 60) + "m" : ""}`.trim();
}

const TODAY = new Date(2026, 1, 22).toDateString();

const INITIAL_STATE = {
  xp: 3420,
  streak: 7,
  sessions: [
    { id: 1, subject: "math",    mins: 50, date: new Date(2026, 1, 22).toDateString(), label: "Calculus – Integration" },
    { id: 2, subject: "cs",      mins: 35, date: new Date(2026, 1, 22).toDateString(), label: "Binary Trees"           },
    { id: 3, subject: "lang",    mins: 25, date: new Date(2026, 1, 21).toDateString(), label: "Spanish vocab"          },
    { id: 4, subject: "science", mins: 60, date: new Date(2026, 1, 21).toDateString(), label: "Organic Chemistry"      },
    { id: 5, subject: "math",    mins: 45, date: new Date(2026, 1, 20).toDateString(), label: "Linear Algebra"         },
    { id: 6, subject: "lit",     mins: 30, date: new Date(2026, 1, 20).toDateString(), label: "Shakespeare analysis"   },
    { id: 7, subject: "history", mins: 40, date: new Date(2026, 1, 19).toDateString(), label: "WW2 Timeline"           },
    { id: 8, subject: "cs",      mins: 55, date: new Date(2026, 1, 19).toDateString(), label: "React Hooks deep dive"  },
  ],
  dailyGoal: 120,
};

// ─── SVG RING TIMER ───────────────────────────────────────────────────────────

function RingTimer({ progress, size = 240, color, children, pulsing }) {
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        {/* Progress */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          filter="url(#ring-glow)"
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }}
        />
        {/* Glow dot at progress tip */}
        {progress > 0.02 && (
          <circle
            cx={size/2 + r * Math.cos(2 * Math.PI * progress - Math.PI/2)}
            cy={size/2 + r * Math.sin(2 * Math.PI * progress - Math.PI/2)}
            r="7" fill={color}
            filter="url(#ring-glow)"
            style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}
          />
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {children}
      </div>
      {pulsing && (
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${color}`, animation: "ripple 1.5s ease-out infinite", opacity: 0 }} />
      )}
    </div>
  );
}

// ─── XP BAR ───────────────────────────────────────────────────────────────────

function XPBar({ xp }) {
  const { level, current, needed } = getLevel(xp);
  const pct = current / needed * 100;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#a78bfa", letterSpacing: "0.1em" }}>LEVEL {level}</span>
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: "#64748b" }}>{current.toLocaleString()} / {needed.toLocaleString()} XP</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa, #c4b5fd)", borderRadius: 99, boxShadow: "0 0 10px rgba(167,139,250,0.6)", transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

// ─── SUBJECT BREAKDOWN ────────────────────────────────────────────────────────

function SubjectBar({ subject, mins, maxMins }) {
  const sub = SUBJECTS.find(s => s.id === subject);
  const pct = maxMins > 0 ? (mins / maxMins) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 14, width: 22, textAlign: "center" }}>{sub?.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{sub?.label}</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: sub?.color, fontWeight: 700 }}>{fmtHours(mins)}</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: sub?.color, borderRadius: 99, boxShadow: `0 0 8px ${sub?.glow}`, transition: "width 1s ease" }} />
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function StudyTracker() {
  const [data, setData] = useState(() => {
    try { const s = localStorage.getItem("studytrack_v1"); return s ? JSON.parse(s) : INITIAL_STATE; }
    catch { return INITIAL_STATE; }
  });

  // Timer state
  const [mode, setMode]           = useState("focus");
  const [customMins, setCustomMins] = useState(45);
  const [running, setRunning]     = useState(false);
  const [elapsed, setElapsed]     = useState(0);          // seconds elapsed
  const [subject, setSubject]     = useState("math");
  const [sessionLabel, setSessionLabel] = useState("");
  const [view, setView]           = useState("timer");    // timer | stats | history
  const [quoteIdx, setQuoteIdx]   = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);
  const [newXP, setNewXP]         = useState(0);
  const intervalRef = useRef(null);

  const currentMode = POMODORO_MODES.find(m => m.id === mode);
  const totalSecs   = (mode === "custom" ? customMins : currentMode.minutes) * 60;
  const progress    = Math.min(elapsed / totalSecs, 1);
  const remaining   = Math.max(totalSecs - elapsed, 0);
  const sub         = SUBJECTS.find(s => s.id === subject);

  useEffect(() => { localStorage.setItem("studytrack_v1", JSON.stringify(data)); }, [data]);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % MOTIVATIONAL_QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => {
          if (e + 1 >= totalSecs) {
            clearInterval(intervalRef.current);
            setRunning(false);
            completeSession(Math.round(totalSecs / 60));
            return totalSecs;
          }
          return e + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, totalSecs]);

  const completeSession = useCallback((mins) => {
    const earned = mins * XP_PER_MINUTE;
    setNewXP(earned);
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 4000);
    setData(prev => ({
      ...prev,
      xp: prev.xp + earned,
      sessions: [
        { id: Date.now(), subject, mins, date: new Date().toDateString(), label: sessionLabel || `${sub?.label} session` },
        ...prev.sessions,
      ],
    }));
  }, [subject, sessionLabel, sub]);

  const stopAndSave = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const mins = Math.round(elapsed / 60);
    if (mins >= 1) completeSession(mins);
    setElapsed(0);
  };

  const resetTimer = () => { clearInterval(intervalRef.current); setRunning(false); setElapsed(0); };

  // Stats computation
  const todaySessions   = data.sessions.filter(s => s.date === TODAY);
  const todayMins       = todaySessions.reduce((a, s) => a + s.mins, 0);
  const totalMins       = data.sessions.reduce((a, s) => a + s.mins, 0);
  const goalPct         = Math.min(todayMins / data.dailyGoal * 100, 100);
  const { level }       = getLevel(data.xp);

  // Per-subject totals (all time)
  const subjectTotals = SUBJECTS.map(s => ({
    subject: s.id,
    mins: data.sessions.filter(ss => ss.subject === s.id).reduce((a, ss) => a + ss.mins, 0),
  })).filter(s => s.mins > 0).sort((a, b) => b.mins - a.mins);
  const maxSubjectMins = subjectTotals[0]?.mins || 1;

  // Weekly chart data (last 7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 1, 22 - 6 + i);
    const ds = d.toDateString();
    const mins = data.sessions.filter(s => s.date === ds).reduce((a, s) => a + s.mins, 0);
    return { label: d.toLocaleDateString("en-US", { weekday: "short" }), mins, isToday: ds === TODAY };
  });
  const maxWeekMins = Math.max(...weekDays.map(d => d.mins), 1);

  return (
    <div style={{ background: "#030712", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Rajdhani', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }

        /* Starfield background */
        body { background: #030712; }

        .nav-btn { background: none; border: none; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-family: 'Orbitron', sans-serif; font-size: 10px; letter-spacing: 0.12em; transition: all 0.2s; color: #475569; }
        .nav-btn.active { color: #a78bfa; background: rgba(167,139,250,0.1); }
        .nav-btn:hover:not(.active) { color: #94a3b8; background: rgba(255,255,255,0.04); }

        .subject-pill { padding: 8px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); cursor: pointer; font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 600; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
        .subject-pill:hover { background: rgba(255,255,255,0.06); }
        .subject-pill.active { border-color: transparent; }

        .mode-btn { flex: 1; padding: 8px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); background: none; color: #475569; font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .mode-btn.active { color: #e2e8f0; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.12); }
        .mode-btn:hover:not(.active) { color: #94a3b8; background: rgba(255,255,255,0.04); }

        @keyframes ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes pulse-glow { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes xp-pop { 0% { opacity:0; transform: translateY(0) scale(0.8); } 30% { opacity:1; transform: translateY(-20px) scale(1.1); } 80% { opacity:1; } 100% { opacity:0; transform: translateY(-60px) scale(0.9); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes twinkle { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; }
        input[type=range] { accent-color: #a78bfa; width: 100%; }
        input[type=text] { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-family: 'Rajdhani', sans-serif; font-size: 14px; outline: none; width: 100%; transition: border-color 0.15s; }
        input[type=text]:focus { border-color: #a78bfa; }
        input[type=text]::placeholder { color: #334155; }
      `}</style>

      {/* Stars background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 80 }, (_, i) => (
          <div key={i} style={{ position: "absolute", width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, background: "#fff", borderRadius: "50%", left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.7 + 0.1, animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`, animationDelay: `${Math.random() * 4}s` }} />
        ))}
        {/* Nebula glows */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)", top: -200, right: -100 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)", bottom: -100, left: -100 }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(52,211,153,0.05) 0%, transparent 70%)", top: "40%", left: "45%" }} />
      </div>

      {/* ── HEADER ── */}
      <div style={{ position: "relative", zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, background: "rgba(3,7,18,0.8)", backdropFilter: "blur(12px)" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.05em" }}>STUDYFLOW</div>
          <div style={{ fontSize: 10, fontFamily: "'Orbitron', sans-serif", color: "#334155", letterSpacing: "0.15em", marginTop: 2 }}>MISSION CONTROL</div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 4, marginLeft: 24 }}>
          {[["timer","TIMER"],["stats","STATS"],["history","LOG"]].map(([v,l]) => (
            <button key={v} className={`nav-btn ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
          {/* Streak */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18, animation: "pulse-glow 2s infinite" }}>🔥</span>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, color: "#fb923c" }}>{data.streak}</div>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>DAY STREAK</div>
            </div>
          </div>

          {/* Level */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18 }}>⭐</span>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, color: "#a78bfa" }}>LVL {level}</div>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>{data.xp.toLocaleString()} XP</div>
            </div>
          </div>

          {/* Today */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18 }}>⏱</span>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, color: "#60a5fa" }}>{fmtHours(todayMins)}</div>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>TODAY</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* XP completion banner */}
        {justCompleted && (
          <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "rgba(167,139,250,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(167,139,250,0.4)", borderRadius: 16, padding: "16px 28px", textAlign: "center", animation: "xp-pop 4s ease forwards" }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 24, fontWeight: 900, background: "linear-gradient(135deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SESSION COMPLETE!</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, color: "#a78bfa", marginTop: 4 }}>+{newXP} XP earned ✨</div>
          </div>
        )}

        {/* ── TIMER VIEW ── */}
        {view === "timer" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, animation: "fadeUp 0.3s ease" }}>
            {/* Left: main timer */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Motivational quote */}
              <div className="card" style={{ padding: "14px 20px", textAlign: "center" }}>
                <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, color: "#64748b", fontStyle: "italic", lineHeight: 1.5, transition: "opacity 0.5s" }}>
                  "{MOTIVATIONAL_QUOTES[quoteIdx]}"
                </p>
              </div>

              {/* Mode selector */}
              <div style={{ display: "flex", gap: 6 }}>
                {POMODORO_MODES.map(m => (
                  <button key={m.id} className={`mode-btn ${mode === m.id ? "active" : ""}`} onClick={() => { setMode(m.id); resetTimer(); }}
                    style={{ borderColor: mode === m.id ? m.color + "44" : undefined, color: mode === m.id ? m.color : undefined }}>
                    {m.label}
                    {m.id !== "custom" && <div style={{ fontSize: 10, opacity: 0.6 }}>{m.minutes}m</div>}
                  </button>
                ))}
              </div>

              {/* Custom duration */}
              {mode === "custom" && (
                <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>DURATION</span>
                  <input type="range" min="5" max="120" value={customMins} onChange={e => { setCustomMins(+e.target.value); resetTimer(); }} />
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: "#fb923c", minWidth: 40 }}>{customMins}m</span>
                </div>
              )}

              {/* Big timer ring */}
              <div className="card" style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <RingTimer progress={progress} size={260} color={currentMode.color} pulsing={running}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 48, fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {fmtTime(remaining)}
                  </div>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: currentMode.color, letterSpacing: "0.15em", marginTop: 6, opacity: 0.8 }}>
                    {running ? "FOCUSING" : elapsed > 0 ? "PAUSED" : currentMode.label.toUpperCase()}
                  </div>
                  {sub && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: "3px 12px" }}>
                      <span style={{ fontSize: 13 }}>{sub.icon}</span>
                      <span style={{ fontSize: 11, color: sub.color, fontWeight: 600, letterSpacing: "0.06em" }}>{sub.label}</span>
                    </div>
                  )}
                </RingTimer>

                {/* Controls */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button onClick={resetTimer} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#64748b", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}>↺</button>

                  <button onClick={() => setRunning(r => !r)}
                    style={{ width: 72, height: 72, borderRadius: "50%", border: `2px solid ${currentMode.color}66`, background: running ? `${currentMode.color}22` : `${currentMode.color}15`, color: currentMode.color, cursor: "pointer", fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: running ? `0 0 24px ${currentMode.color}44` : "none" }}>
                    {running ? "⏸" : "▶"}
                  </button>

                  {elapsed > 0 && (
                    <button onClick={stopAndSave} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)", color: "#34d399", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                      title="Save progress & stop">✓</button>
                  )}
                </div>
              </div>

              {/* Today daily goal */}
              <div className="card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "#475569", letterSpacing: "0.12em" }}>TODAY'S MISSION</span>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: goalPct >= 100 ? "#34d399" : "#60a5fa", fontWeight: 700 }}>
                    {fmtHours(todayMins)} / {fmtHours(data.dailyGoal)} {goalPct >= 100 ? "✓" : ""}
                  </span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${goalPct}%`, background: goalPct >= 100 ? "linear-gradient(90deg,#34d399,#059669)" : "linear-gradient(90deg,#3b82f6,#60a5fa)", borderRadius: 99, boxShadow: `0 0 12px ${goalPct >= 100 ? "rgba(52,211,153,0.5)" : "rgba(96,165,250,0.5)"}`, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {[60,90,120,150,180].map(g => (
                    <button key={g} onClick={() => setData(d => ({ ...d, dailyGoal: g }))} style={{ flex: 1, padding: "4px 0", borderRadius: 6, border: `1px solid ${data.dailyGoal === g ? "#60a5fa44" : "rgba(255,255,255,0.06)"}`, background: data.dailyGoal === g ? "rgba(96,165,250,0.1)" : "none", color: data.dailyGoal === g ? "#60a5fa" : "#334155", fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                      {g}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Subject picker */}
              <div className="card" style={{ padding: "16px" }}>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "#475569", letterSpacing: "0.12em", marginBottom: 12 }}>SUBJECT</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {SUBJECTS.map(s => (
                    <button key={s.id} className={`subject-pill ${subject === s.id ? "active" : ""}`}
                      style={{ background: subject === s.id ? s.color + "18" : undefined, borderColor: subject === s.id ? s.color + "55" : undefined, color: subject === s.id ? s.color : "#64748b" }}
                      onClick={() => setSubject(s.id)}>
                      <span style={{ fontSize: 14 }}>{s.icon}</span>
                      <span style={{ fontSize: 12 }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session label */}
              <div className="card" style={{ padding: "16px" }}>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "#475569", letterSpacing: "0.12em", marginBottom: 10 }}>SESSION TOPIC</p>
                <input type="text" placeholder="What are you studying?" value={sessionLabel} onChange={e => setSessionLabel(e.target.value)} />
              </div>

              {/* XP progress */}
              <div className="card" style={{ padding: "16px" }}>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "#475569", letterSpacing: "0.12em", marginBottom: 12 }}>EXPERIENCE</p>
                <XPBar xp={data.xp} />
                <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#334155" }}>+{XP_PER_MINUTE} XP per minute</span>
                  <span style={{ fontSize: 11, color: "#a78bfa" }}>🏆 {data.xp.toLocaleString()} total</span>
                </div>
              </div>

              {/* Recent today */}
              <div className="card" style={{ padding: "16px", flex: 1 }}>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "#475569", letterSpacing: "0.12em", marginBottom: 12 }}>TODAY'S LOG</p>
                {todaySessions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#334155" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🚀</div>
                    <p style={{ fontSize: 12 }}>No sessions yet today.</p>
                    <p style={{ fontSize: 11, marginTop: 4, color: "#1e293b" }}>Start your first mission!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {todaySessions.slice(0, 4).map(s => {
                      const sb = SUBJECTS.find(x => x.id === s.subject);
                      return (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                          <span style={{ fontSize: 16 }}>{sb?.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</p>
                            <p style={{ fontSize: 11, color: sb?.color }}>{fmtHours(s.mins)}</p>
                          </div>
                          <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700 }}>+{s.mins * XP_PER_MINUTE}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STATS VIEW ── */}
        {view === "stats" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, animation: "fadeUp 0.3s ease" }}>
            {/* Weekly chart */}
            <div className="card" style={{ padding: "20px", gridColumn: "span 2" }}>
              <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 20 }}>WEEKLY STUDY TIME</p>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 140 }}>
                {weekDays.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: d.mins > 0 ? "#a78bfa" : "#1e293b" }}>{d.mins > 0 ? fmtHours(d.mins) : ""}</span>
                    <div style={{ width: "100%", background: "rgba(255,255,255,0.04)", borderRadius: "6px 6px 0 0", height: 100, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                      <div style={{ width: "100%", height: `${(d.mins / maxWeekMins) * 100}%`, background: d.isToday ? "linear-gradient(180deg, #a78bfa, #7c3aed)" : "linear-gradient(180deg, #3b82f6, #1d4ed8)", borderRadius: "4px 4px 0 0", boxShadow: d.isToday ? "0 0 14px rgba(167,139,250,0.5)" : "none", transition: "height 1s ease", minHeight: d.mins > 0 ? 4 : 0 }} />
                    </div>
                    <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: d.isToday ? "#a78bfa" : "#475569", fontWeight: d.isToday ? 700 : 400 }}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject breakdown */}
            <div className="card" style={{ padding: "20px" }}>
              <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16 }}>SUBJECT BREAKDOWN</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {subjectTotals.map(st => <SubjectBar key={st.subject} subject={st.subject} mins={st.mins} maxMins={maxSubjectMins} />)}
                {subjectTotals.length === 0 && <p style={{ color: "#334155", fontSize: 13 }}>No sessions logged yet.</p>}
              </div>
            </div>

            {/* Stats cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Total Study Time", value: fmtHours(totalMins), icon: "⏱", color: "#60a5fa" },
                { label: "Sessions Completed", value: data.sessions.length, icon: "✅", color: "#34d399" },
                { label: "Current Streak", value: `${data.streak} days`, icon: "🔥", color: "#fb923c" },
                { label: "Level Reached", value: `Level ${level}`, icon: "⭐", color: "#a78bfa" },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div>
                    <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: "#475569", marginTop: 3 }}>{s.label}</p>
                  </div>
                </div>
              ))}
              <div className="card" style={{ padding: "16px 20px" }}>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 10 }}>TOTAL XP</p>
                <XPBar xp={data.xp} />
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY VIEW ── */}
        {view === "history" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: "#e2e8f0", letterSpacing: "0.08em" }}>SESSION LOG</p>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: "#475569" }}>{data.sessions.length} sessions · {fmtHours(totalMins)} total</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.sessions.map((s, i) => {
                const sb = SUBJECTS.find(x => x.id === s.subject);
                const isToday = s.date === TODAY;
                return (
                  <div key={s.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, animation: `fadeUp 0.3s ease both`, animationDelay: `${i * 0.04}s`, borderLeft: `3px solid ${sb?.color}44` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: sb?.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {sb?.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</p>
                      <p style={{ fontSize: 12, color: sb?.color, marginTop: 2 }}>{sb?.label}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: "#f8fafc", fontWeight: 700 }}>{fmtHours(s.mins)}</p>
                      <p style={{ fontSize: 11, color: isToday ? "#34d399" : "#334155", marginTop: 2 }}>{isToday ? "Today" : s.date}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, minWidth: 60 }}>
                      <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#a78bfa" }}>+{s.mins * XP_PER_MINUTE}</p>
                      <p style={{ fontSize: 10, color: "#334155" }}>XP</p>
                    </div>
                    <button onClick={() => setData(d => ({ ...d, sessions: d.sessions.filter(x => x.id !== s.id) }))}
                      style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(248,113,113,0.2)", background: "none", color: "#475569", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.5)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.2)"; }}>×</button>
                  </div>
                );
              })}
              {data.sessions.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px", color: "#334155" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌌</div>
                  <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, letterSpacing: "0.1em" }}>NO SESSIONS YET</p>
                  <p style={{ marginTop: 6, fontSize: 13 }}>Start a timer to log your first session</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
