import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CATEGORIES = ["Breakfast","Lunch","Dinner","Dessert","Drinks","Vegetarian"];
const DIFFICULTIES = ["Easy","Medium","Hard"];
const CUISINES = ["Italian","Mexican","Asian","American","Mediterranean","Indian","French","Middle Eastern","Japanese","Other"];

const USERS = [
  { id: "u1", name: "Sofia Martínez", avatar: "SM", color: "#e07a5f" },
  { id: "u2", name: "James Chen",     avatar: "JC", color: "#3d405b" },
  { id: "u3", name: "Aisha Patel",    avatar: "AP", color: "#81b29a" },
  { id: "u4", name: "Tom Eriksson",   avatar: "TE", color: "#f2cc8f" },
];

const ME = USERS[0];

const SAMPLE_RECIPES = [
  {
    id: "r1", authorId: "u2", shared: true,
    title: "Miso Butter Ramen",
    description: "A soul-warming bowl of rich miso broth with hand-pulled noodles, soft-boiled eggs and crispy garlic.",
    category: "Dinner", cuisine: "Japanese", difficulty: "Medium",
    prepTime: 20, cookTime: 40, servings: 2,
    tags: ["comfort food","noodles","Japanese"],
    emoji: "🍜",
    ingredients: [
      "200g ramen noodles","2 tbsp white miso paste","2 tbsp unsalted butter",
      "4 cups chicken broth","2 soft-boiled eggs","100g chashu pork",
      "2 sheets nori","1 tbsp sesame oil","Spring onions to serve","Sesame seeds",
    ],
    steps: [
      "Bring broth to a simmer and whisk in miso paste until fully dissolved.",
      "In a separate pan, melt butter over medium heat and fry garlic for 2 minutes.",
      "Cook ramen noodles according to package instructions, drain and set aside.",
      "Add garlic butter and sesame oil to the broth, stir well.",
      "Divide noodles into bowls, ladle over the hot broth.",
      "Top with sliced chashu, halved soft-boiled eggs, nori and spring onions.",
    ],
    likes: ["u1","u3"],
    savedBy: ["u1"],
    comments: [{ id: "c1", userId: "u1", text: "Made this last night — absolutely incredible! The miso butter is genius.", date: "2026-02-21" }],
    createdAt: "2026-02-19",
  },
  {
    id: "r2", authorId: "u3", shared: true,
    title: "Cardamom Rose Cake",
    description: "A fragrant Persian-inspired layer cake with cardamom sponge, rose water cream and crushed pistachios.",
    category: "Baking", cuisine: "Middle Eastern", difficulty: "Hard",
    prepTime: 45, cookTime: 35, servings: 8,
    tags: ["cake","floral","celebration"],
    emoji: "🌹",
    ingredients: [
      "2 cups all-purpose flour","1½ cups sugar","3 eggs","½ cup rose water",
      "1 tsp cardamom","1 tsp baking powder","200ml heavy cream",
      "2 tbsp powdered sugar","Pistachios","Dried rose petals",
    ],
    steps: [
      "Preheat oven to 175°C. Grease and line two 20cm round tins.",
      "Cream butter and sugar until pale, then beat in eggs one at a time.",
      "Fold in flour, cardamom and baking powder alternating with rose water.",
      "Bake for 35 minutes or until a skewer comes out clean. Cool completely.",
      "Whip cream with powdered sugar to soft peaks, fold in remaining rose water.",
      "Layer and frost the cake, then decorate with pistachios and rose petals.",
    ],
    likes: ["u1","u2","u4"],
    savedBy: ["u1","u2"],
    comments: [],
    createdAt: "2026-02-20",
  },
  {
    id: "r3", authorId: "u1", shared: true,
    title: "Smoky Shakshuka",
    description: "Eggs poached in a smoky tomato and pepper sauce with feta, fresh herbs and warm pita.",
    category: "Breakfast", cuisine: "Middle Eastern", difficulty: "Easy",
    prepTime: 10, cookTime: 25, servings: 4,
    tags: ["eggs","one-pan","vegetarian"],
    emoji: "🍳",
    ingredients: [
      "6 eggs","400g crushed tomatoes","2 red peppers","1 onion",
      "3 garlic cloves","1 tsp cumin","1 tsp smoked paprika","½ tsp chilli flakes",
      "100g feta cheese","Fresh parsley","Olive oil","Warm pita to serve",
    ],
    steps: [
      "Heat olive oil in a large skillet. Sauté onion and peppers until softened.",
      "Add garlic, cumin, paprika and chilli. Cook for 1 minute until fragrant.",
      "Pour in crushed tomatoes, season and simmer for 10 minutes.",
      "Make wells in the sauce and crack in the eggs.",
      "Cover and cook for 8–10 minutes until whites are set but yolks still soft.",
      "Crumble over feta, scatter parsley and serve straight from the pan with pita.",
    ],
    likes: ["u2","u3"],
    savedBy: ["u3"],
    comments: [{ id: "c2", userId: "u4", text: "Added some harissa for extra kick — highly recommend!", date: "2026-02-22" }],
    createdAt: "2026-02-18",
  },
  {
    id: "r4", authorId: "u4", shared: true,
    title: "Brown Butter Pasta",
    description: "Ridiculously simple weeknight pasta with nutty brown butter, sage, crispy capers and parmesan.",
    category: "Dinner", cuisine: "Italian", difficulty: "Easy",
    prepTime: 5, cookTime: 20, servings: 2,
    tags: ["pasta","quick","sage"],
    emoji: "🍝",
    ingredients: [
      "200g pappardelle","80g unsalted butter","10 fresh sage leaves",
      "2 tbsp capers","50g parmesan","Salt and black pepper","Lemon zest",
    ],
    steps: [
      "Cook pasta in generously salted boiling water. Reserve 1 cup pasta water.",
      "Melt butter in a wide pan over medium heat until it turns golden and smells nutty.",
      "Add sage leaves — they'll crisp immediately. Remove and set aside.",
      "Add capers to the brown butter and fry until crispy, about 2 minutes.",
      "Toss drained pasta in the pan, adding pasta water to loosen into a sauce.",
      "Plate up topped with crispy sage, shaved parmesan and a grate of lemon zest.",
    ],
    likes: ["u1","u3","u2"],
    savedBy: ["u1","u2","u3"],
    comments: [],
    createdAt: "2026-02-21",
  },
  {
    id: "r5", authorId: "u1", shared: false,
    title: "Mum's Lemon Tart",
    description: "Classic French tarte au citron with a buttery pâte sablée shell and silky lemon curd filling.",
    category: "Dessert", cuisine: "French", difficulty: "Hard",
    prepTime: 60, cookTime: 30, servings: 8,
    tags: ["tart","citrus","French"],
    emoji: "🍋",
    ingredients: [
      "200g plain flour","100g butter","50g icing sugar","2 egg yolks",
      "3 lemons (zest and juice)","150g caster sugar","3 eggs","150ml double cream",
    ],
    steps: [
      "Make pastry: rub butter into flour and icing sugar until breadcrumbs. Mix in egg yolks.",
      "Chill dough 30 mins, then roll and line a 23cm tart tin. Blind bake at 180°C for 15 mins.",
      "Whisk lemon zest, juice, sugar, eggs and cream until combined.",
      "Pour filling into hot pastry case and bake at 150°C for 25–30 mins until just set.",
      "Cool completely before removing from tin. Dust with icing sugar to serve.",
    ],
    likes: [],
    savedBy: [],
    comments: [],
    createdAt: "2026-02-15",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getUser(id) { return USERS.find(u => u.id === id) || USERS[0]; }
function timeAgo(dateStr) {
  const d = Math.floor((new Date("2026-02-22") - new Date(dateStr)) / 86400000);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`;
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────

function Avatar({ userId, size = 32 }) {
  const u = getUser(userId);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Libre Baskerville', serif", fontSize: size * 0.36, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: 0 }}>
      {u.avatar}
    </div>
  );
}

// ─── RECIPE CARD ─────────────────────────────────────────────────────────────

function RecipeCard({ recipe, onClick, onLike, onSave, currentUserId }) {
  const author = getUser(recipe.authorId);
  const isLiked = recipe.likes.includes(currentUserId);
  const isSaved = recipe.savedBy.includes(currentUserId);
  const isOwn   = recipe.authorId === currentUserId;

  return (
    <div onClick={() => onClick(recipe)} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "1px solid #ede8df", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} className="recipe-card">
      {/* Emoji banner */}
      <div style={{ height: 110, background: `linear-gradient(135deg, ${author.color}22, ${author.color}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative", borderBottom: "1px solid #ede8df" }}>
        {recipe.emoji}
        {!recipe.shared && (
          <div style={{ position: "absolute", top: 10, right: 10, background: "#1a1008", borderRadius: 20, padding: "3px 10px", fontFamily: "'Libre Baskerville', serif", fontSize: 10, color: "#f0ebe1", letterSpacing: "0.06em" }}>PRIVATE</div>
        )}
        <div style={{ position: "absolute", bottom: 10, left: 12, background: author.color, borderRadius: 20, padding: "3px 10px", fontFamily: "'Work Sans', sans-serif", fontSize: 11, color: "#fff", fontWeight: 600 }}>
          {recipe.category}
        </div>
      </div>

      <div style={{ padding: "14px 16px 12px" }}>
        <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 700, color: "#1a1008", lineHeight: 1.3, marginBottom: 6 }}>{recipe.title}</h3>
        <p style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 12, color: "#9c8970", lineHeight: 1.5, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{recipe.description}</p>

        {/* Meta row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          {[
            { icon: "⏱", val: `${recipe.prepTime + recipe.cookTime}m` },
            { icon: "👥", val: `${recipe.servings} servings` },
            { icon: "📊", val: recipe.difficulty },
          ].map(m => (
            <span key={m.val} style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 11, color: "#7a5c40", background: "#f7f2eb", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
              {m.icon} {m.val}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Avatar userId={recipe.authorId} size={26} />
            <span style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 12, color: "#9c8970" }}>{isOwn ? "You" : author.name.split(" ")[0]}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => onSave(recipe.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: isSaved ? 1 : 0.4, transition: "opacity 0.15s" }} title={isSaved ? "Unsave" : "Save"}>🔖</button>
            <button onClick={() => onLike(recipe.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 14, color: isLiked ? "#e07a5f" : "#9c8970", transition: "color 0.15s" }}>
              {isLiked ? "❤️" : "🤍"} <span style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 12 }}>{recipe.likes.length}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RECIPE DETAIL MODAL ─────────────────────────────────────────────────────

function RecipeModal({ recipe, onClose, onLike, onSave, onAddComment, onDelete, currentUserId }) {
  const [comment, setComment] = useState("");
  const author  = getUser(recipe.authorId);
  const isLiked = recipe.likes.includes(currentUserId);
  const isSaved = recipe.savedBy.includes(currentUserId);
  const isOwn   = recipe.authorId === currentUserId;
  const [servMult, setServMult] = useState(1);

  const submit = () => { if (!comment.trim()) return; onAddComment(recipe.id, comment.trim()); setComment(""); };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,16,8,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#fdf9f4", borderRadius: 20, width: "100%", maxWidth: 720, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", border: "1px solid #ede8df", animation: "modalIn 0.2s ease" }} onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div style={{ background: `linear-gradient(135deg, ${author.color}28, ${author.color}55)`, padding: "24px 28px 20px", borderBottom: "1px solid #ede8df", flexShrink: 0, position: "relative" }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>{recipe.emoji}</div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 700, color: "#1a1008", lineHeight: 1.2, marginBottom: 6 }}>{recipe.title}</h2>
          <p style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 14, color: "#7a5c40", lineHeight: 1.6, maxWidth: 540 }}>{recipe.description}</p>

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
            {[recipe.category, recipe.cuisine, recipe.difficulty].map(t => (
              <span key={t} style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.5)", color: "#5a3820", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.6)" }}>{t}</span>
            ))}
            {recipe.tags.map(t => (
              <span key={t} style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 11, color: "#9c8970", background: "rgba(255,255,255,0.3)", padding: "3px 9px", borderRadius: 20 }}>#{t}</span>
            ))}
          </div>

          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.6)", color: "#5a3820", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* Stats bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #ede8df", background: "#fff" }}>
            {[
              { icon: "🕐", label: "Prep", val: `${recipe.prepTime}m` },
              { icon: "🍳", label: "Cook", val: `${recipe.cookTime}m` },
              { icon: "⏱", label: "Total", val: `${recipe.prepTime + recipe.cookTime}m` },
              { icon: "👥", label: "Serves", val: `${recipe.servings * servMult}` },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, padding: "12px 8px", textAlign: "center", borderRight: "1px solid #ede8df" }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 700, color: "#1a1008", marginTop: 2 }}>{s.val}</div>
                <div style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 11, color: "#9c8970" }}>{s.label}</div>
              </div>
            ))}
            {/* Serving multiplier */}
            <div style={{ flex: 1, padding: "12px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <button onClick={() => setServMult(m => Math.max(0.5, m - 0.5))} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #ddd0b8", background: "none", cursor: "pointer", fontSize: 14, color: "#9c8970" }}>−</button>
              <span style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 12, color: "#7a5c40", minWidth: 28, textAlign: "center" }}>{servMult}×</span>
              <button onClick={() => setServMult(m => m + 0.5)} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #ddd0b8", background: "none", cursor: "pointer", fontSize: 14, color: "#9c8970" }}>+</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 0 }}>
            {/* Ingredients */}
            <div style={{ padding: "20px 24px", borderRight: "1px solid #ede8df" }}>
              <h4 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: "#1a1008", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>🛒 Ingredients</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontFamily: "'Work Sans', sans-serif", fontSize: 13, color: "#5a3820", lineHeight: 1.5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: author.color, flexShrink: 0, marginTop: 6 }} />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div style={{ padding: "20px 24px" }}>
              <h4 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: "#1a1008", marginBottom: 14 }}>📋 Method</h4>
              <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                {recipe.steps.map((step, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: author.color, color: "#fff", fontFamily: "'Libre Baskerville', serif", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <p style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 13, color: "#5a3820", lineHeight: 1.7 }}>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Comments + actions */}
          <div style={{ borderTop: "1px solid #ede8df", padding: "20px 24px" }}>
            {/* Action row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Avatar userId={recipe.authorId} size={28} />
                <span style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 13, color: "#7a5c40" }}>{isOwn ? "Your recipe" : `By ${author.name}`}</span>
                <span style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 11, color: "#c4b099", marginLeft: 4 }}>{timeAgo(recipe.createdAt)}</span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={() => onSave(recipe.id)} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${isSaved ? "#e07a5f" : "#ddd0b8"}`, background: isSaved ? "#fdf0eb" : "#fff", color: isSaved ? "#e07a5f" : "#9c8970", fontFamily: "'Work Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                  {isSaved ? "🔖 Saved" : "🔖 Save"}
                </button>
                <button onClick={() => onLike(recipe.id)} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${isLiked ? "#e07a5f" : "#ddd0b8"}`, background: isLiked ? "#fdf0eb" : "#fff", color: isLiked ? "#e07a5f" : "#9c8970", fontFamily: "'Work Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                  {isLiked ? "❤️" : "🤍"} {recipe.likes.length}
                </button>
                {isOwn && (
                  <button onClick={() => onDelete(recipe.id)} style={{ padding: "7px 16px", borderRadius: 20, border: "1px solid #fecaca", background: "#fff5f5", color: "#dc2626", fontFamily: "'Work Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Comments */}
            <h4 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 700, color: "#1a1008", marginBottom: 12 }}>Comments ({recipe.comments.length})</h4>
            {recipe.comments.map(c => (
              <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <Avatar userId={c.userId} size={30} />
                <div style={{ background: "#fff", borderRadius: 12, padding: "10px 14px", flex: 1, border: "1px solid #ede8df" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#5a3820" }}>{getUser(c.userId).name}</span>
                    <span style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 11, color: "#c4b099" }}>{timeAgo(c.date)}</span>
                  </div>
                  <p style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 13, color: "#7a5c40", lineHeight: 1.5 }}>{c.text}</p>
                </div>
              </div>
            ))}

            {/* Comment input */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Avatar userId={currentUserId} size={30} />
              <div style={{ flex: 1, display: "flex", gap: 8 }}>
                <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
                  placeholder="Share a thought or tip…"
                  style={{ flex: 1, padding: "9px 14px", borderRadius: 20, border: "1.5px solid #ddd0b8", fontFamily: "'Work Sans', sans-serif", fontSize: 13, color: "#5a3820", outline: "none", background: "#fff", transition: "border-color 0.15s" }}
                  onFocus={e => e.target.style.borderColor = "#e07a5f"} onBlur={e => e.target.style.borderColor = "#ddd0b8"} />
                <button onClick={submit} disabled={!comment.trim()} style={{ padding: "9px 18px", borderRadius: 20, border: "none", background: comment.trim() ? "#e07a5f" : "#ede8df", color: comment.trim() ? "#fff" : "#c4b099", fontFamily: "'Work Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>Post</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NEW RECIPE FORM ─────────────────────────────────────────────────────────

function NewRecipeForm({ onSave, onClose, currentUserId }) {
  const [form, setForm] = useState({ title: "", description: "", category: "Dinner", cuisine: "Italian", difficulty: "Easy", prepTime: 15, cookTime: 30, servings: 4, emoji: "🍽️", tags: "", shared: true, ingredients: ["","",""], steps: ["",""] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateIngredient = (i, v) => { const a = [...form.ingredients]; a[i] = v; set("ingredients", a); };
  const updateStep = (i, v)       => { const a = [...form.steps]; a[i] = v; set("steps", a); };

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      id: `r${Date.now()}`, authorId: currentUserId, shared: form.shared,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      ingredients: form.ingredients.filter(Boolean),
      steps: form.steps.filter(Boolean),
      likes: [], savedBy: [], comments: [],
      createdAt: "2026-02-22",
    });
  };

  const Label = ({ children }) => <label style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#9c8970", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{children}</label>;
  const inp = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #ddd0b8", fontFamily: "'Work Sans', sans-serif", fontSize: 13, color: "#5a3820", outline: "none", background: "#fff", transition: "border-color 0.15s" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,16,8,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#fdf9f4", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid #ede8df", boxShadow: "0 32px 80px rgba(0,0,0,0.2)", animation: "modalIn 0.2s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #ede8df", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", flexShrink: 0 }}>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: "#1a1008" }}>New Recipe</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #ddd0b8", background: "none", color: "#9c8970", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Emoji + Title */}
          <div style={{ display: "flex", gap: 12 }}>
            <div>
              <Label>Emoji</Label>
              <input value={form.emoji} onChange={e => set("emoji", e.target.value)} style={{ ...inp, width: 60, textAlign: "center", fontSize: 22 }} />
            </div>
            <div style={{ flex: 1 }}>
              <Label>Title *</Label>
              <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Recipe name…" style={inp} autoFocus />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} placeholder="Brief description…" style={{ ...inp, resize: "vertical", lineHeight: 1.6 }} />
          </div>

          {/* Grid fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><Label>Category</Label><select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...inp, appearance: "none", cursor: "pointer" }}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><Label>Cuisine</Label><select value={form.cuisine} onChange={e => set("cuisine", e.target.value)} style={{ ...inp, appearance: "none", cursor: "pointer" }}>{CUISINES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><Label>Difficulty</Label><select value={form.difficulty} onChange={e => set("difficulty", e.target.value)} style={{ ...inp, appearance: "none", cursor: "pointer" }}>{DIFFICULTIES.map(d => <option key={d}>{d}</option>)}</select></div>
            <div><Label>Prep (mins)</Label><input type="number" value={form.prepTime} onChange={e => set("prepTime", +e.target.value)} style={inp} /></div>
            <div><Label>Cook (mins)</Label><input type="number" value={form.cookTime} onChange={e => set("cookTime", +e.target.value)} style={inp} /></div>
            <div><Label>Servings</Label><input type="number" value={form.servings} onChange={e => set("servings", +e.target.value)} style={inp} /></div>
          </div>

          {/* Tags */}
          <div><Label>Tags (comma-separated)</Label><input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="e.g. quick, vegetarian, comfort food" style={inp} /></div>

          {/* Ingredients */}
          <div>
            <Label>Ingredients</Label>
            {form.ingredients.map((ing, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <input value={ing} onChange={e => updateIngredient(i, e.target.value)} placeholder={`Ingredient ${i + 1}`} style={{ ...inp, flex: 1, marginBottom: 0 }} />
                {form.ingredients.length > 1 && <button onClick={() => set("ingredients", form.ingredients.filter((_, j) => j !== i))} style={{ width: 32, borderRadius: 8, border: "1px solid #fecaca", background: "#fff5f5", color: "#dc2626", cursor: "pointer", fontSize: 16 }}>×</button>}
              </div>
            ))}
            <button onClick={() => set("ingredients", [...form.ingredients, ""])} style={{ padding: "6px 14px", borderRadius: 8, border: "1px dashed #ddd0b8", background: "none", color: "#9c8970", fontFamily: "'Work Sans', sans-serif", fontSize: 12, cursor: "pointer" }}>+ Add ingredient</button>
          </div>

          {/* Steps */}
          <div>
            <Label>Steps</Label>
            {form.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#e07a5f", color: "#fff", fontFamily: "'Libre Baskerville', serif", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 8 }}>{i + 1}</span>
                <textarea value={step} onChange={e => updateStep(i, e.target.value)} rows={2} placeholder={`Step ${i + 1}…`} style={{ ...inp, flex: 1, resize: "vertical", lineHeight: 1.6 }} />
                {form.steps.length > 1 && <button onClick={() => set("steps", form.steps.filter((_, j) => j !== i))} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fecaca", background: "#fff5f5", color: "#dc2626", cursor: "pointer", fontSize: 16, marginTop: 6, flexShrink: 0 }}>×</button>}
              </div>
            ))}
            <button onClick={() => set("steps", [...form.steps, ""])} style={{ padding: "6px 14px", borderRadius: 8, border: "1px dashed #ddd0b8", background: "none", color: "#9c8970", fontFamily: "'Work Sans', sans-serif", fontSize: 12, cursor: "pointer" }}>+ Add step</button>
          </div>

          {/* Sharing toggle + save */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #ede8df" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div onClick={() => set("shared", !form.shared)} style={{ width: 44, height: 24, borderRadius: 12, background: form.shared ? "#e07a5f" : "#ddd0b8", position: "relative", transition: "background 0.2s", cursor: "pointer" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: form.shared ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
              <span style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 13, color: "#7a5c40", fontWeight: 600 }}>{form.shared ? "🌍 Share with community" : "🔒 Keep private"}</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid #ddd0b8", background: "#fff", color: "#9c8970", fontFamily: "'Work Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} disabled={!form.title.trim()} style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: form.title.trim() ? "#e07a5f" : "#ede8df", color: form.title.trim() ? "#fff" : "#c4b099", fontFamily: "'Work Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>Save Recipe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function RecipeTracker() {
  const [recipes, setRecipes] = useState(() => {
    try {
      const saved = window.storage ? null : null; // Will use effect
      return SAMPLE_RECIPES;
    } catch { return SAMPLE_RECIPES; }
  });

  const [currentUser, setCurrentUser] = useState(ME.id);
  const [view, setView]     = useState("discover"); // discover | myrecipes | saved
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState(null);
  const [filterDiff, setFilterDiff] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from persistent storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get("recipes_v3", true);
        if (result?.value) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed) && parsed.length > 0) setRecipes(parsed);
        }
      } catch (e) { /* use sample data */ }
      setLoading(false);
    };
    loadData();
  }, []);

  // Save to persistent storage on change
  useEffect(() => {
    if (loading) return;
    const save = async () => {
      try { await window.storage.set("recipes_v3", JSON.stringify(recipes), true); } catch (e) {}
    };
    save();
  }, [recipes, loading]);

  const toggleLike = (id) => {
    setRecipes(prev => prev.map(r => {
      if (r.id !== id) return r;
      const liked = r.likes.includes(currentUser);
      return { ...r, likes: liked ? r.likes.filter(u => u !== currentUser) : [...r.likes, currentUser] };
    }));
    if (selected?.id === id) setSelected(prev => {
      if (!prev) return null;
      const liked = prev.likes.includes(currentUser);
      return { ...prev, likes: liked ? prev.likes.filter(u => u !== currentUser) : [...prev.likes, currentUser] };
    });
  };

  const toggleSave = (id) => {
    setRecipes(prev => prev.map(r => {
      if (r.id !== id) return r;
      const saved = r.savedBy.includes(currentUser);
      return { ...r, savedBy: saved ? r.savedBy.filter(u => u !== currentUser) : [...r.savedBy, currentUser] };
    }));
  };

  const addComment = (id, text) => {
    const newComment = { id: `c${Date.now()}`, userId: currentUser, text, date: "2026-02-22" };
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, comments: [...r.comments, newComment] } : r));
    setSelected(prev => prev?.id === id ? { ...prev, comments: [...prev.comments, newComment] } : prev);
  };

  const addRecipe = (recipe) => {
    setRecipes(prev => [recipe, ...prev]);
    setShowForm(false);
  };

  const deleteRecipe = (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setSelected(null);
  };

  const user = getUser(currentUser);

  const visibleRecipes = recipes.filter(r => {
    if (view === "myrecipes") return r.authorId === currentUser;
    if (view === "saved")     return r.savedBy.includes(currentUser);
    return r.shared; // discover — only shared
  }).filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.tags.some(t => t.includes(q)) || r.description.toLowerCase().includes(q);
    const matchCat  = !filterCat  || r.category === filterCat;
    const matchDiff = !filterDiff || r.difficulty === filterDiff;
    return matchSearch && matchCat && matchDiff;
  });

  const myCount    = recipes.filter(r => r.authorId === currentUser).length;
  const savedCount = recipes.filter(r => r.savedBy.includes(currentUser)).length;

  return (
    <div style={{ background: "#f7f2eb", minHeight: "100vh", minWidth:'100vw', fontFamily: "'Work Sans', sans-serif", color: "#1a1008" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #f0ebe1; } ::-webkit-scrollbar-thumb { background: #d4c9b4; border-radius: 3px; }
        .recipe-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        select, input, textarea { font-family: 'Work Sans', sans-serif; }
        select:focus, input:focus, textarea:focus { border-color: #e07a5f !important; box-shadow: 0 0 0 3px rgba(224,122,95,0.1); }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ede8df", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 64, gap: 20 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 26 }}>🍴</span>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: "#1a1008", letterSpacing: "-0.02em" }}>Recipeé</h1>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 4, marginLeft: 16 }}>
            {[
              { id: "discover",   label: "Discover", count: null },
              { id: "myrecipes",  label: "My Recipes", count: myCount },
              { id: "saved",      label: "Saved", count: savedCount },
            ].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: view === v.id ? "#fdf0eb" : "none", color: view === v.id ? "#e07a5f" : "#9c8970", fontFamily: "'Work Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
                {v.label}
                {v.count !== null && v.count > 0 && <span style={{ background: view === v.id ? "#e07a5f" : "#ede8df", color: view === v.id ? "#fff" : "#9c8970", borderRadius: 10, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>{v.count}</span>}
              </button>
            ))}
          </nav>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 280, display: "flex", alignItems: "center", gap: 8, background: "#f7f2eb", borderRadius: 20, padding: "8px 14px", border: "1px solid #ede8df" }}>
            <svg width="14" height="14" fill="none" stroke="#9c8970" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search recipes…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: "none", border: "none", outline: "none", fontFamily: "'Work Sans', sans-serif", fontSize: 13, color: "#5a3820", width: "100%" }} />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            {/* User switcher */}
            <div style={{ display: "flex", gap: 4 }}>
              {USERS.map(u => (
                <button key={u.id} onClick={() => setCurrentUser(u.id)} title={`Switch to ${u.name}`} style={{ width: 32, height: 32, borderRadius: "50%", background: u.color, border: currentUser === u.id ? `2px solid ${u.color}` : "2px solid transparent", cursor: "pointer", fontFamily: "'Libre Baskerville', serif", fontSize: 11, fontWeight: 700, color: "#fff", transition: "all 0.15s", outline: currentUser === u.id ? `2px solid #fff` : "none", outlineOffset: 1 }}>
                  {u.avatar}
                </button>
              ))}
            </div>

            <span style={{ fontSize: 12, color: "#9c8970" }}>as <strong style={{ color: "#5a3820" }}>{user.name.split(" ")[0]}</strong></span>

            <button onClick={() => setShowForm(true)} style={{ padding: "9px 20px", borderRadius: 20, border: "none", background: "#e07a5f", color: "#fff", fontFamily: "'Work Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(224,122,95,0.35)", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#c96845"}
              onMouseLeave={e => e.currentTarget.style.background = "#e07a5f"}>
              + New Recipe
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ borderTop: "1px solid #ede8df", padding: "8px 24px", display: "flex", gap: 6, overflowX: "auto", maxWidth: 1200, margin: "0 auto" }}>
          <button onClick={() => setFilterCat(null)} style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${!filterCat ? "#e07a5f" : "#ede8df"}`, background: !filterCat ? "#fdf0eb" : "none", color: !filterCat ? "#e07a5f" : "#9c8970", fontFamily: "'Work Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCat(f => f === c ? null : c)} style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${filterCat === c ? "#e07a5f" : "#ede8df"}`, background: filterCat === c ? "#fdf0eb" : "none", color: filterCat === c ? "#e07a5f" : "#9c8970", fontFamily: "'Work Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>{c}</button>
          ))}
          <div style={{ width: 1, background: "#ede8df", margin: "0 6px", flexShrink: 0 }} />
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setFilterDiff(f => f === d ? null : d)} style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${filterDiff === d ? "#3d405b" : "#ede8df"}`, background: filterDiff === d ? "#eef" : "none", color: filterDiff === d ? "#3d405b" : "#9c8970", fontFamily: "'Work Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>{d}</button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {/* Section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, fontWeight: 700, color: "#1a1008", letterSpacing: "-0.02em" }}>
            {view === "discover" ? "Community Recipes" : view === "myrecipes" ? "My Recipes" : "Saved Recipes"}
          </h2>
          <span style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 13, color: "#9c8970" }}>{visibleRecipes.length} recipe{visibleRecipes.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9c8970" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🍳</div>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontStyle: "italic" }}>Loading recipes…</p>
          </div>
        ) : visibleRecipes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: "#9c8970", fontStyle: "italic" }}>No recipes found</p>
            <p style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 14, color: "#c4b099", marginTop: 8 }}>
              {view === "myrecipes" ? "Create your first recipe with the button above!" : view === "saved" ? "Save some recipes to find them here." : "Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
            {visibleRecipes.map((r, i) => (
              <div key={r.id} style={{ animation: `fadeUp 0.3s ease both`, animationDelay: `${i * 0.05}s` }}>
                <RecipeCard recipe={r} onClick={setSelected} onLike={toggleLike} onSave={toggleSave} currentUserId={currentUser} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <RecipeModal
          recipe={recipes.find(r => r.id === selected.id) || selected}
          onClose={() => setSelected(null)}
          onLike={toggleLike}
          onSave={toggleSave}
          onAddComment={addComment}
          onDelete={deleteRecipe}
          currentUserId={currentUser}
        />
      )}

      {/* ── NEW RECIPE FORM ── */}
      {showForm && <NewRecipeForm onSave={addRecipe} onClose={() => setShowForm(false)} currentUserId={currentUser} />}
    </div>
  );
}
