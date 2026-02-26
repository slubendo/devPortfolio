import { useState, useRef, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: "backlog",     label: "BACKLOG",     accent: "#1a1a1a" },
  { id: "todo",        label: "TO DO",       accent: "#e63946" },
  { id: "inprogress",  label: "IN PROGRESS", accent: "#f4a261" },
  { id: "review",      label: "REVIEW",      accent: "#457b9d" },
  { id: "done",        label: "DONE",        accent: "#2a9d8f" },
];

const TAGS = [
  { id: "design",     label: "DESIGN",     bg: "#ffd6e0", fg: "#c1121f" },
  { id: "dev",        label: "DEV",        bg: "#d0e8ff", fg: "#1d3557" },
  { id: "research",   label: "RESEARCH",   bg: "#d8f3dc", fg: "#1b4332" },
  { id: "marketing",  label: "MARKETING",  bg: "#fff3b0", fg: "#7b4f00" },
  { id: "ops",        label: "OPS",        bg: "#e9d8fd", fg: "#4a235a" },
];

const PRIORITY = [
  { id: "critical", label: "CRITICAL", symbol: "!!!" },
  { id: "high",     label: "HIGH",     symbol: "!!"  },
  { id: "medium",   label: "MED",      symbol: "!"   },
  { id: "low",      label: "LOW",      symbol: "–"   },
];

const MEMBERS = ["AK", "JM", "SR", "TL", "PD"];

const INITIAL_CARDS = [
  { id: "c1", col: "backlog",    title: "Conduct user interviews for onboarding flow", tag: "research", priority: "high",     assignee: "SR", due: "2026-03-10", desc: "Interview 8–10 users to identify friction points in the current onboarding experience." },
  { id: "c2", col: "backlog",    title: "Redesign pricing page", tag: "design",   priority: "medium",   assignee: "AK", due: "2026-03-20", desc: "A/B test two pricing layout variants. Focus on trust signals and CTA clarity." },
  { id: "c3", col: "todo",       title: "Set up CI/CD pipeline for staging", tag: "dev",      priority: "high",     assignee: "TL", due: "2026-02-28", desc: "GitHub Actions → Docker → Fly.io. Include automated test runs on PR." },
  { id: "c4", col: "todo",       title: "Write Q1 newsletter copy", tag: "marketing", priority: "medium", assignee: "JM", due: "2026-03-01", desc: "2,000 word digest of product updates, customer stories, and upcoming events." },
  { id: "c5", col: "todo",       title: "Fix mobile nav overflow bug", tag: "dev",      priority: "critical", assignee: "TL", due: "2026-02-23", desc: "Nav items overflow on screens < 375px. Repro on iPhone SE." },
  { id: "c6", col: "inprogress", title: "Illustration system for empty states", tag: "design",   priority: "medium",   assignee: "AK", due: "2026-03-05", desc: "Create a cohesive set of 12 SVG illustrations for zero-state screens across the app." },
  { id: "c7", col: "inprogress", title: "Migrate database to Postgres 16", tag: "dev",      priority: "critical", assignee: "PD", due: "2026-02-25", desc: "Full migration plan, rollback script, and zero-downtime deploy strategy required." },
  { id: "c8", col: "inprogress", title: "Social media content calendar — March", tag: "marketing", priority: "low",    assignee: "JM", due: "2026-02-28", desc: "16 posts across Twitter, LinkedIn, Instagram. Align with product launch dates." },
  { id: "c9", col: "review",     title: "Authentication flow redesign", tag: "design",   priority: "high",     assignee: "AK", due: "2026-02-22", desc: "New sign-in/sign-up flows with SSO support. Ready for eng handoff review." },
  { id: "c10", col: "review",    title: "Add Stripe subscription webhooks", tag: "dev",     priority: "high",     assignee: "PD", due: "2026-02-24", desc: "Handle subscription.created, updated, deleted. Include retry logic and logging." },
  { id: "c11", col: "done",      title: "Rebrand logo and wordmark", tag: "design",   priority: "high",     assignee: "SR", due: "2026-02-15", desc: "Final logo suite delivered in all formats. Brand guide updated." },
  { id: "c12", col: "done",      title: "Launch referral program", tag: "marketing", priority: "high",    assignee: "JM", due: "2026-02-18", desc: "Email sequence, landing page, and tracking all live. 340 signups in week 1." },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getTag(id)      { return TAGS.find(t => t.id === id) || TAGS[0]; }
function getPriority(id) { return PRIORITY.find(p => p.id === id) || PRIORITY[2]; }
function getCol(id)      { return COLUMNS.find(c => c.id === id); }

function daysUntil(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date("2026-02-22")) / 86400000);
  return diff;
}

function DueChip({ due }) {
  const d = daysUntil(due);
  const label = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d}d`;
  const color = d < 0 ? "#c1121f" : d <= 2 ? "#e63946" : d <= 5 ? "#f4a261" : "#888";
  return (
    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 600, color, letterSpacing: "0.06em", border: `1px solid ${color}44`, padding: "1px 5px", borderRadius: 2 }}>
      {label.toUpperCase()}
    </span>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

function Card({ card, onMove, onEdit, onDelete, isDragging, dragHandlers }) {
  const tag = getTag(card.tag);
  const pri = getPriority(card.priority);
  const col = getCol(card.col);

  return (
    <div
      {...dragHandlers}
      style={{
        background: card.col === "done" ? "#f5f5f0" : "#fff",
        border: "2px solid #1a1a1a",
        borderLeft: `6px solid ${col.accent}`,
        padding: "14px 14px 12px",
        cursor: "grab",
        opacity: isDragging ? 0.35 : 1,
        transform: isDragging ? "rotate(1deg)" : "none",
        transition: "box-shadow 0.15s, transform 0.1s",
        userSelect: "none",
        position: "relative",
        animation: "cardIn 0.2s ease both",
      }}
      className="kanban-card"
      onClick={() => onEdit(card)}
    >
      {/* Priority badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: pri.id === "critical" ? "#c1121f" : pri.id === "high" ? "#e63946" : "#888" }}>
          {pri.symbol} {pri.label}
        </span>
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#1a1a1a", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 0, flexShrink: 0 }}>
          {card.assignee}
        </span>
      </div>

      {/* Title */}
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 14, fontWeight: 700, lineHeight: 1.4,
        color: card.col === "done" ? "#888" : "#1a1a1a",
        textDecoration: card.col === "done" ? "line-through" : "none",
        marginBottom: 10,
      }}>{card.title}</p>

      {/* Bottom row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", background: tag.bg, color: tag.fg, padding: "2px 7px", borderRadius: 2 }}>
          {tag.label}
        </span>
        {card.due && <DueChip due={card.due} />}
      </div>

      {/* Move buttons on hover */}
      <div className="card-actions" style={{ position: "absolute", top: 8, right: 8, display: "none", gap: 3 }}>
        <button onClick={e => { e.stopPropagation(); onDelete(card.id); }} style={{ width: 20, height: 20, background: "#1a1a1a", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2 }}>×</button>
      </div>
    </div>
  );
}

// ─── CARD MODAL ───────────────────────────────────────────────────────────────

function CardModal({ card, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(card ? { ...card } : { id: null, col: "backlog", title: "", desc: "", tag: "dev", priority: "medium", assignee: "AK", due: "" });
  const isNew = !card?.id;

  const handleSave = () => { if (!form.title.trim()) return; onSave({ ...form, id: form.id || `c${Date.now()}` }); };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: "#fff", border: "3px solid #1a1a1a", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", animation: "modalIn 0.18s ease" }} onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div style={{ background: "#1a1a1a", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "0.15em", color: "#fff", textTransform: "uppercase" }}>
            {isNew ? "— NEW CARD" : "— EDIT CARD"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title */}
          <div>
            <label style={{ ...labelStyle }}>TITLE</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus
              style={{ ...inputStyle, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700 }} placeholder="Card title…" />
          </div>

          {/* Description */}
          <div>
            <label style={{ ...labelStyle }}>DESCRIPTION</label>
            <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "'Barlow', sans-serif", fontSize: 14, lineHeight: 1.6 }} placeholder="Notes, context, links…" />
          </div>

          {/* Row: Column + Priority */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ ...labelStyle }}>COLUMN</label>
              <select value={form.col} onChange={e => setForm(f => ({ ...f, col: e.target.value }))} style={{ ...inputStyle }}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ ...labelStyle }}>PRIORITY</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ ...inputStyle }}>
                {PRIORITY.map(p => <option key={p.id} value={p.id}>{p.symbol} {p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Tag + Assignee + Due */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ ...labelStyle }}>TAG</label>
              <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} style={{ ...inputStyle }}>
                {TAGS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ ...labelStyle }}>ASSIGNEE</label>
              <select value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} style={{ ...inputStyle }}>
                {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ ...labelStyle }}>DUE DATE</label>
              <input type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))} style={{ ...inputStyle }} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "2px solid #1a1a1a" }}>
            {!isNew ? (
              <button onClick={() => onDelete(form.id)} style={{ ...btnStyle, background: "none", color: "#c1121f", border: "2px solid #c1121f" }}>DELETE</button>
            ) : <div />}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{ ...btnStyle, background: "none", color: "#1a1a1a", border: "2px solid #1a1a1a" }}>CANCEL</button>
              <button onClick={handleSave} disabled={!form.title.trim()} style={{ ...btnStyle, background: form.title.trim() ? "#1a1a1a" : "#ccc", color: "#fff", border: "2px solid transparent" }}>
                {isNew ? "CREATE" : "SAVE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#666", display: "block", marginBottom: 5, textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "9px 12px", border: "2px solid #1a1a1a", borderRadius: 0, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#1a1a1a", outline: "none", background: "#fff", fontWeight: 500 };
const btnStyle = { padding: "9px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer", borderRadius: 0, transition: "opacity 0.15s" };

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function KanbanTracker() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [modal, setModal] = useState(null); // null | 'new' | card object
  const [dragId, setDragId]   = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [filterTag, setFilterTag] = useState(null);
  const [filterPri, setFilterPri] = useState(null);
  const [projectName] = useState("Horizon — Q1 2026");

  const saveCard = (card) => {
    setCards(prev => prev.find(c => c.id === card.id) ? prev.map(c => c.id === card.id ? card : c) : [...prev, card]);
    setModal(null);
  };

  const deleteCard = (id) => { setCards(prev => prev.filter(c => c.id !== id)); setModal(null); };

  // Drag-and-drop
  const handleDragStart = (id) => setDragId(id);
  const handleDragEnd   = () => { setDragId(null); setDragOver(null); };
  const handleDrop      = (colId) => {
    if (!dragId) return;
    setCards(prev => prev.map(c => c.id === dragId ? { ...c, col: colId } : c));
    setDragId(null); setDragOver(null);
  };

  const filtered = cards.filter(c =>
    (!filterTag || c.tag === filterTag) && (!filterPri || c.priority === filterPri)
  );

  const totalByCol = (colId) => cards.filter(c => c.col === colId).length;
  const doneCount  = cards.filter(c => c.col === "done").length;
  const progress   = Math.round(doneCount / cards.length * 100);

  return (
    <div style={{ background: "#f0ede8", minHeight: "100vh", minWidth:'100vw', fontFamily: "'Barlow', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { height: 5px; width: 5px; }
        ::-webkit-scrollbar-track { background: #e0dcd5; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; }

        .kanban-card { transition: box-shadow 0.15s; }
        .kanban-card:hover { box-shadow: 4px 4px 0 #484848; }
        .kanban-card:hover .card-actions { display: flex !important; }
        .kanban-card:active { cursor: grabbing; }

        .col-drop-target { transition: background 0.15s; }
        .col-drop-target.over { background: rgba(0,0,0,0.04); }

        @keyframes cardIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }

        input[type='date']::-webkit-calendar-picker-indicator { cursor: pointer; }
        select, input, textarea { appearance: none; -webkit-appearance: none; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: "#1a1a1a", borderBottom: "3px solid #1a1a1a", padding: "0 28px", display: "flex", alignItems: "stretch", gap: 0 }}>
        {/* Logo block */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 24, borderRight: "2px solid #333" }}>
          <div style={{ width: 36, height: 36, background: "#e63946", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>K</span>
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", color: "#888", textTransform: "uppercase" }}>Kanvas</span>
        </div>

        {/* Project name */}
        <div style={{ padding: "14px 24px", flex: 1 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{projectName}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <div style={{ height: 4, width: 120, background: "#333", borderRadius: 0, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#2a9d8f", transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#666", letterSpacing: "0.1em" }}>{progress}% COMPLETE · {doneCount}/{cards.length} CARDS</span>
          </div>
        </div>

        {/* Right: filters + new card */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 20, borderLeft: "2px solid #333" }}>
          {/* Tag filter */}
          <div style={{ display: "flex", gap: 4 }}>
            {TAGS.map(t => (
              <button key={t.id} onClick={() => setFilterTag(f => f === t.id ? null : t.id)}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", padding: "4px 9px", border: `1.5px solid ${filterTag === t.id ? t.bg : "#444"}`, background: filterTag === t.id ? t.bg : "transparent", color: filterTag === t.id ? t.fg : "#666", cursor: "pointer", borderRadius: 2, transition: "all 0.15s" }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 28, background: "#333" }} />

          <button onClick={() => setModal("new")} style={{ padding: "9px 20px", background: "#e63946", border: "none", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={e => e.currentTarget.style.background = "#c1121f"} onMouseLeave={e => e.currentTarget.style.background = "#e63946"}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> NEW CARD
          </button>
        </div>
      </div>

      {/* ── BOARD ── */}
      <div style={{ display: "flex", justifyContent:'space-between', gap: 0, padding: 0, height: "calc(100vh - 77px)", overflowX: "auto" }}>
        {COLUMNS.map((col, ci) => {
          const colCards = filtered.filter(c => c.col === col.id).sort((a, b) => {
            const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return pOrder[a.priority] - pOrder[b.priority];
          });
          const isOver = dragOver === col.id;

          return (
            <div key={col.id}
              className={`col-drop-target ${isOver ? "over" : ""}`}
              style={{ width: 280, minWidth: 280, borderRight: ci < COLUMNS.length - 1 ? "2px solid #1a1a1a" : "none", display: "flex", flexDirection: "column", background: isOver ? "#ebe7e0" : "transparent" }}
              onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.id)}>

              {/* Column header */}
              <div style={{ padding: "16px 16px 14px", borderBottom: "2px solid #1a1a1a", background: "#f0ede8", position: "sticky", top: 0, zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, background: col.accent, borderRadius: ci === 0 ? 0 : "50%" }} />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: "0.16em", color: "#1a1a1a" }}>{col.label}</span>
                  </div>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: col.accent, lineHeight: 1 }}>
                    {String(totalByCol(col.id)).padStart(2, "0")}
                  </span>
                </div>

                {/* Col progress bar */}
                <div style={{ marginTop: 10, height: 2, background: "#ddd8d0" }}>
                  <div style={{ height: "100%", width: col.id === "done" ? "100%" : `${Math.min(colCards.length / 5 * 100, 100)}%`, background: col.accent }} />
                </div>
              </div>

              {/* Cards */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
                {colCards.map(card => (
                  <Card key={card.id} card={card}
                    isDragging={dragId === card.id}
                    onEdit={(c) => setModal(c)}
                    onDelete={deleteCard}
                    dragHandlers={{
                      draggable: true,
                      onDragStart: () => handleDragStart(card.id),
                      onDragEnd: handleDragEnd,
                    }}
                  />
                ))}

                {colCards.length === 0 && (
                  <div style={{ border: "2px dashed #ccc8c0", padding: "24px 12px", textAlign: "center" }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: "0.1em", color: "#bbb" }}>EMPTY</p>
                  </div>
                )}

                {/* Add card shortcut at bottom of each col */}
                <button onClick={() => { setModal({ id: null, col: col.id, title: "", desc: "", tag: "dev", priority: "medium", assignee: "AK", due: "" }); }}
                  style={{ border: "2px dashed #ccc8c0", background: "none", padding: "10px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: "0.1em", color: "#aaa", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = col.accent; e.currentTarget.style.color = col.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#ccc8c0"; e.currentTarget.style.color = "#aaa"; }}>
                  + ADD CARD
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <CardModal
          card={modal === "new" ? null : modal}
          onSave={saveCard}
          onDelete={deleteCard}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
