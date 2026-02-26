import { useState, useEffect, useRef } from "react";

const PROJECTS = [
  { id: "inbox", name: "Inbox", color: "#6366f1", icon: "📥" },
  { id: "work", name: "Work", color: "#f59e0b", icon: "💼" },
  { id: "personal", name: "Personal", color: "#10b981", icon: "🌿" },
  { id: "health", name: "Health", color: "#ef4444", icon: "❤️" },
];

const PRIORITIES = [
  { id: 4, label: "P1", color: "#ef4444", bg: "#fef2f2" },
  { id: 3, label: "P2", color: "#f97316", bg: "#fff7ed" },
  { id: 2, label: "P3", color: "#3b82f6", bg: "#eff6ff" },
  { id: 1, label: "P4", color: "#9ca3af", bg: "#f9fafb" },
];

const SAMPLE_TASKS = [
  { id: 1, title: "Design new landing page mockups", done: false, project: "work", priority: 4, due: "2026-02-23", subtasks: [] },
  { id: 2, title: "Weekly team standup", done: false, project: "work", priority: 2, due: "2026-02-22", subtasks: [] },
  { id: 3, title: "Finish quarterly report", done: true, project: "work", priority: 3, due: "2026-02-20", subtasks: [] },
  { id: 4, title: "Morning run — 5km", done: false, project: "health", priority: 2, due: "2026-02-22", subtasks: [] },
  { id: 5, title: "Buy groceries", done: false, project: "personal", priority: 1, due: "2026-02-23", subtasks: [] },
  { id: 6, title: "Read: Designing Data-Intensive Applications", done: false, project: "personal", priority: 1, due: "2026-02-28", subtasks: [] },
  { id: 7, title: "Dentist appointment", done: false, project: "health", priority: 3, due: "2026-02-25", subtasks: [] },
  { id: 8, title: "Review PR #142 — auth refactor", done: false, project: "work", priority: 4, due: "2026-02-22", subtasks: [] },
];

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const today = new Date("2026-02-22");
  const diff = Math.floor((d - today) / 86400000);
  if (diff === 0) return { label: "Today", color: "#10b981" };
  if (diff === 1) return { label: "Tomorrow", color: "#f59e0b" };
  if (diff < 0) return { label: "Overdue", color: "#ef4444" };
  return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "#6b7280" };
}

export default function TaskFlow() {
  const [tasks, setTasks] = useState(SAMPLE_TASKS);
  const [activeProject, setActiveProject] = useState("inbox");
  const [activeView, setActiveView] = useState("today");
  const [newTaskText, setNewTaskText] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (addingTask && inputRef.current) inputRef.current.focus();
  }, [addingTask]);

  const filteredTasks = tasks.filter(t => {
    if (showSearch && searchQuery) return t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeView === "today") return t.due === "2026-02-22" && !t.done;
    if (activeView === "upcoming") return t.due > "2026-02-22" && !t.done;
    if (activeView === "project") return t.project === activeProject;
    return true;
  });

  const toggleDone = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done, _toggle: Date.now() } : t));
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const proj = activeView === "project" ? activeProject : "inbox";
    setTasks(prev => [...prev, {
      id: Date.now(), title: newTaskText.trim(), done: false,
      project: proj, priority: selectedPriority, due: "2026-02-22", subtasks: []
    }]);
    setNewTaskText("");
    setSelectedPriority(1);
    setAddingTask(false);
  };

  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const doneTasks = filteredTasks.filter(t => t.done);
  const pendingTasks = filteredTasks.filter(t => !t.done).sort((a, b) => b.priority - a.priority);

  const viewTitle = showSearch ? "Search" :
    activeView === "today" ? "Today" :
    activeView === "upcoming" ? "Upcoming" :
    PROJECTS.find(p => p.id === activeProject)?.name || "Tasks";

  const taskCount = tasks.filter(t => !t.done && t.due === "2026-02-22").length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", height: "100vh", width:'100vw', background: "#0f0f10", color: "#e8e6e1", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 9px 14px; border-radius: 10px; cursor: pointer; transition: all 0.15s; font-size: 14px; font-weight: 500; color: #9ca3af; border: none; background: none; width: 100%; text-align: left; }
        .sidebar-item:hover { background: rgba(255,255,255,0.06); color: #e8e6e1; }
        .sidebar-item.active { background: rgba(99,102,241,0.2); color: #818cf8; }
        .task-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border-radius: 12px; transition: all 0.15s; cursor: pointer; animation: fadeSlide 0.2s ease; }
        .task-row:hover { background: rgba(255,255,255,0.04); }
        .task-row:hover .task-actions { opacity: 1; }
        .task-actions { opacity: 0; display: flex; gap: 4px; transition: opacity 0.15s; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .checkbox { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #374151; cursor: pointer; flex-shrink: 0; transition: all 0.2s; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
        .checkbox:hover { border-color: #6366f1; background: rgba(99,102,241,0.1); }
        .checkbox.done { background: #6366f1; border-color: #6366f1; }
        .add-btn { display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 10px; cursor: pointer; background: none; border: none; color: #6366f1; font-size: 14px; font-weight: 500; width: 100%; transition: background 0.15s; }
        .add-btn:hover { background: rgba(99,102,241,0.1); }
        .priority-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
        input[type="text"] { background: none; border: none; outline: none; color: #e8e6e1; font-family: 'DM Sans', sans-serif; font-size: 15px; width: 100%; }
        .search-bar { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; display: flex; align-items: center; gap: 8px; padding: 8px 14px; }
        .kbd { font-size: 11px; padding: 2px 6px; background: rgba(255,255,255,0.08); border-radius: 4px; color: #6b7280; font-family: monospace; }
        .badge { font-size: 11px; padding: 1px 7px; border-radius: 20px; font-weight: 600; }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 300, background: "#141416", borderRight: "1px solid #1f1f22", display: "flex", flexDirection: "column", padding: "20px 12px", gap: 4, flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "4px 14px 20px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#e8e6e1" }}>Taskflow</span>
        </div>

        {/* Search */}
        <button className="sidebar-item" onClick={() => { setShowSearch(!showSearch); setActiveView(null); }} style={{ color: showSearch ? "#818cf8" : undefined, background: showSearch ? "rgba(99,102,241,0.2)" : undefined }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Search
          <span className="kbd" style={{ marginLeft: "auto" }}>⌘K</span>
        </button>

        <div style={{ height: 1, background: "#1f1f22", margin: "8px 2px" }} />

        {/* Views */}
        {[
          { id: "today", icon: "☀️", label: "Today", badge: taskCount },
          { id: "upcoming", icon: "📅", label: "Upcoming" },
        ].map(v => (
          <button key={v.id} className={`sidebar-item ${activeView === v.id && !showSearch ? "active" : ""}`} onClick={() => { setActiveView(v.id); setShowSearch(false); }}>
            <span style={{ fontSize: 15 }}>{v.icon}</span>
            {v.label}
            {v.badge > 0 && <span className="badge" style={{ marginLeft: "auto", background: "rgba(99,102,241,0.2)", color: "#818cf8" }}>{v.badge}</span>}
          </button>
        ))}

        <div style={{ height: 1, background: "#1f1f22", margin: "8px 2px" }} />

        {/* Projects */}
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#4b5563", padding: "0 14px", marginBottom: 4, textTransform: "uppercase" }}>Projects</p>
        {PROJECTS.map(p => {
          const count = tasks.filter(t => t.project === p.id && !t.done).length;
          return (
            <button key={p.id} className={`sidebar-item ${activeView === "project" && activeProject === p.id && !showSearch ? "active" : ""}`}
              onClick={() => { setActiveProject(p.id); setActiveView("project"); setShowSearch(false); }}>
              <span style={{ fontSize: 15 }}>{p.icon}</span>
              {p.name}
              {count > 0 && <span style={{ marginLeft: "auto", fontSize: 12, color: "#4b5563", fontWeight: 600 }}>{count}</span>}
            </button>
          );
        })}

        {/* Bottom */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ height: 1, background: "#1f1f22", marginBottom: 8 }} />
          <div style={{ padding: "8px 14px", display: "flex", align: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>A</div>
            <div style={{ marginLeft: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Alex Chen</p>
              <p style={{ fontSize: 11, color: "#4b5563" }}>Free plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "28px 40px 0", flexShrink: 0 }}>
          {showSearch ? (
            <div className="search-bar" style={{ maxWidth: 560 }}>
              <svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus style={{ fontSize: 15 }} />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>}
            </div>
          ) : (
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, fontWeight: 400, color: "#f9fafb", letterSpacing: "-0.01em" }}>{viewTitle}</h1>
              {activeView === "today" && <p style={{ color: "#4b5563", fontSize: 13, marginTop: 4 }}>Sunday, February 22 · {taskCount} task{taskCount !== 1 ? "s" : ""} remaining</p>}
            </div>
          )}
        </div>

        {/* Task List */}
        <div style={{ flex: 1, overflowY: "auto", overflowX:'auto', padding: "30px 40px 40px" }}>
          {/* Pending Tasks */}
          {pendingTasks.length === 0 && !showSearch && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#374151" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
              <p style={{ fontSize: 16, fontWeight: 500 }}>All clear!</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>No tasks here. Add one below.</p>
            </div>
          )}

          {searchQuery && filteredTasks.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#374151" }}>
              <p style={{ fontSize: 15 }}>No results for "{searchQuery}"</p>
            </div>
          )}

          {pendingTasks.map((task, i) => {
            const pri = PRIORITIES.find(p => p.id === task.priority);
            const proj = PROJECTS.find(p => p.id === task.project);
            const due = formatDate(task.due);
            return (
              <div key={task.id} className="task-row" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="checkbox" onClick={() => toggleDone(task.id)}>
                  <div className="priority-dot" style={{ background: pri.color, width: 6, height: 6, margin: 0 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.5, color: "#e8e6e1" }}>{task.title}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                    {due && (
                      <span style={{ fontSize: 12, color: due.color, display: "flex", alignItems: "center", gap: 3, fontWeight: 500 }}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        {due.label}
                      </span>
                    )}
                    {proj && activeView !== "project" && (
                      <span style={{ fontSize: 12, color: proj.color, fontWeight: 500 }}>{proj.icon} {proj.name}</span>
                    )}
                    <span style={{ fontSize: 11, color: pri.color, background: pri.bg + "20", padding: "1px 6px", borderRadius: 4, fontWeight: 700, border: `1px solid ${pri.color}30` }}>{pri.label}</span>
                  </div>
                </div>
                <div className="task-actions">
                  <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: "2px 6px", borderRadius: 6, fontSize: 16, transition: "all 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "#ef4444"} onMouseLeave={e => e.target.style.color = "#4b5563"}>×</button>
                </div>
              </div>
            );
          })}

          {/* Add Task */}
          {!showSearch && (
            addingTask ? (
              <div style={{ border: "1px solid #2d2d30", borderRadius: 12, padding: "14px 16px", marginTop: 8, background: "#141416" }}>
                <input ref={inputRef} type="text" placeholder="Task name" value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addTask(); if (e.key === "Escape") { setAddingTask(false); setNewTaskText(""); } }}
                  style={{ fontSize: 15, marginBottom: 10 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {PRIORITIES.map(p => (
                    <button key={p.id} onClick={() => setSelectedPriority(p.id)} style={{ padding: "3px 10px", borderRadius: 6, border: `1px solid ${selectedPriority === p.id ? p.color : "#2d2d30"}`, background: selectedPriority === p.id ? p.color + "20" : "none", color: selectedPriority === p.id ? p.color : "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif" }}>
                      {p.label}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={() => { setAddingTask(false); setNewTaskText(""); }} style={{ padding: "5px 14px", borderRadius: 8, border: "1px solid #2d2d30", background: "none", color: "#6b7280", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                    <button onClick={addTask} disabled={!newTaskText.trim()} style={{ padding: "5px 14px", borderRadius: 8, border: "none", background: newTaskText.trim() ? "#6366f1" : "#1f1f22", color: newTaskText.trim() ? "#fff" : "#374151", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all 0.15s" }}>Add task</button>
                  </div>
                </div>
              </div>
            ) : (
              <button className="add-btn" style={{ marginTop: 8 }} onClick={() => setAddingTask(true)}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Add task
              </button>
            )
          )}

          {/* Completed Tasks */}
          {doneTasks.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "#374151", textTransform: "uppercase", marginBottom: 8, paddingLeft: 16 }}>Completed · {doneTasks.length}</p>
              {doneTasks.map(task => (
                <div key={task.id} className="task-row" style={{ opacity: 0.45 }}>
                  <div className="checkbox done" onClick={() => toggleDone(task.id)} style={{ cursor: "pointer" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2"><path d="M2 5l2.5 2.5L8 3"/></svg>
                  </div>
                  <p style={{ fontSize: 14, textDecoration: "line-through", color: "#4b5563", lineHeight: 1.5 }}>{task.title}</p>
                  <div className="task-actions" style={{ marginLeft: "auto" }}>
                    <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: "2px 6px", borderRadius: 6, fontSize: 16 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
