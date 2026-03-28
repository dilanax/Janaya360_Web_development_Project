import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BellIcon,
  FunnelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

const C = {
  parliament: { 50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 500: '#F97316', 600: '#EA580C', 700: '#C2410C' },
  civic: { 50: '#EFF6FF', 100: '#DBEAFE', 600: '#2563EB', 700: '#1D4ED8' },
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280', 700: '#374151', 900: '#111827' },
  maroon: { 600: '#7B0000' },
};

const TYPE_META = {
  general: {
    label: 'General',
    icon: BellIcon,
    bg: C.civic[50],
    text: C.civic[700],
  },
  complaint_update: {
    label: 'Complaint Update',
    icon: ChatBubbleBottomCenterTextIcon,
    bg: '#F0FDF4',
    text: '#166534',
  },
  emergency_alert: {
    label: 'Emergency Alert',
    icon: ExclamationTriangleIcon,
    bg: '#FEF2F2',
    text: '#B91C1C',
  },
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'Unknown time';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const TITLE_MIN = 3;
const TITLE_MAX = 120;
const BODY_MIN = 10;
const BODY_MAX = 500;

const validateField = (name, value) => {
  const v = (value || '').trim();
  if (name === 'title') {
    if (!v) return 'Title is required';
    if (v.length < TITLE_MIN) return `Title must be at least ${TITLE_MIN} characters`;
    if (v.length > TITLE_MAX) return `Title must not exceed ${TITLE_MAX} characters`;
  }
  if (name === 'body') {
    if (!v) return 'Message is required';
    if (v.length < BODY_MIN) return `Message must be at least ${BODY_MIN} characters`;
    if (v.length > BODY_MAX) return `Message must not exceed ${BODY_MAX} characters`;
  }
  return '';
};

const Notifications = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [activeReadFilter, setActiveReadFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    body: '',
    type: 'general',
  });
  const [createForm, setCreateForm] = useState({
    title: '',
    body: '',
    type: 'general',
  });
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const userInfo = useMemo(() => {
    try {
      const stored = localStorage.getItem('userInfo');
      const auth = localStorage.getItem('auth');
      return stored ? JSON.parse(stored) : auth ? JSON.parse(auth) : null;
    } catch {
      return null;
    }
  }, []);

  // Get token from multiple possible locations
  const token = useMemo(() => {
    return userInfo?.token || localStorage.getItem('token') || localStorage.getItem('authToken');
  }, [userInfo]);

  const isAdmin = userInfo?.role === 'admin';

  const api = useMemo(
    () => {
      const instance = axios.create({
        baseURL: `${API_URL}/api/notifications`,
      });

      // Add token to every request
      instance.interceptors.request.use(
        (config) => {
          const currentToken = localStorage.getItem('token') || token;
          if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      return instance;
    },
    [API_URL, token]
  );

  const initialLoadDone = React.useRef(false);

  const loadNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      toast.error('Please login to view notifications');
      return;
    }

    try {
      // Only show loading spinner on initial load, not on background polls
      if (!initialLoadDone.current) setLoading(true);

      // For non-admin users, use /my endpoint
      if (!isAdmin) {
        try {
          const [listRes, statsRes] = await Promise.all([
            api.get('/my').catch(() => ({ data: [] })),
            api.get('/stats').catch(() => ({ data: { total: 0, unread: 0, read: 0 } }))
          ]);

          const list = Array.isArray(listRes.data) ? listRes.data : [];
          setNotifications(list);
          setStats({
            total: statsRes.data?.total || list.length,
            unread: statsRes.data?.unread || list.filter(n => n.status === 'unread').length,
            read: statsRes.data?.read || list.filter(n => n.status === 'read').length,
          });
        } catch (error) {
          console.error('Error loading user notifications:', error);
          if (!initialLoadDone.current) toast.error('Failed to load notifications');
          setNotifications([]);
        }
      } else {
        // For admin users, fetch all notifications
        try {
          const listRes = await api.get('/my');
          const list = Array.isArray(listRes.data) ? listRes.data : [];

          setNotifications(list);
          setStats({
            total: list.length,
            unread: list.filter(n => n.status === 'unread').length,
            read: list.filter(n => n.status === 'read').length,
          });
        } catch (error) {
          console.error('Error loading admin notifications:', error);
          setNotifications([]);
          setStats({ total: 0, unread: 0, read: 0 });
        }
      }
    } catch (error) {
      console.error('Error in loadNotifications:', error);
      if (!initialLoadDone.current) toast.error(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, [api, token, isAdmin]);

  useEffect(() => {
    loadNotifications();
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markOneAsRead = async (notificationId) => {
    try {
      setActionLoading(true);
      await api.patch(`/read/${notificationId}`);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, status: 'read' } : item
        )
      );
      setStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1,
      }));
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error(error.response?.data?.message || 'Failed to mark notification');
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading(true);
      const response = await api.patch('/read');
      
      console.log('Mark all as read response:', response.data);

      // Update all notifications to 'read' status
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, status: 'read' }))
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        read: prev.total,
        unread: 0,
      }));

      toast.success(`${response.data.modified || 'All'} notifications marked as read`);
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();

    const titleErr = validateField('title', createForm.title);
    const bodyErr = validateField('body', createForm.body);
    const errors = {};
    if (titleErr) errors.title = titleErr;
    if (bodyErr) errors.body = bodyErr;
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setCreateLoading(true);
      
      // Step 1: Create the notification
      const createResponse = await api.post('/', {
        title: createForm.title.trim(),
        body: createForm.body.trim(),
        type: createForm.type,
      });

      const notificationId = createResponse.data?.notificationId || createResponse.data?.notification?._id;

      // Step 2: Send the notification to all users
      if (notificationId) {
        await api.post('/send', {
          notificationId: notificationId,
        });
      }

      toast.success('Notification created and sent successfully');
      setCreateForm({
        title: '',
        body: '',
        type: 'general',
      });
      setCreateErrors({});
      await loadNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error(error.response?.data?.message || 'Failed to create notification');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (notification) => {
    if (!notification || !notification._id) {
      console.error('Invalid notification object:', notification);
      toast.error('Unable to load notification for editing');
      return;
    }
    
    console.log('Opening edit modal for:', notification._id);
    setEditingId(notification._id);
    setEditForm({
      title: notification.title || '',
      body: notification.body || notification.message || '',
      type: notification.type || 'general',
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setEditForm({
      title: '',
      body: '',
      type: 'general',
    });
    setEditErrors({});
  };

  const handleUpdateNotification = async (e) => {
    e.preventDefault();
    console.log('Update form submitted. editingId:', editingId, 'isAdmin:', isAdmin);
    
    const titleErr = validateField('title', editForm.title);
    const bodyErr = validateField('body', editForm.body);
    const errors = {};
    if (titleErr) errors.title = titleErr;
    if (bodyErr) errors.body = bodyErr;
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the validation errors');
      return;
    }

    if (!editingId) {
      console.error('editingId is not set:', editingId);
      toast.error('No notification selected. Please close and try again.');
      return;
    }

    try {
      setActionLoading(true);
      const notifId = editingId;
      console.log('Updating notification:', notifId);
      
      const response = await api.put(`/${notifId}`, {
        title: editForm.title.trim(),
        body: editForm.body.trim(),
        type: editForm.type,
      });

      console.log('Update response:', response.data);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notifId
            ? {
                ...item,
                title: editForm.title.trim(),
                body: editForm.body.trim(),
                type: editForm.type,
              }
            : item
        )
      );

      toast.success('Notification updated successfully');
      closeEditModal();
      await loadNotifications();
    } catch (error) {
      console.error('Error updating notification:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update notification';
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotification = async () => {
    if (!deleteConfirmId) {
      toast.error('No notification selected for deletion');
      return;
    }

    try {
      setActionLoading(true);
      console.log('Deleting notification:', deleteConfirmId, 'isAdmin:', isAdmin);
      
      const response = await api.delete(`/${deleteConfirmId}`);
      console.log('Delete response:', response.data);

      setNotifications((prev) => prev.filter((item) => item._id !== deleteConfirmId));
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        unread: prev.unread > 0 ? prev.unread - 1 : 0,
      }));

      toast.success('Notification deleted successfully');
      setShowDeleteConfirm(false);
      setDeleteConfirmId(null);
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete notification';
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteConfirm = (notificationId) => {
    setDeleteConfirmId(notificationId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmId(null);
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const typeMatches = activeType === 'all' || item.type === activeType;
      const readMatches =
        activeReadFilter === 'all' ||
        (activeReadFilter === 'read' && item.status === 'read') ||
        (activeReadFilter === 'unread' && item.status === 'unread');
      const searchMatches =
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.message?.toLowerCase().includes(search.toLowerCase()) ||
        item.body?.toLowerCase().includes(search.toLowerCase());
      return typeMatches && readMatches && searchMatches;
    });
  }, [notifications, activeType, activeReadFilter, search]);

  const hasUnread = stats.unread > 0;

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-2xl border p-8 text-center" style={{ borderColor: C.gray[200], background: '#fff' }}>
          <MegaphoneIcon className="h-10 w-10 mx-auto mb-4" style={{ color: C.parliament[600] }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: C.gray[900] }}>Notifications</h2>
          <p style={{ color: C.gray[500] }}>Please sign in to view and manage your notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{ background: `linear-gradient(145deg, ${C.gray[50]} 0%, #FFFFFF 55%, ${C.parliament[50]} 100%)` }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl p-6 sm:p-8 border shadow-sm" style={{ borderColor: C.gray[200], background: '#fff' }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: C.parliament[100], color: C.parliament[700] }}>
                <BellIcon className="h-4 w-4" />
                Notification Management
              </div>
              <h1 className="text-3xl font-extrabold mb-1" style={{ color: C.gray[900] }}>Stay Updated</h1>
              <p style={{ color: C.gray[500] }}>Track important updates, alerts, and complaint status changes in one place.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={loadNotifications}
                disabled={loading || actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold"
                style={{ borderColor: C.gray[300], color: C.gray[700], background: '#fff' }}
              >
                <ArrowPathIcon className={`h-4 w-4 ${(loading || actionLoading) ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {!isAdmin && (
                <button
                  onClick={markAllAsRead}
                  disabled={stats.unread === 0 || loading || actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${C.parliament[600]}, ${C.parliament[500]})` }}
                >
                  <CheckBadgeIcon className="h-4 w-4" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: BellIcon, color: C.civic[600], bg: C.civic[50] },
            { label: 'Unread', value: stats.unread, icon: ExclamationTriangleIcon, color: C.maroon[600], bg: '#FEF2F2' },
            { label: 'Read', value: stats.read, icon: CheckCircleIcon, color: '#166534', bg: '#F0FDF4' },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border p-5" style={{ borderColor: C.gray[200], background: '#fff' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: C.gray[500] }}>{card.label}</p>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-3xl font-black mt-3" style={{ color: C.gray[900] }}>{card.value}</p>
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <form
              onSubmit={handleCreateNotification}
              className="rounded-2xl border p-5 sm:p-6 space-y-4"
              style={{ borderColor: C.gray[200], background: '#fff' }}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold" style={{ color: C.gray[900] }}>
                  Create Notification
                </h2>
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: C.civic[100], color: C.civic[700] }}
                >
                  Admin
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: C.gray[700] }}>
                    Title
                  </label>
                  <input
                    value={createForm.title}
                    onChange={(e) => {
                      setCreateForm((prev) => ({ ...prev, title: e.target.value }));
                      if (createErrors.title) setCreateErrors((prev) => ({ ...prev, title: validateField('title', e.target.value) }));
                    }}
                    onBlur={(e) => setCreateErrors((prev) => ({ ...prev, title: validateField('title', e.target.value) }))}
                    placeholder="Enter notification title"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: createErrors.title ? '#EF4444' : C.gray[300], color: C.gray[900], background: C.gray[50] }}
                    maxLength={TITLE_MAX}
                  />
                  <div className="flex justify-between mt-1">
                    {createErrors.title
                      ? <span className="text-xs" style={{ color: '#EF4444' }}>{createErrors.title}</span>
                      : <span />}
                    <span className="text-xs" style={{ color: C.gray[400] }}>{createForm.title.length}/{TITLE_MAX}</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: C.gray[700] }}>
                    Message
                  </label>
                  <textarea
                    value={createForm.body}
                    onChange={(e) => {
                      setCreateForm((prev) => ({ ...prev, body: e.target.value }));
                      if (createErrors.body) setCreateErrors((prev) => ({ ...prev, body: validateField('body', e.target.value) }));
                    }}
                    onBlur={(e) => setCreateErrors((prev) => ({ ...prev, body: validateField('body', e.target.value) }))}
                    placeholder="Write the notification message..."
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none min-h-[120px]"
                    style={{ borderColor: createErrors.body ? '#EF4444' : C.gray[300], color: C.gray[900], background: C.gray[50] }}
                    maxLength={BODY_MAX}
                  />
                  <div className="flex justify-between mt-1">
                    {createErrors.body
                      ? <span className="text-xs" style={{ color: '#EF4444' }}>{createErrors.body}</span>
                      : <span />}
                    <span className="text-xs" style={{ color: C.gray[400] }}>{createForm.body.length}/{BODY_MAX}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: C.gray[700] }}>
                    Type
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: C.gray[300], color: C.gray[700], background: '#fff' }}
                  >
                    <option value="general">General</option>
                    <option value="complaint_update">Complaint Update</option>
                    <option value="emergency_alert">Emergency Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: C.gray[700] }}>
                    Audience
                  </label>
                  <div
                    className="w-full px-3 py-2.5 rounded-xl border text-sm font-semibold"
                    style={{ borderColor: C.gray[200], color: C.gray[900], background: C.gray[50] }}
                  >
                    All users
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={createLoading || loading || actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${C.parliament[600]}, ${C.parliament[500]})` }}
                >
                  {createLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <MegaphoneIcon className="h-4 w-4" />}
                  {createLoading ? 'Creating...' : 'Create & Send'}
                </button>
              </div>
            </form>

            <div
              className="rounded-2xl border p-5 sm:p-6 space-y-4"
              style={{ borderColor: C.gray[200], background: '#fff' }}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold" style={{ color: C.gray[900] }}>
                  Recent Notifications
                </h2>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl border p-4 animate-pulse"
                      style={{ borderColor: C.gray[200], background: '#fff' }}
                    >
                      <div className="h-4 rounded w-2/3 mb-2" style={{ background: C.gray[100] }} />
                      <div className="h-4 rounded w-1/2" style={{ background: C.gray[100] }} />
                    </div>
                  ))
                ) : notifications.length === 0 ? (
                  <div className="rounded-xl border p-6 text-center" style={{ borderColor: C.gray[200], background: '#fff' }}>
                    <BellIcon className="h-8 w-8 mx-auto mb-3" style={{ color: C.gray[400] }} />
                    <h3 className="font-bold" style={{ color: C.gray[900] }}>No notifications yet</h3>
                    <p style={{ color: C.gray[500], fontSize: 13, marginTop: 4 }}>Create one on the left.</p>
                  </div>
                ) : (
                  notifications.slice(0, 6).map((item) => {
                    const meta = TYPE_META[item.type] || TYPE_META.general;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={item._id}
                        className="rounded-xl border p-4"
                        style={{
                          borderColor: item.status === 'read' ? C.gray[200] : C.parliament[200],
                          background: item.status === 'read' ? '#fff' : C.parliament[50],
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: meta.bg }}>
                              <Icon className="h-4 w-4" style={{ color: meta.text }} />
                            </div>
                            <div>
                              <div className="text-sm font-extrabold" style={{ color: C.gray[900] }}>
                                {item.title}
                              </div>
                              <div className="text-xs mt-1" style={{ color: C.gray[500] }}>
                                {formatDate(item.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{
                                background: item.status === 'read' ? '#F0FDF4' : '#FEF2F2',
                                color: item.status === 'read' ? '#166534' : '#B91C1C',
                                border: `1px solid ${item.status === 'read' ? '#DCFCE7' : '#FEE2E2'}`,
                              }}
                            >
                              {item.status === 'read' ? 'Read' : 'Unread'}
                            </div>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Edit button clicked, item:', item);
                                    if (item && item._id) {
                                      openEditModal(item);
                                    } else {
                                      console.error('Invalid item for edit:', item);
                                      toast.error('Cannot load notification');
                                    }
                                  }}
                                  disabled={actionLoading}
                                  className="px-2 py-1 rounded text-xs font-semibold text-white disabled:opacity-50"
                                  style={{ background: C.civic[600] }}
                                  title="Edit"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Delete button clicked, item:', item);
                                    if (item && item._id) {
                                      openDeleteConfirm(item._id);
                                    } else {
                                      console.error('Invalid item for delete:', item);
                                      toast.error('Cannot load notification');
                                    }
                                  }}
                                  disabled={actionLoading}
                                  className="px-2 py-1 rounded text-xs font-semibold text-white disabled:opacity-50"
                                  style={{ background: '#E74C3C' }}
                                  title="Delete"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {!isAdmin && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: C.gray[200], background: '#fff' }}>
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.gray[400] }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or message..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: C.gray[300], color: C.gray[900], background: C.gray[50] }}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: C.gray[300], color: C.gray[500] }}>
                <FunnelIcon className="h-4 w-4" />
                Filter
              </div>
              <select
                value={activeReadFilter}
                onChange={(e) => setActiveReadFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border text-sm"
                style={{ borderColor: C.gray[300], color: C.gray[700], background: '#fff' }}
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'general', 'complaint_update', 'emergency_alert'].map((type) => {
              const isActive = activeType === type;
              const typeLabel = type === 'all' ? 'All types' : TYPE_META[type]?.label || type;
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className="px-3.5 py-2 rounded-full text-sm font-semibold border"
                  style={{
                    borderColor: isActive ? C.parliament[600] : C.gray[300],
                    background: isActive ? C.parliament[100] : '#fff',
                    color: isActive ? C.parliament[700] : C.gray[700],
                  }}
                >
                  {typeLabel}
                </button>
              );
            })}
          </div>
        </div>
        )}

        {!isAdmin && (
        <div className="space-y-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border p-5 animate-pulse" style={{ borderColor: C.gray[200], background: '#fff' }}>
                <div className="h-5 rounded w-1/3 mb-3" style={{ background: C.gray[100] }} />
                <div className="h-4 rounded w-2/3 mb-2" style={{ background: C.gray[100] }} />
                <div className="h-4 rounded w-1/2" style={{ background: C.gray[100] }} />
              </div>
            ))
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border p-10 text-center" style={{ borderColor: C.gray[200], background: '#fff' }}>
              <BellIcon className="h-10 w-10 mx-auto mb-3" style={{ color: C.gray[400] }} />
              <h3 className="text-lg font-bold mb-1" style={{ color: C.gray[900] }}>No notifications found</h3>
              <p style={{ color: C.gray[500] }}>Try changing filters or search to view more results.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const meta = TYPE_META[item.type] || TYPE_META.general;
              const Icon = meta.icon;
              return (
                <div
                  key={item._id}
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: item.status === 'read' ? C.gray[200] : C.parliament[200],
                    background: item.status === 'read' ? '#fff' : C.parliament[50],
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.text }}>
                          <Icon className="h-3.5 w-3.5" />
                          {meta.label}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full border" style={{ borderColor: C.gray[300], color: item.status === 'read' ? '#166534' : C.maroon[600], background: item.status === 'read' ? '#F0FDF4' : '#FEF2F2' }}>
                          {item.status === 'read' ? 'Read' : 'Unread'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1" style={{ color: C.gray[900] }}>{item.title}</h3>
                      <p className="text-sm leading-6" style={{ color: C.gray[700] }}>{item.message || item.body}</p>
                      <p className="text-xs mt-3" style={{ color: C.gray[500] }}>{formatDate(item.createdAt)}</p>
                    </div>

                    {item.status !== 'read' && (
                      <button
                        onClick={() => markOneAsRead(item._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${C.civic[600]}, ${C.civic[700]})` }}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8" style={{ background: '#fff' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: C.gray[900] }}>
                  Edit Notification
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                  style={{ color: C.gray[400] }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: C.gray[700] }}>
                    Title
                  </label>
                  <input
                    value={editForm.title}
                    onChange={(e) => {
                      setEditForm((prev) => ({ ...prev, title: e.target.value }));
                      if (editErrors.title) setEditErrors((prev) => ({ ...prev, title: validateField('title', e.target.value) }));
                    }}
                    onBlur={(e) => setEditErrors((prev) => ({ ...prev, title: validateField('title', e.target.value) }))}
                    placeholder="Enter notification title"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: editErrors.title ? '#EF4444' : C.gray[300], color: C.gray[900], background: C.gray[50] }}
                    maxLength={TITLE_MAX}
                  />
                  <div className="flex justify-between mt-1">
                    {editErrors.title
                      ? <span className="text-xs" style={{ color: '#EF4444' }}>{editErrors.title}</span>
                      : <span />}
                    <span className="text-xs" style={{ color: C.gray[400] }}>{editForm.title.length}/{TITLE_MAX}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: C.gray[700] }}>
                    Message
                  </label>
                  <textarea
                    value={editForm.body}
                    onChange={(e) => {
                      setEditForm((prev) => ({ ...prev, body: e.target.value }));
                      if (editErrors.body) setEditErrors((prev) => ({ ...prev, body: validateField('body', e.target.value) }));
                    }}
                    onBlur={(e) => setEditErrors((prev) => ({ ...prev, body: validateField('body', e.target.value) }))}
                    placeholder="Write the notification message..."
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none min-h-[120px]"
                    style={{ borderColor: editErrors.body ? '#EF4444' : C.gray[300], color: C.gray[900], background: C.gray[50] }}
                    maxLength={BODY_MAX}
                  />
                  <div className="flex justify-between mt-1">
                    {editErrors.body
                      ? <span className="text-xs" style={{ color: '#EF4444' }}>{editErrors.body}</span>
                      : <span />}
                    <span className="text-xs" style={{ color: C.gray[400] }}>{editForm.body.length}/{BODY_MAX}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: C.gray[700] }}>
                    Type
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: C.gray[300], color: C.gray[700], background: '#fff' }}
                  >
                    <option value="general">General</option>
                    <option value="complaint_update">Complaint Update</option>
                    <option value="emergency_alert">Emergency Alert</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border"
                    style={{ borderColor: C.gray[300], color: C.gray[700], background: '#fff' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${C.parliament[600]}, ${C.parliament[500]})` }}
                  >
                    {actionLoading ? 'Updating...' : 'Update Notification'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-2" style={{ color: C.gray[900] }}>
                Delete Notification?
              </h2>
              <p className="text-sm mb-6" style={{ color: C.gray[600] }}>
                Are you sure you want to delete this notification? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: C.gray[300], color: C.gray[700], background: '#fff' }}
                >
                  No, Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteNotification}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: '#E74C3C' }}
                >
                  {actionLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Notifications;