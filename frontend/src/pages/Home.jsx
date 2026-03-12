import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────
   DESIGN TOKENS — all colours as hex codes
───────────────────────────────────────── */
const C = {
  // Backgrounds
  bgDeep:    "#07090F",
  bgBase:    "#0C1120",
  bgSurface: "#111827",
  bgCard:    "#141E33",

  // Brand Gold (Sri Lanka flag)
  gold:      "#D4A017",
  goldLight: "#F0C040",
  goldTint:  "#D4A0171A",
  borderGold:"#D4A01733",

  // Crimson accent (Sri Lanka flag)
  red:       "#C0392B",
  redLight:  "#E74C3C",

  // Status: Kept / Broken / Pending
  kept:      "#16A34A",
  keptLight: "#22C55E",
  keptTint:  "#16A34A18",
  broken:    "#DC2626",
  brokenTint:"#DC262618",
  pending:   "#D97706",
  pendingTint:"#D9770618",

  // Text
  text1: "#F1F3F9",
  text2: "#94A3B8",
  text3: "#4B5B74",

  // Borders
  border: "#1E2D4A",

  // Nav overlay
  navBg: "#07090FEE",

  // SDG badge blue
  blue:     "#3B82F6",
  blueTint: "#3B82F618",
};

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const politicians = [
  { name:"Ranil Wickremesinghe", role:"President · UNP",         emoji:"🧑‍💼", score:62, kept:12, broken:8,  pending:6,  scoreColor:C.gold      },
  { name:"Sajith Premadasa",     role:"Opposition Leader · SJB", emoji:"👨‍💼", score:78, kept:19, broken:4,  pending:3,  scoreColor:C.keptLight },
  { name:"Mahinda Rajapaksa",    role:"MP · SLPP · Southern",    emoji:"🧓",  score:34, kept:6,  broken:14, pending:2,  scoreColor:C.redLight  },
  { name:"Harini Amarasuriya",   role:"Prime Minister · NPP",    emoji:"👩‍💼", score:81, kept:9,  broken:1,  pending:7,  scoreColor:C.keptLight },
];

const features = [
  { icon:"📋", title:"Promise Tracker",    desc:"Every election promise logged, categorized, and verified with real evidence and trusted sources." },
  { icon:"📊", title:"Performance Scores", desc:"Transparent scores based on attendance, voting record, spending declarations, and promise fulfillment." },
  { icon:"🗳️", title:"Voting Records",     desc:"Every parliamentary vote publicly accessible. See exactly how your MP voted on bills that matter." },
  { icon:"💰", title:"Spending Watch",     desc:"Track declared assets, public expenditures, and financial disclosures of politicians." },
  { icon:"🔔", title:"Citizen Alerts",     desc:"Get notified when promises are updated or new records are filed for politicians you follow." },
  { icon:"🤝", title:"Community Reports",  desc:"Citizens can submit evidence — verified by our editorial team before being published." },
];

const steps = [
  { n:"01", title:"Search Any Politician", desc:"Find any MP, minister, or councillor by name, party, or district." },
  { n:"02", title:"Review Their Record",   desc:"See full promise history, voting record, attendance, and accountability score." },
  { n:"03", title:"Compare & Verify",      desc:"Compare politicians side-by-side with linked evidence from verified sources." },
  { n:"04", title:"Share & Demand Action", desc:"Share reports with your community and demand accountability." },
];

const tickerItems = [
  { label:"KEPT",    bg:C.keptTint,    color:C.keptLight, text:"Education budget increased 15% — Ministry of Finance" },
  { label:"BROKEN",  bg:C.brokenTint,  color:C.redLight,  text:"10,000 housing units pledge — 2 years overdue" },
  { label:"PENDING", bg:C.pendingTint, color:C.pending,   text:"Anti-corruption bill — Committee review ongoing" },
  { label:"KEPT",    bg:C.keptTint,    color:C.keptLight, text:"Free school meals program — Fully implemented" },
  { label:"BROKEN",  bg:C.brokenTint,  color:C.redLight,  text:"Power cuts elimination by 2023 — Not achieved" },
  { label:"PENDING", bg:C.pendingTint, color:C.pending,   text:"Constitutional reform — Draft stage" },
];

/* ─────────────────────────────────────────
   COUNT-UP HOOK
───────────────────────────────────────── */
function useCountUp(target, duration = 1400, trigger = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return val;
}

/* ─────────────────────────────────────────
   STAT ITEM
───────────────────────────────────────── */
function StatItem({ raw, suffix = "", label }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const num = useCountUp(raw, 1400, vis);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.4 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  const display = raw >= 1000 ? num.toLocaleString() : num;

  return (
    <div ref={ref}
      style={{ background:C.bgBase, padding:"3rem 1.5rem", display:"flex", flexDirection:"column", alignItems:"center", cursor:"default", transition:"background .25s", borderRight:`1px solid ${C.border}` }}
      onMouseEnter={e => e.currentTarget.style.background = C.bgSurface}
      onMouseLeave={e => e.currentTarget.style.background = C.bgBase}
    >
      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"2.8rem", fontWeight:900, color:C.gold, lineHeight:1, marginBottom:"0.5rem" }}>
        {display}{suffix}
      </span>
      <p style={{ fontSize:"0.78rem", color:C.text2, textAlign:"center", lineHeight:1.6, maxWidth:130 }}>{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function SectionLabel({ text }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.7rem", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:C.gold, fontFamily:"'Space Mono',monospace", marginBottom:"1rem" }}>
      <span style={{ width:22, height:2, background:C.gold, display:"inline-block" }} />
      {text}
    </div>
  );
}

function Tag({ bg, color, border, children }) {
  return (
    <span style={{ fontSize:"0.65rem", padding:"0.2rem 0.55rem", borderRadius:"4px", fontWeight:700, background:bg, color:color, border:`1px solid ${border}` }}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────── */
export default function Janaaya360() {
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:C.bgBase, color:C.text1, fontFamily:"'Sora',sans-serif", overflowX:"hidden" }}>

      {/* ── GLOBAL CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:${C.bgDeep}; }
        ::-webkit-scrollbar-thumb { background:${C.gold}; border-radius:3px; }

        @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(.65)} }

        .ticker-run  { animation: ticker 38s linear infinite; white-space:nowrap; }
        .fade0 { animation: fadeUp .7s        ease both; }
        .fade1 { animation: fadeUp .7s .13s   ease both; }
        .fade2 { animation: fadeUp .7s .26s   ease both; }
        .fade3 { animation: fadeUp .7s .4s    ease both; }
        .glow  { animation: glowDot 2s ease infinite; }

        .grid-bg {
          background-image:
            linear-gradient(${C.gold}09 1px, transparent 1px),
            linear-gradient(90deg, ${C.gold}09 1px, transparent 1px);
          background-size:58px 58px;
        }

        /* hover utilities */
        .card-hover { transition:transform .28s, border-color .28s, box-shadow .28s !important; }
        .card-hover:hover { transform:translateY(-5px) !important; border-color:${C.gold}66 !important; box-shadow:0 20px 48px ${C.bgDeep}BB !important; }

        .btn-gold-h:hover { background:${C.goldLight} !important; transform:translateY(-2px) !important; box-shadow:0 10px 28px ${C.gold}44 !important; }
        .btn-out-h:hover  { border-color:${C.gold} !important; color:${C.gold} !important; transform:translateY(-2px) !important; }
        .nav-lnk:hover    { color:${C.gold} !important; }
        .search-in:focus  { border-color:${C.gold} !important; }

        /* step line visible on wide screens */
        .step-connector { display:none; }
        @media(min-width:900px){ .step-connector { display:block; } }

        /* responsive grid */
        @media(max-width:1080px){
          .rg-hero  { grid-template-columns:1fr !important; }
          .mock-col { display:none !important; }
          .rg-4     { grid-template-columns:1fr 1fr !important; }
        }
        @media(max-width:600px){
          .rg-4     { grid-template-columns:1fr !important; }
          .rg-3     { grid-template-columns:1fr !important; }
          .rg-steps { grid-template-columns:1fr !important; }
          .nav-menu { display:none !important; }
          .sec      { padding-left:1.25rem !important; padding-right:1.25rem !important; }
          .footer-r { flex-direction:column !important; gap:1.5rem !important; }
        }
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:50,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"1rem 4rem",
        background: scrolled ? C.navBg : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
        transition:"all .3s",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.55rem" }}>
          <span style={{ fontSize:"1.7rem" }}>🦁</span>
          <span style={{ color:C.gold,  fontWeight:900, fontSize:"1.25rem", letterSpacing:"-0.02em" }}>Janaaya</span>
          <span style={{ color:C.text1, fontWeight:900, fontSize:"1.25rem", letterSpacing:"-0.02em" }}> 360</span>
        </div>

        {/* Links */}
        <div className="nav-menu" style={{ display:"flex", alignItems:"center", gap:"2.5rem" }}>
          {["Politicians","Promises","Reports","About"].map(l => (
            <a key={l} className="nav-lnk" style={{ color:C.text2, fontSize:"0.78rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", textDecoration:"none", transition:"color .2s", cursor:"pointer" }}>{l}</a>
          ))}
          <button className="btn-gold-h" style={{ background:C.gold, color:C.bgDeep, border:"none", padding:"0.5rem 1.3rem", borderRadius:"6px", fontSize:"0.82rem", fontWeight:900, cursor:"pointer", transition:"all .2s" }}>
            Get Involved
          </button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="sec" style={{ position:"relative", minHeight:"100vh", padding:"7.5rem 4rem 4rem", overflow:"hidden" }}>
        <div className="grid-bg" style={{ position:"absolute", inset:0, zIndex:0 }} />
        <div style={{ position:"absolute", inset:0, zIndex:0, background:`radial-gradient(ellipse 60% 70% at 70% 50%, ${C.gold}0F 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 8% 82%, ${C.red}12 0%, transparent 58%)` }} />

        <div className="rg-hero" style={{ position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"1fr 1fr", alignItems:"center", gap:"3rem" }}>

          {/* — Left text — */}
          <div>
            {/* Badge */}
            <div className="fade0" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:C.goldTint, border:`1px solid ${C.borderGold}`, borderRadius:"100px", padding:"0.35rem 1rem", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.gold, marginBottom:"2rem" }}>
              <span className="glow" style={{ width:7, height:7, borderRadius:"50%", background:C.gold, display:"inline-block" }} />
              SDG 16 · Peace, Justice &amp; Strong Institutions
            </div>

            <h1 className="fade1" style={{ fontSize:"clamp(3rem,5vw,5.4rem)", fontWeight:900, lineHeight:1.03, letterSpacing:"-0.045em", marginBottom:"1.4rem" }}>
              Hold Power<br />
              <span style={{ color:C.gold }}>Accountable.</span><br />
              <span style={{ color:C.red }}>Demand</span> Truth.
            </h1>

            <p className="fade2" style={{ color:C.text2, fontSize:"1.05rem", lineHeight:1.8, maxWidth:460, marginBottom:"2.2rem", fontWeight:300 }}>
              Sri Lanka's first <strong style={{ color:C.text1, fontWeight:600 }}>citizen-powered platform</strong> to track every promise, vote, and action of your elected representatives — transparently.
            </p>

            {/* Search */}
            <div className="fade2" style={{ position:"relative", maxWidth:430, marginBottom:"2rem" }}>
              <span style={{ position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)", fontSize:"1rem", color:C.text3, pointerEvents:"none" }}>🔍</span>
              <input
                className="search-in"
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search politician, party or promise…"
                style={{ width:"100%", background:"#FFFFFF08", border:`1px solid ${C.border}`, borderRadius:"8px", padding:"0.9rem 1rem 0.9rem 2.9rem", color:C.text1, fontSize:"0.88rem", fontFamily:"'Sora',sans-serif", outline:"none", transition:"border-color .2s" }}
              />
            </div>

            <div className="fade3" style={{ display:"flex", gap:"0.85rem", flexWrap:"wrap" }}>
              <button className="btn-gold-h" style={{ background:C.gold, color:C.bgDeep, border:"none", padding:"0.9rem 2.2rem", borderRadius:"8px", fontSize:"0.9rem", fontWeight:900, cursor:"pointer", display:"flex", alignItems:"center", gap:"0.4rem", transition:"all .2s" }}>
                Explore Politicians →
              </button>
              <button className="btn-out-h" style={{ background:"transparent", color:C.text1, border:`1px solid ${C.border}`, padding:"0.9rem 2.2rem", borderRadius:"8px", fontSize:"0.9rem", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:"0.4rem", transition:"all .2s" }}>
                📊 View Reports
              </button>
            </div>
          </div>

          {/* — Right: mock dashboard — */}
          <div className="mock-col" style={{ display:"flex", justifyContent:"center" }}>
            <div style={{ background:C.bgCard, border:`1px solid ${C.borderGold}`, borderRadius:"18px", padding:"1.6rem", width:"100%", maxWidth:420, boxShadow:`0 32px 80px ${C.bgDeep}BB, 0 0 0 1px ${C.gold}10` }}>
              {/* Window bar */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"1rem", marginBottom:"1.2rem", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.7rem", fontWeight:700, color:C.gold, letterSpacing:"0.1em", textTransform:"uppercase" }}>// Accountability Score</span>
                <div style={{ display:"flex", gap:5 }}>
                  {["#FF5F57","#FEBC2E","#28C840"].map(bg => <span key={bg} style={{ width:10, height:10, borderRadius:"50%", background:bg, display:"inline-block" }} />)}
                </div>
              </div>

              {politicians.slice(0,3).map((p,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.85rem", background:"#FFFFFF04", border:`1px solid ${C.border}`, borderRadius:"10px", padding:"0.8rem", marginBottom:"0.65rem" }}>
                  <div style={{ width:42, height:42, borderRadius:"50%", background:C.bgSurface, border:`2px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0 }}>{p.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"0.84rem", fontWeight:600, color:C.text1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.68rem", color:C.text3 }}>{p.role}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontWeight:900, fontSize:"1.05rem", color:p.scoreColor }}>{p.score}%</span>
                    <div style={{ width:56, height:4, background:"#FFFFFF0F", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ width:`${p.score}%`, height:"100%", background:p.scoreColor, borderRadius:2 }} />
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.6rem", marginTop:"0.9rem" }}>
                {[["247","Politicians"],["1.2k","Promises"],["38%","Kept"]].map(([v,l]) => (
                  <div key={l} style={{ background:"#FFFFFF04", border:`1px solid ${C.border}`, borderRadius:"8px", padding:"0.7rem", textAlign:"center" }}>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontWeight:900, fontSize:"1.2rem", color:C.gold, display:"block", lineHeight:1 }}>{v}</span>
                    <span style={{ fontSize:"0.62rem", color:C.text3, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:"0.2rem", display:"block" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══ TICKER ══ */}
      <div style={{ background:`${C.gold}0C`, borderTop:`1px solid ${C.borderGold}`, borderBottom:`1px solid ${C.borderGold}`, padding:"0.72rem 0", overflow:"hidden" }}>
        <div className="ticker-run" style={{ display:"inline-block" }}>
          {[...tickerItems,...tickerItems].map((t,i) => (
            <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"0.7rem", marginRight:"3.5rem", fontSize:"0.78rem", fontFamily:"'Space Mono',monospace", color:C.text2 }}>
              <span style={{ background:t.bg, color:t.color, padding:"0.15rem 0.55rem", borderRadius:"3px", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.06em" }}>{t.label}</span>
              {t.text}
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ══ */}
      <div className="rg-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }}>
        <StatItem raw={247}   suffix=""  label="Politicians tracked across all provinces and parliament" />
        <StatItem raw={1284}  suffix=""  label="Election promises logged and publicly verified" />
        <StatItem raw={38}    suffix="%" label="Promise-keep rate across all tracked politicians" />
        <StatItem raw={52000} suffix=""  label="Citizens actively using the platform" />
      </div>

      {/* ══ FEATURES ══ */}
      <section className="sec" style={{ padding:"6rem 4rem" }}>
        <SectionLabel text="What We Do" />
        <h2 style={{ fontSize:"clamp(2rem,4vw,3.4rem)", fontWeight:900, letterSpacing:"-0.04em", lineHeight:1.08, marginBottom:"1rem" }}>
          Transparency is a right,<br />not a privilege.
        </h2>
        <p style={{ color:C.text2, fontSize:"1rem", lineHeight:1.75, maxWidth:500, marginBottom:"3.5rem", fontWeight:300 }}>
          Janaaya 360 gives every Sri Lankan the tools to see through political rhetoric and demand real accountability.
        </p>
        <div className="rg-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.2rem" }}>
          {features.map((f,i) => (
            <div key={i} className="card-hover" style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:"14px", padding:"2rem" }}>
              <div style={{ width:50, height:50, background:`${C.gold}18`, border:`1px solid ${C.gold}30`, borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", marginBottom:"1.25rem" }}>{f.icon}</div>
              <h3 style={{ fontSize:"0.95rem", fontWeight:700, color:C.text1, marginBottom:"0.5rem" }}>{f.title}</h3>
              <p style={{ fontSize:"0.84rem", color:C.text2, lineHeight:1.7, fontWeight:300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="sec" style={{ background:C.bgSurface, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"6rem 4rem" }}>
        <SectionLabel text="How It Works" />
        <h2 style={{ fontSize:"clamp(2rem,4vw,3.4rem)", fontWeight:900, letterSpacing:"-0.04em", lineHeight:1.08, marginBottom:"4.5rem" }}>
          Simple. Transparent.<br />Powered by you.
        </h2>
        <div className="rg-steps" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"2rem", position:"relative" }}>
          <div className="step-connector" style={{ position:"absolute", top:"1.5rem", left:"12.5%", right:"12.5%", height:1, background:`linear-gradient(90deg, transparent, ${C.gold}44, ${C.gold}44, transparent)` }} />
          {steps.map((s,i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:C.bgCard, border:`2px solid ${C.gold}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Mono',monospace", fontSize:"0.85rem", fontWeight:700, color:C.gold, margin:"0 auto 1.4rem", position:"relative", zIndex:1 }}>{s.n}</div>
              <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:C.text1, marginBottom:"0.5rem" }}>{s.title}</h3>
              <p style={{ fontSize:"0.8rem", color:C.text2, lineHeight:1.65, fontWeight:300 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ POLITICIANS PREVIEW ══ */}
      <section className="sec" style={{ padding:"6rem 4rem" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <SectionLabel text="Featured" />
            <h2 style={{ fontSize:"clamp(1.8rem,3vw,2.8rem)", fontWeight:900, letterSpacing:"-0.04em" }}>Most Followed Politicians</h2>
          </div>
          <button className="btn-out-h" style={{ background:"transparent", color:C.text2, border:`1px solid ${C.border}`, padding:"0.7rem 1.5rem", borderRadius:"8px", fontSize:"0.84rem", fontWeight:600, cursor:"pointer", transition:"all .2s", whiteSpace:"nowrap" }}>
            View All →
          </button>
        </div>

        <div className="rg-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.2rem" }}>
          {politicians.map((p,i) => (
            <div key={i} className="card-hover" style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:"14px", padding:"1.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.85rem", marginBottom:"1.2rem" }}>
                <div style={{ width:50, height:50, borderRadius:"50%", background:C.bgSurface, border:`2px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", flexShrink:0 }}>{p.emoji}</div>
                <div>
                  <div style={{ fontSize:"0.88rem", fontWeight:700, color:C.text1, lineHeight:1.3 }}>{p.name}</div>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.68rem", color:C.text3, marginTop:2 }}>{p.role}</div>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
                <span style={{ fontSize:"0.72rem", color:C.text3, textTransform:"uppercase", letterSpacing:"0.06em" }}>Accountability</span>
                <span style={{ fontFamily:"'Space Mono',monospace", fontWeight:900, fontSize:"1.1rem", color:p.scoreColor }}>{p.score}%</span>
              </div>
              <div style={{ width:"100%", height:5, background:"#FFFFFF08", borderRadius:3, overflow:"hidden", marginBottom:"1rem" }}>
                <div style={{ width:`${p.score}%`, height:"100%", background:p.scoreColor, borderRadius:3 }} />
              </div>
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                <Tag bg={C.keptTint}    color={C.keptLight} border={`${C.kept}40`}>{p.kept} Kept</Tag>
                <Tag bg={C.brokenTint}  color={C.redLight}  border={`${C.broken}40`}>{p.broken} Broken</Tag>
                <Tag bg={C.pendingTint} color={C.pending}   border={`${C.pending}40`}>{p.pending} Pending</Tag>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="sec" style={{ position:"relative", padding:"8rem 4rem", textAlign:"center", overflow:"hidden", borderTop:`1px solid ${C.border}` }}>
        <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 70% 60% at 50% 50%, ${C.gold}0D 0%, transparent 70%)` }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:C.goldTint, border:`1px solid ${C.borderGold}`, borderRadius:"100px", padding:"0.35rem 1rem", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.gold, marginBottom:"1.6rem" }}>
            Join the Movement
          </div>
          <h2 style={{ fontSize:"clamp(2.8rem,6vw,5rem)", fontWeight:900, letterSpacing:"-0.05em", lineHeight:1, marginBottom:"1.4rem" }}>
            An Informed Citizen<br />
            <span style={{ color:C.gold }}>Is a Powerful Citizen.</span>
          </h2>
          <p style={{ color:C.text2, fontSize:"1.05rem", maxWidth:440, margin:"0 auto 2.8rem", fontWeight:300, lineHeight:1.75 }}>
            Join over 52,000 Sri Lankans already using Janaaya 360 to demand better governance and real accountability.
          </p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn-gold-h" style={{ background:C.gold, color:C.bgDeep, border:"none", padding:"1rem 2.5rem", borderRadius:"10px", fontSize:"1rem", fontWeight:900, cursor:"pointer", transition:"all .2s" }}>
              🚀 Start Tracking Now
            </button>
            <button className="btn-out-h" style={{ background:"transparent", color:C.text1, border:`1px solid ${C.border}`, padding:"1rem 2.5rem", borderRadius:"10px", fontSize:"1rem", fontWeight:600, cursor:"pointer", transition:"all .2s" }}>
              📥 Download the App
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="sec" style={{ borderTop:`1px solid ${C.border}`, padding:"2.5rem 4rem" }}>
        <div className="footer-r" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.3rem" }}>
              <span style={{ fontSize:"1.4rem" }}>🦁</span>
              <span style={{ color:C.gold, fontWeight:900, fontSize:"1.1rem" }}>Janaaya</span>
              <span style={{ fontWeight:900, fontSize:"1.1rem" }}> 360</span>
            </div>
            <p style={{ fontSize:"0.78rem", color:C.text3 }}>Built by citizens, for citizens of Sri Lanka.</p>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", marginTop:"0.6rem", background:C.blueTint, border:`1px solid ${C.blue}33`, padding:"0.25rem 0.8rem", borderRadius:"4px", fontSize:"0.68rem", fontWeight:600, color:C.blue }}>
              🌐 SDG Goal 16 — Peace, Justice &amp; Strong Institutions
            </div>
          </div>
          <div style={{ textAlign:"right", fontSize:"0.75rem", color:C.text3, lineHeight:1.85 }}>
            <p>© 2025 Janaaya 360. Independent, non-partisan.</p>
            <p>Not affiliated with any political party or government body.</p>
            <div style={{ display:"flex", gap:"1.2rem", justifyContent:"flex-end", marginTop:"0.35rem", opacity:0.5 }}>
              {["Privacy","Terms","Contact"].map(l => (
                <a key={l} style={{ color:C.text2, textDecoration:"none", cursor:"pointer" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}