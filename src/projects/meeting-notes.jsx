import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const TODAY = new Date(2026, 1, 22);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const fmtShort = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const SAMPLE_NOTES = [
  {
    id: "n1",
    title: "Q1 Planning Kickoff",
    date: new Date(2026, 1, 20).toISOString(),
    attendees: ["Sarah K.", "Tom L.", "Priya D.", "Alex M."],
    duration: "60 min",
    type: "planning",
    pinned: true,
    content: `## Agenda

- Review Q4 performance metrics
- Set Q1 OKRs across departments
- Align on hiring priorities

## Discussion Notes

Sarah opened with a summary of Q4 — revenue hit 94% of target, with strong SaaS growth offset by slower professional services. Customer NPS improved 8 points to 47.

Tom flagged that engineering velocity was impacted by the auth refactor in December. The team is now unblocked and expects a return to normal sprint cadence by end of February.

Priya shared early designs for the new onboarding flow. Positive reception. Next step is prototype testing with 5 beta users.

## Decisions

- Q1 revenue target set at $2.4M (10% growth)
- Hiring 2 senior engineers and 1 product designer in Q1
- Auth v2 launches February 28th

## Action Items

- [ ] Alex: Finalize Q1 OKR doc and share by EOW
- [ ] Tom: Post engineering roadmap to Notion
- [ ] Priya: Schedule onboarding prototype sessions
- [ ] Sarah: Send updated budget forecast to finance`,
  },
  {
    id: "n2",
    title: "Design System Sync",
    date: new Date(2026, 1, 18).toISOString(),
    attendees: ["Priya D.", "Alex M.", "Dev L."],
    duration: "30 min",
    type: "design",
    pinned: false,
    content: `## Context

Weekly sync to review design system progress and align on component priorities.

## Updates

Dev shared the updated button component — now supports 4 variants with full dark mode. Merged to main.

Priya raised the need for a standardized data table component. Currently 3 different implementations across the product.

## Decisions

- Prioritize data table component for sprint 14
- All new components require Storybook stories before merge

## Action Items

- [ ] Dev: Document button component in Storybook
- [ ] Priya: Write spec for data table component
- [ ] Alex: Review and approve component contribution guide`,
  },
  {
    id: "n3",
    title: "Customer Success Debrief",
    date: new Date(2026, 1, 15).toISOString(),
    attendees: ["Sarah K.", "Jordan R.", "Kim P."],
    duration: "45 min",
    type: "debrief",
    pinned: false,
    content: `## Topics

Post-mortem on enterprise customer churn event and process improvements.

## What Happened

Acme Corp. churned after 18 months. Key reasons identified: lack of dedicated CSM, slow support response times, and missing features compared to competitor.

## Learnings

- Enterprise accounts need a dedicated CSM after month 3
- SLA for enterprise tier should be 4 hours, not 24 hours

## Action Items

- [ ] Jordan: Create enterprise CSM playbook
- [ ] Kim: Audit all enterprise accounts for risk signals
- [ ] Sarah: Escalate SLA change to product and ops`,
  },
];

const MEETING_TYPES = [
  { id: "planning",   label: "Planning",   color: "#6366f1", bg: "#eef2ff" },
  { id: "design",     label: "Design",     color: "#0891b2", bg: "#ecfeff" },
  { id: "debrief",    label: "Debrief",    color: "#059669", bg: "#ecfdf5" },
  { id: "standup",    label: "Standup",    color: "#d97706", bg: "#fffbeb" },
  { id: "1on1",       label: "1:1",        color: "#7c3aed", bg: "#f5f3ff" },
  { id: "allhands",   label: "All-Hands",  color: "#dc2626", bg: "#fef2f2" },
  { id: "other",      label: "Other",      color: "#64748b", bg: "#f8fafc" },
];

const TEMPLATE_BLOCKS = {
  standup: `## Yesterday
- 

## Today
- 

## Blockers
- `,
  planning: `## Agenda
- 

## Discussion Notes


## Decisions
- 

## Action Items
- [ ] `,
  "1on1": `## How are you doing?


## Wins & Progress
- 

## Challenges
- 

## Career & Growth


## Action Items
- [ ] `,
  debrief: `## What Happened


## What Went Well
- 

## What Could Improve
- 

## Action Items
- [ ] `,
  default: `## Agenda
- 

## Notes


## Action Items
- [ ] `,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getMeetingType(id) { return MEETING_TYPES.find(t => t.id === id) || MEETING_TYPES[6]; }

function countActionItems(content) {
  const total = (content.match(/- \[[ x]\]/g) || []).length;
  const done  = (content.match(/- \[x\]/g) || []).length;
  return { total, done };
}

function extractHeadings(content) {
  return content.split("\n").filter(l => l.startsWith("## ")).map(l => l.replace("## ", "").trim());
}

// ─── TOOLBAR ──────────────────────────────────────────────────────────────────

function ToolbarButton({ title, onClick, active, children }) {
  return (
    <button title={title} onClick={onClick} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: active ? "#e2e8f0" : "none", color: active ? "#1e293b" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, transition: "all 0.12s", fontFamily: "'Geist Mono', monospace" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f1f5f9"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "none"; }}>
      {children}
    </button>
  );
}

// ─── EDITOR ───────────────────────────────────────────────────────────────────

function Editor({ note, onChange }) {
  const ref = useRef(null);

  const insertAt = (before, after = "", placeholder = "") => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const selected = value.slice(s, e) || placeholder;
    const newVal = value.slice(0, s) + before + selected + after + value.slice(e);
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      const pos = s + before.length + selected.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const insertLine = (prefix) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, value } = el;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const newVal = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(newVal);
    setTimeout(() => { el.focus(); el.setSelectionRange(s + prefix.length, s + prefix.length); }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      insertAt("  ");
    }
    if (e.key === "Enter") {
      const el = ref.current;
      const { selectionStart: s, value } = el;
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const line = value.slice(lineStart, s);
      // Continue checkbox lists
      if (line.match(/^(\s*)- \[ \] /)) {
        e.preventDefault();
        const indent = line.match(/^(\s*)/)[1];
        insertAt("\n" + indent + "- [ ] ", "", "");
      } else if (line.match(/^(\s*)- \[x\] /)) {
        e.preventDefault();
        const indent = line.match(/^(\s*)/)[1];
        insertAt("\n" + indent + "- [ ] ", "", "");
      } else if (line.match(/^(\s*)- /) && line !== line.match(/^(\s*)/)[0] + "- ") {
        e.preventDefault();
        const indent = line.match(/^(\s*)/)[1];
        insertAt("\n" + indent + "- ", "", "");
      }
    }
  };

  // Click on checkbox syntax toggles it
  const handleClick = (e) => {
    const el = ref.current;
    const { selectionStart: s, value } = el;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const lineEnd = value.indexOf("\n", s);
    const end = lineEnd === -1 ? value.length : lineEnd;
    const line = value.slice(lineStart, end);
    if (line.match(/- \[ \] /)) {
      const newVal = value.slice(0, lineStart) + line.replace("- [ ] ", "- [x] ") + value.slice(end);
      onChange(newVal);
    } else if (line.match(/- \[x\] /)) {
      const newVal = value.slice(0, lineStart) + line.replace("- [x] ", "- [ ] ") + value.slice(end);
      onChange(newVal);
    }
  };

  const now = new Date();
  const timeStamp = `**[${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}]** `;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toolbar */}
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 2, background: "#fdfdfd", flexWrap: "wrap" }}>
        <ToolbarButton title="Heading (##)" onClick={() => insertLine("## ")}>H</ToolbarButton>
        <ToolbarButton title="Bold (**text**)" onClick={() => insertAt("**", "**", "bold text")}>B</ToolbarButton>
        <ToolbarButton title="Italic (*text*)" onClick={() => insertAt("*", "*", "italic")}><em>I</em></ToolbarButton>
        <ToolbarButton title="Inline code" onClick={() => insertAt("`", "`", "code")}>{"`"}</ToolbarButton>
        <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 4px" }} />
        <ToolbarButton title="Bullet point" onClick={() => insertLine("- ")}>•</ToolbarButton>
        <ToolbarButton title="Action item (checkbox)" onClick={() => insertLine("- [ ] ")}>☐</ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => insertLine("1. ")}>1.</ToolbarButton>
        <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 4px" }} />
        <ToolbarButton title="Divider" onClick={() => insertAt("\n---\n")}>—</ToolbarButton>
        <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 4px" }} />
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>
          {note.content.trim().split(/\s+/).filter(Boolean).length} words
        </span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>
          {countActionItems(note.content).done}/{countActionItems(note.content).total} actions done
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={note.content}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        spellCheck
        style={{
          flex: 1,
          padding: "32px 48px",
          border: "none",
          outline: "none",
          resize: "none",
          fontFamily: "'Lora', serif",
          fontSize: 15,
          lineHeight: 1.85,
          color: "#1e293b",
          background: "transparent",
          overflowY: "auto",
          caretColor: "#3b82f6",
        }}
        placeholder={`Start typing your meeting notes…\n\nTip: Use "## " for sections, "- [ ] " for action items, "**text**" for bold.`}
      />
    </div>
  );
}

// ─── PREVIEW (render markdown-like) ──────────────────────────────────────────

function Preview({ content }) {
  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} style={{ fontFamily: "'Instrument Serif', serif", fontSize: 19, fontWeight: 600, color: "#1e293b", margin: "24px 0 8px", paddingBottom: 6, borderBottom: "1px solid #e2e8f0" }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, fontWeight: 600, color: "#334155", margin: "18px 0 6px" }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>{line.slice(2)}</h1>);
    } else if (line === "---") {
      elements.push(<hr key={i} style={{ border: "none", borderTop: "2px solid #e2e8f0", margin: "20px 0" }} />);
    } else if (line.match(/^- \[x\] /)) {
      const text = line.replace(/^- \[x\] /, "").replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
      elements.push(<div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "5px 0", opacity: 0.5 }}>
        <span style={{ color: "#22c55e", marginTop: 2, flexShrink: 0 }}>✓</span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: 14, color: "#64748b", textDecoration: "line-through", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: text }} />
      </div>);
    } else if (line.match(/^- \[ \] /)) {
      const text = line.replace(/^- \[ \] /, "").replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
      elements.push(<div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "5px 0" }}>
        <span style={{ color: "#94a3b8", marginTop: 3, flexShrink: 0, fontSize: 12 }}>☐</span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: 14, color: "#334155", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: text }} />
      </div>);
    } else if (line.startsWith("- ")) {
      const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`).replace(/\*(.*?)\*/g, (_, t) => `<em>${t}</em>`).replace(/`(.*?)`/g, (_, t) => `<code style="background:#f1f5f9;padding:1px 5px;border-radius:4px;font-family:'Geist Mono',monospace;font-size:12px">${t}</code>`);
      elements.push(<div key={i} style={{ display: "flex", gap: 10, margin: "4px 0", paddingLeft: 4 }}>
        <span style={{ color: "#94a3b8", flexShrink: 0, fontSize: 16, lineHeight: 1.6 }}>·</span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: 14, color: "#334155", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: text }} />
      </div>);
    } else if (line.match(/^\d+\. /)) {
      const text = line.replace(/^\d+\. /, "").replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
      elements.push(<div key={i} style={{ display: "flex", gap: 10, margin: "4px 0" }}>
        <span style={{ color: "#94a3b8", flexShrink: 0, fontSize: 13, lineHeight: 1.8, minWidth: 16, fontFamily: "'Geist Mono', monospace" }}>{line.match(/^\d+/)[0]}.</span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: 14, color: "#334155", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: text }} />
      </div>);
    } else if (line.startsWith("> ")) {
      const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
      elements.push(<div key={i} style={{ borderLeft: "3px solid #6366f1", paddingLeft: 14, margin: "10px 0", background: "#eef2ff", borderRadius: "0 8px 8px 0", padding: "10px 14px" }}>
        <span style={{ fontFamily: "'Lora', serif", fontSize: 14, color: "#3730a3", fontStyle: "italic" }} dangerouslySetInnerHTML={{ __html: text }} />
      </div>);
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 8 }} />);
    } else {
      const text = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`).replace(/\*(.*?)\*/g, (_, t) => `<em>${t}</em>`).replace(/`(.*?)`/g, (_, t) => `<code style="background:#f1f5f9;padding:1px 5px;border-radius:4px;font-family:'Geist Mono',monospace;font-size:12px">${t}</code>`);
      elements.push(<p key={i} style={{ fontFamily: "'Lora', serif", fontSize: 15, color: "#334155", lineHeight: 1.8, margin: "4px 0" }} dangerouslySetInnerHTML={{ __html: text }} />);
    }
    i++;
  }

  return <div style={{ padding: "32px 48px", overflowY: "auto", flex: 1 }}>{elements}</div>;
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function MeetingNotes() {
  const [notes, setNotes] = useState(() => {
    try { const s = localStorage.getItem("meetingnotes_v1"); return s ? JSON.parse(s) : SAMPLE_NOTES; } catch { return SAMPLE_NOTES; }
  });
  const [activeId, setActiveId]     = useState("n1");
  const [previewMode, setPreview]   = useState(false);
  const [search, setSearch]         = useState("");
  const [showMeta, setShowMeta]     = useState(false);
  const [saved, setSaved]           = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    localStorage.setItem("meetingnotes_v1", JSON.stringify(notes));
  }, [notes]);

  const active = notes.find(n => n.id === activeId);

  const updateNote = useCallback((fields) => {
    setNotes(prev => prev.map(n => n.id === activeId ? { ...n, ...fields } : n));
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(true), 800);
  }, [activeId]);

  const newNote = (type = "other") => {
    const tmpl = TEMPLATE_BLOCKS[type] || TEMPLATE_BLOCKS.default;
    const n = {
      id: `n${Date.now()}`,
      title: "New Meeting",
      date: new Date().toISOString(),
      attendees: [],
      duration: "30 min",
      type,
      pinned: false,
      content: tmpl,
    };
    setNotes(prev => [n, ...prev]);
    setActiveId(n.id);
    setPreview(false);
  };

  const deleteNote = (id) => {
    setNotes(prev => {
      const remaining = prev.filter(n => n.id !== id);
      if (remaining.length) {
        setActiveId(current => current === id ? remaining[0].id : current);
      } else {
        setActiveId(null);
      }
      return remaining;
    });
  };

  const togglePin = (id) => setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));

  const filtered = notes
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date) - new Date(a.date));

  const actions = active ? countActionItems(active.content) : { total: 0, done: 0 };
  const headings = active ? extractHeadings(active.content) : [];

  return (
    <div style={{ display: "flex", height: "100vh", width:'100vw', fontFamily: "'Geist Mono', monospace", background: "#f8fafc", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Geist+Mono:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        textarea { font-feature-settings: "liga" 1; }
        .note-row { padding: 12px 14px; border-radius: 10px; cursor: pointer; transition: background 0.12s; border: 1px solid transparent; }
        .note-row:hover { background: rgba(255,255,255,0.08); }
        .note-row.active { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.1); }
        .sidebar-btn { background: none; border: none; cursor: pointer; border-radius: 6px; transition: background 0.12s; padding: 4px 6px; display: flex; align-items: center; }
        .sidebar-btn:hover { background: rgba(255,255,255,0.1); }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .editor-fade { animation: fadeIn 0.2s ease; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width: 350, background: "#1e293b", color: "#e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Sidebar header */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #3b82f6 0%, #059669 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="white"><path d="M2 2h11v2H2V2zm0 4h11v1.5H2V6zm0 3.5h7v1.5H2V9.5zM2 13h5v1.5H2V13z"/></svg>
            </div>
            <div>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, fontWeight: 400, color: "#f8fafc", letterSpacing: "-0.01em" }}>MeetingNotes</h1>
              <p style={{ fontSize: 10, color: "#475569", letterSpacing: "0.06em", marginTop: 1 }}>Feb 2026</p>
            </div>
          </div>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 10px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <svg width="13" height="13" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "#e2e8f0", width: "100%" }} />
          </div>
        </div>

        {/* New note */}
        <div style={{ padding: "10px 12px 6px" }}>
          <div style={{ position: "relative" }}>
            <button onClick={() => newNote("planning")}
              style={{ width: "100%", padding: "9px 14px", background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, color: "#93c5fd", fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.3)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              New Meeting Note
            </button>
          </div>
          {/* Template quick-pick */}
          <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
            {["standup", "1on1", "debrief"].map(t => {
              const mt = getMeetingType(t);
              return (
                <button key={t} onClick={() => newNote(t)} style={{ padding: "3px 9px", borderRadius: 6, border: `1px solid ${mt.color}44`, background: mt.bg + "20", color: "#94a3b8", fontFamily: "'Geist Mono', monospace", fontSize: 10, cursor: "pointer", transition: "all 0.12s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = mt.color; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; }}>
                  {mt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Note list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px 12px" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "#475569" }}>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 15 }}>No notes found</p>
            </div>
          )}
          {filtered.map(note => {
            const mt = getMeetingType(note.type);
            const ai = countActionItems(note.content);
            return (
              <div key={note.id} className={`note-row ${activeId === note.id ? "active" : ""}`} onClick={() => { setActiveId(note.id); setPreview(false); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                      {note.pinned && <span style={{ color: "#fbbf24", fontSize: 10 }}>📌</span>}
                      <span style={{ fontSize: 10, color: mt.color, background: mt.color + "22", padding: "1px 7px", borderRadius: 10, fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{mt.label}</span>
                    </div>
                    <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 14, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.4 }}>{note.title}</p>
                    <p style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>
                      {fmtShort(note.date)}{ai.total > 0 ? ` · ${ai.done}/${ai.total} ✓` : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                    <button className="sidebar-btn" onClick={e => { e.stopPropagation(); togglePin(note.id); }} title="Pin" style={{ fontSize: 12 }}>
                      {note.pinned ? "📌" : "📍"}
                    </button>
                    <button className="sidebar-btn" onClick={e => { e.stopPropagation(); deleteNote(note.id); }} title="Delete" style={{ color: "#475569", fontSize: 13 }}
                      onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                      onMouseLeave={e => e.currentTarget.style.color = "#475569"}>×</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats footer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "12px 16px", display: "flex", gap: 20 }}>
          {[
            { label: "Notes", value: notes.length },
            { label: "Open actions", value: notes.reduce((s, n) => s + countActionItems(n.content).total - countActionItems(n.content).done, 0) },
          ].map(s => (
            <div key={s.label}>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: "#f1f5f9", fontWeight: 400, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: "#475569", marginTop: 2, letterSpacing: "0.06em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      {active ? (
        <div key={active.id} className="editor-fade" style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
          {/* Top bar */}
          <div style={{ borderBottom: "1px solid #e8edf5", padding: "12px 24px", display: "flex", alignItems: "center", gap: 14, background: "#fff", flexShrink: 0 }}>
            {/* Title */}
            <input
              value={active.title}
              onChange={e => updateNote({ title: e.target.value })}
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, fontWeight: 400, color: "#0f172a", border: "none", outline: "none", background: "none", flex: 1, minWidth: 0 }}
              placeholder="Meeting title…"
            />

            {/* Meta chips */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "#64748b" }}>
                {fmtDate(active.date)}
              </span>
              {actions.total > 0 && (
                <span style={{ fontSize: 11, fontWeight: 600, color: actions.done === actions.total ? "#059669" : "#f97316", background: actions.done === actions.total ? "#ecfdf5" : "#fff7ed", padding: "2px 9px", borderRadius: 20, fontFamily: "'Geist Mono', monospace" }}>
                  {actions.done}/{actions.total} done
                </span>
              )}

              {/* Meta toggle */}
              <button onClick={() => setShowMeta(m => !m)}
                style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${showMeta ? "#3b82f6" : "#e2e8f0"}`, background: showMeta ? "#eff6ff" : "#fff", color: showMeta ? "#3b82f6" : "#64748b", fontFamily: "'Geist Mono', monospace", fontSize: 11, cursor: "pointer", fontWeight: 500, transition: "all 0.15s" }}>
                Details
              </button>

              {/* Preview toggle */}
              <button onClick={() => setPreview(p => !p)}
                style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${previewMode ? "#059669" : "#e2e8f0"}`, background: previewMode ? "#ecfdf5" : "#fff", color: previewMode ? "#059669" : "#64748b", fontFamily: "'Geist Mono', monospace", fontSize: 11, cursor: "pointer", fontWeight: 500, transition: "all 0.15s" }}>
                {previewMode ? "Edit" : "Preview"}
              </button>

              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: saved ? "#059669" : "#94a3b8", transition: "color 0.3s", minWidth: 40 }}>
                {saved ? "✓ Saved" : "···"}
              </span>

              {/* Delete current note */}
              <button
                onClick={() => deleteNote(active.id)}
                title="Delete this meeting"
                style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontFamily: "'Geist Mono', monospace", fontSize: 11, cursor: "pointer", fontWeight: 500, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.borderColor = "#fecaca"; }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                Delete
              </button>
            </div>
          </div>

          {/* Meta panel */}
          {showMeta && (
            <div style={{ borderBottom: "1px solid #f1f5f9", padding: "14px 24px", background: "#fafbfc", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, animation: "fadeIn 0.15s ease" }}>
              {/* Meeting type */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Type</label>
                <select value={active.type} onChange={e => updateNote({ type: e.target.value })}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "#334155", background: "#fff", outline: "none", appearance: "none", cursor: "pointer" }}>
                  {MEETING_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Date</label>
                <input type="date" value={active.date.slice(0, 10)} onChange={e => updateNote({ date: new Date(e.target.value).toISOString() })}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "#334155", background: "#fff", outline: "none", appearance: "none", cursor: "pointer" }} />
              </div>

              {/* Duration */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Duration</label>
                <select value={active.duration} onChange={e => updateNote({ duration: e.target.value })}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "#334155", background: "#fff", outline: "none", appearance: "none", cursor: "pointer" }}>
                  {["15 min","30 min","45 min","60 min","90 min","2 hrs","3 hrs"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              {/* Attendees */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Attendees</label>
                <input value={active.attendees.join(", ")} onChange={e => updateNote({ attendees: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="Names, comma-separated"
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "#334155", background: "#fff", outline: "none" }} />
              </div>
            </div>
          )}

          {/* Attendee pills & outline */}
          <div style={{ borderBottom: "1px solid #f1f5f9", padding: "8px 24px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "#fdfdfd", flexShrink: 0 }}>
            {/* Attendees */}
            {active.attendees.length > 0 && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>👥</span>
                {active.attendees.map((a, i) => (
                  <span key={i} style={{ fontSize: 11, background: "#f1f5f9", color: "#475569", padding: "2px 9px", borderRadius: 20, fontWeight: 500 }}>{a}</span>
                ))}
              </div>
            )}

            {/* Outline pills */}
            {headings.length > 0 && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", marginLeft: active.attendees.length > 0 ? 8 : 0, paddingLeft: active.attendees.length > 0 ? 14 : 0, borderLeft: active.attendees.length > 0 ? "1px solid #e2e8f0" : "none" }}>
                {headings.map((h, i) => (
                  <span key={i} style={{ fontSize: 11, color: "#64748b", background: "#f8fafc", padding: "2px 9px", borderRadius: 20, border: "1px solid #e2e8f0" }}>{h}</span>
                ))}
              </div>
            )}

            {/* Meeting type badge */}
            <div style={{ marginLeft: "auto" }}>
              {(() => { const mt = getMeetingType(active.type); return <span style={{ fontSize: 11, fontWeight: 600, color: mt.color, background: mt.bg, padding: "3px 10px", borderRadius: 20, border: `1px solid ${mt.color}33` }}>{mt.label} · {active.duration}</span>; })()}
            </div>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {previewMode
              ? <Preview content={active.content} />
              : <Editor note={active} onChange={content => updateNote({ content })} />
            }
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: "#cbd5e1", fontStyle: "italic" }}>No note selected</p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8, fontFamily: "'Geist Mono', monospace" }}>Create a new meeting note to begin</p>
          </div>
        </div>
      )}
    </div>
  );
}
