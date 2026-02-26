import { useState, useRef, useEffect, useCallback } from "react";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7am - 11pm
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EVENT_COLORS = [
  { bg: "#c2410c", light: "#fff7ed", label: "Terracotta" },
  { bg: "#0369a1", light: "#e0f2fe", label: "Ocean" },
  { bg: "#065f46", light: "#d1fae5", label: "Forest" },
  { bg: "#7c3aed", light: "#f5f3ff", label: "Violet" },
  { bg: "#be185d", light: "#fdf2f8", label: "Rose" },
  { bg: "#92400e", light: "#fef3c7", label: "Amber" },
];

const SAMPLE_EVENTS = [
  { id: 1, title: "Morning run", day: 0, startHour: 7, duration: 1, color: 2 },
  { id: 2, title: "Team standup", day: 0, startHour: 9, duration: 0.5, color: 1 },
  { id: 3, title: "Design review", day: 0, startHour: 11, duration: 1.5, color: 0 },
  { id: 4, title: "Lunch w/ Sarah", day: 1, startHour: 12, duration: 1, color: 4 },
  { id: 5, title: "Client call", day: 1, startHour: 14, duration: 1, color: 1 },
  { id: 6, title: "Deep work", day: 2, startHour: 9, duration: 3, color: 5 },
  { id: 7, title: "Yoga", day: 3, startHour: 7, duration: 1, color: 2 },
  { id: 8, title: "Sprint planning", day: 3, startHour: 10, duration: 2, color: 0 },
  { id: 9, title: "Coffee chat", day: 4, startHour: 15, duration: 0.5, color: 3 },
  { id: 10, title: "Farmer's market", day: 5, startHour: 9, duration: 1.5, color: 5 },
  { id: 11, title: "Brunch", day: 6, startHour: 11, duration: 2, color: 4 },
];

function formatHour(h) {
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function getWeekDates(offset = 0) {
  const today = new Date(2026, 1, 22); // Feb 22 2026 = Sunday... make Monday the start
  const day = today.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const CELL_HEIGHT = 64; // px per hour

export default function WeeklyCalendar() {
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [weekOffset, setWeekOffset] = useState(0);
  const [modal, setModal] = useState(null); // { type: 'add'|'edit', day, startHour, event? }
  const [form, setForm] = useState({ title: "", startHour: 9, duration: 1, color: 0 });
  const [dragging, setDragging] = useState(null);
  const gridRef = useRef(null);
  const weekDates = getWeekDates(weekOffset);
  const todayDate = new Date(2026, 1, 22);

  const isToday = (date) => date.toDateString() === todayDate.toDateString();
  const currentTodayCol = weekDates.findIndex(d => isToday(d));
  const currentHour = 10.5; // 10:30am "now"

  const openAdd = (day, hour) => {
    setForm({ title: "", startHour: hour, duration: 1, color: 0 });
    setModal({ type: "add", day, startHour: hour });
  };

  const openEdit = (e, event) => {
    e.stopPropagation();
    setForm({ title: event.title, startHour: event.startHour, duration: event.duration, color: event.color });
    setModal({ type: "edit", event });
  };

  const saveEvent = () => {
    if (!form.title.trim()) return;
    if (modal.type === "add") {
      setEvents(prev => [...prev, { id: Date.now(), ...form, day: modal.day }]);
    } else {
      setEvents(prev => prev.map(e => e.id === modal.event.id ? { ...e, ...form } : e));
    }
    setModal(null);
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setModal(null);
  };

  const monthLabel = (() => {
    const months = weekDates.map(d => d.toLocaleString("en-US", { month: "long" }));
    const unique = [...new Set(months)];
    return unique.join(" / ") + " " + weekDates[0].getFullYear();
  })();

  return (
    <div style={{ fontFamily: "'Lora', serif", background: "#faf8f4", minHeight: "100vh", minWidth:'100vw', color: "#1a1008" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Epilogue:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d6c9b4; border-radius: 3px; }
        .btn { border: none; background: none; cursor: pointer; font-family: 'Epilogue', sans-serif; }
        .day-col { flex: 1; border-right: 1px solid #e8e0d2; position: relative; min-width: 0; }
        .day-col:last-child { border-right: none; }
        .hour-cell { height: ${CELL_HEIGHT}px; border-bottom: 1px solid #f0ebe1; cursor: pointer; position: relative; transition: background 0.12s; }
        .hour-cell:hover { background: rgba(194,65,12,0.04); }
        .hour-cell:hover::after { content: '+'; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); color: #c2410c; font-size: 20px; opacity: 0.4; font-family: 'Epilogue', sans-serif; pointer-events: none; }
        .event-block { position: absolute; left: 3px; right: 3px; border-radius: 6px; padding: 5px 8px; cursor: pointer; overflow: hidden; transition: transform 0.12s, box-shadow 0.12s; z-index: 2; }
        .event-block:hover { transform: translateX(1px) scale(1.01); box-shadow: 0 4px 16px rgba(0,0,0,0.15); z-index: 10; }
        .nav-btn { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #d6c9b4; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-size: 14px; color: #6b5a42; }
        .nav-btn:hover { background: #c2410c; border-color: #c2410c; color: white; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(20,10,0,0.35); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); animation: fadeIn 0.15s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal { background: #faf8f4; border-radius: 16px; padding: 28px; width: 360px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); border: 1px solid #e8e0d2; animation: slideUp 0.2s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e0d8cc; border-radius: 8px; font-family: 'Epilogue', sans-serif; font-size: 14px; background: #fff; color: #1a1008; outline: none; transition: border-color 0.15s; }
        .form-input:focus { border-color: #c2410c; }
        select.form-input { appearance: none; cursor: pointer; }
        .color-dot { width: 24px; height: 24px; border-radius: 50%; cursor: pointer; transition: transform 0.15s; border: 3px solid transparent; }
        .color-dot:hover, .color-dot.active { transform: scale(1.2); border-color: #1a1008; }
        .today-col { background: rgba(194,65,12,0.02); }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #e0d8cc", background: "#fff", padding: "16px 32px", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#1a1008" }}>
            Week
          </h1>
          <span style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 13, color: "#9c8970", fontWeight: 500 }}>
            {monthLabel}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
          <button className="nav-btn" onClick={() => setWeekOffset(w => w - 1)}>←</button>
          <button onClick={() => setWeekOffset(0)} style={{ padding: "0 14px", borderRadius: 20, border: "1.5px solid #d6c9b4", background: weekOffset === 0 ? "#c2410c" : "#fff", color: weekOffset === 0 ? "#fff" : "#6b5a42", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Epilogue', sans-serif", transition: "all 0.15s" }}>Today</button>
          <button className="nav-btn" onClick={() => setWeekOffset(w => w + 1)}>→</button>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 12, color: "#9c8970" }}>{events.length} events this week</span>
          <button onClick={() => openAdd(0, 9)} style={{ padding: "8px 18px", borderRadius: 20, border: "none", background: "#c2410c", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Epilogue', sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#9a3412"}
            onMouseLeave={e => e.currentTarget.style.background = "#c2410c"}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: "flex", height: "calc(100vh - 73px)", overflow: "hidden" }}>

        {/* Time gutter */}
        <div style={{ width: 64, flexShrink: 0, borderRight: "1px solid #e0d8cc", background: "#fff" }}>
          {/* Day header spacer */}
          <div style={{ height: 56, borderBottom: "2px solid #e0d8cc" }} />
          <div style={{ overflowY: "scroll", height: "calc(100% - 56px)" }}>
            {HOURS.map((h, i) => (
              <div key={h} style={{ height: CELL_HEIGHT, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 10, paddingTop: 3, position: "relative" }}>
                {i > 0 && <span style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 11, color: "#b8a990", fontWeight: 500, whiteSpace: "nowrap" }}>{formatHour(h)}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Days */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Day headers */}
          <div style={{ display: "flex", borderBottom: "2px solid #e0d8cc", background: "#fff", flexShrink: 0, height: 56 }}>
            {weekDates.map((date, i) => {
              const today = isToday(date);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: i < 6 ? "1px solid #e8e0d2" : "none", padding: "6px 0", gap: 2 }}>
                  <span style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: today ? "#c2410c" : "#9c8970" }}>
                    {DAYS[i]}
                  </span>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: today ? "#c2410c" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'Lora', serif", fontSize: 15, fontWeight: today ? 700 : 500, color: today ? "#fff" : "#2d1f0d" }}>
                      {date.getDate()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scrollable grid */}
          <div style={{ flex: 1, overflowY: "scroll", display: "flex" }} ref={gridRef}>
            {weekDates.map((date, dayIdx) => {
              const dayEvents = events.filter(e => e.day === dayIdx);
              const today = isToday(date);
              return (
                <div key={dayIdx} className={`day-col ${today ? "today-col" : ""}`}>
                  {HOURS.map((h, hi) => (
                    <div key={h} className="hour-cell" onClick={() => openAdd(dayIdx, h)} />
                  ))}

                  {/* Now indicator */}
                  {today && (
                    <div style={{ position: "absolute", top: (currentHour - 7) * CELL_HEIGHT, left: 0, right: 0, zIndex: 5, pointerEvents: "none" }}>
                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -4, top: -4, width: 8, height: 8, borderRadius: "50%", background: "#c2410c" }} />
                        <div style={{ height: 2, background: "#c2410c", opacity: 0.8, marginLeft: 4 }} />
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {dayEvents.map(event => {
                    const col = EVENT_COLORS[event.color];
                    const top = (event.startHour - 7) * CELL_HEIGHT;
                    const height = event.duration * CELL_HEIGHT;
                    const isShort = height < 36;
                    return (
                      <div key={event.id} className="event-block"
                        style={{ top, height: Math.max(height - 3, 22), background: col.light, borderLeft: `3px solid ${col.bg}` }}
                        onClick={(e) => openEdit(e, event)}>
                        <p style={{ fontFamily: "'Epilogue', sans-serif", fontSize: isShort ? 10 : 12, fontWeight: 600, color: col.bg, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isShort ? "nowrap" : "normal", margin: 0 }}>
                          {event.title}
                        </p>
                        {!isShort && height > 48 && (
                          <p style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 10, color: col.bg, opacity: 0.7, margin: "2px 0 0", lineHeight: 1.2 }}>
                            {formatHour(event.startHour)} — {formatHour(event.startHour + event.duration)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 700, color: "#1a1008" }}>
                {modal.type === "add" ? "New Event" : "Edit Event"}
              </h2>
              <button onClick={() => setModal(null)} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: "#9c8970", lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Title */}
              <div>
                <label style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9c8970", display: "block", marginBottom: 6 }}>Title</label>
                <input className="form-input" type="text" placeholder="Event name..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && saveEvent()} autoFocus />
              </div>

              {/* Day selector (only for add) */}
              {modal.type === "add" && (
                <div>
                  <label style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9c8970", display: "block", marginBottom: 6 }}>Day</label>
                  <select className="form-input" value={modal.day} onChange={e => setModal(m => ({ ...m, day: parseInt(e.target.value) }))}>
                    {FULL_DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Start time */}
                <div>
                  <label style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9c8970", display: "block", marginBottom: 6 }}>Start</label>
                  <select className="form-input" value={form.startHour} onChange={e => setForm(f => ({ ...f, startHour: parseFloat(e.target.value) }))}>
                    {HOURS.map(h => [h, h + 0.5].map(hh => <option key={hh} value={hh}>{formatHour(Math.floor(hh))}{hh % 1 ? ":30" : ":00"}</option>))}
                  </select>
                </div>
                {/* Duration */}
                <div>
                  <label style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9c8970", display: "block", marginBottom: 6 }}>Duration</label>
                  <select className="form-input" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseFloat(e.target.value) }))}>
                    {[0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8].map(d => <option key={d} value={d}>{d < 1 ? "30 min" : d === 1 ? "1 hour" : `${d} hours`}</option>)}
                  </select>
                </div>
              </div>

              {/* Color */}
              <div>
                <label style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9c8970", display: "block", marginBottom: 8 }}>Color</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {EVENT_COLORS.map((c, i) => (
                    <div key={i} className={`color-dot ${form.color === i ? "active" : ""}`}
                      style={{ background: c.bg }}
                      onClick={() => setForm(f => ({ ...f, color: i }))} />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, marginTop: 4, justifyContent: "space-between" }}>
                {modal.type === "edit" && (
                  <button onClick={() => deleteEvent(modal.event.id)} style={{ padding: "9px 16px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fff1f1", color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Epilogue', sans-serif" }}>Delete</button>
                )}
                <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                  <button onClick={() => setModal(null)} style={{ padding: "9px 16px", borderRadius: 8, border: "1.5px solid #e0d8cc", background: "none", color: "#6b5a42", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Epilogue', sans-serif" }}>Cancel</button>
                  <button onClick={saveEvent} disabled={!form.title.trim()} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: form.title.trim() ? "#c2410c" : "#e0d8cc", color: form.title.trim() ? "#fff" : "#b8a990", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Epilogue', sans-serif", transition: "background 0.15s" }}>
                    {modal.type === "add" ? "Add Event" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
