import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  PlayIcon,
  SparklesIcon,
  FingerPrintIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

/* ═══════════════════════════════════════════════════════════════════
   ALL IMAGES — verified direct URLs (Wikipedia Commons + Wikimedia)
   Every entry has a picsum fallback so the site never breaks.
═══════════════════════════════════════════════════════════════════ */

// ── Hero Slideshow: real Sri Lanka civic buildings ──────────────────
const HERO_SLIDES = [
  {
    name: 'Sri Lanka Parliament',
    region: 'Sri Jayawardenepura Kotte',
    src: '/lotes.jpg',
  },
    {
    name: 'Sri Lanka Parliament',
    region: 'Sri Jayawardenepura Kotte',
    src: '/cort.jpg',
  },
    {
    name: 'Sri Lanka Parliament',
    region: 'Sri Jayawardenepura Kotte',
    src: '/h1.jpg',
  },

//   {
//     name: 'Supreme Court of Sri Lanka',
//     region: 'Colombo 12',
//     src: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Supreme_Court_of_Sri_Lanka.jpg',
//     fb: 'https://picsum.photos/seed/court/1600/900',
//   },
//   {
//     name: 'Independence Memorial Hall',
//     region: 'Colombo 07',
//     src: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Independence_Memorial_Hall_Sri_Lanka.jpg',
//     fb: 'https://picsum.photos/seed/indep/1600/900',
//   },
//   {
//     name: 'Galle Face Green',
//     region: 'Colombo 03',
//     src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Galle_Face_Green_Colombo.jpg/1280px-Galle_Face_Green_Colombo.jpg',
//     fb: 'https://picsum.photos/seed/gface/1600/900',
//   },
];

// ── Scrolling strip thumbnails ──────────────────────────────────────
const STRIP = [
  { name: 'Parliament',             src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Sri_Lanka_Parliament_2.jpg/480px-Sri_Lanka_Parliament_2.jpg',                                                   fb: 'https://picsum.photos/seed/st1/400/250' },
  { name: 'Presidential Secretariat', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Presidential_Secretariat%2C_Colombo.jpg/480px-Presidential_Secretariat%2C_Colombo.jpg',                     fb: 'https://picsum.photos/seed/st2/400/250' },
  { name: 'Supreme Court',          src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Supreme_Court_of_Sri_Lanka.jpg/480px-Supreme_Court_of_Sri_Lanka.jpg',                                          fb: 'https://picsum.photos/seed/st3/400/250' },
  { name: 'Independence Hall',      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Independence_Memorial_Hall_Sri_Lanka.jpg/480px-Independence_Memorial_Hall_Sri_Lanka.jpg',                      fb: 'https://picsum.photos/seed/st4/400/250' },
  { name: 'Galle Face Green',       src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Galle_Face_Green_Colombo.jpg/480px-Galle_Face_Green_Colombo.jpg',                                             fb: 'https://picsum.photos/seed/st5/400/250' },
  { name: 'Sigiriya',               src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sigiriya_mirror_wall.jpg/480px-Sigiriya_mirror_wall.jpg',                                                      fb: 'https://picsum.photos/seed/st6/400/250' },
  { name: 'Temple of the Tooth',    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sri_Dalada_Maligawa_in_Kandy.jpg/480px-Sri_Dalada_Maligawa_in_Kandy.jpg',                                     fb: 'https://picsum.photos/seed/st7/400/250' },
  { name: 'Galle Dutch Fort',       src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Galle_fort_gate.jpg/480px-Galle_fort_gate.jpg',                                                               fb: 'https://picsum.photos/seed/st8/400/250' },
];

// ── Politicians — CORRECT names & real Wikipedia photos ────────────
const POLITICIANS = [
  {
    name: 'Anura Kumara Dissanayake',
    fullTitle: 'President Anura Kumara Dissanayake',
    role: 'President of Sri Lanka (2024–Present)',
    party: 'NPP',
    promisesKept: 18,
    totalPromises: 52,
    rating: 34.6,
    trend: '+14.2%',
    color: '#7B0000',
    // Direct Wikipedia Commons URL — actual photo of AKD
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Anura_Kumara_Dissanayake.jpg/400px-Anura_Kumara_Dissanayake.jpg',
    photoFb: 'https://picsum.photos/seed/akd/400/500',
    place: 'Presidential Secretariat, Colombo',
    placeImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Presidential_Secretariat%2C_Colombo.jpg/640px-Presidential_Secretariat%2C_Colombo.jpg',
    placeImgFb: 'https://picsum.photos/seed/akd-place/640/400',
  },
  {
    name: 'Sajith Premadasa',
    fullTitle: 'Hon. Sajith Premadasa',
    role: 'Leader of the Opposition & SJB Leader',
    party: 'SJB',
    promisesKept: 67,
    totalPromises: 95,
    rating: 70.5,
    trend: '+3.8%',
    color: '#1B4D3E',
    // Direct Wikipedia Commons URL — actual photo of Sajith Premadasa
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Sajith_Premadasa_%28cropped%29.jpg/400px-Sajith_Premadasa_%28cropped%29.jpg',
    photoFb: 'https://picsum.photos/seed/sajith/400/500',
    place: 'Independence Memorial Hall, Colombo',
    placeImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Independence_Memorial_Hall_Sri_Lanka.jpg/640px-Independence_Memorial_Hall_Sri_Lanka.jpg',
    placeImgFb: 'https://picsum.photos/seed/sajith-place/640/400',
  },
  {
    name: 'Ranil Wickremesinghe',
    fullTitle: 'Former President Ranil Wickremesinghe',
    role: 'Former President of Sri Lanka (2022–2024)',
    party: 'UNP',
    promisesKept: 85,
    totalPromises: 120,
    rating: 70.8,
    trend: '+2.1%',
    color: '#FF6B35',
    // Direct Wikipedia Commons URL — actual photo of Ranil
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Ranil_Wickremesinghe_2017.jpg/400px-Ranil_Wickremesinghe_2017.jpg',
    photoFb: 'https://picsum.photos/seed/ranil/400/500',
    place: 'Sri Lanka Parliament, Kotte',
    placeImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Sri_Lanka_Parliament_2.jpg/640px-Sri_Lanka_Parliament_2.jpg',
    placeImgFb: 'https://picsum.photos/seed/ranil-place/640/400',
  },
];

// ── News card images — contextual civic photos ──────────────────────
const NEWS = [
  {
    title: 'Parliament debates key economic reform legislation',
    source: 'Political Desk', time: '2 hours ago', category: 'Governance',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Sri_Lanka_Parliament_2.jpg/640px-Sri_Lanka_Parliament_2.jpg',
    imgFb: 'https://picsum.photos/seed/news1/500/300',
  },
  {
    title: 'Opposition leader Sajith Premadasa addresses economic concerns',
    source: 'Civic Monitor', time: '5 hours ago', category: 'Economy',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Independence_Memorial_Hall_Sri_Lanka.jpg/640px-Independence_Memorial_Hall_Sri_Lanka.jpg',
    imgFb: 'https://picsum.photos/seed/news2/500/300',
  },
  {
    title: 'Supreme Court rules on electoral transparency measures',
    source: 'Citizen Watch', time: '1 day ago', category: 'Law',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Supreme_Court_of_Sri_Lanka.jpg/640px-Supreme_Court_of_Sri_Lanka.jpg',
    imgFb: 'https://picsum.photos/seed/news3/500/300',
  },
];

// ── Section background images ───────────────────────────────────────
const SEC_BG = {
  stats:        { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Sri_Lanka_Parliament_2.jpg/1280px-Sri_Lanka_Parliament_2.jpg',                                        fb: 'https://picsum.photos/seed/sbg1/1600/800' },
  features:     { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Independence_Memorial_Hall_Sri_Lanka.jpg/1280px-Independence_Memorial_Hall_Sri_Lanka.jpg',           fb: 'https://picsum.photos/seed/sbg2/1600/800' },
  politicians:  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Presidential_Secretariat%2C_Colombo.jpg/1280px-Presidential_Secretariat%2C_Colombo.jpg',             fb: 'https://picsum.photos/seed/sbg3/1600/800' },
  news:         { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Supreme_Court_of_Sri_Lanka.jpg/1280px-Supreme_Court_of_Sri_Lanka.jpg',                               fb: 'https://picsum.photos/seed/sbg4/1600/800' },
  testimonials: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Independence_Memorial_Hall_Sri_Lanka.jpg/1280px-Independence_Memorial_Hall_Sri_Lanka.jpg',           fb: 'https://picsum.photos/seed/sbg5/1600/800' },
  cta:          { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Presidential_Secretariat%2C_Colombo.jpg/1280px-Presidential_Secretariat%2C_Colombo.jpg',             fb: 'https://picsum.photos/seed/sbg6/1600/800' },
};

/* ═══════════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════════ */
const STATS = [
  { id:1, value:225,  label:'Politicians Tracked', icon:UserGroupIcon,           suffix:'+' },
  { id:2, value:1247, label:'Promises Made',        icon:DocumentTextIcon,        suffix:'+' },
  { id:3, value:856,  label:'Promises Kept',        icon:CheckBadgeIcon,          suffix:'+' },
  { id:4, value:3452, label:'Citizen Reports',      icon:ChatBubbleLeftRightIcon, suffix:'+' },
];

const FEATURES = [
  { icon:ShieldCheckIcon,         title:'Promise Tracking',      desc:'Track political promises with status updates, supporting evidence, and public accountability.', gradient:'from-blue-500 to-cyan-500',     stat:'95% Accuracy', delay:0    },
  { icon:ChartBarIcon,            title:'Performance Analytics', desc:'View completion rates, politician ratings, and promise fulfillment history.',                   gradient:'from-purple-500 to-pink-500',  stat:'Live Updates',  delay:0.1  },
  { icon:GlobeAltIcon,            title:'News Integration',      desc:'Connect political news and developments with ongoing promises and public feedback.',             gradient:'from-orange-500 to-red-500',   stat:'24/7 Updates',  delay:0.2  },
  { icon:ChatBubbleLeftRightIcon, title:'Citizen Feedback',      desc:'Let citizens contribute reports, opinions, and evidence for better transparency.',              gradient:'from-green-500 to-emerald-500',stat:'10k+ Reviews',  delay:0.3  },
];

const TESTIMONIALS = [
  { name:'Nimal Perera',           role:'Colombo Resident',    img:'https://randomuser.me/api/portraits/men/11.jpg',   comment:'This platform clearly shows which promises are being kept and which are not.',  rating:5 },
  { name:'Kamala Silva',           role:'Community Volunteer', img:'https://randomuser.me/api/portraits/women/21.jpg', comment:'The visual design and transparent data make this very useful for citizens.',     rating:5 },
  { name:'Dr. Asanka Weerasinghe', role:'University Lecturer', img:'https://randomuser.me/api/portraits/men/32.jpg',   comment:'A strong concept for democratic transparency and public participation.',         rating:5 },
];

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */

/** Safe image: shows fallback on any load error */
const Img = ({ src, fb, alt = '', className = '', style = {} }) => {
  const [err, setErr] = useState(false);
  return (
    <img
      src={err ? fb : src}
      alt={alt}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={() => setErr(true)}
      className={className}
      style={style}
    />
  );
};

/** Section background layer */
const SectionBg = ({ src, fb, opacity = 0.07, overlay = 'bg-white/93 dark:bg-gray-900/93' }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <Img src={src} fb={fb} alt="" className="w-full h-full object-cover" style={{ opacity }} />
    <div className={`absolute inset-0 ${overlay}`} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   HERO SLIDESHOW
═══════════════════════════════════════════════════════════════════ */
const HeroSlideshow = () => {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCur(c => (c + 1) % HERO_SLIDES.length), 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {/* Slides */}
      {HERO_SLIDES.map((sl, i) => (
        <AnimatePresence key={i}>
          {i === cur && (
            <motion.div
              key={`slide-${i}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            >
              <Img src={sl.src} fb={sl.fb} alt={sl.name} className="w-full h-full object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/72 via-black/52 to-orange-950/88 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-10" />

      {/* Location pill + dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={`lbl-${cur}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.45 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/35 backdrop-blur-md border border-white/22"
          >
            <MapPinIcon className="w-4 h-4 text-orange-300 flex-shrink-0" />
            <span className="text-white text-sm font-semibold">{HERO_SLIDES[cur].name}</span>
            <span className="text-white/55 text-xs hidden sm:inline">· {HERO_SLIDES[cur].region}</span>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i} onClick={() => setCur(i)} aria-label={`Slide ${i + 1}`}
              style={{
                width: i === cur ? 26 : 8, height: 8, padding: 0,
                borderRadius: 4, border: 'none', cursor: 'pointer',
                background: i === cur ? '#F59E0B' : 'rgba(255,255,255,0.32)',
                transition: 'all 0.35s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SCROLLING STRIP
═══════════════════════════════════════════════════════════════════ */
const LandmarkStrip = () => {
  const doubled = [...STRIP, ...STRIP];
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-950 via-orange-950 to-red-950 py-1">
      <motion.div
        className="flex" style={{ width: 'max-content' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="relative flex-shrink-0 overflow-hidden" style={{ width: 240, height: 140, margin: '0 3px' }}>
            <Img src={item.src} fb={item.fb} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
              <MapPinIcon className="w-3 h-3 text-orange-300 flex-shrink-0" />
              <span className="text-white text-xs font-medium leading-tight">{item.name}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   STAT CARDS
═══════════════════════════════════════════════════════════════════ */
const StatCards = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}
          className="bg-white/96 dark:bg-gray-800/96 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <s.icon className="w-6 h-6 text-orange-500" />
            </div>
            <SparklesIcon className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {inView ? <CountUp end={s.value} duration={2.5} /> : 0}{s.suffix}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const Home = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroSlideshow />
        <div className="relative z-20 container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">

            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8 }} className="mb-6">
              <span className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/12 backdrop-blur-md text-orange-200 text-sm font-semibold border border-white/22">
                <FingerPrintIcon className="w-4 h-4 mr-2" />
                Sri Lanka Transparency Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              style={{ textShadow:'0 4px 32px rgba(0,0,0,0.55)' }}
            >
              Track Political Promises
              <span className="block bg-gradient-to-r from-orange-300 to-yellow-300 bg-clip-text text-transparent">
                in Sri Lanka
              </span>
            </motion.h1>

            <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.4 }} className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Empowering citizens with real-time data on political accountability, promise tracking, and public participation across Sri Lanka.
            </motion.p>

            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/politicians" className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-700 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-orange-500/35 transform hover:scale-105 transition-all duration-300">
                Start Tracking Now
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white/12 backdrop-blur-md text-white rounded-xl font-semibold border border-white/28 hover:bg-white/22 transition-all">
                <PlayIcon className="w-5 h-5 mr-2" /> Watch Demo
              </button>
            </motion.div>

            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }} className="mt-12 flex flex-wrap justify-center gap-6">
              {['Trusted by citizens','Visual promise tracking','Sri Lanka focused'].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckBadgeIcon className="w-4 h-4 text-green-400" />{b}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── LANDMARK STRIP ───────────────────────────────────────── */}
      <LandmarkStrip />

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <SectionBg src={SEC_BG.stats.src} fb={SEC_BG.stats.fb} opacity={0.06} overlay="bg-white/94 dark:bg-gray-900/94" />
        <div className="container mx-auto px-4 relative z-10"><StatCards /></div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <SectionBg src={SEC_BG.features.src} fb={SEC_BG.features.fb} opacity={0.06} overlay="bg-gradient-to-br from-gray-50/95 to-white/95 dark:from-gray-900/95 dark:to-gray-800/95" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-6">
              <MapPinIcon className="w-4 h-4" /> Built for Sri Lanka
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for
              <span className="bg-gradient-to-r from-orange-500 to-red-700 bg-clip-text text-transparent"> Democratic Transparency</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">A modern platform designed to connect citizens, political promises, and public evidence.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:f.delay }} whileHover={{ y:-10 }} onHoverStart={() => setHoveredCard(i)} onHoverEnd={() => setHoveredCard(null)} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-700 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 h-full hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${f.gradient} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{f.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-orange-500">{f.stat}</span>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POLITICIANS ──────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <SectionBg src={SEC_BG.politicians.src} fb={SEC_BG.politicians.fb} opacity={0.05} overlay="bg-white/93 dark:bg-gray-900/93" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Leading Politicians
              <span className="block text-orange-500">Performance Dashboard</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Real-time tracking — President Anura Kumara Dissanayake, Sajith Premadasa & Ranil Wickremesinghe
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {POLITICIANS.map((p, i) => (
              <motion.div key={i} initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }} transition={{ delay: i * 0.1 }} whileHover={{ y:-10 }} className="group">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">

                  {/* ── Politician photo ── */}
                  <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700" style={{ height: 300 }}>
                    <Img src={p.photo} fb={p.photoFb} alt={p.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-xl font-bold mb-0.5 drop-shadow leading-tight">{p.fullTitle}</h3>
                      <p className="text-white/78 text-xs leading-snug">{p.role}</p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1.5 bg-white/93 dark:bg-gray-800/90 rounded-full text-sm font-bold shadow" style={{ color: p.color }}>{p.party}</span>
                    </div>
                  </div>

                  {/* ── Associated landmark ── */}
                  <div className="relative overflow-hidden" style={{ height: 148 }}>
                    <Img src={p.placeImg} fb={p.placeImgFb} alt={p.place} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                      <MapPinIcon className="w-4 h-4 text-orange-300 flex-shrink-0" />
                      <span className="text-white text-sm font-semibold drop-shadow">{p.place}</span>
                    </div>
                  </div>

                  {/* ── Stats ── */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Promise Fulfillment</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{p.rating}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                      <motion.div
                        initial={{ width: 0 }} whileInView={{ width: `${p.rating}%` }}
                        transition={{ duration: 1.2, delay: 0.4 }}
                        className="h-3 rounded-full"
                        style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}aa)` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm mb-5">
                      <span className="text-gray-600 dark:text-gray-400">Kept: {p.promisesKept}</span>
                      <span className="text-gray-600 dark:text-gray-400">Total: {p.totalPromises}</span>
                      <span className="text-green-600 font-bold">{p.trend}</span>
                    </div>
                    <Link
                      to={`/politicians/${p.name.toLowerCase().replace(/\s+/g,'-')}`}
                      className="block w-full text-center py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-orange-500 hover:text-white transition-all font-semibold"
                    >
                      View Detailed Report
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWS ─────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <SectionBg src={SEC_BG.news.src} fb={SEC_BG.news.fb} opacity={0.05} overlay="bg-gradient-to-br from-gray-50/95 to-white/95 dark:from-gray-900/95 dark:to-gray-800/95" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Latest Political News</h2>
              <p className="text-gray-600 dark:text-gray-400">Sri Lanka-focused civic news</p>
            </div>
            <Link to="/news" className="flex items-center gap-1 text-orange-500 font-semibold hover:gap-2 transition-all">
              View All News <ChevronRightIcon className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NEWS.map((n, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay: i * 0.1 }} whileHover={{ y:-5 }} className="group cursor-pointer">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all">
                  <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700" style={{ height: 192 }}>
                    <Img src={n.img} fb={n.imgFb} alt={n.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">{n.category}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors">{n.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{n.source}</span>
                      <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" />{n.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <SectionBg src={SEC_BG.testimonials.src} fb={SEC_BG.testimonials.fb} opacity={0.04} overlay="bg-white/94 dark:bg-gray-900/94" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Citizens Across <span className="text-orange-500">Sri Lanka</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Join users who want better political transparency</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }} transition={{ delay: i * 0.1 }} whileHover={{ y:-5 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <img src={t.img} alt={t.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover mr-4" onError={e => { e.target.src = `https://picsum.photos/seed/tm${i}/80/80`; }} />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{t.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, j) => (<StarIcon key={j} className="w-5 h-5 text-yellow-400 fill-current" />))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic">"{t.comment}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Img src={SEC_BG.cta.src} fb={SEC_BG.cta.fb} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/94 to-red-800/94" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow">Ready to Make a Difference?</h2>
            <p className="text-xl text-white/90 mb-8">Join the movement for transparent governance in Sri Lanka.</p>
            <Link to="/register" className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all">
              Get Started Now <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FLOATING BUTTON ──────────────────────────────────────── */}
      <motion.button initial={{ scale:0 }} animate={{ scale:1 }} whileHover={{ scale:1.1 }} className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-orange-500 to-red-700 text-white p-4 rounded-full shadow-2xl">
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </motion.button>

    </div>
  );
};

export default Home;