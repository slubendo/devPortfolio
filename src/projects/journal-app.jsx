import { useState, useEffect, useRef, useCallback } from "react";

const MOODS = [
  { id: "radiant",    emoji: "✨", label: "Radiant",   color: "#f59e0b" },
  { id: "content",    emoji: "🌿", label: "Content",   color: "#10b981" },
  { id: "reflective", emoji: "🌙", label: "Reflective",color: "#6366f1" },
  { id: "anxious",    emoji: "🌊", label: "Anxious",   color: "#0ea5e9" },
  { id: "melancholy", emoji: "🍂", label: "Melancholy",color: "#b45309" },
  { id: "grateful",   emoji: "🕊️", label: "Grateful",  color: "#ec4899" },
];

const PROMPTS = [
  "What made you smile today?",
  "What's weighing on your heart right now?",
  "Describe a moment of beauty you witnessed today.",
  "What are you most grateful for in this moment?",
  "What would you tell your past self about today?",
  "What did you learn today — about the world, or yourself?",
  "What's a small thing you want to remember from today?",
  "If today had a color, what would it be and why?",
  "What unfinished thought has been lingering with you?",
  "Who made an impression on you today, and how?",
];

const SAMPLE_ENTRIES = [
  {
    id: "e1",
    date: "2026-02-20",
    title: "A quiet Friday",
    body: "The morning light came through at an angle I'd never noticed before — hitting the water glass on my desk and casting little rainbows across the wall. I sat there for a full minute just watching them drift.\n\nSpent the afternoon finishing the book I've been carrying around for weeks. The ending surprised me, and I found myself rereading the last page twice. There's something to be said for stories that don't give you everything you expect.\n\nMade lemon pasta for dinner. Simple. Good. Sometimes that's enough.",
    mood: "content",
    wordCount: 89,
    prompt: null,
  },
  {
    id: "e2",
    date: "2026-02-18",
    title: "Tangled thoughts",
    body: "I've been overthinking again. That familiar loop — replaying conversations, second-guessing the email I sent at 11pm, wondering if I said too much or too little.\n\nWent for a walk to shake it off. The air was cold and it helped. There's something grounding about feeling temperature on your skin — it brings you back into your body, away from the noise in your head.\n\nReminder to self: most things work out. Most things don't need solving tonight.",
    mood: "anxious",
    wordCount: 78,
    prompt: "What's weighing on your heart right now?",
  },
  {
    id: "e3",
    date: "2026-02-14",
    title: "Valentine's evening",
    body: "We didn't do anything grand. Cooked together, spilled flour everywhere, laughed a lot. There's a particular kind of happiness that comes from being completely comfortable with another person — no performance, no pretense.\n\nI keep returning to how lucky I am. Not in a dramatic way. Just a quiet, settled knowing.",
    mood: "grateful",
    wordCount: 55,
    prompt: null,
  },
];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function todayStr() {
  const d = new Date(2026, 1, 22);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export default function JournalApp() {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem("journal_entries_v2");
      return saved ? JSON.parse(saved) : SAMPLE_ENTRIES;
    } catch { return SAMPLE_ENTRIES; }
  });

  const [view, setView] = useState("list"); // 'list' | 'write' | 'read'
  const [activeEntry, setActiveEntry] = useState(null);
  const [draft, setDraft] = useState({ title: "", body: "", mood: null, date: todayStr() });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [saved, setSaved] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const bodyRef = useRef(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("journal_entries_v2", JSON.stringify(entries));
  }, [entries]);

  const startNew = () => {
    const today = todayStr();
    const existing = entries.find(e => e.date === today);
    if (existing) {
      setDraft({ title: existing.title, body: existing.body, mood: existing.mood, date: existing.date });
      setActiveEntry(existing.id);
    } else {
      setDraft({ title: "", body: "", mood: null, date: today });
      setActiveEntry(null);
      const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
      setPrompt(p);
    }
    setWordCount(0);
    setView("write");
    setTimeout(() => bodyRef.current?.focus(), 100);
  };

  const openEntry = (entry) => {
    setActiveEntry(entry.id);
    setView("read");
  };

  const editEntry = (entry) => {
    setDraft({ title: entry.title, body: entry.body, mood: entry.mood, date: entry.date });
    setActiveEntry(entry.id);
    setPrompt(entry.prompt);
    setWordCount(countWords(entry.body));
    setView("write");
    setTimeout(() => bodyRef.current?.focus(), 100);
  };

  const saveEntry = useCallback(() => {
    if (!draft.body.trim()) return;
    const wc = countWords(draft.body);
    const title = draft.title.trim() || formatShortDate(draft.date);
    const newEntry = {
      id: activeEntry || `e${Date.now()}`,
      date: draft.date,
      title,
      body: draft.body,
      mood: draft.mood,
      wordCount: wc,
      prompt,
    };
    setEntries(prev => {
      const exists = prev.find(e => e.id === newEntry.id);
      if (exists) return prev.map(e => e.id === newEntry.id ? newEntry : e);
      return [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [draft, activeEntry, prompt]);

  // Auto-save every 3s while writing
  useEffect(() => {
    if (view !== "write") return;
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(saveEntry, 3000);
    return () => clearTimeout(autoSaveRef.current);
  }, [draft, view, saveEntry]);

  const deleteEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setView("list");
  };

  const handleBodyChange = (e) => {
    setDraft(d => ({ ...d, body: e.target.value }));
    setWordCount(countWords(e.target.value));
  };

  const filtered = entries.filter(e => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
    const matchMood = !filterMood || e.mood === filterMood;
    return matchSearch && matchMood;
  });

  // Group by month
  const grouped = filtered.reduce((acc, e) => {
    const key = new Date(e.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const readEntry = entries.find(e => e.id === activeEntry);

  return (
    <div style={{ fontFamily: "'Crimson Pro', serif", background: "#f7f0e6", minHeight: "100vh", color: "#2c1810" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Petit+Formal+Script&family=Josefin+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #ede4d4; }
        ::-webkit-scrollbar-thumb { background: #c4a882; border-radius: 2px; }

        .parchment {
          background: #fdf8f0;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(210,180,140,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(180,140,100,0.06) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
        }

        .entry-card {
          background: #fdf8f0;
          border: 1px solid #e8d8c0;
          border-radius: 4px;
          padding: 20px 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .entry-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 2px 0 0 2px;
          background: transparent;
          transition: background 0.2s;
        }
        .entry-card:hover { background: #fff9f0; transform: translateX(3px); box-shadow: -4px 0 0 #c4956a, 2px 4px 16px rgba(0,0,0,0.06); }

        .nav-link { fontFamily: "'Josefin Sans', sans-serif"; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #9c7c5a; cursor: pointer; padding: 4px 0; border-bottom: 1px solid transparent; transition: all 0.15s; background: none; border: none; }
        .nav-link:hover, .nav-link.active { color: #6b3f1c; border-bottom-color: #c4956a; }

        .write-area {
          width: 100%;
          min-height: 400px;
          background: none;
          border: none;
          outline: none;
          font-family: 'Crimson Pro', serif;
          font-size: 19px;
          line-height: 1.9;
          color: #2c1810;
          resize: none;
          caret-color: #c4956a;
        }
        .write-area::placeholder { color: #c4b099; font-style: italic; }

        .title-input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          font-family: 'Crimson Pro', serif;
          font-size: 28px;
          font-weight: 600;
          color: #2c1810;
          caret-color: #c4956a;
        }
        .title-input::placeholder { color: #d4c0a8; font-style: italic; }

        .mood-btn { border: 1px solid #e0cdb8; background: none; border-radius: 20px; padding: 5px 12px; font-size: 13px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 5px; font-family: 'Josefin Sans', sans-serif; letter-spacing: 0.04em; color: #7a5c40; }
        .mood-btn:hover { border-color: #c4956a; background: rgba(196,149,106,0.08); }
        .mood-btn.active { background: rgba(196,149,106,0.15); border-color: #c4956a; color: #6b3f1c; }

        .sidebar-link { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
        .sidebar-link:hover { background: rgba(196,149,106,0.08); }
        .sidebar-link.active { background: rgba(196,149,106,0.15); }

        .ink-divider { height: 1px; background: linear-gradient(90deg, transparent, #d4b896, transparent); margin: 20px 0; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease both; }

        .line-bg {
          background-image: repeating-linear-gradient(transparent, transparent calc(1.9em - 1px), rgba(196,168,130,0.2) calc(1.9em - 1px), rgba(196,168,130,0.2) 1.9em);
          background-size: 100% 1.9em;
        }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: 260, background: "#f0e6d6", borderRight: "1px solid #ddd0b8", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #ddd0b8" }}>
            <h1 style={{ fontFamily: "'Petit Formal Script', cursive", fontSize: 28, color: "#6b3f1c", lineHeight: 1.2 }}>My Journal</h1>
            <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, letterSpacing: "0.14em", color: "#a08060", marginTop: 4, textTransform: "uppercase" }}>
              {new Date(2026, 1, 22).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Write today button */}
          <div style={{ padding: "16px 16px 8px" }}>
            <button onClick={startNew} style={{
              width: "100%", padding: "11px 16px", background: "#6b3f1c", border: "none", borderRadius: 6,
              color: "#fdf8f0", fontFamily: "'Josefin Sans', sans-serif", fontSize: 12, letterSpacing: "0.1em",
              textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, transition: "background 0.15s"
            }} onMouseEnter={e => e.currentTarget.style.background = "#8b5a2b"} onMouseLeave={e => e.currentTarget.style.background = "#6b3f1c"}>
              <span style={{ fontSize: 16 }}>✒</span> Write Today
            </button>
          </div>

          {/* Nav */}
          <div style={{ padding: "8px 16px", display: "flex", gap: 20, borderBottom: "1px solid #ddd0b8", paddingBottom: 12 }}>
            <button className={`nav-link ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>Entries</button>
            <button className={`nav-link`} style={{ color: "#c4b099", cursor: "default" }}>Stats</button>
          </div>

          {/* Search */}
          <div style={{ padding: "12px 16px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.5)", border: "1px solid #ddd0b8", borderRadius: 6, padding: "7px 12px" }}>
              <svg width="13" height="13" fill="none" stroke="#a08060" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Search entries..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ background: "none", border: "none", outline: "none", fontFamily: "'Josefin Sans', sans-serif", fontSize: 12, color: "#5a3820", width: "100%" }} />
            </div>
          </div>

          {/* Mood filter */}
          <div style={{ padding: "4px 16px 12px", display: "flex", flexWrap: "wrap", gap: 4 }}>
            {MOODS.map(m => (
              <button key={m.id} onClick={() => setFilterMood(f => f === m.id ? null : m.id)}
                style={{ border: `1px solid ${filterMood === m.id ? m.color : "#ddd0b8"}`, background: filterMood === m.id ? m.color + "22" : "none", borderRadius: 20, padding: "3px 8px", fontSize: 11, cursor: "pointer", transition: "all 0.15s", fontFamily: "'Josefin Sans', sans-serif", color: filterMood === m.id ? m.color : "#a08060" }}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          {/* Entry list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
            {Object.entries(grouped).map(([month, monthEntries]) => (
              <div key={month}>
                <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, letterSpacing: "0.12em", color: "#a08060", textTransform: "uppercase", padding: "12px 8px 6px" }}>{month}</p>
                {monthEntries.map(entry => {
                  const mood = MOODS.find(m => m.id === entry.mood);
                  return (
                    <div key={entry.id} className={`sidebar-link ${activeEntry === entry.id ? "active" : ""}`} onClick={() => openEntry(entry)}>
                      <div style={{ marginTop: 1, fontSize: 16 }}>{mood?.emoji || "📖"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "#3d2010", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.title}</p>
                        <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, color: "#a08060", marginTop: 2, letterSpacing: "0.04em" }}>
                          {formatShortDate(entry.date)} · {entry.wordCount}w
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 16px", color: "#c4b099" }}>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: 15 }}>No entries found</p>
              </div>
            )}
          </div>

          {/* Bottom stats */}
          <div style={{ borderTop: "1px solid #ddd0b8", padding: "12px 20px", display: "flex", justifyContent: "space-around" }}>
            {[
              { label: "Entries", value: entries.length },
              { label: "Words", value: entries.reduce((s, e) => s + (e.wordCount || 0), 0).toLocaleString() },
              { label: "Streak", value: "4d" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 18, fontWeight: 600, color: "#6b3f1c" }}>{s.value}</p>
                <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a08060" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="parchment" style={{ flex: 1, overflowY: "auto", position: "relative" }}>

          {/* ---- LIST VIEW ---- */}
          {view === "list" && (
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 48px" }} className="fade-up">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
                <div>
                  <h2 style={{ fontFamily: "'Petit Formal Script', cursive", fontSize: 36, color: "#6b3f1c" }}>All Entries</h2>
                  <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, color: "#a08060", letterSpacing: "0.1em", marginTop: 4 }}>{filtered.length} ENTRIES</p>
                </div>
              </div>

              {Object.entries(grouped).map(([month, monthEntries]) => (
                <div key={month} style={{ marginBottom: 36 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, letterSpacing: "0.12em", color: "#a08060", textTransform: "uppercase", whiteSpace: "nowrap" }}>{month}</p>
                    <div className="ink-divider" style={{ flex: 1, margin: 0 }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {monthEntries.map((entry, i) => {
                      const mood = MOODS.find(m => m.id === entry.mood);
                      const preview = entry.body.replace(/\n+/g, " ").slice(0, 120);
                      return (
                        <div key={entry.id} className="entry-card fade-up" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => openEntry(entry)}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <div>
                              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#2c1810", lineHeight: 1.3 }}>{entry.title}</h3>
                              <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, letterSpacing: "0.08em", color: "#a08060", marginTop: 3 }}>
                                {formatDate(entry.date)}
                              </p>
                            </div>
                            {mood && <span style={{ fontSize: 20, marginTop: 2 }}>{mood.emoji}</span>}
                          </div>
                          <p style={{ fontSize: 15, color: "#6b5040", lineHeight: 1.7, fontStyle: "italic" }}>
                            {preview}{entry.body.length > 120 ? "…" : ""}
                          </p>
                          <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, color: "#c4b099", marginTop: 10, letterSpacing: "0.06em" }}>
                            {entry.wordCount} words{entry.prompt ? " · prompted" : ""}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {entries.length === 0 && (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <p style={{ fontFamily: "'Petit Formal Script', cursive", fontSize: 28, color: "#c4b099" }}>Begin your story</p>
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", color: "#a08060", marginTop: 8 }}>Click "Write Today" to start your first entry.</p>
                </div>
              )}
            </div>
          )}

          {/* ---- WRITE VIEW ---- */}
          {view === "write" && (
            <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 56px 80px" }} className="fade-up">
              {/* Top bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button onClick={() => { saveEntry(); setView("list"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#a08060", fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 6 }}>
                    ← ENTRIES
                  </button>
                  <span style={{ color: "#ddd0b8" }}>|</span>
                  <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, color: "#a08060", letterSpacing: "0.08em" }}>
                    {formatDate(draft.date)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, color: saved ? "#10b981" : "#c4b099", transition: "color 0.3s", letterSpacing: "0.06em" }}>
                    {saved ? "✓ Saved" : `${wordCount} words`}
                  </span>
                  <button onClick={() => { saveEntry(); setView("list"); }} style={{
                    padding: "7px 18px", background: "#6b3f1c", border: "none", borderRadius: 4,
                    color: "#fdf8f0", fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, letterSpacing: "0.1em",
                    textTransform: "uppercase", cursor: "pointer"
                  }}>Save & Close</button>
                </div>
              </div>

              {/* Prompt */}
              {prompt && !draft.body && (
                <div style={{ background: "rgba(196,149,106,0.1)", border: "1px solid rgba(196,149,106,0.25)", borderRadius: 6, padding: "12px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>✨</span>
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: 15, color: "#8b5a2b", flex: 1 }}>"{prompt}"</p>
                  <button onClick={() => setPrompt(null)} style={{ background: "none", border: "none", color: "#c4b099", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              )}

              {/* Title */}
              <input className="title-input" type="text" placeholder="Give this day a title…"
                value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />

              <div className="ink-divider" />

              {/* Mood selector */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, letterSpacing: "0.12em", color: "#a08060", textTransform: "uppercase", marginBottom: 8 }}>How are you feeling?</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {MOODS.map(m => (
                    <button key={m.id} className={`mood-btn ${draft.mood === m.id ? "active" : ""}`}
                      style={{ borderColor: draft.mood === m.id ? m.color : undefined, color: draft.mood === m.id ? m.color : undefined, background: draft.mood === m.id ? m.color + "18" : undefined }}
                      onClick={() => setDraft(d => ({ ...d, mood: d.mood === m.id ? null : m.id }))}>
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Writing area with line background */}
              <div className="line-bg" style={{ padding: "8px 0", borderRadius: 4 }}>
                <textarea ref={bodyRef} className="write-area" placeholder="Begin writing… let the words come freely."
                  value={draft.body} onChange={handleBodyChange}
                  style={{ padding: "0 4px" }} />
              </div>

              {/* New prompt button */}
              <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                <button onClick={() => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])} style={{ background: "none", border: "1px solid #ddd0b8", borderRadius: 4, padding: "6px 14px", fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, color: "#a08060", cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#c4956a"} onMouseLeave={e => e.currentTarget.style.borderColor = "#ddd0b8"}>
                  ✨ Get a prompt
                </button>
                {activeEntry && (
                  <button onClick={() => { if (confirm("Delete this entry?")) deleteEntry(activeEntry); }} style={{ background: "none", border: "1px solid #f0d0c0", borderRadius: 4, padding: "6px 14px", fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, color: "#c47050", cursor: "pointer", letterSpacing: "0.08em" }}>
                    Delete entry
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ---- READ VIEW ---- */}
          {view === "read" && readEntry && (
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 56px 80px" }} className="fade-up">
              {/* Top bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: "#a08060", fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, letterSpacing: "0.1em" }}>
                  ← ENTRIES
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => editEntry(readEntry)} style={{ padding: "6px 16px", background: "none", border: "1px solid #ddd0b8", borderRadius: 4, fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, color: "#8b5a2b", cursor: "pointer", letterSpacing: "0.08em" }}>
                    Edit
                  </button>
                  <button onClick={() => { if (confirm("Delete this entry?")) deleteEntry(readEntry.id); }} style={{ padding: "6px 14px", background: "none", border: "1px solid #f0d0c0", borderRadius: 4, fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, color: "#c47050", cursor: "pointer", letterSpacing: "0.08em" }}>
                    Delete
                  </button>
                </div>
              </div>

              {/* Entry header */}
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, letterSpacing: "0.12em", color: "#a08060", textTransform: "uppercase", marginBottom: 10 }}>
                  {formatDate(readEntry.date)}
                </p>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: 36, fontWeight: 600, color: "#2c1810", lineHeight: 1.2 }}>{readEntry.title}</h2>
                  {readEntry.mood && <span style={{ fontSize: 28, marginTop: 4 }}>{MOODS.find(m => m.id === readEntry.mood)?.emoji}</span>}
                </div>
                {readEntry.mood && (
                  <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, color: MOODS.find(m => m.id === readEntry.mood)?.color, letterSpacing: "0.08em", marginTop: 6 }}>
                    {MOODS.find(m => m.id === readEntry.mood)?.label}
                  </p>
                )}
              </div>

              <div className="ink-divider" />

              {/* Prompt */}
              {readEntry.prompt && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: 15, color: "#a08060" }}>Prompted: "{readEntry.prompt}"</p>
                </div>
              )}

              {/* Body */}
              <div style={{ fontSize: 19, lineHeight: 1.9, color: "#2c1810" }}>
                {readEntry.body.split("\n\n").map((para, i) => (
                  <p key={i} style={{ marginBottom: 24, textIndent: i === 0 ? 0 : "1.5em" }}>{para}</p>
                ))}
              </div>

              <div className="ink-divider" />
              <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, color: "#c4b099", letterSpacing: "0.1em", textAlign: "right" }}>
                {readEntry.wordCount} words
              </p>
            </div>
          )}

          {/* Decorative corner */}
          <div style={{ position: "fixed", bottom: 24, right: 28, opacity: 0.15, fontSize: 48, pointerEvents: "none", userSelect: "none" }}>✒</div>
        </div>
      </div>
    </div>
  );
}
