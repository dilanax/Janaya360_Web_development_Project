import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, 
  MapPin, User, ThumbsUp, ThumbsDown, ExternalLink, 
  History, Share2, ShieldCheck
} from 'lucide-react';

// --- PREMIUM PUBLIC COLOR TOKENS ---
const C = {
  primary: '#EA580C', primaryLight: '#FFEDD5',
  bg: '#F8FAFC', card: '#FFFFFF', text: '#0F172A', textMuted: '#64748B', border: '#E2E8F0',
  shadow: '0 10px 40px -10px rgba(15,23,42,0.08)',
  status: {
    Kept: { bg: 'rgba(22, 163, 74, 0.1)', text: '#16A34A', hex: '#16A34A', icon: CheckCircle },
    Broken: { bg: 'rgba(220, 38, 38, 0.1)', text: '#DC2626', hex: '#DC2626', icon: XCircle },
    'In-Progress': { bg: 'rgba(217, 119, 6, 0.1)', text: '#D97706', hex: '#D97706', icon: AlertCircle },
    Pending: { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748B', hex: '#64748B', icon: Clock }
  }
};

// --- DYNAMIC CATEGORY IMAGES ---
const CATEGORY_IMAGES = {
  Economy: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200',
  Education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200',
  Health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200',
  Infrastructure: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200',
  Governance: 'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&q=80&w=1200',
  Agriculture: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200',
  Other: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200'
};

const PromiseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [promise, setPromise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState({ up: 0, down: 0, userVote: null });

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchPromiseDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/promises/${id}`);
        const data = response.data.data || response.data;
        setPromise(data);
        setVotes({ up: data.upvotes || 0, down: data.downvotes || 0, userVote: null });
      } catch (error) {
        console.error("Failed to load promise", error);
        toast.error("Could not load promise details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromiseDetails();
  }, [id, API_URL]);

  // --- INTERACTION HANDLERS ---
  const handleVote = async (type) => {
    // Optimistic UI Update
    setVotes(prev => {
      let newUp = prev.up; let newDown = prev.down;
      if (prev.userVote === type) {
          type === 'up' ? newUp-- : newDown--;
          return { up: Math.max(0, newUp), down: Math.max(0, newDown), userVote: null };
      }
      if (type === 'up') { newUp++; if (prev.userVote) newDown--; } 
      else { newDown++; if (prev.userVote) newUp--; }
      return { up: Math.max(0, newUp), down: Math.max(0, newDown), userVote: type };
    });

    // Send to backend
    try {
      await axios.post(`${API_URL}/api/promises/${id}/vote`, {
        voteType: type,
        action: votes.userVote === type ? 'remove' : 'add'
      });
    } catch (error) {
      toast.error("Vote failed to save on the server.");
    }
  };

  const handleShare = async () => {
    const shareText = `Check out this political promise by ${promise.politicianId?.name || 'an official'} on Janaya360! Status: ${promise.status}.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Janaya360', text: shareText, url: window.location.href }); } 
      catch (error) { console.log('Error sharing', error); }
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      toast.success("Link copied to clipboard!");
    }
  };

  // --- LOADING / ERROR STATES ---
  if (isLoading) return <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: C.textMuted }}>Loading Audit Data...</div>;
  if (!promise) return <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: C.textMuted }}>Record Not Found</div>;

  const badge = C.status[promise.status] || C.status.Pending;
  const BadgeIcon = badge.icon;
  const totalV = votes.up + votes.down || 1; // Prevent division by zero
  const upPercent = (votes.up === 0 && votes.down === 0) ? 50 : Math.round((votes.up / totalV) * 100);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", paddingBottom: '80px' }}>
      
      {/* --- TOP NAVIGATION BAR --- */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.border}`, padding: '16px 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: C.textMuted, fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = C.primary} onMouseLeave={e => e.currentTarget.style.color = C.textMuted}>
            <ArrowLeft size={18} /> Back to Feed
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, background: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', color: C.text }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}>
              <Share2 size={16}/> Share
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* ========================================= */}
        {/* LEFT COLUMN: The Core Promise Details     */}
        {/* ========================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Content Header - WITH DYNAMIC BACKGROUND IMAGE */}
          <div style={{ 
            position: 'relative', 
            padding: '48px 40px', 
            borderRadius: '24px', 
            boxShadow: C.shadow,
            overflow: 'hidden', 
            color: '#fff' 
          }}>
            
            {/* 1. The Dynamic Background Image */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${CATEGORY_IMAGES[promise.category] || CATEGORY_IMAGES['Other']})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              zIndex: 0
            }} />
            
            {/* 2. The Dark Gradient Overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 100%)',
              zIndex: 1
            }} />

            {/* 3. The Actual Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '800', background: badge.bg, color: badge.hex, border: `1px solid ${badge.hex}` }}>
                  <BadgeIcon size={16} /> {promise.status}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14}/> {promise.district || 'National'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#CBD5E1' }}>• {promise.category}</span>
              </div>

              <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 20px', lineHeight: 1.3 }}>{promise.title}</h1>
              <p style={{ fontSize: '16px', color: '#F1F5F9', lineHeight: 1.8, margin: 0 }}>{promise.description}</p>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <User size={24} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', margin: '0 0 2px' }}>Accountable Official</p>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{promise.politicianId?.name || 'Unknown Official'}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* News & Evidence Section */}
          <div style={{ background: C.card, padding: '32px', borderRadius: '24px', border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: C.text, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 24px' }}>
              <ShieldCheck size={20} color={C.primary}/> Verified Evidence
            </h3>
            
            {promise.evidenceUrl ? (
               <a href={promise.evidenceUrl} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '20px', border: `1px solid ${C.border}`, borderRadius: '16px', textDecoration: 'none', background: C.bg, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}>
                 <h4 style={{ fontSize: '15px', color: C.text, margin: '0 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   Primary Source Document <ExternalLink size={16} color={C.textMuted}/>
                 </h4>
                 <p style={{ fontSize: '13px', color: C.textMuted, margin: 0, lineHeight: 1.5 }}>
                   {promise.evidenceNotes || 'Click to review the official source material related to this promise.'}
                 </p>
               </a>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', border: `1px dashed ${C.border}`, borderRadius: '16px', background: C.bg }}>
                <p style={{ color: C.textMuted, fontSize: '14px', fontWeight: '600', margin: 0 }}>No primary evidence URLs attached by auditors yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT COLUMN: Interactive & History       */}
        {/* ========================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Community Consensus Box */}
          <div style={{ background: C.card, padding: '32px', borderRadius: '24px', border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: C.text, margin: '0 0 24px', textAlign: 'center' }}>Public Consensus</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '32px', fontWeight: '900', color: C.status.Kept.hex, display: 'block', lineHeight: 1 }}>{upPercent}%</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase' }}>Truthful</span>
              </div>
              <div style={{ width: '1px', height: '40px', background: C.border }}></div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '32px', fontWeight: '900', color: C.status.Broken.hex, display: 'block', lineHeight: 1 }}>{100 - upPercent}%</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase' }}>False</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handleVote('up')} 
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: votes.userVote === 'up' ? `1px solid ${C.primary}` : `1px solid ${C.border}`, background: votes.userVote === 'up' ? C.primaryLight : '#fff', color: votes.userVote === 'up' ? C.primary : C.text, fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <ThumbsUp size={16} fill={votes.userVote === 'up' ? 'currentColor' : 'none'}/> {votes.up}
              </button>
              <button 
                onClick={() => handleVote('down')} 
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: votes.userVote === 'down' ? `1px solid ${C.text}` : `1px solid ${C.border}`, background: votes.userVote === 'down' ? C.border : '#fff', color: votes.userVote === 'down' ? C.text : C.text, fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <ThumbsDown size={16} fill={votes.userVote === 'down' ? 'currentColor' : 'none'}/> {votes.down}
              </button>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div style={{ background: C.card, padding: '32px', borderRadius: '24px', border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: C.text, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 24px' }}>
              <History size={18} color={C.textMuted}/> Audit History Ledger
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
               {/* Vertical Line connecting timeline */}
               <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: C.border, zIndex: 0 }}></div>

               {/* Map through the actual history array from the schema */}
               {promise.history && promise.history.length > 0 ? promise.history.map((entry, idx) => (
                 <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.bg, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.status[entry.newStatus]?.hex || C.textMuted }}></div>
                   </div>
                   <div>
                     <p style={{ fontSize: '11px', fontWeight: '700', color: C.textMuted, margin: '0 0 4px' }}>{new Date(entry.changedAt).toLocaleDateString()}</p>
                     <p style={{ fontSize: '14px', fontWeight: '800', color: C.text, margin: '0 0 4px' }}>
                       Status updated to <span style={{ color: C.status[entry.newStatus]?.hex || C.text }}>{entry.newStatus}</span>
                     </p>
                     {entry.reason && <p style={{ fontSize: '13px', color: C.textMuted, margin: 0, background: C.bg, padding: '8px 12px', borderRadius: '8px', marginTop: '8px' }}>"{entry.reason}"</p>}
                   </div>
                 </div>
               )) : (
                 <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.status.Pending.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                     <Clock size={14} color={C.status.Pending.hex} />
                   </div>
                   <div>
                     <p style={{ fontSize: '11px', fontWeight: '700', color: C.textMuted, margin: '0 0 4px' }}>{new Date(promise.createdAt).toLocaleDateString()}</p>
                     <p style={{ fontSize: '14px', fontWeight: '800', color: C.text, margin: '0 0 4px' }}>Record Initialized</p>
                     <p style={{ fontSize: '13px', color: C.textMuted, margin: 0 }}>System set status to Pending.</p>
                   </div>
                 </div>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PromiseDetail;