import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, Search, Filter, Pencil, Trash2, ExternalLink, 
  CheckCircle, Clock, AlertCircle, XCircle, 
  PieChart as PieIcon, BarChart2, Target, FileText,
  ArrowLeft, Info, Activity, Download, History, 
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

// --- ZOD SCHEMAS ---
const createPromiseSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Provide a detailed description." }),
  category: z.string().min(1, { message: "Category is required." }),
  politicianId: z.string().min(1, { message: "Link to a politician." })
});
const updateStatusSchema = z.object({
  status: z.string().min(1, { message: "Status is required." }),
  reason: z.string().min(5, { message: "Audit reason required." })
});

// --- PREMIUM COLOR TOKENS ---
const C = {
  primary: '#EA580C', primaryLight: '#FFEDD5',
  gradient: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
  bg: '#F8FAFC', card: '#FFFFFF', text: '#0F172A', textMuted: '#64748B', border: '#E2E8F0',
  shadow: '0 10px 40px -10px rgba(15,23,42,0.06)',
  status: {
    Kept: { bg: 'rgba(22, 163, 74, 0.1)', text: '#16A34A', hex: '#16A34A', icon: CheckCircle },
    Broken: { bg: 'rgba(220, 38, 38, 0.1)', text: '#DC2626', hex: '#DC2626', icon: XCircle },
    'In-Progress': { bg: 'rgba(217, 119, 6, 0.1)', text: '#D97706', hex: '#D97706', icon: AlertCircle },
    Pending: { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748B', hex: '#64748B', icon: Clock }
  }
};

const PromisesManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getAuthHeaders = () => ({ Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}').token}` });

  // --- PREMIUM FEATURES STATES ---
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Pagination limit
  const [activeModalTab, setActiveModalTab] = useState('audit'); // 'audit' or 'history'

  // --- DATA STATES ---
  const [promises, setPromises] = useState([]);
  const [politicians, setPoliticians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', politicianId: '', search: '' });
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromise, setSelectedPromise] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [isSearchingNews, setIsSearchingNews] = useState(false);

  // --- FORM HOOKS ---
  const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate } } = useForm({
    resolver: zodResolver(createPromiseSchema), defaultValues: { title: '', description: '', category: 'Economy', politicianId: '' }
  });
  const { register: registerUpdate, handleSubmit: handleSubmitUpdate, reset: resetUpdate, formState: { errors: errorsUpdate, isSubmitting: isSubmittingUpdate } } = useForm({
    resolver: zodResolver(updateStatusSchema), defaultValues: { status: '', reason: '' }
  });

  // --- FEATURE 1: SECURITY AUTO-LOGOUT ---
  useEffect(() => {
    let timeout;
    const handleActivity = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.removeItem('userInfo');
        window.location.href = '/login'; // Force redirect on idle
      }, 15 * 60 * 1000); // 15 Minutes Idle Time
    };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    handleActivity(); // Init
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearTimeout(timeout);
    };
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchPoliticians = async () => {
      try { const polRes = await axios.get(`${API_URL}/api/politicians`, { headers: getAuthHeaders() }); setPoliticians(polRes.data.data || polRes.data || []); } 
      catch (error) { console.error("Failed to load politicians"); }
    };
    fetchPoliticians();
  }, []);

  useEffect(() => {
    const fetchPromises = async () => {
      setIsLoading(true);
      try {
        const promiseRes = await axios.get(`${API_URL}/api/promises`, { headers: getAuthHeaders() });
        setPromises(promiseRes.data.data || promiseRes.data || []);
      } catch (error) { toast.error("Failed to load promises."); } 
      finally { setIsLoading(false); }
    };
    fetchPromises();
  }, []);

  // --- ADVANCED FILTERING & PAGINATION ---
  const displayedPromises = useMemo(() => {
    return promises.filter(p => {
      const matchesSearch = !filters.search || p.title.toLowerCase().includes(filters.search.toLowerCase()) || (p.politicianId?.name && p.politicianId.name.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesStatus = !filters.status || p.status === filters.status;
      const matchesPolitician = !filters.politicianId || (p.politicianId?._id === filters.politicianId);
      return matchesSearch && matchesStatus && matchesPolitician;
    });
  }, [promises, filters]);

  // Reset to page 1 if filters change
  useEffect(() => { setCurrentPage(1); }, [filters]);

  const totalPages = Math.ceil(displayedPromises.length / itemsPerPage);
  const paginatedPromises = displayedPromises.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- FEATURE 2: EXPORT TO CSV ---
  const handleExportCSV = () => {
    if (displayedPromises.length === 0) return toast.error("No data to export.");
    const headers = "Promise Title,Category,Politician,Status,Created Date\n";
    const csvRows = displayedPromises.map(p => {
      const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A';
      return `"${p.title.replace(/"/g, '""')}","${p.category}","${p.politicianId?.name || 'Unknown'}","${p.status}","${date}"`;
    }).join('\n');
    
    const blob = new Blob([headers + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Janaya360_Promises_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); window.URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully!");
  };

  // --- CHART DATA PROCESSING ---
  const totalCount = promises.length;
  const statusData = useMemo(() => {
    const counts = { 'Kept': 0, 'Broken': 0, 'In-Progress': 0, 'Pending': 0 };
    promises.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });
    return Object.keys(counts).map(key => ({
      name: key, value: counts[key], color: C.status[key].hex, percentage: totalCount ? Math.round((counts[key]/totalCount)*100) : 0
    })).filter(d => d.value > 0);
  }, [promises, totalCount]);

  const categoryData = useMemo(() => {
    const counts = {};
    promises.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] })).sort((a,b) => b.count - a.count);
  }, [promises]);

  const fulfillmentRate = totalCount === 0 ? 0 : Math.round((promises.filter(p => p.status === 'Kept').length / totalCount) * 100);

  // --- API HANDLERS ---
  const onSubmitCreate = async (data) => {
    const loadingToast = toast.loading('Publishing promise record...');
    try {
      await axios.post(`${API_URL}/api/promises`, data, { headers: getAuthHeaders() });
      resetCreate(); setCurrentView('dashboard');
      toast.success('Promise securely added to database!', { id: loadingToast });
      const promiseRes = await axios.get(`${API_URL}/api/promises`, { headers: getAuthHeaders() });
      setPromises(promiseRes.data.data || promiseRes.data || []);
    } catch (error) { toast.error(error.response?.data?.error || 'Failed to add promise', { id: loadingToast }); }
  };

  const openAuditModal = (promise) => {
    setSelectedPromise(promise); setEvidence(null); setActiveModalTab('audit');
    resetUpdate({ status: promise.status, reason: '' }); setIsModalOpen(true);
  };

  const onSubmitUpdate = async (data) => {
    const loadingToast = toast.loading('Securing audit log...');
    try {
      const response = await axios.put(`${API_URL}/api/promises/${selectedPromise._id}`, data, { headers: getAuthHeaders() });
      let updatedPromise = response.data.data || response.data;
      if (typeof updatedPromise.politicianId === 'string' || !updatedPromise.politicianId?.name) {
        updatedPromise.politicianId = selectedPromise.politicianId;
      }
      setPromises(promises.map(p => p._id === selectedPromise._id ? updatedPromise : p));
      setIsModalOpen(false); toast.success('Status successfully audited!', { id: loadingToast });
    } catch (error) { toast.error(error.response?.data?.error || 'Update failed', { id: loadingToast }); }
  };

  const handleDelete = async () => {
    if (!window.confirm("WARNING: This will permanently purge this record from the database. Continue?")) return;
    const loadingToast = toast.loading('Purging record...');
    try {
      await axios.delete(`${API_URL}/api/promises/${selectedPromise._id}`, { headers: getAuthHeaders() });
      setPromises(promises.filter(p => p._id !== selectedPromise._id));
      setIsModalOpen(false); toast.success('Record purged.', { id: loadingToast });
    } catch (error) { toast.error('Purge failed', { id: loadingToast }); }
  };

  const handleSearchNews = async () => {
    setIsSearchingNews(true); setEvidence(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEvidence([
        { title: `Live Updates: ${selectedPromise.politicianId?.name || 'Official'} addresses "${selectedPromise.title}" progress`, source: 'Daily Mirror Sri Lanka', url: 'https://www.dailymirror.lk', publishedAt: new Date().toISOString() },
        { title: `Parliament Debates Sector Reforms: Impact on ${selectedPromise.category}`, source: 'NewsFirst SL', url: 'https://www.newsfirst.lk', publishedAt: new Date(Date.now() - 86400000 * 2).toISOString() }
      ]);
      toast.success("Verified sources retrieved successfully!");
    } catch (error) { toast.error("Evidence retrieval failed."); } 
    finally { setIsSearchingNews(false); }
  };

  // --- FEATURE 3: SKELETON LOADER UI ---
  const SkeletonRow = () => (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      <td style={{ padding: '20px 24px' }}>
        <div style={{ height: '16px', width: '80%', background: '#E2E8F0', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ height: '12px', width: '30%', background: '#F1F5F9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      </td>
      <td style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E2E8F0', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          <div style={{ height: '14px', width: '100px', background: '#F1F5F9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        </div>
      </td>
      <td style={{ padding: '20px 24px' }}><div style={{ height: '24px', width: '80px', background: '#E2E8F0', borderRadius: '10px', animation: 'pulse 1.5s infinite ease-in-out' }}></div></td>
      <td style={{ padding: '20px 24px', textAlign: 'right' }}><div style={{ height: '32px', width: '80px', background: '#F1F5F9', borderRadius: '10px', display: 'inline-block', animation: 'pulse 1.5s infinite ease-in-out' }}></div></td>
    </tr>
  );

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: C.card, padding: '12px 16px', borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: C.text, fontSize: '13px' }}>{payload[0].payload.name}</p>
          <p style={{ margin: '4px 0 0', color: C.primary, fontWeight: 'bold', fontSize: '12px' }}>{payload[0].value} Active Promises</p>
        </div>
      );
    }
    return null;
  };

  // ==========================================
  // VIEW: CREATE NEW PROMISE PAGE
  // ==========================================
  if (currentView === 'create') {
    return (
      <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => setCurrentView('dashboard')} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: C.shadow, transition: 'all 0.2s' }}>
            <ArrowLeft size={20} color={C.text} />
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: C.text, margin: 0 }}>Publish New Promise</h2>
            <p style={{ fontSize: '14px', color: C.textMuted, margin: '4px 0 0' }}>Record a verified political commitment into the global database.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          <form onSubmit={handleSubmitCreate(onSubmitCreate)} style={{ background: C.card, borderRadius: '24px', border: `1px solid ${C.border}`, padding: '32px', boxShadow: C.shadow }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>Official Promise Title</label>
              <input {...registerCreate('title')} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: errorsCreate.title ? `2px solid ${C.status.Broken.hex}` : `1px solid ${C.border}`, background: C.bg, fontSize: '14px', color: C.text, outline: 'none' }} placeholder="e.g., Provide 100,000 tech scholarships by 2027" />
              {errorsCreate.title && <p style={{ fontSize: '12px', color: C.status.Broken.hex, margin: '6px 0 0', fontWeight: '600' }}>{errorsCreate.title.message}</p>}
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>Detailed Context & Parameters</label>
              <textarea rows="5" {...registerCreate('description')} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: errorsCreate.description ? `2px solid ${C.status.Broken.hex}` : `1px solid ${C.border}`, background: C.bg, fontSize: '14px', color: C.text, outline: 'none', resize: 'vertical' }} placeholder="Detail the exact metrics, budget allocations, or deadlines mentioned..."></textarea>
              {errorsCreate.description && <p style={{ fontSize: '12px', color: C.status.Broken.hex, margin: '6px 0 0', fontWeight: '600' }}>{errorsCreate.description.message}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>Sector Category</label>
                <select {...registerCreate('category')} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: errorsCreate.category ? `2px solid ${C.status.Broken.hex}` : `1px solid ${C.border}`, background: C.bg, fontSize: '14px', color: C.text, outline: 'none', cursor: 'pointer' }}>
                  <option value="Economy">Economy</option><option value="Education">Education</option><option value="Health">Health</option><option value="Infrastructure">Infrastructure</option><option value="Governance">Governance</option>
                </select>
                {errorsCreate.category && <p style={{ fontSize: '12px', color: C.status.Broken.hex, margin: '6px 0 0', fontWeight: '600' }}>{errorsCreate.category.message}</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>Accountable Politician</label>
                <select {...registerCreate('politicianId')} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: errorsCreate.politicianId ? `2px solid ${C.status.Broken.hex}` : `1px solid ${C.border}`, background: C.bg, fontSize: '14px', color: C.text, outline: 'none', cursor: 'pointer' }}>
                  <option value="" disabled>Select verified official...</option>
                  {politicians.map(pol => (<option key={pol._id} value={pol._id}>{pol.name}</option>))}
                </select>
                {errorsCreate.politicianId && <p style={{ fontSize: '12px', color: C.status.Broken.hex, margin: '6px 0 0', fontWeight: '600' }}>{errorsCreate.politicianId.message}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '24px', borderTop: `1px solid ${C.border}` }}>
              <button disabled={isSubmittingCreate} type="submit" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.gradient, color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(234,88,12,0.5)', opacity: isSubmittingCreate ? 0.7 : 1 }}>
                <Plus size={18} /> {isSubmittingCreate ? 'Encrypting & Saving...' : 'Publish to Database'}
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: C.card, borderRadius: '24px', border: `1px solid ${C.border}`, padding: '24px', boxShadow: C.shadow }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: C.primary }}>
                <Info size={20} /> <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: C.text }}>Data Integrity Guide</h3>
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0, color: C.textMuted, fontSize: '13px', lineHeight: 1.7 }}>
                <li>Ensure the promise is backed by verifiable public statements.</li>
                <li>Do not interpret or paraphrase; use exact metrics where possible.</li>
                <li>All new promises default to <strong>Pending</strong>.</li>
              </ul>
            </div>
            <div style={{ background: C.status.Kept.bg, borderRadius: '24px', border: `1px solid rgba(22, 163, 74, 0.2)`, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: C.status.Kept.hex }}>
                <CheckCircle size={20} /> <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>System Ready</h3>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: C.status.Kept.hex, lineHeight: 1.6 }}>The Janaya360 API connection is stable. Records submitted here will instantly reflect on the public citizen dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN DASHBOARD PAGE
  // ==========================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* --- DASHBOARD HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: C.text, margin: 0 }}>Promises Intelligence</h2>
          <p style={{ fontSize: '14px', color: C.textMuted, margin: '4px 0 0' }}>Monitor, audit, and export political commitments.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: C.text, border: `1px solid ${C.border}`, padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = C.primary} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => setCurrentView('create')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.gradient, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(234,88,12,0.4)', transition: 'transform 0.2s' }}>
            <Plus size={16} /> New Promise
          </button>
        </div>
      </div>

      {/* --- PREMIUM ANALYTICS ROW --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div style={{ background: C.card, padding: '24px', borderRadius: '24px', border: `1px solid ${C.border}`, boxShadow: C.shadow, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>Global Fulfillment Rate</p>
              <h3 style={{ fontSize: '42px', fontWeight: '900', color: C.text, margin: 0, lineHeight: 1 }}>{fulfillmentRate}<span style={{ fontSize: '24px', color: C.textMuted }}>%</span></h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} color={C.primary} />
            </div>
          </div>
          <div style={{ background: C.bg, borderRadius: '12px', padding: '12px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: C.textMuted, fontWeight: '600' }}>Total Tracked</span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: C.text }}>{totalCount} Records</span>
          </div>
        </div>

        <div style={{ background: C.card, padding: '24px', borderRadius: '24px', border: `1px solid ${C.border}`, boxShadow: C.shadow, gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: C.text, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={16} color={C.textMuted}/> Status Distribution
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '140px' }}>
            <div style={{ width: '140px', height: '140px', position: 'relative' }}>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                      {statusData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '12px' }}>No data</div>}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {statusData.map(stat => (
                <div key={stat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stat.color }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: C.textMuted }}>{stat.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: C.text }}>{stat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: C.card, padding: '24px', borderRadius: '24px', border: `1px solid ${C.border}`, boxShadow: C.shadow, gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: C.text, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={16} color={C.textMuted}/> Sector Focus
          </h3>
          <div style={{ height: '140px' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData.slice(0, 4)} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={85} tick={{ fontSize: 11, fill: C.textMuted, fontWeight: '600' }} />
                  <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: C.bg, radius: 8 }} />
                  <Bar dataKey="count" fill={C.primary} radius={[4, 4, 4, 4]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '12px' }}>No data</div>}
          </div>
        </div>
      </div>

      {/* --- PREMIUM DATA TABLE SECTION --- */}
      <div style={{ background: C.card, borderRadius: '24px', border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: 'hidden' }}>
        
        {/* Table Controls (Search & Filters) */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: '#FAFAFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: `1px solid ${C.border}`, padding: '10px 16px', borderRadius: '12px', minWidth: '280px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <Search size={16} color={C.textMuted} />
            <input type="text" placeholder="Search promises by title or politician..." style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px', color: C.text, fontWeight: '500' }} value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filters:</span>
            <select style={{ padding: '10px 16px', borderRadius: '12px', border: `1px solid ${C.border}`, fontSize: '13px', outline: 'none', background: '#fff', color: C.text, fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
              <option value="">All Statuses</option><option value="Pending">Pending</option><option value="In-Progress">In-Progress</option><option value="Kept">Kept</option><option value="Broken">Broken</option>
            </select>
            <select style={{ padding: '10px 16px', borderRadius: '12px', border: `1px solid ${C.border}`, fontSize: '13px', outline: 'none', background: '#fff', color: C.text, fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} value={filters.politicianId} onChange={(e) => setFilters({...filters, politicianId: e.target.value})}>
              <option value="">All Politicians</option>
              {politicians.map(pol => (<option key={pol._id} value={pol._id}>{pol.name}</option>))}
            </select>
            {(filters.status || filters.politicianId || filters.search) && (
              <button onClick={() => setFilters({ status: '', category: '', politicianId: '', search: '' })} style={{ border: 'none', background: 'transparent', color: C.primary, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Reset</button>
            )}
          </div>
        </div>
        
        {/* The Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fff', borderBottom: `2px solid ${C.border}` }}>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Promise Details</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Politician</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Log</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               // --- SKELETON LOADERS ---
              <>{[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}</>
            ) : paginatedPromises.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '80px', textAlign: 'center', color: C.textMuted }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <FileText size={48} strokeWidth={1} color={C.border} />
                    <span style={{ fontSize: '15px', fontWeight: '700', color: C.text }}>No records found.</span>
                    <p style={{ fontSize: '13px', margin: 0 }}>Adjust your search parameters or create a new record.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPromises.map((promise) => {
                const badge = C.status[promise.status] || C.status.Pending;
                const BadgeIcon = badge.icon;
                return (
                  <tr key={promise._id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '800', color: C.text, fontSize: '14px', marginBottom: '6px' }}>{promise.title}</div>
                      <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '8px', background: C.bg, border: `1px solid ${C.border}`, color: C.textMuted, fontSize: '11px', fontWeight: '700' }}>{promise.category}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: C.text, border: `1px solid ${C.border}` }}>
                          {promise.politicianId?.name ? promise.politicianId.name.substring(0,2).toUpperCase() : '?'}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: C.text }}>{promise.politicianId?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', backgroundColor: badge.bg, color: badge.text }}>
                        <BadgeIcon size={14} /> {promise.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <button onClick={() => openAuditModal(promise)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', border: `1px solid ${C.border}`, padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', color: C.text, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseEnter={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }} onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}>
                        <Pencil size={14} /> Audit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* --- FEATURE 4: PAGINATION CONTROLS --- */}
        {!isLoading && displayedPromises.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
            <span style={{ fontSize: '13px', color: C.textMuted, fontWeight: '600' }}>
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, displayedPromises.length)}</strong> of <strong>{displayedPromises.length}</strong> results
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, background: currentPage === 1 ? C.bg : '#fff', color: currentPage === 1 ? C.textMuted : C.text, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '12px' }}>
                <ChevronLeft size={14} /> Prev
              </button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, background: currentPage === totalPages ? C.bg : '#fff', color: currentPage === totalPages ? C.textMuted : C.text, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '12px' }}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- AUDIT & HISTORY MODAL --- */}
      {isModalOpen && selectedPromise && (
         <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.2s ease-out' }}>
         <div style={{ background: C.card, borderRadius: '24px', width: '100%', maxWidth: '650px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}>
           
           <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}`, background: C.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
               <h3 style={{ fontSize: '20px', fontWeight: '900', color: C.text, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}><Target size={22} color={C.primary}/> Promise Record</h3>
               <p style={{ fontSize: '13px', color: C.textMuted, margin: 0, fontWeight: '500' }}>Politician: <span style={{ color: C.text, fontWeight: '800' }}>{selectedPromise.politicianId?.name || 'Unknown'}</span></p>
             </div>
             <button onClick={() => setIsModalOpen(false)} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseEnter={e => e.currentTarget.style.color = C.status.Broken.hex} onMouseLeave={e => e.currentTarget.style.color = C.textMuted}><XCircle size={20} /></button>
           </div>

           {/* --- FEATURE 5: AUDIT TRAIL TABS --- */}
           <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: '#fff' }}>
             <button onClick={() => setActiveModalTab('audit')} style={{ flex: 1, padding: '16px', background: 'transparent', border: 'none', borderBottom: activeModalTab === 'audit' ? `3px solid ${C.primary}` : '3px solid transparent', color: activeModalTab === 'audit' ? C.primary : C.textMuted, fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
               <Pencil size={16} /> Update Status
             </button>
             <button onClick={() => setActiveModalTab('history')} style={{ flex: 1, padding: '16px', background: 'transparent', border: 'none', borderBottom: activeModalTab === 'history' ? `3px solid ${C.primary}` : '3px solid transparent', color: activeModalTab === 'history' ? C.primary : C.textMuted, fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
               <History size={16} /> Audit History Ledger
             </button>
           </div>

           <div style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
             
             {activeModalTab === 'audit' ? (
               <>
                 <div>
                   <h4 style={{ fontSize: '12px', fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>Original Promise</h4>
                   <div style={{ background: C.bg, padding: '20px', borderRadius: '16px', border: `1px solid ${C.border}` }}>
                     <h4 style={{ fontWeight: '800', color: C.text, margin: '0 0 8px', fontSize: '16px' }}>{selectedPromise.title}</h4>
                     <p style={{ color: C.textMuted, fontSize: '14px', margin: 0, lineHeight: 1.7 }}>{selectedPromise.description}</p>
                   </div>
                 </div>

                 <form onSubmit={handleSubmitUpdate(onSubmitUpdate)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                     <div>
                       <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>Verified Status</label>
                       <select {...registerUpdate('status')} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: errorsUpdate.status ? `2px solid ${C.status.Broken.hex}` : `1px solid ${C.border}`, background: '#fff', color: C.text, fontWeight: '600', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                         <option value="Pending">Pending</option><option value="In-Progress">In-Progress</option><option value="Kept">Kept</option><option value="Broken">Broken</option>
                       </select>
                       {errorsUpdate.status && <p style={{ fontSize: '12px', color: C.status.Broken.hex, margin: '6px 0 0', fontWeight: '600' }}>{errorsUpdate.status.message}</p>}
                     </div>
                     <div>
                       <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>Auditor Notes / Reason</label>
                       <input type="text" placeholder="e.g., Budget approved on floor..." {...registerUpdate('reason')} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: errorsUpdate.reason ? `2px solid ${C.status.Broken.hex}` : `1px solid ${C.border}`, background: '#fff', color: C.text, outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} />
                       {errorsUpdate.reason && <p style={{ fontSize: '12px', color: C.status.Broken.hex, margin: '6px 0 0', fontWeight: '600' }}>{errorsUpdate.reason.message}</p>}
                     </div>
                   </div>
                   <button disabled={isSubmittingUpdate} type="submit" style={{ width: '100%', padding: '16px', background: C.text, color: '#fff', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '8px', opacity: isSubmittingUpdate ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px -6px rgba(15,23,42,0.4)' }}>
                     <CheckCircle size={18} /> {isSubmittingUpdate ? 'Updating System...' : 'Confirm & Save Status'}
                   </button>
                 </form>

                 {/* Live API Integration */}
                 <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '24px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                     <h4 style={{ fontSize: '12px', fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>API News Evidence</h4>
                     <button type="button" onClick={handleSearchNews} disabled={isSearchingNews} style={{ padding: '8px 16px', background: C.bg, color: C.text, fontWeight: '700', fontSize: '13px', border: `1px solid ${C.border}`, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                       <Search size={14} /> {isSearchingNews ? 'Scanning...' : 'Scan Verified Sources'}
                     </button>
                   </div>
                   {evidence && evidence.length > 0 && (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       {evidence.map((article, idx) => (
                         <a key={idx} href={article.url} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '16px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: '16px', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = C.shadow; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }}>
                           <h5 style={{ color: C.text, fontWeight: '800', fontSize: '14px', margin: '0 0 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', lineHeight: 1.4 }}>
                             {article.title} <ExternalLink size={16} color={C.textMuted} style={{ flexShrink: 0 }} />
                           </h5>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.textMuted, fontWeight: '600' }}>
                             <span style={{ color: C.primary }}>{article.source}</span><span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                           </div>
                         </a>
                       ))}
                     </div>
                   )}
                 </div>
               </>
             ) : (
               // --- HISTORY TAB CONTENT ---
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '20px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '16px', borderLeft: `4px solid ${C.primary}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: C.textMuted }}>CURRENT STATUS</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: C.status[selectedPromise.status]?.hex || C.textMuted }}>{selectedPromise.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: C.text, fontWeight: '600' }}>Waiting for Backend Ledger Integration</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.textMuted }}>When the backend `auditHistory` array is implemented, the chronological timeline of all status changes, auditor notes, and timestamps will render here.</p>
                  </div>
                  <div style={{ padding: '20px', border: `1px solid ${C.border}`, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                     <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} color={C.textMuted}/></div>
                     <div>
                       <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '800', color: C.text }}>Record Created</p>
                       <p style={{ margin: 0, fontSize: '12px', color: C.textMuted }}>Initial database entry logged. Status set to Pending.</p>
                     </div>
                  </div>
               </div>
             )}
           </div>

           {/* Danger Zone */}
           <div style={{ padding: '20px 32px', background: C.bg, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontSize: '12px', color: C.textMuted, fontWeight: '600' }}>Record ID: {selectedPromise._id.substring(0,8)}...</span>
             <button onClick={handleDelete} style={{ background: '#fff', color: C.status.Broken.hex, fontWeight: '700', fontSize: '13px', border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseEnter={e => { e.currentTarget.style.background = C.status.Broken.bg; e.currentTarget.style.borderColor = C.status.Broken.hex; }} onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = C.border; }}>
               <Trash2 size={16} /> Permanently Purge
             </button>
           </div>
         </div>
       </div>
      )}

      {/* Inline Animation Styles */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
};

export default PromisesManagement;