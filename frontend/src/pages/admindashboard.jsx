import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  LayoutDashboard, Users, FileText, MessageSquare,
  Newspaper, Bell, BellRing, Settings, LogOut, Search,
  TrendingUp, TrendingDown, ChevronRight,
  CheckCircle, MapPin, BarChart2, ThumbsUp, ThumbsDown,
  ExternalLink, Home, Plus, Pencil, Trash2,
} from 'lucide-react';
import PromisesManagement from '../components/PromisesManagement';
import Notifications from '../components/Notifications';
import AdminPoliticiansManagement from '../components/AdminPoliticiansManagement';
import AdminFeedbackManagement from '../components/AdminFeedbackManagement';

/* ── Janaya360 Color Tokens ───────────────────────────────────── */
const C = {
  parliament: {
    50:  '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    500: '#F97316',
    600: '#EA580C',   // PRIMARY
    700: '#C2410C',
    800: '#9A3412',
  },
  civic: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  maroon: {
    600: '#7B0000',
    700: '#5C0000',
  },
  gray: {
    50:  '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    700: '#374151',
    900: '#111827',
  },
  status: {
    keptBg:   '#DCFCE7', keptText:  '#14532D', keptColor: '#16A34A',
    progBg:   '#FEF3C7', progText:  '#78350F', progColor: '#D97706',
    brokBg:   '#FEE2E2', brokText:  '#7F1D1D', brokColor: '#DC2626',
    pendBg:   '#F3F4F6', pendText:  '#374151', pendColor: '#6B7280',
  },
  sidebar: '#18181B',   // zinc-900 — admin panel sidebar per spec
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

const getRelativeTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const toUiStatus = (status) => {
  if (!status) return 'Pending';
  return status === 'In-Progress' ? 'In Progress' : status;
};

const partyColorMap = {
  NPP: C.maroon[600],
  SJB: '#1B4D3E',
  UNP: C.parliament[600],
  SLPP: '#7C3AED',
  Other: C.gray[400],
};

/* ── STATUS CONFIG ────────────────────────────────────────────── */
const statusCfg = {
  'Kept':        { bg: C.status.keptBg,  text: C.status.keptText  },
  'In Progress': { bg: C.status.progBg,  text: C.status.progText  },
  'Broken':      { bg: C.status.brokBg,  text: C.status.brokText  },
  'Pending':     { bg: C.status.pendBg,  text: C.status.pendText  },
};

/* ── NAV ITEMS ────────────────────────────────────────────────── */
const NAV = [
  { label:'Dashboard',     icon:LayoutDashboard, path:'/admin-dashboard', badge:null  },
  { label:'Politicians',   icon:Users,           path:'/admin-politicians', badge:'89'  },
  { label:'Promises',      icon:FileText,        path:'/admin-promises',    badge:'247' },
  { label:'Feedback',      icon:MessageSquare,   path:'/admin-feedback',  badge:'12'  },
  { label:'News',          icon:Newspaper,       path:'/admin-news',      badge:null  },
  { label:'Notifications', icon:BellRing,        path:'/admin-notifications',   badge:'5'   },
  { label:'Users',         icon:Users,           path:'/users',           badge:null  },
  { label:'Settings',      icon:Settings,        path:'/settings',        badge:null  },
];

const DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale',
  'Nuwara Eliya','Galle','Matara','Hambantota',
  'Jaffna','Kilinochchi','Mannar','Vavuniya',
  'Mullaitivu','Batticaloa','Ampara','Trincomalee',
  'Kurunegala','Puttalam','Anuradhapura',
  'Polonnaruwa','Badulla','Monaragala',
  'Ratnapura','Kegalle',
];

/* ── DONUT CHART ──────────────────────────────────────────────── */
const DonutChart = ({ data, centerValue }) => {
  const size = 140, r = 52, inner = 34, cx = 70, cy = 70;
  let start = -Math.PI / 2;
  const slices = data.map(d => {
    const angle = (d.pct / 100) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(start + angle), y2 = cy + r * Math.sin(start + angle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
    start += angle;
    return { ...d, path };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s,i) => <path key={i} d={s.path} fill={s.color} />)}
      <circle cx={cx} cy={cy} r={inner} fill="white" />
      <text x={cx} y={cy-6} textAnchor="middle" fontSize="11" fill={C.gray[400]} fontFamily="sans-serif">Total</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="16" fontWeight="600" fill={C.gray[900]} fontFamily="sans-serif">{centerValue}</text>
    </svg>
  );
};

/* ── STAT CARD ────────────────────────────────────────────────── */
const StatCard = ({ stat, inView }) => {
  const Icon = stat.icon;
  return (
    <div style={{
      background:'#fff', borderRadius:16, padding:'20px',
      border:`1px solid ${C.gray[200]}`,
      boxShadow:`0 1px 3px rgba(0,0,0,0.04)`,
    }}>
      <div style={{
        width:40, height:40, borderRadius:10, background:stat.bg,
        display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14,
      }}>
        <Icon size={18} color={stat.iconColor} />
      </div>
      <div style={{ fontSize:12, color:C.gray[400], marginBottom:4 }}>{stat.label}</div>
      <div style={{ fontSize:28, fontWeight:700, color:C.gray[900], lineHeight:1.1, marginBottom:6 }}>
        {inView ? <CountUp end={stat.value} duration={2} separator="," /> : 0}{stat.suffix}
      </div>
      <div style={{ fontSize:11, display:'flex', alignItems:'center', gap:4,
        color: stat.up ? C.status.keptColor : C.status.brokColor }}>
        {stat.up ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
        {stat.change}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {

  const location  = useLocation();
  const navigate  = useNavigate();
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const isMobile = viewportWidth <= 900;
  const isTablet = viewportWidth <= 1200;
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);
  const [ref, inView] = useInView({ triggerOnce:true, threshold:0.1 });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [users, setUsers] = useState([]);
  const [promises, setPromises] = useState([]);
  const [politicians, setPoliticians] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
     citizenName: "",
     comment: "",
     feedbackType: "",
     district: "",
     });

  const [dataError, setDataError] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [userSearchInput, setUserSearchInput] = useState('');
  const [activeUserSearch, setActiveUserSearch] = useState('');
  
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', phone: '', district: '', role: 'citizen', status: 'active',
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [userActionError, setUserActionError] = useState('');
  const [userActionSuccess, setUserActionSuccess] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState('');
  
  const [newsForm, setNewsForm] = useState({
    title: '', description: '', source: '', politician: '', url: '', image: '', publishedAt: '',
  });
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [newsActionError, setNewsActionError] = useState('');
  const [newsActionSuccess, setNewsActionSuccess] = useState('');
  const [isSavingNews, setIsSavingNews] = useState(false);
  const [deletingNewsId, setDeletingNewsId] = useState('');
  
  // ROUTING LOGIC
  const isUsersPage = location.pathname === '/users';
  const isNewsPage = location.pathname === '/admin-news';
  const isNotificationsPage = location.pathname === '/admin-notifications';
  const isFeedbackPage = location.pathname === '/admin-feedback';
  const isPromisesPage = location.pathname === '/admin-promises';
  const isPoliticiansPage = location.pathname === '/admin-politicians';
  const searchTerm = (activeUserSearch || userSearchInput).trim().toLowerCase();
  const displayedUsers = searchTerm
    ? users.filter((user) => (
        [ user.name, user.email, user.phone, user.district, user.role, user.status ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchTerm))
      ))
    : users;

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}').token}`,
  });

  const resetUserForm = () => {
    setUserForm({ name: '', email: '', password: '', phone: '', district: '', role: 'citizen', status: 'active' });
    setEditingUserId(null);
  };

  const resetNewsForm = () => {
    setNewsForm({ title: '', description: '', source: '', politician: '', url: '', image: '', publishedAt: '' });
    setEditingNewsId(null);
  };

  const fetchUsers = async (searchValue = '') => {
    const response = await axios.get(`${API_URL}/api/users`, {
      headers: getAuthHeaders(),
      params: searchValue ? { q: searchValue } : {},
    });
    setUsers(Array.isArray(response.data) ? response.data : []);
  };

  const fetchNews = async () => {
    const response = await axios.get(`${API_URL}/api/news`, { headers: getAuthHeaders() });
    setNewsItems(Array.isArray(response.data) ? response.data : []);
  };

  const fetchPromises = async () => {
    const response = await axios.get(`${API_URL}/api/promises`, {
      headers: getAuthHeaders(),
      params: { limit: 300 },
    });
    const items = response.data?.data || response.data || [];
    setPromises(Array.isArray(items) ? items : []);
    return Array.isArray(items) ? items : [];
  };

  const fetchPoliticians = async () => {
    const response = await axios.get(`${API_URL}/api/politicians`, {
      headers: getAuthHeaders(),
    });
    const items = response.data?.data || response.data || [];
    setPoliticians(Array.isArray(items) ? items : []);
  };

  const fetchFeedback = async (promiseList = []) => {
    const uniquePromiseIds = Array.from(
      new Set(
        promiseList
          .map((item) => item?._id)
          .filter(Boolean)
      )
    );
    if (uniquePromiseIds.length === 0) {
      setFeedbackItems([]);
      return;
    }

    const feedbackResponses = await Promise.all(
      uniquePromiseIds.map(async (promiseId) => {
        try {
          const res = await axios.get(`${API_URL}/api/feedback/${promiseId}`, {
            headers: getAuthHeaders(),
          });
          return Array.isArray(res.data)
            ? res.data.map((entry) => ({ ...entry, promiseId }))
            : [];
        } catch (error) {
          return [];
        }
      })
    );
    setFeedbackItems(feedbackResponses.flat());
  };

  const dashboardData = useMemo(() => {
    const totalPromises = promises.length;
    const normalizedStatusCounts = {
      Kept: 0,
      'In Progress': 0,
      Pending: 0,
      Broken: 0,
    };

    promises.forEach((promise) => {
      const status = toUiStatus(promise.status);
      if (normalizedStatusCounts[status] !== undefined) {
        normalizedStatusCounts[status] += 1;
      }
    });

    const keptCount = normalizedStatusCounts.Kept;
    const fulfillmentRate = totalPromises > 0 ? Math.round((keptCount / totalPromises) * 100) : 0;
    const feedbackCount = feedbackItems.length;
    const promiseStatusRows = Object.entries(normalizedStatusCounts).map(([label, count]) => {
      const pct = totalPromises > 0 ? Math.round((count / totalPromises) * 100) : 0;
      if (label === 'Kept') {
        return { label, count, pct, color: C.status.keptColor, bg: C.status.keptBg, text: C.status.keptText };
      }
      if (label === 'In Progress') {
        return { label, count, pct, color: C.status.progColor, bg: C.status.progBg, text: C.status.progText };
      }
      if (label === 'Broken') {
        return { label, count, pct, color: C.status.brokColor, bg: C.status.brokBg, text: C.status.brokText };
      }
      return { label, count, pct, color: C.gray[500], bg: C.status.pendBg, text: C.status.pendText };
    });

    const stats = [
      { label: 'Politicians Tracked', value: politicians.length, suffix: '', change: 'From database', up: true, bg: C.status.keptBg, icon: Users, iconColor: C.status.keptColor },
      { label: 'Total Promises', value: totalPromises, suffix: '', change: 'From database', up: true, bg: C.civic[100], icon: FileText, iconColor: C.civic[600] },
      { label: 'Citizen Reports', value: feedbackCount, suffix: '', change: 'From database', up: true, bg: C.status.brokBg, icon: MessageSquare, iconColor: C.status.brokColor },
      { label: 'Fulfilment Rate', value: fulfillmentRate, suffix: '%', change: `${keptCount} promises kept`, up: fulfillmentRate >= 50, bg: C.status.progBg, icon: BarChart2, iconColor: C.status.progColor },
    ];

    const recentPromises = [...promises]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 4)
      .map((item) => {
        const politicianName = item.politicianId?.name || 'Unknown';
        const initials = politicianName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'NA';
        const uiStatus = toUiStatus(item.status);
        const tagColors =
          uiStatus === 'Kept'
            ? { bg: C.status.keptBg, fg: C.status.keptText }
            : uiStatus === 'In Progress'
              ? { bg: C.status.progBg, fg: C.status.progText }
              : uiStatus === 'Broken'
                ? { bg: C.status.brokBg, fg: C.status.brokText }
                : { bg: C.status.pendBg, fg: C.status.pendText };

        return {
          initials,
          bg: tagColors.bg,
          fg: tagColors.fg,
          name: politicianName,
          party: item.politicianId?.party || 'Other',
          text: item.title || 'Untitled promise',
          status: uiStatus,
        };
      });

    const promiseTitleMap = new Map(promises.map((item) => [item._id, item.title]));
    const recentFeedback = [...feedbackItems]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((item) => ({
        name: item.citizenName || 'Anonymous',
        promise: promiseTitleMap.get(item.promiseId) || 'Unknown promise',
        vote: (item.upvotes || 0) >= (item.downvotes || 0),
        district: item.district || 'N/A',
        time: getRelativeTime(item.createdAt),
      }));

    const partyCounts = {};
    politicians.forEach((politician) => {
      const party = politician.party || 'Other';
      partyCounts[party] = (partyCounts[party] || 0) + 1;
    });
    const totalPoliticians = politicians.length;
    const parties = Object.entries(partyCounts)
      .map(([name, count]) => ({
        name,
        pct: totalPoliticians > 0 ? Math.round((count / totalPoliticians) * 100) : 0,
        color: partyColorMap[name] || partyColorMap.Other,
      }))
      .sort((a, b) => b.pct - a.pct);

    const politicianPerformanceMap = {};
    promises.forEach((promise) => {
      const politician = promise.politicianId;
      const id = politician?._id;
      if (!id) return;
      if (!politicianPerformanceMap[id]) {
        politicianPerformanceMap[id] = {
          id,
          name: politician.name || 'Unknown',
          party: politician.party || 'Other',
          kept: 0,
          total: 0,
        };
      }
      politicianPerformanceMap[id].total += 1;
      if (toUiStatus(promise.status) === 'Kept') politicianPerformanceMap[id].kept += 1;
    });

    const topPoliticians = Object.values(politicianPerformanceMap)
      .map((item) => ({
        ...item,
        rating: item.total > 0 ? Number(((item.kept / item.total) * 100).toFixed(1)) : 0,
        color: partyColorMap[item.party] || partyColorMap.Other,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    return {
      stats,
      promiseStatusRows,
      recentPromises,
      recentFeedback,
      parties,
      topPoliticians,
      totalPoliticians,
      totalPromises,
    };
  }, [promises, politicians, feedbackItems]);


  const handleUserFormChange = (field, value) => {
    setUserForm(prev => ({ ...prev, [field]: value }));
  };
  

  const handleUserSearch = async (event) => {
    event.preventDefault();
    setUserActionError(''); setUserActionSuccess(''); setActiveUserSearch(userSearchInput.trim()); setIsDataLoading(true);
    try { await fetchUsers(userSearchInput.trim()); } 
    catch (error) { setUserActionError(error.response?.data?.message || 'Failed to search users.'); } 
    finally { setIsDataLoading(false); }
  };

  const startEditUser = (user) => {
    setEditingUserId(user._id); setUserActionError(''); setUserActionSuccess('');
    setUserForm({ name: user.name || '', email: user.email || '', password: '', phone: user.phone || '', district: user.district || '', role: user.role || 'citizen', status: user.status || 'active' });
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();
    setIsSavingUser(true); setUserActionError(''); setUserActionSuccess('');
    try {
      const normalizedEmail = userForm.email.trim().toLowerCase();
      const normalizedPhone = userForm.phone.trim();
      const duplicateUser = users.find((user) => (
        user._id !== editingUserId && ( user.email?.trim().toLowerCase() === normalizedEmail || user.phone?.trim() === normalizedPhone )
      ));

      if (duplicateUser?.email?.trim().toLowerCase() === normalizedEmail) { setUserActionError('Email is already in use.'); setIsSavingUser(false); return; }
      if (duplicateUser?.phone?.trim() === normalizedPhone) { setUserActionError('Phone number is already in use.'); setIsSavingUser(false); return; }

      const payload = { name: userForm.name, email: normalizedEmail, phone: normalizedPhone, district: userForm.district, role: userForm.role, status: userForm.status };
      if (userForm.password) payload.password = userForm.password;

      if (editingUserId) {
        await axios.put(`${API_URL}/api/users/${editingUserId}`, payload, { headers: getAuthHeaders() });
        setUserActionSuccess('User updated successfully.');
      } else {
        await axios.post(`${API_URL}/api/users`, { ...payload, password: userForm.password }, { headers: getAuthHeaders() });
        setUserActionSuccess('New user account created successfully.');
      }
      resetUserForm(); await fetchUsers(activeUserSearch);
    } catch (error) { setUserActionError(error.response?.data?.message || 'Failed to save user.'); } 
    finally { setIsSavingUser(false); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    setDeletingUserId(userId); setUserActionError(''); setUserActionSuccess('');
    try {
      await axios.delete(`${API_URL}/api/users/${userId}`, { headers: getAuthHeaders() });
      setUserActionSuccess('User deleted successfully.'); await fetchUsers(activeUserSearch);
    } catch (error) { setUserActionError(error.response?.data?.message || 'Failed to delete user.'); } 
    finally { setDeletingUserId(''); }
  };

  const handleNewsFormChange = (field, value) => { setNewsForm(prev => ({ ...prev, [field]: value })); };

  const startEditNews = (news) => {
    setEditingNewsId(news._id); setNewsActionError(''); setNewsActionSuccess('');
    setNewsForm({ title: news.title || '', description: news.description || '', source: news.source || '', politician: news.politician || '', url: news.url || '', image: news.image || '', publishedAt: news.publishedAt ? new Date(news.publishedAt).toISOString().slice(0, 10) : '' });
  };

  const handleSaveNews = async (event) => {
    event.preventDefault(); setIsSavingNews(true); setNewsActionError(''); setNewsActionSuccess('');
    try {
      const payload = { title: newsForm.title, description: newsForm.description, source: newsForm.source, politician: newsForm.politician, url: newsForm.url, image: newsForm.image, publishedAt: newsForm.publishedAt || null };
      if (editingNewsId) {
        await axios.put(`${API_URL}/api/news/update/${editingNewsId}`, payload, { headers: getAuthHeaders() });
        setNewsActionSuccess('News updated successfully.');
      } else {
        await axios.post(`${API_URL}/api/news`, payload, { headers: getAuthHeaders() });
        setNewsActionSuccess('News created successfully.');
      }
      resetNewsForm(); await fetchNews();
    } catch (error) { setNewsActionError(error.response?.data?.message || 'Failed to save news.'); } 
    finally { setIsSavingNews(false); }
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) return;
    setDeletingNewsId(newsId); setNewsActionError(''); setNewsActionSuccess('');
    try {
      await axios.delete(`${API_URL}/api/news/link/${newsId}`, { headers: getAuthHeaders() });
      setNewsActionSuccess('News deleted successfully.'); await fetchNews();
    } catch (error) { setNewsActionError(error.response?.data?.message || 'Failed to delete news.'); } 
    finally { setDeletingNewsId(''); }
  };
  const handleUpdateFeedback = async (feedbackId) => {
  try {
    await axios.patch(
      `${API_URL}/api/feedback/${feedbackId}`,
      feedbackForm,
      { headers: getAuthHeaders() }
    );

    setEditingFeedbackId(null); // exit edit mode
    fetchFeedback(promises);            // reload data
  } catch (error) {
    alert("Failed to update feedback");
    console.error(error);
  }
};



  const renderNewsTable = () => (
    <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:`1px solid ${C.gray[200]}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color: C.gray[900] }}>All News</div>
          <div style={{ fontSize:11, color: C.gray[400], marginTop:4 }}>
            {isDataLoading ? 'Loading news...' : `${newsItems.length} news items found in the database`}
          </div>
        </div>
        <Link to="/admin-dashboard" style={{ fontSize:12, color: C.parliament[600], textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
          Back to dashboard <ChevronRight size={12}/>
        </Link>
      </div>

      <form onSubmit={handleSaveNews} style={{ background:C.gray[50], border:`1px solid ${C.gray[200]}`, borderRadius:16, padding:'16px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.gray[900] }}>
            {editingNewsId ? 'Update News' : 'Create News'}
          </div>
          {editingNewsId && (
            <button type="button" onClick={resetNewsForm} style={{ border:'none', background:'transparent', color:C.parliament[600], fontSize:12, fontWeight:700, cursor:'pointer' }}>
              Cancel edit
            </button>
          )}
        </div>

        <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 10, background: C.parliament[50], border: `1px solid ${C.parliament[200]}`, color: C.parliament[800], fontSize: 12, lineHeight: 1.5 }}>
          Admin news is optional. The homepage latest-news section prefers the live third-party news feed, while news created here remains available for your managed news content and public news page.
        </div>

        <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1fr 1fr', gap:12 }}>
          <input value={newsForm.title} onChange={(e) => handleNewsFormChange('title', e.target.value)} placeholder="News title" style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
          <input value={newsForm.source} onChange={(e) => handleNewsFormChange('source', e.target.value)} placeholder="Source" style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
          <input value={newsForm.politician} onChange={(e) => handleNewsFormChange('politician', e.target.value)} placeholder="Politician" style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
          <input value={newsForm.publishedAt} onChange={(e) => handleNewsFormChange('publishedAt', e.target.value)} type="date" style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
          <input value={newsForm.url} onChange={(e) => handleNewsFormChange('url', e.target.value)} placeholder="Article URL" style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
          <input value={newsForm.image} onChange={(e) => handleNewsFormChange('image', e.target.value)} placeholder="Image URL" style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
          <textarea value={newsForm.description} onChange={(e) => handleNewsFormChange('description', e.target.value)} placeholder="Description" style={{ gridColumn:'1 / -1', minHeight:90, padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}`, resize:'vertical' }} />
        </div>

        <button type="submit" disabled={isSavingNews} style={{ marginTop:14, border:'none', borderRadius:10, padding:'11px 14px', background:C.parliament[600], color:'#fff', fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
          <Plus size={16} />
          {isSavingNews ? 'Saving...' : editingNewsId ? 'Update News' : 'Create News'}
        </button>
      </form>

      {(dataError || newsActionError) && (
        <div style={{ marginBottom: 16, background: '#FEF2F2', border: `1px solid ${C.status.brokColor}`, color: C.status.brokText, borderRadius: 14, padding: '14px 16px', fontSize: 14, fontWeight: 600 }}>
          {newsActionError || dataError}
        </div>
      )}

      {newsActionSuccess && (
        <div style={{ marginBottom: 16, background: C.status.keptBg, border: `1px solid ${C.status.keptColor}`, color: C.status.keptText, borderRadius: 14, padding: '14px 16px', fontSize: 14, fontWeight: 600 }}>
          {newsActionSuccess}
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {newsItems.map((news) => (
          <div key={news._id} style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1.6fr 1fr 0.9fr 0.8fr', gap:12, alignItems:'center', padding:'14px 16px', borderRadius:12, background:C.gray[50], border:`1px solid ${C.gray[200]}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.gray[900] }}>{news.title || 'Untitled news item'}</div>
              <div style={{ fontSize:11, color:C.gray[500], marginTop:4 }}>{news.description || 'No description available'}</div>
            </div>
            <div style={{ fontSize:12, color:C.gray[700] }}>{news.politician || news.source || 'Unknown source'}</div>
            <div style={{ fontSize:12, color:C.gray[700] }}>{news.source || 'No source'}</div>
            <div style={{ textAlign:'right', fontSize:11, color:C.gray[500] }}>
              {formatDate(news.publishedAt || news.createdAt)}
              <div style={{ marginTop:8, display:'flex', justifyContent:'flex-end', gap:8 }}>
                <button type="button" onClick={() => startEditNews(news)} style={{ border:'none', background:'transparent', color:C.civic[600], cursor:'pointer' }}>
                  <Pencil size={14} />
                </button>
                <button type="button" disabled={deletingNewsId === news._id} onClick={() => handleDeleteNews(news._id)} style={{ border:'none', background:'transparent', color:C.status.brokColor, cursor:'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!isDataLoading && newsItems.length === 0 && (
          <div style={{ fontSize:12, color:C.gray[500] }}>No news to display yet.</div>
        )}
      </div>
    </div>
  );

  const renderUsersTable = () => (
    <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:`1px solid ${C.gray[200]}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color: C.gray[900] }}>All Users</div>
          <div style={{ fontSize:11, color: C.gray[400], marginTop:4 }}>
            {isDataLoading ? 'Loading users...' : `${displayedUsers.length} users shown from ${users.length} database users`}
          </div>
        </div>
        <Link to="/admin-dashboard" style={{ fontSize:12, color: C.parliament[600], textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
          Back to dashboard <ChevronRight size={12}/>
        </Link>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1.15fr 1.85fr', gap:16, marginBottom:20 }}>
        <form onSubmit={handleSaveUser} style={{ background:C.gray[50], border:`1px solid ${C.gray[200]}`, borderRadius:16, padding:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.gray[900] }}>{editingUserId ? 'Update User Account' : 'Create User Account'}</div>
            {editingUserId && (
              <button type="button" onClick={resetUserForm} style={{ border:'none', background:'transparent', color:C.parliament[600], fontSize:12, fontWeight:700, cursor:'pointer' }}>Cancel edit</button>
            )}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1fr 1fr', gap:12 }}>
            <input value={userForm.name} onChange={(e) => handleUserFormChange('name', e.target.value)} placeholder="Full name" style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
            <input value={userForm.email} onChange={(e) => handleUserFormChange('email', e.target.value)} placeholder="Email address" style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
            <input value={userForm.phone} onChange={(e) => handleUserFormChange('phone', e.target.value)} placeholder="Phone number" style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
            <input value={userForm.password} onChange={(e) => handleUserFormChange('password', e.target.value)} placeholder={editingUserId ? 'New password (optional)' : 'Password'} style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
            <select value={userForm.district} onChange={(e) => handleUserFormChange('district', e.target.value)} style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }}>
              <option value="">Select district</option>
              {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
            <select value={userForm.role} onChange={(e) => handleUserFormChange('role', e.target.value)} style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }}>
              <option value="citizen">Citizen</option><option value="admin">Admin</option>
            </select>
            <select value={userForm.status} onChange={(e) => handleUserFormChange('status', e.target.value)} style={{ padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }}>
              <option value="active">Active</option><option value="suspended">Suspended</option>
            </select>
          </div>
          <button type="submit" disabled={isSavingUser} style={{ marginTop:14, border:'none', borderRadius:10, padding:'11px 14px', background:C.parliament[600], color:'#fff', fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
            <Plus size={16} />{isSavingUser ? 'Saving...' : editingUserId ? 'Update User' : 'Create User'}
          </button>
        </form>
        

        <div style={{ background:C.gray[50], border:`1px solid ${C.gray[200]}`, borderRadius:16, padding:'16px' }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.gray[900], marginBottom:12 }}>Search Users</div>
          <form onSubmit={handleUserSearch} style={{ display:'flex', gap:10, marginBottom:12 }}>
            <input value={userSearchInput} onChange={(e) => setUserSearchInput(e.target.value)} placeholder="Search by name, email, district, role..." style={{ flex:1, padding:'11px 12px', borderRadius:10, border:`1px solid ${C.gray[300]}` }} />
            <button type="submit" style={{ border:'none', borderRadius:10, padding:'0 16px', background:C.gray[900], color:'#fff', fontWeight:700, cursor:'pointer' }}>Search</button>
          </form>
          <button type="button" onClick={async () => { setUserSearchInput(''); setActiveUserSearch(''); setIsDataLoading(true); try { await fetchUsers(''); } finally { setIsDataLoading(false); } }} style={{ border:'none', background:'transparent', color:C.parliament[600], fontWeight:700, cursor:'pointer', padding:0 }}>Clear search</button>
          {activeUserSearch && (<div style={{ marginTop:14, fontSize:12, color:C.gray[500] }}>Current filter: <span style={{ fontWeight:700, color:C.gray[700] }}>{activeUserSearch}</span></div>)}
        </div>
      </div>

      {(dataError || userActionError) && (<div style={{ marginBottom: 16, background: '#FEF2F2', border: `1px solid ${C.status.brokColor}`, color: C.status.brokText, borderRadius: 14, padding: '14px 16px', fontSize: 14, fontWeight: 600 }}>{userActionError || dataError}</div>)}
      {userActionSuccess && (<div style={{ marginBottom: 16, background: C.status.keptBg, border: `1px solid ${C.status.keptColor}`, color: C.status.keptText, borderRadius: 14, padding: '14px 16px', fontSize: 14, fontWeight: 600 }}>{userActionSuccess}</div>)}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {displayedUsers.map((user) => (
          <div key={user._id} style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1.1fr 1.2fr 0.75fr 0.75fr 0.55fr 0.95fr', gap:12, alignItems:'center', padding:'14px 16px', borderRadius:12, background:C.gray[50], border:`1px solid ${C.gray[200]}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.gray[900] }}>{user.name}</div>
              <div style={{ fontSize:10, color:C.gray[400] }}>{user._id}</div>
            </div>
            <div style={{ fontSize:12, color:C.gray[700], whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</div>
            <div style={{ fontSize:12, color:C.gray[700] }}>{user.phone || 'No phone'}</div>
            <div style={{ fontSize:12, color:C.gray[700] }}>{user.district || 'No district'}</div>
            <div style={{ fontSize:12, color:user.status === 'active' ? C.status.keptText : C.status.brokText, fontWeight:700 }}>{user.status || 'active'}</div>
            <div style={{ textAlign:'right' }}>
              <span style={{ fontSize:10, fontWeight:700, padding:'4px 9px', borderRadius:99, background:user.role === 'admin' ? C.parliament[100] : C.gray[100], color:user.role === 'admin' ? C.parliament[700] : C.gray[700] }}>{user.role}</span>
              <div style={{ marginTop:8, display:'flex', justifyContent:'flex-end', gap:8 }}>
                <button type="button" onClick={() => startEditUser(user)} style={{ border:'none', background:'transparent', color:C.civic[600], cursor:'pointer' }}><Pencil size={14} /></button>
                <button type="button" disabled={deletingUserId === user._id || adminUser?._id === user._id} onClick={() => handleDeleteUser(user._id)} style={{ border:'none', background:'transparent', color:C.status.brokColor, cursor:'pointer', opacity: adminUser?._id === user._id ? 0.45 : 1 }}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {!isDataLoading && displayedUsers.length === 0 && (<div style={{ fontSize:12, color:C.gray[500] }}>{users.length === 0 ? 'No users to display yet.' : 'No users matched your search.'}</div>)}
      </div>
    </div>
  );

  const renderFeedbackManagement = () => (
  <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:`1px solid ${C.gray[200]}` }}>
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:14, fontWeight:700, color:C.gray[900] }}>Feedback Management</div>
      <div style={{ fontSize:11, color:C.gray[400], marginTop:4 }}>
        {feedbackItems.filter(item =>
             item.comment?.toLowerCase().includes(feedbackSearch.toLowerCase())
            ).length} feedback records found
      </div>
    </div>

    <input
      type="text"
      placeholder="Search feedback by name, comment, type, or district..."
      value={feedbackSearch}
      onChange={(e) => setFeedbackSearch(e.target.value)}
     style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        border: `1px solid ${C.gray[300]}`,
        marginBottom: 20,
      fontSize: 12,
    }}
    />

    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {feedbackItems
      .filter(item => {
      const term = feedbackSearch.toLowerCase();

      return (
      item.comment?.toLowerCase().includes(term) ||
      item.citizenName?.toLowerCase().includes(term) ||
      item.feedbackType?.toLowerCase().includes(term) ||
      item.district?.toLowerCase().includes(term)
    );
   })
    .map(item => (
        <div key={item._id} style={{
          padding:'14px 16px',
          borderRadius:12,
          background:C.gray[50],
          border:`1px solid ${C.gray[200]}`,
          display:'flex',
          justifyContent:'space-between'
        }}>
          
          {editingFeedbackId === item._id ? (
         /* ✅ EDIT MODE */
          <div
            style={{
            background: "#FFF7ED",          // ✅ light orange
            border: "1px solid #FED7AA",    // ✅ orange border
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "100%",
          }}
          >
            

              {/* ✅ Citizen Name */}
           <label style={{ fontSize: 15, fontWeight: 600 }}>
           Citizen Name
           </label>
           <input
           value={feedbackForm.citizenName}
           onChange={(e) =>
          setFeedbackForm({ ...feedbackForm, citizenName: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />

           {/* ✅ Comment */}
           <label style={{ fontSize: 15, fontWeight: 600 }}>
          Comment
         </label>
         <textarea
         value={feedbackForm.comment}
        onChange={(e) =>
        setFeedbackForm({ ...feedbackForm, comment: e.target.value })
        }
        rows={4}
       style={{ marginBottom: 10 }}
        />
        <label style={{ fontSize: 15, fontWeight: 600 }}>
        Feedback Type
        </label>
        <select
        value={feedbackForm.feedbackType}
       onChange={(e) =>
        setFeedbackForm({ ...feedbackForm, feedbackType: e.target.value })
       }
      style={{ marginBottom: 10 }}
     >
         <option value="">Select Type</option>
         <option>Opinion</option>
        <option>Complaint</option>
        <option>Suggestion</option>
        <option>Evidence</option>
      </select>
       <label style={{ fontSize: 15, fontWeight: 600 }}>
          District
      </label>
      <input
       value={feedbackForm.district}
       onChange={(e) =>
       setFeedbackForm({ ...feedbackForm, district: e.target.value })
      }
        />
      

       <div
           style={{
           display: "flex",
           justifyContent: "flex-end",
          gap: 12,        // ✅ spacing between Cancel & Save
          marginTop: 14,
          }}
         >
  <button
  onClick={() => setEditingFeedbackId(null)}
  style={{
    background: "#FFFFFF",          // ✅ white button
    color: "#374151",               // dark gray text
    border: "1.5px solid #D1D5DB",  // light gray border
    padding: "6px 14px",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  Cancel
</button>

  <button
    onClick={() => handleUpdateFeedback(item._id)}
    style={{
      background: "#EA580C",
      color: "#fff",
      padding: "6px 18px",
      borderRadius: 8,
      border: "none",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    Save
  </button>
</div>

  </div>
) : (
  /* ✅ NORMAL VIEW */
  <div>
    <div style={{ fontSize:13, fontWeight:700 }}>
      {item.citizenName || "Anonymous"}
    </div>
    <div style={{ fontSize:12, color:C.gray[600], marginTop:4 }}>
      {item.comment}
    </div>
    <div style={{ fontSize:11, color:C.gray[400], marginTop:6 }}>
      {item.feedbackType} · {item.district} · 👍 {item.upvotes}
    </div>
  </div>
)}
          

          <div style={{ display:'flex', gap:8 }}>
            <button
               onClick={() => {
               setEditingFeedbackId(item._id);
               setFeedbackForm({
               citizenName: item.citizenName || "",
               comment: item.comment || "",
               feedbackType: item.feedbackType || "",
               district: item.district || "",
             });
           }}
         style={{ border: "none", background: "transparent", cursor: "pointer" }}
         >
         <Pencil size={14} />
          </button>

            <button
              title="Delete"
              style={{ border:'none', background:'transparent', cursor:'pointer', color:C.status.brokColor }}
              onClick={async () => {
                if (window.confirm('Delete this feedback?')) {
                  await axios.delete(`${API_URL}/api/feedback/${item._id}`, {
                    headers: getAuthHeaders(),
                  });
                  fetchFeedback(promises);
                }
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);



  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (!storedUser) { navigate('/login'); return; }
    const parsedUser = JSON.parse(storedUser);
    setAdminUser(parsedUser);
    if (parsedUser.role !== 'admin') { navigate('/'); return; }

    const fetchDashboardData = async () => {
      setIsDataLoading(true);
      setDataError('');

      try {
        const loadedPromises = await fetchPromises();
        await Promise.all([
          fetchUsers(activeUserSearch),
          fetchPoliticians(),
          fetchNews(),
          fetchFeedback(loadedPromises),
        ]);
      } catch (error) {
        setDataError(error.response?.data?.message || 'Failed to load admin dashboard data.');
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchDashboardData();
  }, [API_URL, navigate, activeUserSearch]);

  const handleLogout = () => {
    const shouldLogout = window.confirm('Are you sure you want to log out from the admin dashboard?');
    if (!shouldLogout) return;
    localStorage.removeItem('userInfo');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <div style={{ display:'flex', height:'100vh', background: C.gray[50], fontFamily:"'DM Sans', sans-serif", overflow:'hidden', position:'relative' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside style={{
        width: isMobile ? (sidebarOpen ? 240 : 0) : (sidebarOpen ? 240 : 70),
        flexShrink:0,
        background: C.sidebar,
        display:'flex',
        flexDirection:'column',
        transition:'width 0.25s ease',
        overflow:'hidden',
        position: isMobile ? 'absolute' : 'relative',
        zIndex: 30,
        height: '100%',
      }}>
        <div style={{ padding:'20px 18px 16px', borderBottom:`1px solid rgba(255,255,255,0.07)`, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg, ${C.parliament[600]}, ${C.parliament[500]})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff', flexShrink:0, boxShadow:`0 2px 8px rgba(234,88,12,0.4)` }}>J</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'#fff', lineHeight:1.2 }}>Janaya<span style={{ color: C.parliament[500] }}>360</span></div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', letterSpacing:0.5 }}>Admin Panel</div>
            </div>
          )}
        </div>

        <div style={{ padding: sidebarOpen ? '12px 10px 4px' : '12px 6px 4px' }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding: sidebarOpen ? '9px 10px' : '9px 0', justifyContent: !sidebarOpen ? 'center' : 'flex-start', background:`rgba(234,88,12,0.15)`, border:`1px solid rgba(234,88,12,0.3)`, borderRadius:10, cursor:'pointer', transition:'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = `rgba(234,88,12,0.25)`} onMouseLeave={e => e.currentTarget.style.background = `rgba(234,88,12,0.15)`}>
              <Home size={14} color={C.parliament[500]} />
              {sidebarOpen && (
                <>
                  <span style={{ fontSize:12, fontWeight:600, color: C.parliament[400] || '#FB923C', flex:1 }}>Go to Public Site</span>
                  <ExternalLink size={11} color="rgba(234,88,12,0.6)" />
                </>
              )}
            </div>
          </Link>
        </div>

        <nav style={{ flex:1, padding:'8px 0', overflowY:'auto' }}>
          {[ { section:'Main', items: NAV.slice(0,4) }, { section:'Content', items: NAV.slice(4,6) }, { section:'System', items: NAV.slice(6) } ].map(({ section, items }) => (
            <div key={section}>
              {sidebarOpen && (<div style={{ padding:'8px 18px 4px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.2)', letterSpacing:1.2, textTransform:'uppercase' }}>{section}</div>)}
              {items.map(item => {
                const Icon   = item.icon;
                const active = item.hash ? location.pathname === item.path && location.hash === item.hash : location.pathname === item.path;
                return (
                  <Link key={`${item.path}${item.hash || ''}`} to={item.hash ? `${item.path}${item.hash}` : item.path} style={{ textDecoration:'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding: sidebarOpen ? '10px 18px' : '10px 0', justifyContent: !sidebarOpen ? 'center' : 'flex-start', margin:'1px 8px', borderRadius:10, cursor:'pointer', background: active ? `rgba(234,88,12,0.18)` : 'transparent', transition:'background 0.15s' }} onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}>
                      <Icon size={16} color={active ? C.parliament[500] : 'rgba(255,255,255,0.4)'} />
                      {sidebarOpen && (
                        <>
                          <span style={{ fontSize:13, fontWeight: active ? 600 : 400, color: active ? C.parliament[400] || '#FB923C' : 'rgba(255,255,255,0.55)', flex:1 }}>{item.label}</span>
                          {item.badge && (<span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, background: active ? C.parliament[600] : 'rgba(234,88,12,0.25)', color: active ? '#fff' : C.parliament[500] }}>{item.badge}</span>)}
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding: sidebarOpen ? '10px 10px' : '10px 0', borderRadius:10, cursor:'pointer', justifyContent: !sidebarOpen ? 'center' : 'flex-start' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:`rgba(234,88,12,0.2)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color: C.parliament[500], flexShrink:0, border:`1px solid rgba(234,88,12,0.3)` }}>AD</div>
            {sidebarOpen && (
              <>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>Admin User</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>Super Admin</div>
                </div>
                <button onClick={handleLogout} style={{ background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:6, display:'flex', alignItems:'center' }} title="Logout" onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <LogOut size={14} color="rgba(255,255,255,0.4)" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Topbar */}
        <header style={{ height:64, background:'#fff', borderBottom:`1px solid ${C.gray[200]}`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:isMobile ? '0 12px' : '0 28px', flexShrink:0, boxShadow:`0 1px 0 ${C.gray[200]}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:6, display:'flex', alignItems:'center' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>{[0,1,2].map(i => <div key={i} style={{ width:18, height:1.5, background: C.gray[500], borderRadius:2 }} />)}</div>
            </button>
            <div>
              {/* --- DYNAMIC HEADER TITLE --- */}
              <div style={{ fontSize:16, fontWeight:700, color: C.gray[900] }}>
                {isUsersPage
                  ? 'User Management'
                  : isNewsPage
                    ? 'News Management'
                    : isNotificationsPage
                      ? 'Notifications Management'
                    : isFeedbackPage
                      ? 'Feedback Management'
                      : isPromisesPage
                        ? 'Promises Management'
                        : isPoliticiansPage
                          ? 'Politicians Management'
                          : 'Overview Dashboard'}
              </div>
              <div style={{ fontSize:11, color: C.gray[400] }}>
                {isUsersPage
                  ? 'All registered users from the database'
                  : isNewsPage
                    ? 'All news records from the database'
                    : isNotificationsPage
                      ? 'Manage notifications in admin view'
                    : isFeedbackPage
                      ? 'Manage citizen feedback without leaving admin dashboard'
                      : isPromisesPage
                        ? 'Manage promises in admin view'
                        : isPoliticiansPage
                          ? 'Manage politicians in admin view'
                          : 'Welcome back, Admin'}
              </div>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {!isMobile && <div style={{ display:'flex', alignItems:'center', gap:8, background: C.gray[50], border:`1px solid ${C.gray[200]}`, borderRadius:10, padding:'8px 14px', minWidth:200 }}>
              <Search size={13} color={C.gray[400]} />
              <span style={{ fontSize:13, color: C.gray[300] }}>Search anything...</span>
            </div>}
            <Link to="/" style={{ textDecoration:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background: C.parliament[50], border:`1px solid ${C.parliament[200]}`, cursor:'pointer', transition:'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = C.parliament[100]} onMouseLeave={e => e.currentTarget.style.background = C.parliament[50]}>
                <Home size={13} color={C.parliament[600]} />
                <span style={{ fontSize:12, fontWeight:600, color: C.parliament[600] }}>Public Site</span>
                <ExternalLink size={11} color={C.parliament[500]} />
              </div>
            </Link>
            <div style={{ position:'relative', width:36, height:36, background: C.gray[50], border:`1px solid ${C.gray[200]}`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <Bell size={15} color={C.gray[500]} />
              <div style={{ position:'absolute', top:7, right:8, width:7, height:7, background: C.status.brokColor, borderRadius:'50%', border:'1.5px solid #fff' }} />
            </div>
            {!isMobile && <div style={{ width:36, height:36, borderRadius:'50%', background: C.parliament[100], display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color: C.parliament[700], cursor:'pointer', border:`2px solid ${C.parliament[200]}` }}>AD</div>}
          </div>
        </header>

        {/* Scrollable content */}
        <div style={{ flex:1, overflowY:'auto', padding:isMobile ? '14px 12px' : '24px 28px' }}>
          {isUsersPage ? (
            renderUsersTable()
          ) : isNewsPage ? (
            renderNewsTable()
          ) : isNotificationsPage ? (
            <Notifications embedded />
          ) : isFeedbackPage ? (
            <AdminFeedbackManagement />
          ) : isPromisesPage ? (
            <PromisesManagement />
          ) : isPoliticiansPage ? (
            <AdminPoliticiansManagement />
          ) : (
          <>

          {/* Stat cards */}
          <div ref={ref} style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : (isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)'), gap:16, marginBottom:24 }}>
            {dashboardData.stats.map((s,i) => <StatCard key={i} stat={s} inView={inView} />)}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1fr 1fr', gap:16, marginBottom:20 }}>
            {/* Promise status breakdown */}
            <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:`1px solid ${C.gray[200]}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <div style={{ fontSize:14, fontWeight:700, color: C.gray[900] }}>Promise Status Breakdown</div>
                <Link to="/promises" style={{ fontSize:12, color: C.parliament[600], textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
                  View all <ChevronRight size={12}/>
                </Link>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {dashboardData.promiseStatusRows.map((s,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:12, color: C.gray[500], width:72, textAlign:'right', flexShrink:0 }}>{s.label}</span>
                    <div style={{ flex:1, height:8, background: C.gray[100], borderRadius:99, overflow:'hidden' }}>
                      <div style={{ width:`${s.pct}%`, height:'100%', background:s.color, borderRadius:99, transition:'width 1s ease' }} />
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:99, background:s.bg, color:s.text, width:42, textAlign:'center', flexShrink:0 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:8, marginTop:20 }}>
                {dashboardData.promiseStatusRows.map((s,i) => (
                  <div key={i} style={{ background:s.bg, borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:700, color:s.text }}>{s.count}</div>
                    <div style={{ fontSize:10, color:s.text, opacity:0.75 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent promise updates */}
            <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:`1px solid ${C.gray[200]}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:700, color: C.gray[900] }}>Recent Promise Updates</div>
                <Link to="/promises" style={{ fontSize:12, color: C.parliament[600], textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
                  See all <ChevronRight size={12}/>
                </Link>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {dashboardData.recentPromises.map((p,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background: C.gray[50], borderRadius:12 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:p.bg, color:p.fg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0 }}>{p.initials}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color: C.gray[900], whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.text}</div>
                      <div style={{ fontSize:10, color: C.gray[400] }}>{p.name} · {p.party}</div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:99, flexShrink:0, background: statusCfg[p.status].bg, color: statusCfg[p.status].text }}>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1.8fr 1fr', gap:16, marginBottom:20 }}>
            {/* Feedback table */}
            <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:`1px solid ${C.gray[200]}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:700, color: C.gray[900] }}>Recent Citizen Feedback</div>
                <Link to="/feedback" style={{ fontSize:12, color: C.parliament[600], textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
                  Manage <ChevronRight size={12}/>
                </Link>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr>
                    {['Citizen','Promise','Vote','District','Time'].map(h => (
                      <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontSize:10, fontWeight:700, color: C.gray[400], borderBottom:`1px solid ${C.gray[100]}`, whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentFeedback.map((f,i) => (
                    <tr key={i} style={{ borderBottom: i < dashboardData.recentFeedback.length-1 ? `1px solid ${C.gray[50]}` : 'none' }}>
                      <td style={{ padding:'10px 10px', fontWeight:600, color: C.gray[900] }}>{f.name}</td>
                      <td style={{ padding:'10px 10px', color: C.gray[500], maxWidth:140, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.promise}</td>
                      <td style={{ padding:'10px 10px' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:99, background: f.vote ? C.status.keptBg  : C.status.brokBg, color:      f.vote ? C.status.keptText : C.status.brokText }}>
                          {f.vote ? <ThumbsUp size={10}/> : <ThumbsDown size={10}/>}
                          {f.vote ? 'Truthful' : 'False'}
                        </span>
                      </td>
                      <td style={{ padding:'10px 10px' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color: C.gray[500] }}>
                          <MapPin size={10} color={C.gray[400]}/>{f.district}
                        </span>
                      </td>
                      <td style={{ padding:'10px 10px', fontSize:11, color: C.gray[400] }}>{f.time}</td>
                    </tr>
                  ))}
                  {!isDataLoading && dashboardData.recentFeedback.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding:'12px 10px', color:C.gray[500] }}>No feedback records available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Party donut */}
            <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:`1px solid ${C.gray[200]}` }}>
              <div style={{ fontSize:14, fontWeight:700, color: C.gray[900], marginBottom:16 }}>Party Distribution</div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
                <DonutChart data={dashboardData.parties} centerValue={dashboardData.totalPoliticians} />
                <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
                  {dashboardData.parties.map((p,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background:p.color, flexShrink:0 }} />
                      <span style={{ fontSize:12, color: C.gray[500], flex:1 }}>{p.name}</span>
                      <div style={{ flex:2, height:4, background: C.gray[100], borderRadius:99, overflow:'hidden' }}>
                        <div style={{ width:`${p.pct}%`, height:'100%', background:p.color, borderRadius:99 }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:600, color: C.gray[900], width:30, textAlign:'right' }}>{p.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Politicians */}
          <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:`1px solid ${C.gray[200]}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div style={{ fontSize:14, fontWeight:700, color: C.gray[900] }}>Top Politicians — Performance</div>
              <Link to="/politicians" style={{ fontSize:12, color: C.parliament[600], textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
                View all <ChevronRight size={12}/>
              </Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : (isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'), gap:16 }}>
              {dashboardData.topPoliticians.map((p,i) => (
                <div key={i} style={{ padding:'16px', background: C.gray[50], borderRadius:14, border:`1px solid ${C.gray[200]}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {p.name.split(' ').map(w=>w[0]).slice(0,2).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color: C.gray[900], lineHeight:1.3 }}>{p.name}</div>
                      <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, background:p.color+'22', color:p.color }}>{p.party}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color: C.gray[500], marginBottom:6 }}>
                    <span>Promise fulfilment</span>
                    <span style={{ fontWeight:700, color:p.color }}>{p.rating}%</span>
                  </div>
                  <div style={{ height:6, background: C.gray[200], borderRadius:99, overflow:'hidden', marginBottom:10 }}>
                    <div style={{ width:`${p.rating}%`, height:'100%', background:p.color, borderRadius:99, transition:'width 1.2s ease' }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                    <span style={{ color: C.status.keptColor, display:'flex', alignItems:'center', gap:3 }}><CheckCircle size={10}/> {p.kept} kept</span>
                    <span style={{ color: C.gray[400] }}>{p.total} total</span>
                    <Link to={`/politicians/${p.name.toLowerCase().replace(/\s+/g,'-')}`} style={{ color: C.parliament[600], textDecoration:'none', display:'flex', alignItems:'center', gap:2 }}>
                      View <ChevronRight size={10}/>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {dataError && (
            <div style={{ marginTop: 20, background: '#FEF2F2', border: `1px solid ${C.status.brokColor}`, color: C.status.brokText, borderRadius: 16, padding: '14px 16px', fontSize: 14, fontWeight: 600 }}>
              {dataError}
            </div>
          )}
          </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;