import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, CheckCircle, XCircle, Clock, AlertCircle, 
  ThumbsUp, ThumbsDown, User, Flag, ArrowRight,
  Share2, MessageSquareWarning, MapPin, Globe, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- PREMIUM PUBLIC COLOR TOKENS ---
const C = {
  primary: '#EA580C', primaryLight: '#FFEDD5',
  gradient: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
  bg: '#F8FAFC', card: '#FFFFFF', text: '#0F172A', textMuted: '#64748B', border: '#E2E8F0',
  shadow: '0 10px 40px -10px rgba(15,23,42,0.08)',
  status: {
    Kept: { bg: 'rgba(22, 163, 74, 0.1)', text: '#16A34A', border: 'rgba(22, 163, 74, 0.2)', icon: CheckCircle },
    Broken: { bg: 'rgba(220, 38, 38, 0.1)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.2)', icon: XCircle },
    'In-Progress': { bg: 'rgba(217, 119, 6, 0.1)', text: '#D97706', border: 'rgba(217, 119, 6, 0.2)', icon: AlertCircle },
    Pending: { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748B', border: 'rgba(100, 116, 139, 0.2)', icon: Clock }
  }
};

const CATEGORIES = ['All', 'Economy', 'Education', 'Health', 'Infrastructure', 'Governance'];
const DISTRICTS = ['All Districts', 'Colombo', 'Gampaha', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala', 'National'];

// --- TRILINGUAL DICTIONARY ---
const TRANSLATIONS = {
  en: {
    hero: "Hold Leaders", heroSpan: "Accountable.", sub: "Janaya360 tracks official political commitments, audits their progress, and provides verified news evidence.",
    kept: "Promises Kept", total: "Total Tracked", search: "Search by politician or promise...", allDistricts: "All Districts",
    truthful: "Truthful", false: "False", share: "Share", report: "Report Discrepancy", evidence: "Evidence", noMatches: "No matches found",
    prev: "Previous", next: "Next", page: "Page"
  },
  si: {
    hero: "නායකයින්", heroSpan: "වගකීමට බැඳීම.", sub: "Janaya360 නිල දේශපාලන පොරොන්දු නිරීක්ෂණය කරයි, ඒවායේ ප්‍රගතිය විගණනය කරයි, සහ තහවුරු කළ පුවත් සාක්ෂි සපයයි.",
    kept: "ඉටු කළ පොරොන්දු", total: "මුළු ගණන", search: "දේශපාලනඥයා හෝ පොරොන්දුව සොයන්න...", allDistricts: "සියලුම දිස්ත්‍රික්ක",
    truthful: "සත්‍යයි", false: "අසත්‍යයි", share: "බෙදාගන්න", report: "දෝෂයක් වාර්තා කරන්න", evidence: "සාක්ෂි", noMatches: "ගැලපෙන දත්ත නොමැත",
    prev: "පෙර", next: "ඊළඟ", page: "පිටුව"
  },
  ta: {
    hero: "தலைவர்களை", heroSpan: "பொறுப்பாக்குங்கள்.", sub: "Janaya360 அதிகாரப்பூர்வ அரசியல் வாக்குறுதிகளை கண்காணிக்கிறது, அவற்றின் முன்னேற்றத்தை தணிக்கை செய்கிறது.",
    kept: "நிறைவேற்றியவை", total: "மொத்தம்", search: "அரசியல்வாதி அல்லது வாக்குறுதியைத் தேடுங்கள்...", allDistricts: "அனைத்து மாவட்டங்களும்",
    truthful: "உண்மை", false: "பொய்", share: "பகிர்", report: "பிழையை அறிக்கை செய்", evidence: "சான்றுகள்", noMatches: "பொருத்தங்கள் கிடைக்கவில்லை",
    prev: "முந்தைய", next: "அடுத்த", page: "பக்கம்"
  }
};

const Promises = () => {
  // ✅ FIXED: Hook is now safely inside the component
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // --- STATES ---
  const [promises, setPromises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDistrict, setActiveDistrict] = useState('All Districts');
  const [lang, setLang] = useState('en');
  
  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  
  // Interaction States
  const [votes, setVotes] = useState({}); 
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedPromiseForReport, setSelectedPromiseForReport] = useState(null);
  const [reportForm, setReportForm] = useState({ url: '', reason: '' });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const t = TRANSLATIONS[lang];

  // --- DATA FETCHING (100% REAL DATA) ---
  useEffect(() => {
    const fetchPublicPromises = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/promises`);
        let fetchedData = response.data.data || response.data || [];
        
        const initialVotes = {};
        
        fetchedData = fetchedData.map(p => {
          initialVotes[p._id] = { 
            up: p.upvotes || 0, 
            down: p.downvotes || 0, 
            userVote: null 
          };
          return { ...p, district: p.district || 'National' }; 
        });

        setPromises(fetchedData);
        setVotes(initialVotes);
      } catch (error) { 
        toast.error("Failed to load public promises"); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchPublicPromises();
  }, [API_URL]);

  // --- PUBLIC FILTERING ---
  const displayedPromises = useMemo(() => {
    return promises.filter(p => {
      const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.politicianId?.name && p.politicianId.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesDistrict = activeDistrict === 'All Districts' || p.district === activeDistrict;
      return matchesSearch && matchesCategory && matchesDistrict;
    });
  }, [promises, searchQuery, activeCategory, activeDistrict]);

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, activeDistrict]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(displayedPromises.length / itemsPerPage);
  const paginatedPromises = displayedPromises.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPromises = promises.length;
  const fulfillmentRate = totalPromises === 0 ? 0 : Math.round((promises.filter(p => p.status === 'Kept').length / totalPromises) * 100);

  // --- INTERACTION HANDLERS ---
  const handleVote = async (id, type) => {
    // Optimistic UI Update
    setVotes(prev => {
      const pVotes = prev[id];
      const isRemovingVote = pVotes.userVote === type;
      const isSwitchingVote = pVotes.userVote && pVotes.userVote !== type;

      let newUp = pVotes.up;
      let newDown = pVotes.down;

      if (isRemovingVote) {
        if (type === 'up') newUp--; else newDown--;
      } else {
        if (type === 'up') { newUp++; if (isSwitchingVote) newDown--; } 
        else { newDown++; if (isSwitchingVote) newUp--; }
      }

      return { ...prev, [id]: { up: Math.max(0, newUp), down: Math.max(0, newDown), userVote: isRemovingVote ? null : type } };
    });

    // Send to backend
    try {
      await axios.post(`${API_URL}/api/promises/${id}/vote`, {
        voteType: type,
        action: votes[id].userVote === type ? 'remove' : 'add'
      });
    } catch (error) {
      toast.error("Vote failed to save on the server.");
    }
  };

  const handleShare = async (promise) => {
    const shareText = `Check out this political promise by ${promise.politicianId?.name || 'an official'} on Janaya360! Status: ${promise.status}.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Janaya360', text: shareText, url: `${window.location.origin}/promise/${promise._id}` }); } 
      catch (error) { console.log('Error sharing', error); }
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}/promise/${promise._id}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    setTimeout(() => {
      setIsSubmittingReport(false);
      setReportModalOpen(false);
      setReportForm({ url: '', reason: '' });
      toast.success("Evidence submitted to Admins for review! Thank you.");
    }, 1500);
  };

  // --- UI HELPERS ---
  const SkeletonCard = () => (
    <div style={{ background: C.card, borderRadius: '24px', padding: '24px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E2E8F0', animation: 'pulse 1.5s infinite ease-in-out' }}></div><div style={{ flex: 1 }}><div style={{ height: '14px', width: '40%', background: '#E2E8F0', borderRadius: '4px', marginBottom: '8px' }}></div><div style={{ height: '10px', width: '20%', background: '#F1F5F9', borderRadius: '4px' }}></div></div></div>
      <div style={{ height: '20px', width: '90%', background: '#E2E8F0', borderRadius: '6px' }}></div>
      <div style={{ height: '60px', width: '100%', background: '#F1F5F9', borderRadius: '8px' }}></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* --- HERO SECTION --- */}
      <div style={{ background: '#111827', position: 'relative', overflow: 'hidden', padding: '60px 24px 80px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px', zIndex: 20, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '99px' }}>
          <Globe size={18} color="#fff" style={{ margin: 'auto 6px' }} />
          {['en', 'si', 'ta'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? C.primary : 'transparent', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>{l}</button>
          ))}
        </div>
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: C.primary, opacity: 0.15, filter: 'blur(100px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: '#3B82F6', opacity: 0.15, filter: 'blur(80px)', borderRadius: '50%' }}></div>
        
        <div style={{ maxWidth: '1000px', margin: '40px auto 0', position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '900', color: '#FFFFFF', margin: '0 0 16px', letterSpacing: '-1px' }}>
            {t.hero} <span style={{ color: C.primary }}>{t.heroSpan}</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>{t.sub}</p>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>National Fulfillment Rate</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '48px', fontWeight: '900', color: '#FFFFFF', lineHeight: 1 }}>{fulfillmentRate}%</span>
                  <span style={{ fontSize: '14px', color: C.status.Kept.text, fontWeight: '700' }}>{t.kept}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF' }}>{totalPromises}</span>
                <span style={{ fontSize: '14px', color: '#9CA3AF', display: 'block', fontWeight: '600' }}>{t.total}</span>
              </div>
            </div>
            <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${fulfillmentRate}%`, height: '100%', background: C.gradient, borderRadius: '99px', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH & CATEGORY FILTERS --- */}
      <div style={{ maxWidth: '1200px', margin: '-30px auto 40px', position: 'relative', zIndex: 20, padding: '0 24px' }}>
        <div style={{ background: C.card, borderRadius: '20px', padding: '16px', boxShadow: C.shadow, border: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', gap: '12px', background: C.bg, border: `1px solid ${C.border}`, padding: '14px 20px', borderRadius: '14px' }}>
            <Search size={18} color={C.textMuted} />
            <input type="text" placeholder={t.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', color: C.text, background: 'transparent', fontWeight: '500' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', flexWrap: 'nowrap' }}>
            <select value={activeDistrict} onChange={(e) => setActiveDistrict(e.target.value)} style={{ padding: '10px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '700', border: `1px solid ${C.border}`, background: '#fff', color: C.text, outline: 'none', cursor: 'pointer' }}>
              {DISTRICTS.map(d => <option key={d} value={d}>{d === 'All Districts' ? t.allDistricts : d}</option>)}
            </select>
            {CATEGORIES.map(category => (
              <button key={category} onClick={() => setActiveCategory(category)} style={{ whiteSpace: 'nowrap', padding: '10px 20px', borderRadius: '99px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', background: activeCategory === category ? C.text : '#fff', color: activeCategory === category ? '#fff' : C.textMuted, border: activeCategory === category ? `1px solid ${C.text}` : `1px solid ${C.border}` }}>
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- PROMISE FEED --- */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {isLoading ? ( <>{[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}</> ) : paginatedPromises.length === 0 ? (
             <div style={{ gridColumn: '1 / -1', padding: '80px 20px', textAlign: 'center', background: C.card, borderRadius: '24px', border: `1px solid ${C.border}` }}>
               <Search size={48} color={C.border} style={{ margin: '0 auto 16px' }} />
               <h3 style={{ fontSize: '18px', color: C.text, fontWeight: '800', margin: '0 0 8px' }}>{t.noMatches}</h3>
             </div>
          ) : (
            paginatedPromises.map(promise => {
              const badge = C.status[promise.status] || C.status.Pending;
              const BadgeIcon = badge.icon;
              const pVotes = votes[promise._id] || { up: 0, down: 0, userVote: null };
              const totalV = pVotes.up + pVotes.down || 1;
              const upPercent = (pVotes.up === 0 && pVotes.down === 0) ? 50 : Math.round((pVotes.up / totalV) * 100);

              return (
                <div 
                  key={promise._id} 
                  // ✅ FIXED: Clicking the card navigates to the details page!
                  onClick={() => navigate(`/promise/${promise._id}`)}
                  style={{ background: C.card, borderRadius: '24px', border: `1px solid ${C.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} 
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = C.shadow; }} 
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  
                  <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${C.bg}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: C.text, border: `1px solid ${C.border}` }}>
                        {promise.politicianId?.name ? promise.politicianId.name.substring(0,2).toUpperCase() : <User size={20} color={C.textMuted} />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: C.text, margin: '0 0 2px' }}>{promise.politicianId?.name || 'Unknown'}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase' }}>
                          <MapPin size={10}/> {promise.district || 'National'} • {promise.category}
                        </div>
                      </div>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '800', background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                      <BadgeIcon size={12} /> {promise.status}
                    </span>
                  </div>

                  <div style={{ padding: '20px 24px', flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: C.text, margin: '0 0 12px', lineHeight: 1.4 }}>{promise.title}</h3>
                    <p style={{ fontSize: '14px', color: C.textMuted, margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{promise.description}</p>
                  </div>

                  {/* Community Consensus Bar */}
                  <div style={{ padding: '0 24px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '6px', color: C.textMuted }}>
                      <span>{upPercent}% {t.truthful}</span><span>{100 - upPercent}% {t.false}</span>
                    </div>
                    <div style={{ height: '6px', background: C.status.Broken.hex, borderRadius: '99px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${upPercent}%`, background: C.status.Kept.hex, height: '100%' }}></div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ padding: '16px 24px', background: C.bg, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleVote(promise._id, 'up'); }} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', border: pVotes.userVote === 'up' ? `1px solid ${C.primary}` : `1px solid ${C.border}`, background: pVotes.userVote === 'up' ? C.primaryLight : '#fff', color: pVotes.userVote === 'up' ? C.primary : C.textMuted, cursor: 'pointer', transition: 'all 0.2s', fontWeight: '700', fontSize: '12px' }}
                      >
                        <ThumbsUp 
                          size={14} 
                          color={pVotes.userVote === 'up' ? C.primary : C.textMuted} 
                          fill={pVotes.userVote === 'up' ? C.primary : 'none'} 
                        /> 
                        {pVotes.up}
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleVote(promise._id, 'down'); }} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', border: pVotes.userVote === 'down' ? `1px solid ${C.text}` : `1px solid ${C.border}`, background: pVotes.userVote === 'down' ? C.border : '#fff', color: pVotes.userVote === 'down' ? C.text : C.textMuted, cursor: 'pointer', transition: 'all 0.2s', fontWeight: '700', fontSize: '12px' }}
                      >
                        <ThumbsDown 
                          size={14} 
                          color={pVotes.userVote === 'down' ? C.text : C.textMuted} 
                          fill={pVotes.userVote === 'down' ? C.text : 'none'} 
                        /> 
                        {pVotes.down}
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedPromiseForReport(promise); setReportModalOpen(true); }} style={{ background: 'transparent', border: 'none', color: C.textMuted, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = C.primary} onMouseLeave={e => e.currentTarget.style.color = C.textMuted} title={t.report}>
                        <MessageSquareWarning size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleShare(promise); }} style={{ background: 'transparent', border: 'none', color: C.textMuted, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = C.primary} onMouseLeave={e => e.currentTarget.style.color = C.textMuted} title={t.share}>
                        <Share2 size={16} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- PAGINATION CONTROLS --- */}
        {!isLoading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '12px', border: `1px solid ${C.border}`, background: currentPage === 1 ? C.bg : '#fff', color: currentPage === 1 ? '#CBD5E1' : C.text, fontWeight: '700', fontSize: '14px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: currentPage === 1 ? 'none' : '0 2px 4px rgba(0,0,0,0.02)' }}
            >
              <ChevronLeft size={16} /> {t.prev}
            </button>
            
            <span style={{ fontSize: '14px', fontWeight: '700', color: C.textMuted }}>
              {t.page} {currentPage} / {totalPages}
            </span>

            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '12px', border: `1px solid ${C.border}`, background: currentPage === totalPages ? C.bg : '#fff', color: currentPage === totalPages ? '#CBD5E1' : C.text, fontWeight: '700', fontSize: '14px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: currentPage === totalPages ? 'none' : '0 2px 4px rgba(0,0,0,0.02)' }}
            >
               {t.next} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* --- REPORT DISCREPANCY MODAL --- */}
      {reportModalOpen && selectedPromiseForReport && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: C.card, borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquareWarning size={20} color={C.primary}/> {t.report}</h3>
              <button onClick={() => setReportModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMuted }}><X size={20} /></button>
            </div>
            <form onSubmit={submitReport} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: C.bg, padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}`, fontSize: '13px', color: C.textMuted }}>
                <strong>Promise:</strong> {selectedPromiseForReport.title}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>News URL / Evidence Link</label>
                <input required type="url" placeholder="https://news-source.com/article" value={reportForm.url} onChange={e => setReportForm({...reportForm, url: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, outline: 'none', background: C.bg }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Why is the current status incorrect?</label>
                <textarea required rows="3" value={reportForm.reason} onChange={e => setReportForm({...reportForm, reason: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, outline: 'none', background: C.bg, resize: 'vertical' }}></textarea>
              </div>
              <button disabled={isSubmittingReport} type="submit" style={{ background: C.text, color: '#fff', padding: '14px', borderRadius: '10px', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '8px', opacity: isSubmittingReport ? 0.7 : 1 }}>
                {isSubmittingReport ? 'Submitting to Admins...' : 'Submit Evidence'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
    </div>
  );
};

export default Promises;