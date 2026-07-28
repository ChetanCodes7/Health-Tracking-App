import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, ResponsiveContainer, BarChart, Bar,
  XAxis, Tooltip, PieChart, Pie, Cell,
} from "recharts";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  orange:  "#f4622a",
  orangeL: "#ff8c5a",
  red:     "#ff375f",
  green:   "#30d158",
  blue:    "#32ade6",
  purple:  "#bf5af2",
  text:    "#1a1a1a",
  sub:     "#8a8a8a",
  border:  "rgba(0,0,0,0.07)",
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const weeklyActivity = [
  { day: "Mon", cal: 1820, steps: 7200  },
  { day: "Tue", cal: 2100, steps: 9800  },
  { day: "Wed", cal: 1950, steps: 8400  },
  { day: "Thu", cal: 2240, steps: 11200 },
  { day: "Fri", cal: 1780, steps: 6900  },
  { day: "Sat", cal: 2380, steps: 13500 },
  { day: "Sun", cal: 2050, steps: 9100  },
];

const heartRateData = [
  { t: "6am",  bpm: 58  },
  { t: "8am",  bpm: 72  },
  { t: "10am", bpm: 78  },
  { t: "12pm", bpm: 85  },
  { t: "2pm",  bpm: 74  },
  { t: "4pm",  bpm: 80  },
  { t: "6pm",  bpm: 142 },
  { t: "7pm",  bpm: 98  },
  { t: "9pm",  bpm: 65  },
];

const hrRecoveryData = [
  { t: "6:00", bpm: 142 },
  { t: "6:15", bpm: 118 },
  { t: "6:30", bpm: 105 },
  { t: "6:45", bpm: 94  },
  { t: "7:00", bpm: 86  },
  { t: "7:30", bpm: 78  },
  { t: "8:00", bpm: 72  },
  { t: "8:30", bpm: 68  },
  { t: "9:00", bpm: 65  },
];

const MEALS = [
  {
    name: "Avocado Toast & Eggs",
    time: "8:30 AM · Breakfast",
    cal: 420, p: 32, c: 38, f: 18,
    color: C.green,
  },
  {
    name: "Grilled Chicken Bowl",
    time: "1:00 PM · Lunch",
    cal: 680, p: 54, c: 62, f: 12,
    color: C.blue,
  },
  {
    name: "Salmon with Quinoa",
    time: "7:30 PM · Dinner",
    cal: 590, p: 44, c: 52, f: 16,
    color: C.purple,
  },
];

const WORKOUTS = [
  {
    name: "Morning Run",
    type: "Cardio", date: "Today · 6:15 AM",
    dur: "42 min", cal: 410,
    tags: ["Zone 2", "Outdoor"],
    color: C.red, icon: "🏃",
  },
  {
    name: "Upper Body Strength",
    type: "Strength", date: "Today · 12:00 PM",
    dur: "55 min", cal: 285,
    tags: ["Push", "Hypertrophy"],
    color: C.blue, icon: "🏋️",
  },
  {
    name: "Yoga Flow",
    type: "Flexibility", date: "Today · 6:30 PM",
    dur: "30 min", cal: 120,
    tags: ["Mobility", "Recovery"],
    color: C.purple, icon: "🧘",
  },
  {
    name: "HIIT Circuit",
    type: "Cardio", date: "Yesterday · 7:00 AM",
    dur: "28 min", cal: 340,
    tags: ["Intervals", "High Intensity"],
    color: C.orange, icon: "⚡",
  },
  {
    name: "Cycling Session",
    type: "Cardio", date: "Monday · 7:00 AM",
    dur: "65 min", cal: 520,
    tags: ["Endurance", "Zone 3"],
    color: C.green, icon: "🚴",
  },
];

const GOALS = [
  { label: "Weekly Steps",    cur: 56400,  goal: 70000, unit: "",  color: C.blue   },
  { label: "Calorie Burn",    cur: 1690,   goal: 2000,  unit: "",  color: C.red    },
  { label: "Water Intake",    cur: 1.8,    goal: 2.5,   unit: "L", color: C.blue   },
  { label: "Active Minutes",  cur: 284,    goal: 300,   unit: "",  color: C.green  },
  { label: "Sleep Hours",     cur: 6.5,    goal: 8,     unit: "h", color: C.purple },
];

// ─── Shared tooltip style ─────────────────────────────────────────────────────
const TT = {
  contentStyle: {
    background: "#fff",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    color: C.text,
    fontSize: 11,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    padding: "8px 12px",
  },
  cursor: { stroke: "#e5e5e5", strokeWidth: 1 } as object,
};

// ─── Shared components ────────────────────────────────────────────────────────
function Card({ children, className = "", style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)", ...style }}>
      {children}
    </div>
  );
}

function Chip({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: `${color}18`, color }}>
      {children}
    </span>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: `${color}18` }}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
  );
}

// ─── Activity Rings ───────────────────────────────────────────────────────────
function ActivityRings({ size = 130 }: { size?: number }) {
  const cx = size / 2;
  const sw = size * 0.09;
  const rings = [
    { color: C.red,   progress: 0.78, r: size * 0.41, label: "Move",     val: "78%" },
    { color: C.green, progress: 0.62, r: size * 0.30, label: "Exercise", val: "62%" },
    { color: C.blue,  progress: 0.91, r: size * 0.19, label: "Stand",    val: "91%" },
  ];
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map(({ color, progress, r }, i) => {
          const circ = 2 * Math.PI * r;
          return (
            <g key={i}>
              <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={sw} opacity={0.15} />
              <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={sw}
                strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
                strokeLinecap="round" transform={`rotate(-90 ${cx} ${cx})`} />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-extrabold leading-none" style={{ fontSize: size * 0.175, color: C.text }}>78%</span>
        <span className="font-semibold mt-0.5" style={{ fontSize: size * 0.085, color: C.sub }}>Move</span>
      </div>
    </div>
  );
}

// ─── SVG Avatar ──────────────────────────────────────────────────────────────
function SvgAvatar({ size = 80 }: { size?: number }) {
  const r = size * 0.18;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: size * 0.22, flexShrink: 0 }}>
      <defs>
        <linearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.purple} />
          <stop offset="100%" stopColor={C.blue} />
        </linearGradient>
      </defs>
      <rect width={size} height={size} fill="url(#avatarGrad)" rx={r} />
      <text x={size / 2} y={size / 2 + size * 0.095}
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize={size * 0.3}
        fontWeight="800"
        fill="white">
        AR
      </text>
    </svg>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("alex@example.com");
  const [password, setPassword] = useState("password123");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1100);
  };

  const inputBase = "w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition-all bg-[#fafafa]";

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#FFD4A8 0%,#FFE8D6 28%,#ffffff 62%)" }}>
      {/* Blobs */}
      <div className="absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${C.orange}, ${C.orangeL})` }} />
      <div className="absolute bottom-[-60px] left-[-60px] w-52 h-52 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${C.purple}, ${C.blue})` }} />
      <div className="absolute top-[40%] left-[60%] w-40 h-40 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${C.green}, ${C.blue})` }} />

      <Card className="w-full max-w-sm p-7 relative z-10"
        style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xl"
            style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})`, boxShadow: `0 6px 18px ${C.orange}40` }}>
            ❤️
          </div>
          <div>
            <p className="text-xl font-extrabold" style={{ color: C.text }}>Vitals</p>
            <p className="text-xs" style={{ color: C.sub }}>Your health companion</p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: "#f5f5f5" }}>
          {(["signin", "signup"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setMode(t)}
              className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                background: mode === t ? "#fff" : "transparent",
                color: mode === t ? C.orange : C.sub,
                boxShadow: mode === t ? "0 1px 6px rgba(0,0,0,0.10)" : "none",
              }}>
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: C.sub }}>Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: C.sub }}>✉️</span>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
                style={{ border: `1.5px solid ${C.border}`, color: C.text, fontFamily: "inherit" }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: C.sub }}>Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: C.sub }}>🔒</span>
              <input type={showPw ? "text" : "password"} placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputBase} pr-10`}
                style={{ border: `1.5px solid ${C.border}`, color: C.text, fontFamily: "inherit" }} />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base"
                style={{ color: C.sub }}>
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{
              background: `linear-gradient(135deg,${C.orangeL},${C.orange})`,
              boxShadow: `0 4px 18px ${C.orange}40`,
              opacity: loading ? 0.85 : 1,
              fontFamily: "inherit",
            }}>
            {loading ? <Spinner /> : (
              <>{mode === "signin" ? "Sign In" : "Create Account"} →</>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: C.border }} />
          <span className="text-xs" style={{ color: C.sub }}>or</span>
          <div className="flex-1 h-px" style={{ background: C.border }} />
        </div>

        <button type="button" onClick={onLogin}
          className="w-full py-3 rounded-xl text-sm font-bold border transition-all hover:bg-orange-50"
          style={{ border: `1.5px solid ${C.border}`, color: C.sub, fontFamily: "inherit" }}>
          Continue as Guest
        </button>

        <p className="text-[11px] text-center mt-5 leading-relaxed" style={{ color: C.sub }}>
          By continuing, you agree to our{" "}
          <span className="font-bold" style={{ color: C.orange }}>Terms of Service</span>
          {" "}and{" "}
          <span className="font-bold" style={{ color: C.orange }}>Privacy Policy</span>
        </p>
      </Card>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen() {
  return (
    <div className="flex flex-col gap-5">
      {/* Greeting Banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{
          background: `linear-gradient(135deg,${C.orange} 0%,${C.orangeL} 60%,#ffb347 100%)`,
          boxShadow: `0 8px 28px ${C.orange}45`,
        }}>
        <div className="absolute right-[-30px] top-[-30px] w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{ background: "#fff" }} />
        <div className="relative z-10">
          <p className="text-white/75 text-xs font-bold uppercase tracking-widest mb-1">Monday, Jul 28, 2026</p>
          <h2 className="text-white font-extrabold text-xl leading-tight">Good morning, Alex! 👋</h2>
          <p className="text-white/80 text-xs mt-1.5 font-medium">You're on track — 3 of 5 goals complete</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-white text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.22)" }}>
              🔥 1,690 kcal burned
            </span>
            <span className="text-white text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.22)" }}>
              ⚡ Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-5 relative z-10 flex-shrink-0">
          <ActivityRings size={120} />
          <div className="flex flex-col gap-2.5">
            {[
              { color: C.red,   label: "Move",    val: "78%" },
              { color: C.green, label: "Exercise", val: "62%" },
              { color: C.blue,  label: "Stand",    val: "91%" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                <div>
                  <p className="text-white/65 text-[10px] font-semibold leading-none">{r.label}</p>
                  <p className="text-white font-extrabold text-xs leading-tight">{r.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards — 2×2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[
          { emoji: "🏃", label: "Steps",     val: "9,284",    sub: "of 10,000 goal", color: C.blue   },
          { emoji: "❤️", label: "Heart Rate", val: "72 BPM",  sub: "Resting · Normal",color: C.red   },
          { emoji: "🔥", label: "Calories",   val: "1,690",   sub: "of 2,200 kcal",  color: C.orange },
          { emoji: "💧", label: "Water",      val: "1.8 L",   sub: "of 2.5 L goal",  color: C.blue   },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex flex-col gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: `${s.color}16` }}>
              {s.emoji}
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none" style={{ color: C.text }}>{s.val}</p>
              <p className="text-[11px] font-bold mt-1" style={{ color: C.sub }}>{s.label}</p>
            </div>
            <p className="text-[11px]" style={{ color: C.sub }}>{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold" style={{ color: C.text }}>Weekly Calories</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.sub }}>Avg 2,046 kcal/day</p>
            </div>
            <Chip color={C.green}>This Week</Chip>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={weeklyActivity} barSize={22} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <XAxis dataKey="day" tick={{ fill: C.sub, fontSize: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} formatter={(v: number) => [`${v} kcal`, "Calories"]} />
              <Bar dataKey="cal" radius={[6, 6, 0, 0]}
                fill={C.orange}
                label={false} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold" style={{ color: C.text }}>Heart Rate</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.sub }}>Today · Spike at 6pm workout</p>
            </div>
            <Chip color={C.red}>Live</Chip>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={heartRateData} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.red} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fill: C.sub, fontSize: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} formatter={(v: number) => [`${v} BPM`, "Heart Rate"]} />
              <Area type="monotone" dataKey="bpm" stroke={C.red} strokeWidth={2.5} fill="url(#hrGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: C.text }}>Recent Activity</p>
          <button className="text-xs font-bold" style={{ color: C.orange }}>See all →</button>
        </div>
        <div className="flex flex-col">
          {[
            ...MEALS.map((m) => ({ name: m.name, meta: m.time, val: `${m.cal} kcal`, color: C.green, emoji: "🥗" })),
            ...WORKOUTS.slice(0, 2).map((w) => ({ name: w.name, meta: w.date, val: `−${w.cal} kcal`, color: w.color, emoji: w.icon })),
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3.5 py-3 border-b last:border-b-0"
              style={{ borderColor: C.border }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${item.color}14` }}>
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: C.text }}>{item.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: C.sub }}>{item.meta}</p>
              </div>
              <span className="text-sm font-bold flex-shrink-0" style={{ color: item.color }}>{item.val}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Nutrition Screen ─────────────────────────────────────────────────────────
function NutritionScreen() {
  const totalCal = MEALS.reduce((s, m) => s + m.cal, 0);
  const budget = 2200;
  const remaining = budget - totalCal;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.sub }}>Monday, Jul 28</p>
          <h1 className="text-2xl font-extrabold mt-0.5" style={{ color: C.text }}>Nutrition</h1>
        </div>
        <button className="flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
          style={{ background: `linear-gradient(135deg,${C.orangeL},${C.orange})`, boxShadow: `0 4px 14px ${C.orange}38`, fontFamily: "inherit" }}>
          + Log Meal
        </button>
      </div>

      {/* Calorie doughnut + macros + micros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Doughnut */}
        <Card className="p-5 flex flex-col items-center">
          <p className="text-sm font-bold self-start mb-3" style={{ color: C.text }}>Calorie Budget</p>
          <div className="relative" style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ value: totalCal }, { value: Math.max(remaining, 0) }]}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={65}
                  startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                  <Cell fill={C.orange} />
                  <Cell fill="#f0f0f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold" style={{ color: C.text }}>{totalCal.toLocaleString()}</span>
              <span className="text-[10px] font-semibold" style={{ color: C.sub }}>of {budget.toLocaleString()} kcal</span>
            </div>
          </div>
          <div className="w-full mt-4 space-y-2">
            {[
              { label: "Consumed",  val: `${totalCal.toLocaleString()} kcal`, color: C.orange },
              { label: "Remaining", val: `${remaining} kcal`,                 color: C.green  },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <span className="text-xs" style={{ color: C.sub }}>{r.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: r.color }}>{r.val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Macros */}
        <Card className="p-5">
          <p className="text-sm font-bold mb-4" style={{ color: C.text }}>Macronutrients</p>
          {[
            { label: "Protein",       cur: 130, tot: 160, color: C.red    },
            { label: "Carbohydrates", cur: 152, tot: 200, color: C.blue   },
            { label: "Fat",           cur: 46,  tot: 65,  color: C.purple },
          ].map((m) => (
            <div key={m.label} className="mb-4 last:mb-0">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-bold" style={{ color: C.sub }}>{m.label}</span>
                <span className="text-xs font-bold" style={{ color: C.text }}>
                  {m.cur}g <span style={{ color: C.sub }}>/ {m.tot}g</span>
                </span>
              </div>
              <ProgressBar pct={(m.cur / m.tot) * 100} color={m.color} />
            </div>
          ))}
        </Card>

        {/* Micro nutrients */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Fiber",    val: "22g",   goal: "30g",   pct: 73, color: C.green  },
            { label: "Sodium",   val: "1,840mg",goal: "2,300mg",pct: 80, color: C.orange },
            { label: "Sugar",    val: "38g",   goal: "50g",   pct: 76, color: C.red    },
            { label: "Caffeine", val: "240mg", goal: "400mg", pct: 60, color: C.purple },
          ].map((s) => (
            <Card key={s.label} className="p-3.5" style={{ borderTop: `3px solid ${s.color}` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.sub }}>{s.label}</p>
              <p className="text-lg font-extrabold mt-2" style={{ color: C.text }}>{s.val}</p>
              <p className="text-[10px] mt-0.5 mb-2" style={{ color: C.sub }}>of {s.goal}</p>
              <ProgressBar pct={s.pct} color={s.color} />
            </Card>
          ))}
        </div>
      </div>

      {/* Meal Log */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: C.text }}>Today's Meals</p>
          <Chip color={C.orange}>{totalCal.toLocaleString()} kcal total</Chip>
        </div>
        {MEALS.map((m) => (
          <div key={m.name} className="flex items-center gap-3.5 py-3.5 border-b last:border-b-0"
            style={{ borderColor: C.border }}>
            <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: m.color, minHeight: 48 }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: C.text }}>{m.name}</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.sub }}>{m.time}</p>
              <div className="flex gap-3 mt-1.5">
                {[
                  { l: "P", v: m.p, c: C.red    },
                  { l: "C", v: m.c, c: C.blue   },
                  { l: "F", v: m.f, c: C.purple },
                ].map(({ l, v, c }) => (
                  <span key={l} className="text-[11px] font-bold" style={{ color: c }}>{l} {v}g</span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-extrabold" style={{ color: C.text }}>{m.cal}</p>
              <p className="text-[10px]" style={{ color: C.sub }}>kcal</p>
            </div>
          </div>
        ))}
        <button className="w-full mt-3 border-2 border-dashed rounded-xl py-3.5 flex items-center justify-center gap-2 transition-colors hover:bg-orange-50"
          style={{ borderColor: `${C.orange}30`, color: C.sub, fontFamily: "inherit" }}>
          <span className="text-sm font-bold" style={{ color: C.orange }}>+ Add Meal</span>
        </button>
      </Card>
    </div>
  );
}

// ─── Workouts Screen ──────────────────────────────────────────────────────────
function WorkoutsScreen() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.sub }}>This week</p>
          <h1 className="text-2xl font-extrabold mt-0.5" style={{ color: C.text }}>Workouts</h1>
        </div>
        <button className="flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
          style={{ background: `linear-gradient(135deg,${C.orangeL},${C.orange})`, boxShadow: `0 4px 14px ${C.orange}38`, fontFamily: "inherit" }}>
          + Log Workout
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[
          { emoji: "⚡", label: "Sessions",   val: "5",       color: C.orange },
          { emoji: "⏱️", label: "Total Time",  val: "3h 40m",  color: C.blue   },
          { emoji: "🔥", label: "Cal Burned",  val: "1,675",   color: C.red    },
          { emoji: "❤️", label: "Avg HR",      val: "124 BPM", color: C.red    },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex flex-col gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: `${s.color}16` }}>
              {s.emoji}
            </div>
            <div>
              <p className="text-xl font-extrabold leading-none" style={{ color: C.text }}>{s.val}</p>
              <p className="text-[11px] font-bold mt-1" style={{ color: C.sub }}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: C.text }}>Daily Steps</p>
            <Chip color={C.blue}>Avg 9,486</Chip>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={weeklyActivity} barSize={22} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <XAxis dataKey="day" tick={{ fill: C.sub, fontSize: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} formatter={(v: number) => [`${v.toLocaleString()} steps`, "Steps"]} />
              <Bar dataKey="steps" radius={[6, 6, 0, 0]} fill={C.blue} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: C.text }}>Calories Burned</p>
            <Chip color={C.orange}>Avg 2,046</Chip>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={weeklyActivity} barSize={22} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <XAxis dataKey="day" tick={{ fill: C.sub, fontSize: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} formatter={(v: number) => [`${v} kcal`, "Calories"]} />
              <Bar dataKey="cal" radius={[6, 6, 0, 0]} fill={C.orange} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Workout list */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: C.text }}>Workout Log</p>
          <span className="text-[11px] font-semibold" style={{ color: C.sub }}>5 sessions this week</span>
        </div>
        {WORKOUTS.map((w) => (
          <div key={`${w.name}-${w.date}`} className="flex items-center gap-3.5 py-3.5 border-b last:border-b-0"
            style={{ borderColor: C.border }}>
            <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: w.color }} />
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${w.color}14` }}>
              {w.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold" style={{ color: C.text }}>{w.name}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "#f5f5f5", color: C.sub }}>{w.date}</span>
              </div>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {w.tags.map((t) => <Chip key={t} color={w.color}>{t}</Chip>)}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-base font-extrabold" style={{ color: w.color }}>{w.cal}</p>
              <p className="text-[11px]" style={{ color: C.sub }}>{w.dur}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────
function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Profile card — orange gradient */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg,${C.orange} 0%,${C.orangeL} 60%,#ffb347 100%)`,
          boxShadow: `0 8px 28px ${C.orange}45`,
        }}>
        <div className="absolute right-[-40px] bottom-[-40px] w-56 h-56 rounded-full opacity-15"
          style={{ background: "#fff" }} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          <SvgAvatar size={88} />
          <div className="flex-1">
            <p className="text-white text-xl font-extrabold leading-tight">Alex Rivera</p>
            <p className="text-white/75 text-xs mt-1">Health enthusiast · San Francisco, CA</p>
            <div className="flex items-center gap-5 mt-4 flex-wrap">
              {[
                { val: "28",     label: "Age"    },
                { val: "5'10\"", label: "Height" },
                { val: "175 lb", label: "Weight" },
                { val: "25.1",   label: "BMI"    },
              ].map((s, i, arr) => (
                <div key={s.label} className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-white text-lg font-extrabold leading-none">{s.val}</p>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-8 opacity-30" style={{ background: "#fff" }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Goals + HR chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: C.text }}>Goal Progress</p>
            <button className="text-xs font-bold" style={{ color: C.orange }}>Edit Goals</button>
          </div>
          {GOALS.map((g) => {
            const pct = Math.round((g.cur / g.goal) * 100);
            return (
              <div key={g.label} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-bold" style={{ color: C.sub }}>{g.label}</span>
                  <span className="text-xs font-extrabold" style={{ color: g.color }}>{pct}%</span>
                </div>
                <ProgressBar pct={pct} color={g.color} />
              </div>
            );
          })}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold" style={{ color: C.text }}>Heart Rate · Evening</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.sub }}>Workout recovery curve</p>
            </div>
            <Chip color={C.red}>Peak 142 BPM</Chip>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={hrRecoveryData} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <defs>
                <linearGradient id="hrRecGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.red} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fill: C.sub, fontSize: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} formatter={(v: number) => [`${v} BPM`, "Heart Rate"]} />
              <Area type="monotone" dataKey="bpm" stroke={C.red} strokeWidth={2.5} fill="url(#hrRecGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Settings */}
      <Card className="overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <p className="text-sm font-bold" style={{ color: C.text }}>Settings</p>
        </div>
        {[
          { emoji: "👤", label: "Account & Profile",   sub: "Manage personal info",           color: C.blue   },
          { emoji: "🔔", label: "Notifications",        sub: "Reminders and alerts",           color: C.purple },
          { emoji: "❤️", label: "Health Data",           sub: "Sync with Apple Health",        color: C.red    },
          { emoji: "⚙️", label: "Preferences",           sub: "Units, theme, language",        color: C.sub    },
          { emoji: "🔒", label: "Privacy & Security",   sub: "Data and permissions",           color: C.green  },
        ].map(({ emoji, label, sub, color }) => (
          <button key={label}
            className="w-full flex items-center gap-3.5 px-5 py-4 border-t hover:bg-orange-50/50 transition-colors text-left"
            style={{ borderColor: C.border, fontFamily: "inherit" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: `${color}16` }}>
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: C.text }}>{label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.sub }}>{sub}</p>
            </div>
            <span style={{ color: C.sub }}>›</span>
          </button>
        ))}
      </Card>

      {/* Sign out */}
      <button onClick={onLogout}
        className="w-full py-3.5 rounded-2xl text-sm font-extrabold border-2 transition-all hover:bg-red-50 mb-8"
        style={{ borderColor: `${C.red}35`, color: C.red, fontFamily: "inherit" }}>
        ← Sign Out
      </button>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "home",      emoji: "🏠", label: "Home"      },
  { id: "nutrition", emoji: "🥗", label: "Nutrition" },
  { id: "workouts",  emoji: "🏋️", label: "Workouts"  },
  { id: "profile",   emoji: "👤", label: "Profile"   },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn]   = useState(false);
  const [active, setActive]       = useState<TabId>("home");
  const [drawerOpen, setDrawer]   = useState(false);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  const screens: Record<TabId, React.ReactNode> = {
    home:      <HomeScreen />,
    nutrition: <NutritionScreen />,
    workouts:  <WorkoutsScreen />,
    profile:   <ProfileScreen onLogout={() => setLoggedIn(false)} />,
  };

  const pageLabel: Record<TabId, string> = {
    home: "Good Morning ☀️", nutrition: "Nutrition", workouts: "Workouts", profile: "Profile",
  };

  return (
    <div className="min-h-screen flex"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "linear-gradient(180deg,#FFD4A8 0%,#FFE8D6 28%,#ffffff 62%) fixed",
        backgroundAttachment: "fixed",
      }}>

      {/* ── Drawer overlay (mobile) ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/35"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={() => setDrawer(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[260px] flex flex-col border-l"
            style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", borderColor: C.border, boxShadow: "-4px 0 30px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-sm"
                  style={{ background: `linear-gradient(135deg,${C.orange},${C.purple})` }}>AR</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: C.text }}>Alex Rivera</p>
                  <p className="text-[11px]" style={{ color: C.sub }}>alex@example.com</p>
                </div>
              </div>
              <button onClick={() => setDrawer(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ color: C.sub, background: "#f5f5f5" }}>✕</button>
            </div>
            <nav className="flex-1 p-3 flex flex-col gap-1">
              {TABS.map(({ id, emoji, label }) => {
                const isActive = active === id;
                return (
                  <button key={id} onClick={() => { setActive(id); setDrawer(false); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all w-full"
                    style={{
                      background: isActive ? `${C.orange}14` : "transparent",
                      color: isActive ? C.orange : C.sub,
                      fontFamily: "inherit",
                    }}>
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-bold">{label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-4 rounded-full" style={{ background: C.orange }} />}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t" style={{ borderColor: C.border }}>
              <button onClick={() => setLoggedIn(false)}
                className="w-full py-2.5 rounded-xl text-sm font-bold border-2 transition-all hover:bg-red-50"
                style={{ borderColor: `${C.red}30`, color: C.red, fontFamily: "inherit" }}>
                ← Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen border-r"
        style={{
          width: 240,
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(16px)",
          borderColor: C.border,
        }}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})` }}>❤️</div>
            <span className="font-extrabold text-base" style={{ color: C.text }}>Vitals</span>
          </div>
        </div>

        {/* User pill */}
        <div className="mx-3 my-4 px-3 py-3 rounded-xl flex items-center gap-2.5"
          style={{ background: `${C.orange}10` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white text-xs flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${C.orange},${C.purple})` }}>AR</div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold truncate" style={{ color: C.text }}>Alex Rivera</p>
            <p className="text-[10px]" style={{ color: C.sub }}>alex@example.com</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 flex flex-col gap-1">
          {TABS.map(({ id, emoji, label }) => {
            const isActive = active === id;
            return (
              <button key={id} onClick={() => setActive(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-left relative"
                style={{
                  background: isActive ? `${C.orange}14` : "transparent",
                  color: isActive ? C.orange : C.sub,
                  fontFamily: "inherit",
                }}>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                    style={{ background: C.orange }} />
                )}
                <span className="text-base">{emoji}</span>
                <span className="text-sm font-bold">{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-4 rounded-full" style={{ background: C.orange }} />}
              </button>
            );
          })}
        </nav>

        {/* Sign out at bottom */}
        <div className="p-4 border-t" style={{ borderColor: C.border }}>
          <button onClick={() => setLoggedIn(false)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-red-50"
            style={{ color: C.red, fontFamily: "inherit" }}>
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Frosted header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(16px)",
            borderColor: C.border,
            padding: "14px 24px",
          }}>
          {/* Mobile: logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: `linear-gradient(135deg,${C.orange},${C.orangeL})` }}>❤️</div>
            <span className="font-extrabold text-sm" style={{ color: C.text }}>Vitals</span>
          </div>
          {/* Desktop: page title */}
          <p className="hidden md:block text-lg font-extrabold" style={{ color: C.text }}>
            {pageLabel[active]}
          </p>

          <div className="flex items-center gap-3">
            <span className="hidden md:block text-xs font-medium" style={{ color: C.sub }}>Jul 28, 2026</span>
            {/* Mobile avatar */}
            <div className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-white text-xs"
              style={{ background: `linear-gradient(135deg,${C.orange},${C.purple})` }}>AR</div>
            {/* Mobile hamburger */}
            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ background: "#f5f5f5", color: C.sub }}
              onClick={() => setDrawer(true)}>
              ☰
            </button>
          </div>
        </header>

        {/* Screen content */}
        <main className="flex-1 px-5 md:px-8 py-6 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom,0px))" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            {screens[active]}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex items-center border-t"
        style={{
          background: "rgba(255,255,255,0.90)",
          backdropFilter: "blur(20px)",
          borderColor: C.border,
          paddingTop: 6,
          paddingBottom: "max(6px, env(safe-area-inset-bottom,0px))",
          height: "calc(60px + max(0px, env(safe-area-inset-bottom,0px)))",
        }}>
        {TABS.map(({ id, emoji, label }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => setActive(id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-0.5"
              style={{ fontFamily: "inherit" }}>
              <div className="w-10 h-8 flex items-center justify-center rounded-xl text-lg transition-all"
                style={{ background: isActive ? `${C.orange}16` : "transparent" }}>
                {emoji}
              </div>
              <span className="font-extrabold uppercase tracking-wide"
                style={{ fontSize: 9, color: isActive ? C.orange : C.sub }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
