import { useState, useEffect, useRef } from "react";

// ─── PALETTE (Spotify DNA) ────────────────────────────────────────────────────
const C = {
  bg:      "#121212",
  surface: "#1e1e1e",
  elevated:"#282828",
  hover:   "#3e3e3e",
  border:  "#333",
  green:   "#1db954",
  greenHov:"#1ed760",
  white:   "#ffffff",
  muted:   "#a7a7a7",
  faint:   "#535353",
  red:     "#f15e6b",
  blue:    "#4c9aff",
  amber:   "#f59e0b",
  purple:  "#a78bfa",
};

// ─── DATA ────────────────────────────────────────────────────────────────────

const GOALS = [
  { id:"lose", label:"Lose Weight",  icon:"🔥", color: C.red,    tip:"300–500 kcal daily deficit" },
  { id:"gain", label:"Build Muscle", icon:"💪", color: C.green,  tip:"Progressive overload + surplus" },
  { id:"both", label:"Recompose",    icon:"⚡", color: C.purple, tip:"Maintenance calories, high protein" },
];

const MUSCLE_GROUPS = ["Chest","Back","Shoulders","Arms","Core","Legs","Glutes","Full Body","Cardio"];

const EXERCISES_DB = {
  Chest:      ["Bench Press","Incline DB Press","Cable Fly","Chest Dip","Push-Up"],
  Back:       ["Pull-Up","Barbell Row","Lat Pulldown","Seated Cable Row","Deadlift"],
  Shoulders:  ["Overhead Press","Lateral Raise","Front Raise","Face Pull","Arnold Press"],
  Arms:       ["Bicep Curl","Tricep Pushdown","Hammer Curl","Skull Crusher","Preacher Curl"],
  Core:       ["Plank","Hanging Leg Raise","Cable Crunch","Ab Wheel","Russian Twist"],
  Legs:       ["Squat","Romanian Deadlift","Leg Press","Leg Curl","Walking Lunge"],
  Glutes:     ["Hip Thrust","Glute Bridge","Bulgarian Split Squat","Cable Kickback","Step-Up"],
  "Full Body":["Burpee","Kettlebell Swing","Clean & Press","Thruster","Turkish Get-Up"],
  Cardio:     ["Running","Cycling","Jump Rope","HIIT Circuit","Rowing Machine"],
};

const TODAY = "2026-02-22";
const WEEK_START = "2026-02-16";

const INITIAL = {
  goal: "gain",
  profile: { weight:78.4, targetWeight:85, height:178, age:26, unit:"kg", name:"Alex" },
  streak: 12, weeklyGoal: 4,
  workouts: [
    { id:"w1", date:"2026-02-22", label:"Push Day A", group:"Chest",    duration:52, calories:385, volume:8240,
      exercises:[
        {name:"Bench Press",      sets:[{w:80,r:8},{w:80,r:8},{w:75,r:9},{w:70,r:10}]},
        {name:"Incline DB Press", sets:[{w:30,r:10},{w:30,r:10},{w:28,r:11}]},
        {name:"Cable Fly",        sets:[{w:20,r:15},{w:20,r:14},{w:20,r:13}]},
        {name:"Overhead Press",   sets:[{w:50,r:8},{w:50,r:7},{w:45,r:9}]},
      ]},
    { id:"w2", date:"2026-02-20", label:"Pull Day A", group:"Back",     duration:48, calories:340, volume:7100,
      exercises:[
        {name:"Pull-Up",       sets:[{w:0,r:10},{w:0,r:9},{w:0,r:8},{w:0,r:7}]},
        {name:"Barbell Row",   sets:[{w:70,r:8},{w:70,r:8},{w:65,r:9}]},
        {name:"Lat Pulldown",  sets:[{w:60,r:12},{w:60,r:11},{w:55,r:12}]},
      ]},
    { id:"w3", date:"2026-02-19", label:"Leg Day A",  group:"Legs",     duration:62, calories:525, volume:12800,
      exercises:[
        {name:"Squat",             sets:[{w:100,r:5},{w:100,r:5},{w:90,r:6},{w:90,r:6}]},
        {name:"Romanian Deadlift", sets:[{w:80,r:8},{w:80,r:8},{w:75,r:9}]},
        {name:"Leg Press",         sets:[{w:140,r:12},{w:140,r:12},{w:130,r:13}]},
      ]},
    {id:"w4",date:"2026-02-17",label:"Push Day B",group:"Chest",   duration:50,calories:362,volume:7800,exercises:[]},
    {id:"w5",date:"2026-02-15",label:"Cardio HIIT",group:"Cardio", duration:35,calories:490,volume:0,   exercises:[]},
    {id:"w6",date:"2026-02-14",label:"Pull Day B", group:"Back",   duration:46,calories:328,volume:6900,exercises:[]},
    {id:"w7",date:"2026-02-12",label:"Leg Day B",  group:"Legs",   duration:58,calories:512,volume:12100,exercises:[]},
    {id:"w8",date:"2026-02-10",label:"Full Body",  group:"Full Body",duration:55,calories:440,volume:5600,exercises:[]},
  ],
  weightLog:[
    {date:"2026-02-01",w:76.5},{date:"2026-02-05",w:77.0},{date:"2026-02-08",w:77.2},
    {date:"2026-02-12",w:77.8},{date:"2026-02-15",w:78.0},{date:"2026-02-18",w:78.1},{date:"2026-02-22",w:78.4},
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt1 = n => Number(n).toFixed(1);
const fmt0 = n => Math.round(Number(n));
const fmtDate = s => new Date(s+"T12:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const dayShort = s => new Date(s+"T12:00").toLocaleDateString("en-US",{weekday:"short"});
const isThisWeek = d => d >= WEEK_START && d <= TODAY;
const getGoal = id => GOALS.find(g=>g.id===id)||GOALS[0];

// ─── DONUT ────────────────────────────────────────────────────────────────────

function Donut({ pct, size=80, stroke=8, color="#1db954", children }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r;
  const dash = circ * Math.min(pct/100, 1);
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.faint} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ-dash}
          style={{transition:"stroke-dashoffset 1s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        {children}
      </div>
    </div>
  );
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────

function Sparkline({ data, color=C.green, w=120, h=32 }) {
  if (data.length < 2) return null;
  const vals = data.map(d=>d.v);
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx-mn||1;
  const pts = data.map((d,i)=>`${(i/(data.length-1))*w},${h-((d.v-mn)/rng)*h*0.85-h*0.05}`).join(" ");
  const lx=w, ly=h-((vals[vals.length-1]-mn)/rng)*h*0.85-h*0.05;
  return (
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={lx} cy={ly} r="3.5" fill={color} style={{filter:`drop-shadow(0 0 5px ${color})`}}/>
    </svg>
  );
}

// ─── LOG MODAL ────────────────────────────────────────────────────────────────

function LogModal({ onSave, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({label:"",group:"Chest",duration:45,calories:350});
  const [exs, setExs]   = useState([]);
  const [pick, setPick] = useState("Bench Press");

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  useEffect(()=>{ setPick(EXERCISES_DB[form.group][0]); },[form.group]);

  const addEx  = () => { if(!exs.find(e=>e.name===pick)) setExs(p=>[...p,{name:pick,sets:[{w:0,r:8}]}]); };
  const addSet = i  => setExs(p=>p.map((e,j)=>j===i?{...e,sets:[...e.sets,{...e.sets[e.sets.length-1]}]}:e));
  const delSet = (i,si)=>setExs(p=>p.map((e,j)=>j===i?{...e,sets:e.sets.filter((_,k)=>k!==si)}:e));
  const updSet = (i,si,f,v)=>setExs(p=>p.map((e,j)=>j===i?{...e,sets:e.sets.map((s,k)=>k===si?{...s,[f]:+v}:s)}:e));
  const delEx  = i  => setExs(p=>p.filter((_,j)=>j!==i));
  const vol    = exs.reduce((a,e)=>a+e.sets.reduce((b,s)=>b+s.w*s.r,0),0);

  const inp = {background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",fontFamily:"'Circular',sans-serif",fontSize:14,color:C.white,outline:"none",width:"100%",transition:"border-color 0.15s"};
  const Lbl = ({c}) => <label style={{fontFamily:"'Circular',sans-serif",fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:5}}>{c}</label>;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:C.surface,borderRadius:16,width:"100%",maxWidth:560,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.6)",animation:"slideUp 0.22s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h2 style={{fontFamily:"'Circular',sans-serif",fontSize:20,fontWeight:700,color:C.white}}>Log Workout</h2>
            <p style={{fontFamily:"'Circular',sans-serif",fontSize:12,color:C.muted,marginTop:2}}>Step {step} of 2</p>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"none",background:C.elevated,color:C.muted,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background=C.elevated}>×</button>
        </div>
        <div style={{overflowY:"auto",padding:"20px 24px",flex:1}}>
          {step===1 && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{gridColumn:"span 2"}}><Lbl c="Workout Name"/><input value={form.label} onChange={e=>set("label",e.target.value)} placeholder="e.g. Push Day A" style={inp} autoFocus onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/></div>
                <div><Lbl c="Muscle Group"/><select value={form.group} onChange={e=>set("group",e.target.value)} style={{...inp,appearance:"none",cursor:"pointer"}} onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}>{MUSCLE_GROUPS.map(g=><option key={g}>{g}</option>)}</select></div>
                <div><Lbl c="Duration (min)"/><input type="number" value={form.duration} onChange={e=>set("duration",+e.target.value)} style={inp} onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/></div>
                <div style={{gridColumn:"span 2"}}><Lbl c="Calories Burned"/><input type="number" value={form.calories} onChange={e=>set("calories",+e.target.value)} style={inp} onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/></div>
              </div>
              <button onClick={()=>setStep(2)} disabled={!form.label}
                style={{padding:"13px",borderRadius:50,border:"none",background:form.label?C.green:C.faint,color:form.label?"#000":C.muted,fontFamily:"'Circular',sans-serif",fontSize:14,fontWeight:700,cursor:form.label?"pointer":"default",letterSpacing:"0.04em",transition:"all 0.15s",marginTop:4}}>
                Next — Add Exercises →
              </button>
            </div>
          )}
          {step===2 && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",gap:8}}>
                <select value={pick} onChange={e=>setPick(e.target.value)} style={{...inp,flex:1,appearance:"none",cursor:"pointer"}} onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}>
                  {EXERCISES_DB[form.group].map(e=><option key={e}>{e}</option>)}
                </select>
                <button onClick={addEx} style={{padding:"9px 18px",borderRadius:50,border:"none",background:C.green,color:"#000",fontFamily:"'Circular',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>Add</button>
              </div>
              {exs.length===0 && <div style={{textAlign:"center",padding:"28px",color:C.faint,fontFamily:"'Circular',sans-serif",fontSize:13}}>Select an exercise and click Add to begin</div>}
              {exs.map((ex,ei)=>(
                <div key={ei} style={{background:C.elevated,borderRadius:10,padding:"14px",border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontFamily:"'Circular',sans-serif",fontSize:14,fontWeight:700,color:C.green}}>{ex.name}</span>
                    <button onClick={()=>delEx(ei)} style={{background:"none",border:"none",color:C.faint,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 28px",gap:6,marginBottom:8}}>
                    {["#","kg","Reps",""].map(h=><span key={h} style={{fontFamily:"'Circular',sans-serif",fontSize:10,fontWeight:700,color:C.faint,letterSpacing:"0.1em",textTransform:"uppercase"}}>{h}</span>)}
                    {ex.sets.map((s,si)=>[
                      <span key={`n${si}`} style={{fontFamily:"'Circular',sans-serif",fontSize:13,color:C.faint,alignSelf:"center"}}>{si+1}</span>,
                      <input key={`w${si}`} type="number" value={s.w} onChange={e=>updSet(ei,si,"w",e.target.value)} style={{...inp,padding:"6px 10px"}} onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>,
                      <input key={`r${si}`} type="number" value={s.r} onChange={e=>updSet(ei,si,"r",e.target.value)} style={{...inp,padding:"6px 10px"}} onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>,
                      <button key={`d${si}`} onClick={()=>delSet(ei,si)} style={{width:26,height:34,border:`1px solid ${C.border}`,borderRadius:6,background:"none",color:C.faint,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                    ])}
                  </div>
                  <button onClick={()=>addSet(ei)} style={{padding:"4px 12px",borderRadius:50,border:`1px solid ${C.border}`,background:"none",color:C.muted,fontFamily:"'Circular',sans-serif",fontSize:12,cursor:"pointer"}}>+ Set</button>
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button onClick={()=>setStep(1)} style={{flex:1,padding:"12px",borderRadius:50,border:`1px solid ${C.border}`,background:"none",color:C.muted,fontFamily:"'Circular',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.white} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>← Back</button>
                <button onClick={()=>onSave({id:`w${Date.now()}`,date:TODAY,...form,exercises:exs,volume:vol})}
                  style={{flex:2,padding:"12px",borderRadius:50,border:"none",background:C.green,color:"#000",fontFamily:"'Circular',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.greenHov} onMouseLeave={e=>e.currentTarget.style.background=C.green}>
                  Save Workout {vol>0?`· ${fmt1(vol/1000)}t vol`:""}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── WEIGHT MODAL ─────────────────────────────────────────────────────────────

function WeightModal({ log, onAdd, onClose, unit }) {
  const [val, setVal] = useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:C.surface,borderRadius:14,width:340,padding:"22px",boxShadow:"0 24px 60px rgba(0,0,0,0.5)",animation:"slideUp 0.2s ease"}} onClick={e=>e.stopPropagation()}>
        <h3 style={{fontFamily:"'Circular',sans-serif",fontSize:18,fontWeight:700,color:C.white,marginBottom:16}}>Log Weight</h3>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <input type="number" step="0.1" value={val} onChange={e=>setVal(e.target.value)} placeholder={`Weight in ${unit}`} autoFocus
            style={{flex:1,background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",fontFamily:"'Circular',sans-serif",fontSize:15,color:C.white,outline:"none",transition:"border-color 0.15s"}}
            onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}
            onKeyDown={e=>{if(e.key==="Enter"&&val){onAdd(parseFloat(val));setVal("");}}}/>
          <button onClick={()=>{if(val){onAdd(parseFloat(val));setVal("");}}}
            style={{padding:"10px 18px",borderRadius:50,border:"none",background:C.green,color:"#000",fontFamily:"'Circular',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.greenHov} onMouseLeave={e=>e.currentTarget.style.background=C.green}>Log</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:180,overflowY:"auto"}}>
          {[...log].reverse().slice(0,8).map((l,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:C.elevated,borderRadius:7}}>
              <span style={{fontFamily:"'Circular',sans-serif",fontSize:13,color:C.muted}}>{fmtDate(l.date)}</span>
              <span style={{fontFamily:"'Circular',sans-serif",fontSize:13,fontWeight:700,color:C.white}}>{l.w} {unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────

function DetailModal({ w, goal, onClose, onDelete }) {
  const g = getGoal(goal);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:C.surface,borderRadius:16,width:"100%",maxWidth:520,maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.6)",animation:"slideUp 0.2s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{fontFamily:"'Circular',sans-serif",fontSize:11,fontWeight:700,color:g.color,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{fmtDate(w.date)} · {w.group}</p>
            <h2 style={{fontFamily:"'Circular',sans-serif",fontSize:22,fontWeight:700,color:C.white}}>{w.label}</h2>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>onDelete(w.id)} style={{padding:"6px 14px",borderRadius:50,border:`1px solid ${C.red}44`,background:"transparent",color:C.red,fontFamily:"'Circular',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${C.red}22`} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Delete</button>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"none",background:C.elevated,color:C.muted,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.hover} onMouseLeave={e=>e.currentTarget.style.background=C.elevated}>×</button>
          </div>
        </div>
        <div style={{overflowY:"auto",padding:"20px 24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
            {[{l:"Duration",v:`${w.duration}m`,c:g.color},{l:"Calories",c:C.red,v:`${w.calories}`},{l:"Volume",c:C.blue,v:w.volume>0?`${fmt1(w.volume/1000)}t`:"—"}].map(s=>(
              <div key={s.l} style={{background:C.elevated,borderRadius:10,padding:"14px",textAlign:"center",border:`1px solid ${C.border}`}}>
                <p style={{fontFamily:"'Circular',sans-serif",fontSize:24,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</p>
                <p style={{fontFamily:"'Circular',sans-serif",fontSize:11,color:C.muted,marginTop:4,fontWeight:500}}>{s.l}</p>
              </div>
            ))}
          </div>
          {w.exercises?.length > 0 ? w.exercises.map((ex,ei)=>(
            <div key={ei} style={{background:C.elevated,borderRadius:10,padding:"14px",marginBottom:12,border:`1px solid ${C.border}`}}>
              <p style={{fontFamily:"'Circular',sans-serif",fontSize:14,fontWeight:700,color:g.color,marginBottom:12}}>{ex.name}</p>
              <div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 1fr",gap:6}}>
                {["Set","Weight","Reps","Vol"].map(h=><span key={h} style={{fontFamily:"'Circular',sans-serif",fontSize:10,fontWeight:700,color:C.faint,letterSpacing:"0.1em",textTransform:"uppercase"}}>{h}</span>)}
                {ex.sets.map((s,si)=>[
                  <span key={`s${si}`} style={{fontFamily:"'Circular',sans-serif",fontSize:13,color:C.faint}}>{si+1}</span>,
                  <span key={`w${si}`} style={{fontFamily:"'Circular',sans-serif",fontSize:14,fontWeight:600,color:C.white}}>{s.w}kg</span>,
                  <span key={`r${si}`} style={{fontFamily:"'Circular',sans-serif",fontSize:14,fontWeight:600,color:C.white}}>{s.r}</span>,
                  <span key={`v${si}`} style={{fontFamily:"'Circular',sans-serif",fontSize:13,color:C.muted}}>{s.w*s.r}kg</span>,
                ])}
              </div>
              <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:"'Circular',sans-serif",fontSize:12,color:C.faint}}>{ex.sets.length} sets · {ex.sets.reduce((a,s)=>a+s.r,0)} reps</span>
                <span style={{fontFamily:"'Circular',sans-serif",fontSize:12,fontWeight:700,color:g.color}}>{ex.sets.reduce((a,s)=>a+s.w*s.r,0)}kg total</span>
              </div>
            </div>
          )) : <p style={{fontFamily:"'Circular',sans-serif",color:C.faint,fontSize:14,textAlign:"center",padding:"24px 0"}}>No exercise details logged for this session.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function WorkoutDashboard() {
  const [data, setData]     = useState(()=>{try{const s=localStorage.getItem("wkdash_v3");return s?JSON.parse(s):INITIAL;}catch{return INITIAL;}});
  const [tab, setTab]       = useState("home");
  const [showLog, setShowLog] = useState(false);
  const [showWt, setShowWt]   = useState(false);
  const [detail, setDetail]   = useState(null);

  useEffect(()=>{localStorage.setItem("wkdash_v3",JSON.stringify(data));},[data]);

  const g          = getGoal(data.goal);
  const weekW      = data.workouts.filter(w=>isThisWeek(w.date));
  const wkCals     = weekW.reduce((a,w)=>a+w.calories,0);
  const wkVol      = weekW.reduce((a,w)=>a+w.volume,0);
  const wkMins     = weekW.reduce((a,w)=>a+w.duration,0);
  const curWt      = data.weightLog.at(-1)?.w||0;
  const startWt    = data.weightLog[0]?.w||curWt;
  const wtDelta    = curWt-startWt;
  const weekPct    = Math.min(weekW.length/data.weeklyGoal*100,100);
  const bmi        = curWt/Math.pow(data.profile.height/100,2);
  const bmiCat     = bmi<18.5?["Underweight",C.blue]:bmi<25?["Healthy",C.green]:bmi<30?["Overweight",C.amber]:["Obese",C.red];

  const barDays = Array.from({length:7},(_,i)=>{
    const d=new Date("2026-02-16T12:00"); d.setDate(d.getDate()+i);
    const ds=d.toISOString().slice(0,10);
    const found=data.workouts.find(w=>w.date===ds);
    return {label:dayShort(ds),cals:found?.calories||0,isToday:ds===TODAY};
  });
  const maxCals = Math.max(...barDays.map(d=>d.cals),1);

  const saveWorkout = w => {setData(p=>({...p,workouts:[w,...p.workouts],streak:p.streak+1}));setShowLog(false);};
  const delWorkout  = id => {setData(p=>({...p,workouts:p.workouts.filter(w=>w.id!==id)}));setDetail(null);};
  const logWeight   = w  => setData(p=>({...p,weightLog:[...p.weightLog,{date:TODAY,w}],profile:{...p.profile,weight:w}}));

  const sparkData = data.weightLog.map(l=>({v:l.w}));

  // Shared card style
  const card = {background:C.surface,borderRadius:12,border:`1px solid ${C.border}`};

  const NAV = [["home","Home"],["history","History"],["progress","Progress"]];

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.white,fontFamily:"'Circular', 'DM Sans', sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#535353;border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:#737373;}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        select{color-scheme:dark;} input{color-scheme:dark;}
        .row-hover:hover{background:#282828!important;} 
        .nav-link{padding:8px 16px;border-radius:50px;border:none;background:none;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.15s;color:#a7a7a7;letter-spacing:-0.01em;}
        .nav-link.on{background:#333;color:#fff;}
        .nav-link:hover:not(.on){color:#fff;}
        .goal-btn{flex:1;padding:14px 16px;border-radius:10px;cursor:pointer;text-align:left;transition:all 0.18s;border:1px solid transparent;}
        .goal-btn:hover{border-color:#535353!important;}
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={{background:"rgba(18,18,18,0.92)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:50,padding:"0 28px",height:64,display:"flex",alignItems:"center",gap:16}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginRight:8}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 0 16px ${C.green}55`}}>
            {g.icon}
          </div>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:700,color:C.white,letterSpacing:"-0.03em"}}>Forge</span>
        </div>

        {/* Nav */}
        <div style={{display:"flex",gap:2}}>
          {NAV.map(([v,l])=>(
            <button key={v} className={`nav-link ${tab===v?"on":""}`} onClick={()=>setTab(v)}>{l}</button>
          ))}
        </div>

        <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted}}>
            Hi, <strong style={{color:C.white}}>{data.profile.name}</strong>
          </span>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.green,fontWeight:700}}>🔥 {data.streak} day streak</span>

          <button onClick={()=>setShowWt(true)}
            style={{padding:"8px 16px",borderRadius:50,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.white;e.currentTarget.style.color=C.white;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
            Log Weight
          </button>
          <button onClick={()=>setShowLog(true)}
            style={{padding:"9px 22px",borderRadius:50,border:"none",background:C.green,color:"#000",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",transition:"background 0.15s",boxShadow:`0 0 20px ${C.green}44`}}
            onMouseEnter={e=>e.currentTarget.style.background=C.greenHov} onMouseLeave={e=>e.currentTarget.style.background=C.green}>
            + Log Workout
          </button>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px 56px"}}>

        {/* ── HOME ── */}
        {tab==="home" && (
          <div style={{animation:"slideUp 0.3s ease",display:"flex",flexDirection:"column",gap:18}}>

            {/* Goal selector */}
            <div style={{display:"flex",gap:10}}>
              {GOALS.map(gl=>(
                <button key={gl.id} className="goal-btn" onClick={()=>setData(d=>({...d,goal:gl.id}))}
                  style={{background:data.goal===gl.id?`${gl.color}18`:C.surface,borderColor:data.goal===gl.id?`${gl.color}66`:C.border}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:17}}>{gl.icon}</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:data.goal===gl.id?gl.color:C.muted}}>{gl.label}</span>
                    {data.goal===gl.id && <div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:gl.color,boxShadow:`0 0 8px ${gl.color}`}}/>}
                  </div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.faint,lineHeight:1.4}}>{gl.tip}</p>
                </button>
              ))}
            </div>

            {/* 4 stat cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
              {/* Workouts this week */}
              <div style={{...card,padding:"18px 20px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>This Week</p>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:38,fontWeight:700,color:C.white,lineHeight:1}}>
                      {weekW.length}<span style={{fontSize:18,color:C.faint,fontWeight:400}}>/{data.weeklyGoal}</span>
                    </p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,marginTop:3}}>workouts</p>
                  </div>
                  <Donut pct={weekPct} size={64} stroke={7} color={g.color}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:g.color}}>{fmt0(weekPct)}%</span>
                  </Donut>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {Array.from({length:data.weeklyGoal},(_,i)=>(
                    <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<weekW.length?g.color:C.faint,transition:"background 0.3s"}}/>
                  ))}
                </div>
              </div>

              {/* Calories */}
              <div style={{...card,padding:"18px 20px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Week Calories</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:34,fontWeight:700,color:C.red,lineHeight:1,marginBottom:2}}>{wkCals.toLocaleString()}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,marginBottom:12}}>kcal burned</p>
                <div style={{display:"flex",gap:3,alignItems:"flex-end",height:32}}>
                  {barDays.map((d,i)=>(
                    <div key={i} style={{flex:1,height:"100%",display:"flex",alignItems:"flex-end"}}>
                      <div style={{width:"100%",borderRadius:"2px 2px 0 0",height:`${Math.max((d.cals/maxCals)*100,d.cals>0?8:0)}%`,background:d.isToday?C.red:d.cals>0?`${C.red}77`:C.faint,transition:"height 0.6s ease"}}/>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  {barDays.map((d,i)=><span key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:d.isToday?C.white:C.faint,flex:1,textAlign:"center",fontWeight:d.isToday?700:400}}>{d.label[0]}</span>)}
                </div>
              </div>

              {/* Weight */}
              <div style={{...card,padding:"18px 20px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Current Weight</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:34,fontWeight:700,color:C.white,lineHeight:1,marginBottom:2}}>
                  {curWt}<span style={{fontSize:15,color:C.faint,fontWeight:400}}> {data.profile.unit}</span>
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:wtDelta>=0?C.green:C.red,marginBottom:12,fontWeight:600}}>
                  {wtDelta>=0?"+":""}{fmt1(wtDelta)} {data.profile.unit} since start
                </p>
                <Sparkline data={sparkData} color={C.blue} w={130} h={30}/>
              </div>

              {/* Streak */}
              <div style={{...card,padding:"18px 20px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Streak</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:38,fontWeight:700,color:C.amber,lineHeight:1,marginBottom:2}}>{data.streak} 🔥</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,marginBottom:12}}>days in a row</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                  {barDays.map((d,i)=>(
                    <div key={i} title={d.label} style={{aspectRatio:"1",borderRadius:3,background:d.cals>0?C.amber:`${C.faint}66`,transition:"background 0.3s"}}/>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle row */}
            <div style={{display:"grid",gridTemplateColumns:"1.1fr 0.9fr",gap:14}}>
              {/* Weight goal */}
              <div style={{...card,padding:"22px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:18}}>Goal Progress</p>
                <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:16}}>
                  {[
                    {sub:"Start",val:`${startWt}`,c:C.muted},
                    null,
                    {sub:"Now",val:`${curWt}`,c:g.color},
                    null,
                    {sub:"Target",val:`${data.profile.targetWeight}`,c:C.white},
                  ].map((s,i)=> s===null
                    ? <div key={i} style={{flex:1,height:1,background:C.border}}/>
                    : <div key={i} style={{padding:"0 8px",textAlign:"center"}}>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:22,fontWeight:700,color:s.c,lineHeight:1}}>{s.val}</p>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.faint,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.sub}</p>
                      </div>
                  )}
                </div>
                {(()=>{
                  const total=Math.abs(data.profile.targetWeight-startWt);
                  const done=Math.abs(curWt-startWt);
                  const pct=total>0?Math.min(done/total*100,100):0;
                  return (
                    <>
                      <div style={{height:6,background:C.faint,borderRadius:99,overflow:"hidden",marginBottom:8}}>
                        <div style={{height:"100%",width:`${pct}%`,background:g.color,borderRadius:99,boxShadow:`0 0 10px ${g.color}66`,transition:"width 1.2s ease"}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>{fmt0(pct)}% complete</span>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:g.color,fontWeight:700}}>{fmt1(Math.abs(data.profile.targetWeight-curWt))} {data.profile.unit} to go</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Body stats */}
              <div style={{...card,padding:"22px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>Body Stats</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    {l:"Height",v:`${data.profile.height} cm`,c:C.white},
                    {l:"Weight",v:`${curWt} kg`,c:C.white},
                    {l:"BMI",v:fmt1(bmi),c:bmiCat[1]},
                    {l:"Status",v:bmiCat[0],c:bmiCat[1]},
                    {l:"Week Mins",v:`${wkMins}m`,c:C.white},
                    {l:"Week Volume",v:wkVol>0?`${fmt1(wkVol/1000)}t`:"—",c:C.purple},
                  ].map(s=>(
                    <div key={s.l} style={{background:C.elevated,borderRadius:8,padding:"10px 13px"}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.faint,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{s.l}</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:700,color:s.c}}>{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent workouts */}
            <div style={{...card,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:16,fontWeight:700,color:C.white}}>Recent Workouts</h3>
                <button onClick={()=>setTab("history")} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,background:"none",border:"none",cursor:"pointer",fontWeight:600,transition:"color 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=C.white} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>View all →</button>
              </div>
              {data.workouts.slice(0,5).map((w,i)=>(
                <div key={w.id} className="row-hover" onClick={()=>setDetail(w)}
                  style={{padding:"12px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:14,cursor:"pointer",background:C.surface,transition:"background 0.12s",animation:`slideUp 0.3s ease both`,animationDelay:`${i*0.05}s`}}>
                  <div style={{width:40,height:40,borderRadius:8,background:`${g.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{g.icon}</div>
                  <div style={{flex:1}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:C.white}}>{w.label}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,marginTop:1}}>{fmtDate(w.date)} · {w.group}</p>
                  </div>
                  <div style={{display:"flex",gap:20}}>
                    {[{v:`${w.duration}m`,c:C.white},{v:`${w.calories} kcal`,c:C.red},{v:w.volume>0?`${fmt1(w.volume/1000)}t`:"—",c:C.purple}].map((s,j)=>(
                      <span key={j} style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:s.c,minWidth:60,textAlign:"right"}}>{s.v}</span>
                    ))}
                  </div>
                  <span style={{color:C.faint,fontSize:16}}>›</span>
                </div>
              ))}
              {data.workouts.length===0 && (
                <div style={{padding:"40px",textAlign:"center",color:C.faint}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14}}>No workouts yet — log your first session!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab==="history" && (
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 style={{fontFamily:"'DM Sans',sans-serif",fontSize:24,fontWeight:700,color:C.white}}>All Workouts</h2>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted}}>{data.workouts.length} sessions</span>
            </div>
            <div style={{...card,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 90px 90px 100px 90px",padding:"10px 20px",borderBottom:`1px solid ${C.border}`,background:C.elevated}}>
                {["Workout","Date","Duration","Calories","Volume"].map(h=>(
                  <span key={h} style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,color:C.faint,letterSpacing:"0.1em",textTransform:"uppercase"}}>{h}</span>
                ))}
              </div>
              {data.workouts.map((w,i)=>(
                <div key={w.id} className="row-hover" onClick={()=>setDetail(w)}
                  style={{display:"grid",gridTemplateColumns:"1fr 90px 90px 100px 90px",padding:"13px 20px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:C.surface,transition:"background 0.12s",animation:`slideUp 0.3s ease both`,animationDelay:`${i*0.04}s`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:g.color,flexShrink:0,boxShadow:`0 0 6px ${g.color}`}}/>
                    <div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:C.white}}>{w.label}</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted}}>{w.group}</p>
                    </div>
                  </div>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted,alignSelf:"center"}}>{fmtDate(w.date)}</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:C.white,alignSelf:"center"}}>{w.duration}m</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:C.red,alignSelf:"center"}}>{w.calories} kcal</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:C.purple,alignSelf:"center"}}>{w.volume>0?`${fmt1(w.volume/1000)}t`:"—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROGRESS ── */}
        {tab==="progress" && (
          <div style={{animation:"slideUp 0.3s ease",display:"flex",flexDirection:"column",gap:18}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {[
                {l:"Total Workouts",v:data.workouts.length,icon:"🏋️",c:g.color},
                {l:"Total Calories",v:`${data.workouts.reduce((a,w)=>a+w.calories,0).toLocaleString()} kcal`,icon:"🔥",c:C.red},
                {l:"Total Volume",v:`${fmt1(data.workouts.reduce((a,w)=>a+w.volume,0)/1000)} t`,icon:"💪",c:C.purple},
                {l:"Avg Duration",v:`${fmt0(data.workouts.reduce((a,w)=>a+w.duration,0)/Math.max(data.workouts.length,1))} min`,icon:"⏱",c:C.blue},
                {l:"Avg Calories",v:`${fmt0(data.workouts.reduce((a,w)=>a+w.calories,0)/Math.max(data.workouts.length,1))} kcal`,icon:"⚡",c:C.amber},
                {l:"Best Streak",v:`${data.streak} days`,icon:"🔥",c:C.amber},
              ].map((s,i)=>(
                <div key={i} style={{...card,padding:"18px 20px",display:"flex",alignItems:"center",gap:14,animation:`slideUp 0.3s ease both`,animationDelay:`${i*0.06}s`}}>
                  <span style={{fontSize:26}}>{s.icon}</span>
                  <div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:22,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,marginTop:3}}>{s.l}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Muscle freq */}
            <div style={{...card,padding:"22px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:16}}>Muscle Group Frequency</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {MUSCLE_GROUPS.map(mg=>{
                  const cnt=data.workouts.filter(w=>w.group===mg).length;
                  const max=Math.max(...MUSCLE_GROUPS.map(m=>data.workouts.filter(w=>w.group===m).length),1);
                  return (
                    <div key={mg} style={{background:C.elevated,borderRadius:8,padding:"11px 14px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:C.white}}>{mg}</span>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:g.color}}>{cnt}×</span>
                      </div>
                      <div style={{height:4,background:C.faint,borderRadius:99,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${(cnt/max)*100}%`,background:g.color,borderRadius:99,boxShadow:`0 0 6px ${g.color}55`,transition:"width 1s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weight chart */}
            <div style={{...card,padding:"22px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>Weight History</p>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:wtDelta>=0?C.green:C.red}}>{wtDelta>=0?"+":""}{fmt1(wtDelta)} {data.profile.unit} total</span>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
                {data.weightLog.map((l,i)=>{
                  const mn=Math.min(...data.weightLog.map(x=>x.w));
                  const mx=Math.max(...data.weightLog.map(x=>x.w));
                  const pct=mx>mn?(l.w-mn)/(mx-mn):0.5;
                  return (
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.muted}}>{l.w}</span>
                      <div style={{width:"100%",height:80,background:C.elevated,borderRadius:"6px 6px 0 0",display:"flex",alignItems:"flex-end",overflow:"hidden"}}>
                        <div style={{width:"100%",height:`${15+pct*85}%`,background:`linear-gradient(180deg,${C.blue},#2563eb)`,borderRadius:"4px 4px 0 0",boxShadow:`0 0 10px ${C.blue}44`,transition:"height 0.8s ease"}}/>
                      </div>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.faint}}>{fmtDate(l.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showLog && <LogModal onSave={saveWorkout} onClose={()=>setShowLog(false)}/>}
      {showWt  && <WeightModal log={data.weightLog} onAdd={w=>{logWeight(w);}} onClose={()=>setShowWt(false)} unit={data.profile.unit}/>}
      {detail  && <DetailModal w={detail} goal={data.goal} onClose={()=>setDetail(null)} onDelete={delWorkout}/>}
    </div>
  );
}
