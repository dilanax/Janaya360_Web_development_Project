import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

const C = {
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    500: '#6B7280',
    700: '#374151',
    900: '#111827',
  },
  orange: '#EA580C',
  red: '#DC2626',
  greenBg: '#DCFCE7',
  greenText: '#14532D',
};

const initialForm = {
  name: '',
  party: '',
  district: '',
  position: '',
  bio: '',
  profileImageUrl: '',
};

const AdminPoliticiansManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [politicians, setPoliticians] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}').token}`,
  });

  const loadPoliticians = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/api/politicians`);
      setPoliticians(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load politicians.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoliticians();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return politicians;

    return politicians.filter((p) =>
      [p.name, p.party, p.district, p.position, p.bio]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [politicians, search]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setMessage('');
    setError('');
    setForm({
      name: item.name || '',
      party: item.party || '',
      district: item.district || '',
      position: item.position || '',
      bio: item.bio || '',
      profileImageUrl: item.profileImageUrl || '',
    });
  };

  const resetForm = () => {
    setEditingId('');
    setForm(initialForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!form.name.trim()) {
        setError('Politician name is required.');
        setSaving(false);
        return;
      }

      const payload = {
        name: form.name.trim(),
        party: form.party.trim(),
        district: form.district.trim(),
        position: form.position.trim(),
        bio: form.bio.trim(),
        profileImageUrl: form.profileImageUrl.trim(),
      };

      if (editingId) {
        await axios.put(`${API_URL}/api/politicians/${editingId}`, payload, { headers: getAuthHeaders() });
        setMessage('Politician updated successfully.');
      } else {
        await axios.post(`${API_URL}/api/politicians`, payload, { headers: getAuthHeaders() });
        setMessage('Politician created successfully.');
      }

      resetForm();
      await loadPoliticians();
    } catch (e2) {
      setError(e2.response?.data?.message || 'Failed to save politician.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this politician?')) return;

    setError('');
    setMessage('');
    try {
      await axios.delete(`${API_URL}/api/politicians/${id}`, { headers: getAuthHeaders() });
      setMessage('Politician deleted successfully.');
      await loadPoliticians();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete politician.');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: `1px solid ${C.gray[200]}` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[900], marginBottom: 6 }}>Politicians Management</div>
      <div style={{ fontSize: 11, color: C.gray[500], marginBottom: 16 }}>
        {loading ? 'Loading...' : `${filtered.length} politicians shown`}
      </div>

      <form onSubmit={handleSave} style={{ background: C.gray[50], border: `1px solid ${C.gray[200]}`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gray[900] }}>
            {editingId ? 'Update Politician' : 'Create Politician'}
          </div>
          {editingId && (
            <button type="button" onClick={resetForm} style={{ border: 'none', background: 'transparent', color: C.gray[700], cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Name *" style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}` }} />
          <input value={form.party} onChange={(e) => handleChange('party', e.target.value)} placeholder="Party" style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}` }} />
          <input value={form.district} onChange={(e) => handleChange('district', e.target.value)} placeholder="District" style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}` }} />
          <input value={form.position} onChange={(e) => handleChange('position', e.target.value)} placeholder="Position" style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}` }} />
          <input value={form.profileImageUrl} onChange={(e) => handleChange('profileImageUrl', e.target.value)} placeholder="Profile image URL" style={{ gridColumn: '1 / -1', padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}` }} />
          <textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} placeholder="Bio" style={{ gridColumn: '1 / -1', minHeight: 84, padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.gray[300]}` }} />
        </div>

        <button type="submit" disabled={saving} style={{ marginTop: 12, border: 'none', borderRadius: 10, padding: '10px 14px', background: C.orange, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {editingId ? <Save size={14} /> : <Plus size={14} />}
          {saving ? 'Saving...' : editingId ? 'Update Politician' : 'Create Politician'}
        </button>
      </form>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search politician by name, party, district..."
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
          <div key={item._id} style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.8fr 0.8fr 1fr auto', gap: 10, alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: C.gray[50], border: `1px solid ${C.gray[200]}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.gray[900] }}>{item.name}</div>
              <div style={{ fontSize: 11, color: C.gray[500] }}>{item.position || 'No position'}</div>
            </div>
            <div style={{ fontSize: 12, color: C.gray[700] }}>{item.party || '-'}</div>
            <div style={{ fontSize: 12, color: C.gray[700] }}>{item.district || '-'}</div>
            <div style={{ fontSize: 11, color: C.gray[500], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.bio || 'No bio'}</div>
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
          <div style={{ fontSize: 12, color: C.gray[500] }}>No politicians found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminPoliticiansManagement;
