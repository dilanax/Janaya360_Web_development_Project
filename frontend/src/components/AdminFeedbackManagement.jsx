import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

const DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar',
  'Vavuniya','Mullaitivu','Batticaloa','Ampara','Trincomalee',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla',
  'Monaragala','Ratnapura','Kegalle',
];

const TYPES = ['Opinion', 'Complaint', 'Suggestion', 'Evidence'];

const C = {
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 500: '#6B7280', 700: '#374151', 900: '#111827' },
  orange: '#EA580C',
  red: '#DC2626',
  greenBg: '#DCFCE7',
  greenText: '#14532D',
};

const defaultForm = {
  citizenName: '',
  comment: '',
  feedbackType: '',
  district: '',
};

const AdminFeedbackManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [promises, setPromises] = useState([]);
  const [promiseId, setPromiseId] = useState('');
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
  const loadPromises = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/promises`);
      setPromises(res.data.data || res.data);
    } catch (error) {
      console.log("Failed to load promises", error);
    }
  };

  loadPromises();
}, []);

  const loadFeedback = async () => {
    if (!promiseId.trim()) {
      setFeedbackItems([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/api/feedback/${promiseId.trim()}`);
      setFeedbackItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load feedback list.');
      setFeedbackItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [promiseId]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return feedbackItems;

    return feedbackItems.filter((item) =>
      [item.comment, item.citizenName, item.feedbackType, item.district]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [feedbackItems, search]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditingId('');
    setForm(defaultForm);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setError('');
    setMessage('');
    setForm({
      citizenName: item.citizenName || '',
      comment: item.comment || '',
      feedbackType: item.feedbackType || '',
      district: item.district || '',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!promiseId.trim()) {
        setError('Promise ID is required.');
        setSaving(false);
        return;
      }

      if (!form.comment.trim()) {
        setError('Comment is required.');
        setSaving(false);
        return;
      }

      const payload = {
        citizenName: form.citizenName.trim(),
        comment: form.comment.trim(),
        feedbackType: form.feedbackType,
        district: form.district,
      };

      if (editingId) {
        await axios.patch(`${API_URL}/api/feedback/${editingId}`, payload);
        setMessage('Feedback updated successfully.');
      } else {
        await axios.post(`${API_URL}/api/feedback/${promiseId.trim()}`, payload);
        setMessage('Feedback created successfully.');
      }

      resetForm();
      await loadFeedback();
    } catch (e2) {
      setError(e2.response?.data?.message || 'Failed to save feedback.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;

    setError('');
    setMessage('');
    try {
      await axios.delete(`${API_URL}/api/feedback/${id}`);
      setMessage('Feedback deleted successfully.');
      await loadFeedback();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete feedback.');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: `1px solid ${C.gray[200]}` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[900], marginBottom: 6 }}>Feedback Management</div>
      <div style={{ fontSize: 11, color: C.gray[500], marginBottom: 12 }}>
        {loading ? 'Loading...' : `${filtered.length} feedback records shown`}
      </div>

      <div style={{ marginBottom: 10, display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
        <select
            value={promiseId}
            onChange={(e) => setPromiseId(e.target.value)}
            style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: `1px solid ${C.gray[300]}`
           }}
          >
         <option value="">Select Promise</option>
        {promises.map((promise) => (
        <option key={promise._id} value={promise._id}>
      {promise.title}
       </option>
         ))}
          </select>

      </div>

      <form onSubmit={handleSave} style={{ background: C.gray[50], border: `1px solid ${C.gray[200]}`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gray[900] }}>{editingId ? 'Update Feedback' : 'Create Feedback'}</div>
          {editingId && (
            <button type="button" onClick={resetForm} style={{ border: 'none', background: 'transparent', color: C.gray[700], cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input value={form.citizenName} onChange={(e) => handleChange('citizenName', e.target.value)} placeholder="Citizen name" style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}` }} />
          <select value={form.feedbackType} onChange={(e) => handleChange('feedbackType', e.target.value)} style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}` }}>
            <option value="">Feedback Type</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select value={form.district} onChange={(e) => handleChange('district', e.target.value)} style={{ gridColumn: '1 / -1', padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}` }}>
            <option value="">District</option>
            {DISTRICTS.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <textarea value={form.comment} onChange={(e) => handleChange('comment', e.target.value)} placeholder="Comment" style={{ gridColumn: '1 / -1', minHeight: 88, padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}` }} />
        </div>

        <button type="submit" disabled={saving} style={{ marginTop: 12, border: 'none', borderRadius: 10, padding: '10px 14px', background: C.orange, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {editingId ? <Save size={14} /> : <Plus size={14} />}
          {saving ? 'Saving...' : editingId ? 'Update Feedback' : 'Create Feedback'}
        </button>
      </form>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by citizen name, comment, type or district"
        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}`, marginBottom: 12 }}
      />

      {error && (
        <div style={{ marginBottom: 12, background: '#FEF2F2', border: '1px solid #FECACA', color: C.red, borderRadius: 10, padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ marginBottom: 12, background: C.greenBg, border: '1px solid #86EFAC', color: C.greenText, borderRadius: 10, padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((item) => (
          <div key={item._id} style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.6fr 0.8fr 0.8fr auto', gap: 10, alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: C.gray[50], border: `1px solid ${C.gray[200]}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.gray[900] }}>{item.citizenName || 'Anonymous'}</div>
            <div style={{ fontSize: 12, color: C.gray[700], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.comment}</div>
            <div style={{ fontSize: 12, color: C.gray[700] }}>{item.feedbackType || '-'}</div>
            <div style={{ fontSize: 12, color: C.gray[700] }}>{item.district || '-'}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => startEdit(item)} style={{ border: 'none', background: 'transparent', color: '#2563EB', cursor: 'pointer' }}>
                <Pencil size={14} />
              </button>
              <button type="button" onClick={() => handleDelete(item._id)} style={{ border: 'none', background: 'transparent', color: C.red, cursor: 'pointer' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div style={{ fontSize: 12, color: C.gray[500] }}>No feedback found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackManagement;
