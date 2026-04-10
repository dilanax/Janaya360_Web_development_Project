import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import axios from 'axios';
import {
  ArrowRightIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ClockIcon,
  StarIcon,
  ChevronRightIcon,
  SparklesIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

/* ─── Color Tokens ─────────────────────────────────────────── */
const C = {
  parliament: { 50:'#FFF7ED', 100:'#FFEDD5', 200:'#FED7AA', 500:'#F97316', 600:'#EA580C', 700:'#C2410C', 800:'#9A3412' },
  maroon:     { 600:'#7B0000', 700:'#5C0000' },
  civic:      { 600:'#2563EB', 700:'#1D4ED8' },
  gray:       { 50:'#F9FAFB', 100:'#F3F4F6', 200:'#E5E7EB', 300:'#D1D5DB', 400:'#9CA3AF', 500:'#6B7280', 700:'#374151', 800:'#1F2937', 900:'#111827' },
  status:     { keptBg:'#DCFCE7', keptText:'#14532D', keptColor:'#16A34A', progBg:'#FEF3C7', progText:'#78350F', progColor:'#D97706', brokBg:'#FEE2E2', brokText:'#7F1D1D', brokColor:'#DC2626', pendBg:'#F3F4F6', pendText:'#374151', pendColor:'#6B7280' },
};

/* ─── DATA ─────────────────────────────────────────────────── */
const HERO_SLIDES = [
  { name:'Sri Lanka Parliament', region:'Sri Jayawardenepura Kotte', src:'/lotes.jpg', fb:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Sri_Lanka_Parliament_2.jpg/1280px-Sri_Lanka_Parliament_2.jpg' },
  { name:'Supreme Court of Sri Lanka', region:'Colombo 12', src:'/cort.jpg', fb:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Supreme_Court_of_Sri_Lanka.jpg/1280px-Supreme_Court_of_Sri_Lanka.jpg' },
  { name:'Presidential Secretariat', region:'Colombo Fort', src:'/h1.jpg', fb:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Presidential_Secretariat%2C_Colombo.jpg/1280px-Presidential_Secretariat%2C_Colombo.jpg' },
];

const STATS = [
  { value:225,  label:'Politicians Tracked', sub:'Across all parties',    icon:UserGroupIcon,           color: C.parliament[600] },
  { value:1247, label:'Promises Recorded',   sub:'Since 2020',            icon:DocumentTextIcon,        color: C.civic[600]      },
  { value:34,   label:'Fulfilment Rate',      sub:'National average',      icon:ChartBarIcon,            color: C.status.keptColor, suffix:'%' },
  { value:3452, label:'Citizen Reports',      sub:'Active contributors',   icon:ChatBubbleLeftRightIcon, color: C.parliament[500] },
];

const POLITICIANS = [
  {
    name:'Anura Kumara Dissanayake', shortName:'AKD', title:'President of Sri Lanka', since:'2024–Present',
    party:'NPP', partyColor: C.maroon[600], partyBg:'#FFF1F2', partyText: C.maroon[600],
    kept:18, total:52, rating:34.6, trend:'+14.2%', trendUp:true,
    photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Anura_Kumara_Dissanayake.jpg/400px-Anura_Kumara_Dissanayake.jpg',
    photoFb:'https://picsum.photos/seed/akd/400/500',
    promises:[ { text:'Abolish executive presidency', status:'Pending' }, { text:'Recover stolen assets in yr 1', status:'In Progress' }, { text:'Cut cabinet to 25 ministers', status:'Kept' } ],
  },
  {
    name:'Sajith Premadasa', shortName:'SP', title:'Leader of the Opposition', since:'SJB Leader',
    party:'SJB', partyColor:'#1B4D3E', partyBg:'#ECFDF5', partyText:'#065F46',
    kept:67, total:95, rating:70.5, trend:'+3.8%', trendUp:true,
    photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Sajith_Premadasa_%28cropped%29.jpg/400px-Sajith_Premadasa_%28cropped%29.jpg',
    photoFb:'https://picsum.photos/seed/sajith/400/500',
    promises:[ { text:'Build 100,000 low-income homes', status:'Broken' }, { text:'Free broadband for schools', status:'In Progress' }, { text:'Double teacher salaries', status:'Pending' } ],
  },
  {
    name:'Ranil Wickremesinghe', shortName:'RW', title:'Former President', since:'2022–2024',
    party:'UNP', partyColor: C.parliament[600], partyBg: C.parliament[50], partyText: C.parliament[800],
    kept:85, total:120, rating:70.8, trend:'+2.1%', trendUp:true,
    photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Ranil_Wickremesinghe_2017.jpg/400px-Ranil_Wickremesinghe_2017.jpg',
    photoFb:'https://picsum.photos/seed/ranil/400/500',
    promises:[ { text:'Stabilise fuel supply in 3 months', status:'Kept' }, { text:'IMF debt restructuring', status:'Kept' }, { text:'Foreign reserve recovery', status:'In Progress' } ],
  },
];

const NEWS = [
  { title:'Parliament passes landmark anti-corruption bill after third reading', category:'Governance', source:'Political Desk', time:'2h ago', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Sri_Lanka_Parliament_2.jpg/640px-Sri_Lanka_Parliament_2.jpg', imgFb:'https://picsum.photos/seed/n1/640/360', featured:true },
  { title:'Opposition leader challenges economic reform timeline', category:'Economy', source:'Civic Monitor', time:'5h ago', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Independence_Memorial_Hall_Sri_Lanka.jpg/640px-Independence_Memorial_Hall_Sri_Lanka.jpg', imgFb:'https://picsum.photos/seed/n2/640/360', featured:false },
  { title:'Supreme Court rules on electoral transparency measures', category:'Law', source:'Citizen Watch', time:'1d ago', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Supreme_Court_of_Sri_Lanka.jpg/640px-Supreme_Court_of_Sri_Lanka.jpg', imgFb:'https://picsum.photos/seed/n3/640/360', featured:false },
];

const PROMISE_LIVE = [
  { pol:'AKD', text:'Reduce fuel prices by 15%',        status:'In Progress', days:120, party:'NPP', color: C.maroon[600]     },
  { pol:'SP',  text:'100,000 homes programme',           status:'Broken',     days:340, party:'SJB', color:'#1B4D3E'          },
  { pol:'RW',  text:'IMF agreement signed',              status:'Kept',       days:45,  party:'UNP', color: C.parliament[600] },
  { pol:'AKD', text:'Abolish executive presidency',      status:'Pending',    days:0,   party:'NPP', color: C.maroon[600]     },
  { pol:'SP',  text:'Free broadband for all schools',    status:'In Progress',days:80,  party:'SJB', color:'#1B4D3E'          },
  { pol:'RW',  text:'Stabilise foreign reserves',        status:'Kept',       days:60,  party:'UNP', color: C.parliament[600] },
];

const STATUS_STYLE = {
  'Kept':        { bg: C.status.keptBg,  text: C.status.keptText,  dot: C.status.keptColor  },
  'In Progress': { bg: C.status.progBg,  text: C.status.progText,  dot: C.status.progColor  },
  'Broken':      { bg: C.status.brokBg,  text: C.status.brokText,  dot: C.status.brokColor  },
  'Pending':     { bg: C.status.pendBg,  text: C.status.pendText,  dot: C.status.pendColor  },
};

/* ─── Img with fallback ─────────────────────────────────────── */
const Img = ({ src, fb, alt='', style={}, className='' }) => {
  const [err, setErr] = useState(false);
  return <img src={err?fb:src} alt={alt} style={style} className={className} referrerPolicy="no-referrer" crossOrigin="anonymous" onError={()=>setErr(true)} />;
};

/* ─── Status pill ───────────────────────────────────────────── */
const StatusPill = ({ status, small }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE['Pending'];
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: small?4:5,
      padding: small?'2px 8px':'3px 10px',
      borderRadius:999, fontSize: small?10:11, fontWeight:600,
      background: s.bg, color: s.text,
    }}>
      <span style={{ width: small?6:7, height: small?6:7, borderRadius:'50%', background: s.dot, flexShrink:0 }} />
      {status}
    </span>
  );
};

/* ─── Hero ──────────────────────────────────────────────────── */
const Hero = ({ isAdmin }) => {
  const [cur, setCur] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setInterval(() => setCur(c=>(c+1)%HERO_SLIDES.length), 5500);
    return ()=>clearInterval(t);
  }, []);

  return (
    <section style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Slideshow */}
      {HERO_SLIDES.map((sl,i) => (
        <AnimatePresence key={i}>
          {i===cur && (
            <motion.div key={`s${i}`} style={{ position:'absolute', inset:0 }}
              initial={{ opacity:0, scale:1.06 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              transition={{ duration:1.8, ease:'easeInOut' }}>
              <Img src={sl.src} fb={sl.fb} alt={sl.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Layered overlays */}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(17,5,0,0.88) 100%)', zIndex:2 }} />
      <div style={{ position:'absolute', inset:0, backgroundImage:`repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 3px)`, zIndex:3, pointerEvents:'none' }} />

      {/* Content */}
      <div style={{ position:'relative', zIndex:10, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'120px 24px 80px', maxWidth:1200, margin:'0 auto', width:'100%' }}>

        {/* Badge */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          style={{ display:'inline-flex', alignSelf:'flex-start', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:999, border:'1px solid rgba(234,88,12,0.55)', background:'rgba(234,88,12,0.12)', backdropFilter:'blur(8px)', marginBottom:24 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background: C.parliament[500], boxShadow:`0 0 0 3px rgba(249,115,22,0.3)`, animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,200,150,0.95)', letterSpacing:0.5 }}>LIVE · Sri Lanka Political Accountability Platform</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          style={{ fontSize:'clamp(2.4rem, 6vw, 5rem)', fontWeight:800, lineHeight:1.08, color:'#fff', margin:'0 0 20px', fontFamily:"'Playfair Display', Georgia, serif", maxWidth:780, textShadow:'0 2px 24px rgba(0,0,0,0.4)' }}>
          Hold Politicians{' '}
          <span style={{ color: C.parliament[400] || '#FB923C', WebkitTextStroke:'0px', background:`linear-gradient(90deg, ${C.parliament[500]}, #FBBF24)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Accountable.
          </span>
          <br />Track Every Promise.
        </motion.h1>

        <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          style={{ fontSize:'clamp(1rem, 2vw, 1.2rem)', color:'rgba(255,255,255,0.75)', maxWidth:560, lineHeight:1.7, margin:'0 0 36px', fontFamily:"'DM Sans', sans-serif" }}>
          Real-time tracking of political promises across Sri Lanka — transparent data, citizen-verified, party-independent.
        </motion.p>

        {/* Search bar */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.65 }}
          style={{ display:'flex', maxWidth:540, gap:0, marginBottom:32 }}>
          <div style={{ flex:1, position:'relative' }}>
            <MagnifyingGlassIcon style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:18, height:18, color:C.gray[400] }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search politician or promise..."
              style={{ width:'100%', padding:'13px 16px 13px 42px', fontSize:14, borderRadius:'10px 0 0 10px', border:'none', background:'rgba(255,255,255,0.95)', outline:'none', color:C.gray[900], fontFamily:"'DM Sans', sans-serif", boxSizing:'border-box' }} />
          </div>
          <button style={{ padding:'13px 22px', background: C.parliament[600], color:'#fff', border:'none', borderRadius:'0 10px 10px 0', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:"'DM Sans', sans-serif", whiteSpace:'nowrap' }}
            onMouseEnter={e=>e.currentTarget.style.background=C.parliament[700]}
            onMouseLeave={e=>e.currentTarget.style.background=C.parliament[600]}>
            Search
          </button>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8 }}
          style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {isAdmin && (
            <Link to="/admin-dashboard" style={{
              display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px',
              background:'rgba(255,255,255,0.12)', color:'#fff', borderRadius:10, fontWeight:700, fontSize:14,
              textDecoration:'none', border:'1px solid rgba(255,255,255,0.3)', fontFamily:"'DM Sans', sans-serif",
              backdropFilter:'blur(8px)',
            }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}>
              <ShieldCheckIcon style={{ width:16, height:16 }} /> Admin Dashboard
            </Link>
          )}

          <Link to="/politicians" style={{
            display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px',
            background: C.parliament[600], color:'#fff', borderRadius:10, fontWeight:700, fontSize:14,
            textDecoration:'none', fontFamily:"'DM Sans', sans-serif", transition:'all 0.2s',
            boxShadow:`0 4px 20px rgba(234,88,12,0.5)`,
          }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.parliament[700]; e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.parliament[600]; e.currentTarget.style.transform='translateY(0)';}}>
            Explore Politicians <ArrowRightIcon style={{ width:16, height:16 }} />
          </Link>
          <Link to="/promises" style={{
            display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px',
            background:'rgba(255,255,255,0.12)', color:'#fff', borderRadius:10, fontWeight:600, fontSize:14,
            textDecoration:'none', border:'1px solid rgba(255,255,255,0.28)', fontFamily:"'DM Sans', sans-serif",
            backdropFilter:'blur(8px)',
          }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}>
            <DocumentTextIcon style={{ width:16, height:16 }} /> View All Promises
          </Link>
        </motion.div>
      </div>

      {/* Slide location label */}
      <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
        <AnimatePresence mode="wait">
          <motion.div key={cur} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }} transition={{ duration:0.4 }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:999, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)' }}>
            <MapPinIcon style={{ width:13, height:13, color: C.parliament[400] || '#FB923C' }} />
            <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.9)' }}>{HERO_SLIDES[cur].name}</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>· {HERO_SLIDES[cur].region}</span>
          </motion.div>
        </AnimatePresence>
        <div style={{ display:'flex', gap:6 }}>
          {HERO_SLIDES.map((_,i) => (
            <button key={i} onClick={()=>setCur(i)} style={{ width: i===cur?24:7, height:7, borderRadius:4, background: i===cur ? C.parliament[600] : 'rgba(255,255,255,0.3)', border:'none', cursor:'pointer', padding:0, transition:'all 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Live ticker */}
      <div style={{ position:'relative', zIndex:10, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(234,88,12,0.3)', padding:'10px 0', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center' }}>
          <div style={{ flexShrink:0, padding:'0 16px', display:'flex', alignItems:'center', gap:6, borderRight:'1px solid rgba(255,255,255,0.1)' }}>
            <BellAlertIcon style={{ width:14, height:14, color: C.parliament[500] }} />
            <span style={{ fontSize:11, fontWeight:700, color: C.parliament[400] || '#FB923C', letterSpacing:1, textTransform:'uppercase' }}>Live</span>
          </div>
          <motion.div style={{ display:'flex', gap:0, paddingLeft:16 }}
            animate={{ x: [0, -1400] }} transition={{ duration:28, repeat:Infinity, ease:'linear' }}>
            {[...PROMISE_LIVE, ...PROMISE_LIVE].map((p,i) => (
              <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:8, marginRight:40, fontSize:12, color:'rgba(255,255,255,0.8)', whiteSpace:'nowrap', fontFamily:"'DM Sans',sans-serif" }}>
                <span style={{ fontWeight:700, color: p.color }}>{p.pol}</span>
                <span style={{ color:'rgba(255,255,255,0.5)' }}>·</span>
                {p.text}
                <StatusPill status={p.status} small />
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 3px rgba(249,115,22,0.3)}50%{box-shadow:0 0 0 6px rgba(249,115,22,0.1)}}`}</style>
    </section>
  );
};

/* ─── Stats Band ────────────────────────────────────────────── */
const StatsBand = () => {
  const [ref, inView] = useInView({ triggerOnce:true, threshold:0.1 });
  return (
    <section ref={ref} style={{ background: C.parliament[600], padding:'40px 24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(0,0,0,0.15) 0%, transparent 60%)` }} />
      <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32, position:'relative', zIndex:1 }}>
        {STATS.map((s,i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={inView?{opacity:1,y:0}:{}} transition={{ delay:i*0.1 }}
            style={{ textAlign:'center' }}>
            <div style={{ fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:800, color:'#fff', lineHeight:1, fontFamily:"'DM Sans',sans-serif" }}>
              {inView ? <CountUp end={s.value} duration={2} separator="," /> : 0}{s.suffix||'+'}
            </div>
            <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.9)', marginTop:4 }}>{s.label}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/* ─── Promise Live Feed ─────────────────────────────────────── */
const PromiseFeed = () => {
  const [filter, setFilter] = useState('All');
  const statuses = ['All', 'Kept', 'In Progress', 'Broken', 'Pending'];
  const filtered = filter==='All' ? PROMISE_LIVE : PROMISE_LIVE.filter(p=>p.status===filter);

  return (
    <section style={{ background: C.gray[50], padding:'72px 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:32 }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background: C.parliament[50], border:`1px solid ${C.parliament[200]}`, borderRadius:999, padding:'4px 12px', marginBottom:10 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background: C.parliament[600] }} />
              <span style={{ fontSize:11, fontWeight:700, color: C.parliament[700], letterSpacing:0.5, textTransform:'uppercase' }}>Promise Tracker</span>
            </div>
            <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:800, color: C.gray[900], margin:0, fontFamily:"'Playfair Display', Georgia, serif" }}>
              Live Promise Status Feed
            </h2>
          </div>
          <Link to="/promises" style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, fontWeight:600, color: C.parliament[600], textDecoration:'none' }}
            onMouseEnter={e=>e.currentTarget.style.color=C.parliament[700]}
            onMouseLeave={e=>e.currentTarget.style.color=C.parliament[600]}>
            View all promises <ChevronRightIcon style={{ width:16, height:16 }} />
          </Link>
        </div>

        {/* Filter pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
          {statuses.map(s => {
            const active = filter===s;
            const sStyle = s!=='All' ? STATUS_STYLE[s] : null;
            return (
              <button key={s} onClick={()=>setFilter(s)} style={{
                padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:600, cursor:'pointer',
                background: active ? (s==='All' ? C.parliament[600] : sStyle.bg) : '#fff',
                color: active ? (s==='All' ? '#fff' : sStyle.text) : C.gray[500],
                border: active ? (s==='All' ? `1.5px solid ${C.parliament[600]}` : `1.5px solid ${sStyle.dot}`) : `1.5px solid ${C.gray[200]}`,
                transition:'all 0.15s',
              }}>
                {s}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
          {filtered.map((p,i) => (
            <motion.div key={`${filter}-${i}`} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
              style={{ background:'#fff', borderRadius:12, padding:'16px 18px', border:`1px solid ${C.gray[200]}`, cursor:'pointer', transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 4px 20px rgba(234,88,12,0.12)`; e.currentTarget.style.borderColor=C.parliament[200]; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor=C.gray[200]; e.currentTarget.style.transform='translateY(0)'; }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999, background: p.color+'18', color: p.color }}>{p.party}</span>
                    <span style={{ fontSize:11, fontWeight:600, color: C.gray[500] }}>{p.pol}</span>
                  </div>
                  <p style={{ fontSize:13, fontWeight:600, color: C.gray[900], margin:0, lineHeight:1.4 }}>{p.text}</p>
                </div>
                <StatusPill status={p.status} small />
              </div>
              {p.days > 0 && (
                <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:4, fontSize:11, color: C.gray[400] }}>
                  <ClockIcon style={{ width:12, height:12 }} />
                  {p.days} days in progress
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Politicians ───────────────────────────────────────────── */
const Politicians = () => (
  <section style={{ background:'#fff', padding:'72px 24px' }}>
    <div style={{ maxWidth:1200, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:40 }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background: C.parliament[50], border:`1px solid ${C.parliament[200]}`, borderRadius:999, padding:'4px 12px', marginBottom:10 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background: C.parliament[600] }} />
            <span style={{ fontSize:11, fontWeight:700, color: C.parliament[700], letterSpacing:0.5, textTransform:'uppercase' }}>Performance</span>
          </div>
          <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:800, color: C.gray[900], margin:0, fontFamily:"'Playfair Display', Georgia, serif" }}>
            Politician Scorecards
          </h2>
        </div>
        <Link to="/politicians" style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, fontWeight:600, color: C.parliament[600], textDecoration:'none' }}>
          All politicians <ChevronRightIcon style={{ width:16, height:16 }} />
        </Link>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:24 }}>
        {POLITICIANS.map((p,i) => (
          <motion.div key={i} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
            style={{ background:'#fff', borderRadius:16, border:`1px solid ${C.gray[200]}`, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', transition:'all 0.2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 8px 32px rgba(234,88,12,0.12)`; e.currentTarget.style.transform='translateY(-4px)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform='translateY(0)'; }}>

            {/* Top: photo + basic info */}
            <div style={{ display:'flex', alignItems:'stretch', padding:20, gap:16 }}>
              <div style={{ width:72, height:72, borderRadius:12, overflow:'hidden', flexShrink:0, border:`2px solid ${C.gray[100]}` }}>
                <Img src={p.photo} fb={p.photoFb} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999, background: p.partyBg, color: p.partyColor }}>{p.party}</span>
                  {p.trendUp
                    ? <span style={{ fontSize:10, color: C.status.keptColor, display:'flex', alignItems:'center', gap:2 }}><ArrowTrendingUpIcon style={{width:11,height:11}}/>{p.trend}</span>
                    : <span style={{ fontSize:10, color: C.status.brokColor, display:'flex', alignItems:'center', gap:2 }}><ArrowTrendingDownIcon style={{width:11,height:11}}/>{p.trend}</span>
                  }
                </div>
                <div style={{ fontSize:14, fontWeight:700, color: C.gray[900], lineHeight:1.3, marginBottom:1 }}>{p.name}</div>
                <div style={{ fontSize:11, color: C.gray[500] }}>{p.title} · {p.since}</div>
              </div>
            </div>

            {/* Fulfilment bar */}
            <div style={{ padding:'0 20px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, color: C.gray[500] }}>Promise fulfilment</span>
                <span style={{ fontSize:13, fontWeight:700, color: p.partyColor }}>{p.rating}%</span>
              </div>
              <div style={{ height:8, borderRadius:999, background: C.gray[100], overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} whileInView={{ width:`${p.rating}%` }} transition={{ duration:1.2, delay:0.3 }}
                  style={{ height:'100%', borderRadius:999, background: p.partyColor }} />
              </div>
              <div style={{ display:'flex', gap:16, marginTop:8 }}>
                <span style={{ fontSize:11, color: C.status.keptColor, fontWeight:600 }}>✓ {p.kept} kept</span>
                <span style={{ fontSize:11, color: C.gray[400] }}>{p.total} total</span>
              </div>
            </div>

            {/* Mini promise list */}
            <div style={{ borderTop:`1px solid ${C.gray[100]}`, padding:'12px 20px', display:'flex', flexDirection:'column', gap:8 }}>
              {p.promises.map((pr,j) => (
                <div key={j} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                  <span style={{ fontSize:11, color: C.gray[700], flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pr.text}</span>
                  <StatusPill status={pr.status} small />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ padding:'12px 20px', borderTop:`1px solid ${C.gray[100]}` }}>
              <Link to={`/politicians/${p.name.toLowerCase().replace(/\s+/g,'-')}`}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:8, background: C.parliament[50], color: C.parliament[700], fontWeight:600, fontSize:12, textDecoration:'none', border:`1px solid ${C.parliament[200]}`, transition:'all 0.15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=C.parliament[600]; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor=C.parliament[600]; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=C.parliament[50]; e.currentTarget.style.color=C.parliament[700]; e.currentTarget.style.borderColor=C.parliament[200]; }}>
                View Full Scorecard <ArrowRightIcon style={{ width:13, height:13 }} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── News ──────────────────────────────────────────────────── */
const NewsSection = ({ newsItems }) => {
  const displayNews = newsItems.length > 0 ? newsItems : NEWS;
  const featuredNews = displayNews[0] ? [{ ...displayNews[0], featured: true }] : [];
  const sidebarNews = displayNews.slice(1, 4);

  return (
  <section style={{ background: C.gray[50], padding:'72px 24px' }}>
    <div style={{ maxWidth:1200, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:32 }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background: C.parliament[50], border:`1px solid ${C.parliament[200]}`, borderRadius:999, padding:'4px 12px', marginBottom:10 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background: C.parliament[600] }} />
            <span style={{ fontSize:11, fontWeight:700, color: C.parliament[700], letterSpacing:0.5, textTransform:'uppercase' }}>Latest News</span>
          </div>
          <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:800, color: C.gray[900], margin:0, fontFamily:"'Playfair Display', Georgia, serif" }}>
            Political Developments
          </h2>
        </div>
        <Link to="/news" style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, fontWeight:600, color: C.parliament[600], textDecoration:'none' }}>
          All news <ChevronRightIcon style={{ width:16, height:16 }} />
        </Link>
      </div>

      {/* Featured + sidebar layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:20 }}>
        {/* Featured */}
        {featuredNews.map((n,i) => (
          <motion.div key={i} initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
            style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${C.gray[200]}`, background:'#fff', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', gridRow:'span 2' }}
            onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 8px 32px rgba(234,88,12,0.1)`; e.currentTarget.style.transform='translateY(-3px)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform='translateY(0)'; }}>
            <div style={{ position:'relative', height:260, overflow:'hidden', background: C.gray[100] }}>
              <Img src={n.image || n.img} fb={n.imgFb || 'https://picsum.photos/seed/news-feature/640/360'} alt={n.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
              <span style={{ position:'absolute', top:14, left:14, padding:'4px 10px', borderRadius:999, background: C.parliament[600], color:'#fff', fontSize:11, fontWeight:700 }}>{n.category || 'News'}</span>
            </div>
            <div style={{ padding:20 }}>
              <h3 style={{ fontSize:17, fontWeight:700, color: C.gray[900], margin:'0 0 10px', lineHeight:1.4, fontFamily:"'Playfair Display', Georgia, serif" }}>{n.title}</h3>
              <div style={{ display:'flex', gap:12, fontSize:11, color: C.gray[400] }}>
                <span>{n.source || 'News Desk'}</span>
                <span style={{ display:'flex', alignItems:'center', gap:3 }}><ClockIcon style={{width:11,height:11}}/>{n.time || (n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : 'Latest')}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Sidebar news */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {sidebarNews.map((n,i) => (
            <motion.div key={i} initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} transition={{ delay:i*0.1+0.1 }}
              style={{ display:'flex', gap:12, background:'#fff', borderRadius:12, overflow:'hidden', border:`1px solid ${C.gray[200]}`, cursor:'pointer', transition:'all 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 4px 16px rgba(234,88,12,0.1)`; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform='translateY(0)'; }}>
              <div style={{ width:100, flexShrink:0, background: C.gray[100], position:'relative', overflow:'hidden' }}>
                <Img src={n.image || n.img} fb={n.imgFb || 'https://picsum.photos/seed/news-side/320/200'} alt={n.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <span style={{ position:'absolute', top:6, left:6, padding:'2px 6px', borderRadius:4, background: C.parliament[600], color:'#fff', fontSize:9, fontWeight:700 }}>{n.category || 'News'}</span>
              </div>
              <div style={{ padding:'14px 14px 14px 0', flex:1 }}>
                <h3 style={{ fontSize:13, fontWeight:700, color: C.gray[900], margin:'0 0 6px', lineHeight:1.35 }}>{n.title}</h3>
                <div style={{ display:'flex', gap:8, fontSize:10, color: C.gray[400] }}>
                  <span>{n.source || 'News Desk'}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:2 }}><ClockIcon style={{width:10,height:10}}/>{n.time || (n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : 'Latest')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};

/* ─── CTA Banner ────────────────────────────────────────────── */
const CTABanner = () => (
  <section style={{ background:`linear-gradient(135deg, ${C.parliament[800]}, ${C.parliament[600]})`, padding:'72px 24px', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(circle at 10% 50%, rgba(255,255,255,0.07) 0%, transparent 50%), radial-gradient(circle at 90% 50%, rgba(0,0,0,0.2) 0%, transparent 50%)` }} />
    <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
      <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:999, border:'1px solid rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.1)', marginBottom:20 }}>
          <ShieldCheckIcon style={{ width:14, height:14, color:'rgba(255,200,150,0.9)' }} />
          <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,200,150,0.9)', letterSpacing:0.5, textTransform:'uppercase' }}>Join the Movement</span>
        </div>
        <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'#fff', margin:'0 0 14px', fontFamily:"'Playfair Display', Georgia, serif", lineHeight:1.2 }}>
          Democracy Works When Citizens Pay Attention
        </h2>
        <p style={{ fontSize:16, color:'rgba(255,255,255,0.78)', margin:'0 0 32px', lineHeight:1.7 }}>
          Create a free account to track promises, submit reports, and hold your elected representatives accountable.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 28px', background:'#fff', color: C.parliament[700], borderRadius:10, fontWeight:700, fontSize:14, textDecoration:'none', transition:'all 0.2s', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}
            onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.2)'; }}>
            Create Free Account <ArrowRightIcon style={{ width:16, height:16 }} />
          </Link>
          <Link to="/promises" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 28px', background:'rgba(255,255,255,0.12)', color:'#fff', borderRadius:10, fontWeight:600, fontSize:14, textDecoration:'none', border:'1px solid rgba(255,255,255,0.3)', backdropFilter:'blur(8px)' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}>
            Browse Promises
          </Link>
        </div>
        {/* Trust indicators */}
        <div style={{ display:'flex', gap:24, justifyContent:'center', marginTop:32, flexWrap:'wrap' }}>
          {['🇱🇰 Sri Lanka focused','🔒 Independent & non-partisan','📊 Evidence-based tracking'].map((b,i) => (
            <span key={i} style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>{b}</span>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

/* ─── Floating feedback button ──────────────────────────────── */
const FloatingBtn = () => (
  <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:1.5 }}
    style={{ position:'fixed', bottom:28, right:28, zIndex:50 }}>
    <Link to="/feedback" style={{
      display:'flex', alignItems:'center', gap:8, padding:'12px 18px',
      background: C.parliament[600], color:'#fff', borderRadius:999, fontWeight:600, fontSize:13,
      textDecoration:'none', boxShadow:`0 4px 20px rgba(234,88,12,0.5)`,
      border:`1px solid ${C.parliament[500]}`,
    }}
      onMouseEnter={e=>{ e.currentTarget.style.background=C.parliament[700]; e.currentTarget.style.transform='scale(1.05)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.background=C.parliament[600]; e.currentTarget.style.transform='scale(1)'; }}>
      <ChatBubbleLeftRightIcon style={{ width:18, height:18 }} />
      <span>Give Feedback</span>
    </Link>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN HOME
═══════════════════════════════════════════════════════════════ */
const Home = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [latestNews, setLatestNews] = useState([]);
  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch {
      return null;
    }
  });
  const isAdmin = userInfo?.role === 'admin';

  const mapTrendArticle = (article) => ({
    title: article.title,
    description: article.description,
    source: article.source?.name || 'Live News Feed',
    publishedAt: article.publishedAt,
    time: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Latest',
    image: article.image,
    url: article.url,
    category: 'Live',
  });

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/news/social/trends`);
        const articles = Array.isArray(response.data?.articles) ? response.data.articles : [];

        if (articles.length > 0) {
          setLatestNews(articles.slice(0, 4).map(mapTrendArticle));
          return;
        }

        throw new Error('No live trend articles returned');
      } catch (error) {
        try {
          const fallbackResponse = await axios.get(`${API_URL}/api/news/public`);
          setLatestNews(Array.isArray(fallbackResponse.data) ? fallbackResponse.data.slice(0, 4) : []);
        } catch (fallbackError) {
          setLatestNews([]);
        }
      }
    };

    fetchLatestNews();
  }, [API_URL]);

  useEffect(() => {
    const syncUser = () => {
      try {
        setUserInfo(JSON.parse(localStorage.getItem('userInfo')));
      } catch {
        setUserInfo(null);
      }
    };

    window.addEventListener('authChange', syncUser);
    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener('authChange', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", overflowX:'hidden' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <Hero isAdmin={isAdmin} />
      <StatsBand />
      <PromiseFeed />
      <Politicians />
      <NewsSection newsItems={latestNews} />
      <CTABanner />
      <FloatingBtn />
    </div>
  );
};

export default Home;
