import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ─── colour tokens (matches tailwind.config.js palette) ──────────────────
   parliament-600  #EA580C   primary orange
   civic-600       #2563EB   blue
   maroon-600      #7B0000   deep maroon
   All hard-coded here so the component works without Tailwind custom tokens
──────────────────────────────────────────────────────────────────────────── */
const C = {
  orange:     '#EA580C',
  orangeHov:  '#C2410C',
  orangeBg:   '#FFF7ED',
  blue:       '#2563EB',
  blueBg:     '#EFF6FF',
  maroon:     '#7B0000',
  white:      '#FFFFFF',
  gray50:     '#F9FAFB',
  gray100:    '#F3F4F6',
  gray200:    '#E5E7EB',
  gray500:    '#6B7280',
  gray700:    '#374151',
  gray900:    '#111827',
  red:        '#DC2626',
  redBg:      '#FEF2F2',
  campusNavy: '#2F4B72',
  campusNavySoft: '#EAF0F6',
  campusGold: '#C98900',
  campusGoldSoft: '#FFF3CC',
  campusPanel: '#F5F7FA',
  campusBorder: '#D5DCE6',
};

/* ─── SVG icon components for nav links ───────────────────────────────── */
const NavIcons = {
  Home: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Politicians: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Promises: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Feedback: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  News: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="10" y1="6" x2="18" y2="6"/><line x1="10" y1="10" x2="18" y2="10"/><line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  Notifications: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M2 8c0-2.2.7-4.3 2-6"/><path d="M22 8a10 10 0 0 0-2-6"/>
    </svg>
  ),
};

const NAV_LINKS = [
  { path: '/',              label: 'Home',          icon: 'Home'          },
  { path: '/politicians',  label: 'Politicians',   icon: 'Politicians'   },
  { path: '/promises',     label: 'Promises',      icon: 'Promises'      },
  { path: '/feedback',     label: 'Feedback',      icon: 'Feedback'      },
  { path: '/news',         label: 'News',           icon: 'News'          },
];

/* ─── Logout confirmation modal ───────────────────────────────────────── */
const LogoutModal = ({ userName, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.40)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 16px',
  }}>
    <div style={{
      background: C.white, borderRadius: 20, padding: '32px 28px',
      width: '100%', maxWidth: 380,
      boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      animation: 'navModalIn 0.22s ease',
    }}>
      <style>{`@keyframes navModalIn{from{transform:scale(0.90);opacity:0}to{transform:scale(1);opacity:1}}`}</style>

      {/* Warning icon */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: C.redBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: C.gray900, marginBottom: 10, fontFamily: 'Inter,sans-serif' }}>
          Sign out of Janaya360?
        </p>
        {userName && (
          <p style={{ fontSize: 13, color: C.gray500, marginBottom: 8, fontFamily: 'Inter,sans-serif' }}>
            Signed in as <span style={{ fontWeight: 600, color: C.gray700 }}>{userName}</span>
          </p>
        )}
        <p style={{ fontSize: 13, color: C.gray500, lineHeight: 1.65, fontFamily: 'Inter,sans-serif' }}>
          You'll be returned to the login page. Any unsaved changes will be lost.
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 12,
            border: `1px solid ${C.gray200}`, background: C.gray50,
            color: C.gray700, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter,sans-serif',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.target.style.background = C.gray100}
          onMouseLeave={e => e.target.style.background = C.gray50}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 12,
            border: 'none', background: C.red,
            color: C.white, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Inter,sans-serif',
            boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.target.style.opacity = '0.88'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          Yes, sign out
        </button>
      </div>
    </div>
  </div>
);

/* ─── Shared helpers ──────────────────────────────────────────────────── */
const NOTIF_TYPE_META = {
  general:          { bg: '#EDF2F8', color: '#2F4B72', dot: '#2F4B72', label: 'General',          icon: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> },
  complaint_update: { bg: '#FFF3CC', color: '#9A6700', dot: '#C98900', label: 'Complaint Update', icon: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  emergency_alert:  { bg: '#FEF2F2', color: '#B42318', dot: '#B42318', label: 'Emergency Alert',  icon: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
};
const notifTimeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* ─── Notification detail modal ───────────────────────────────────────── */
const NotificationDetailModal = ({ notification, onClose, onMarkRead }) => {
  if (!notification) return null;
  const tc = NOTIF_TYPE_META[notification.type] || NOTIF_TYPE_META.general;
  const isUnread = !(notification.isRead || notification.status === 'read');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 22, width: '100%', maxWidth: 460, boxShadow: '0 25px 70px rgba(0,0,0,0.20)', animation: 'navModalIn 0.22s ease', overflow: 'hidden' }}>
        {/* Accent bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${tc.color}, ${tc.color}88)` }} />

        <div style={{ padding: '24px 26px 26px' }}>
          {/* Type + time row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tc.icon(tc.color)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: tc.color, textTransform: 'capitalize' }}>{tc.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.gray500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontSize: 12, color: C.gray500 }}>{notifTimeAgo(notification.createdAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.gray900, margin: '0 0 14px', lineHeight: 1.45, letterSpacing: '-0.2px' }}>{notification.title}</h3>

          {/* Body */}
          <div style={{ padding: '14px 16px', background: C.gray50, borderRadius: 12, borderLeft: `3px solid ${tc.color}`, marginBottom: 22 }}>
            <p style={{ fontSize: 14, color: C.gray700, lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>{notification.body || notification.message}</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {isUnread && onMarkRead ? (
              <button
                onClick={() => onMarkRead(notification)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.gray200}`, background: C.white, color: C.gray700, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; e.currentTarget.style.background = C.orangeBg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.gray200; e.currentTarget.style.color = C.gray700; e.currentTarget.style.background = C.white; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Mark as read
              </button>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Read
              </span>
            )}
            <button onClick={onClose} style={{ padding: '9px 26px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeHov})`, color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(234,88,12,0.30)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Notification dropdown panel ─────────────────────────────────────── */
const NotificationDropdown = ({ notifications, onMarkRead, onMarkAllRead, onView, onClose, dropdownRef, selectedNotificationId }) => {
  const unreadCount = notifications.filter(n => !(n.isRead || n.status === 'read')).length;

  return (
    <div ref={dropdownRef} style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: -8, zIndex: 200,
      width: 400, maxHeight: 510,
      background: C.campusPanel, borderRadius: 16,
      border: `1px solid ${C.campusBorder}`,
      boxShadow: '0 16px 36px rgba(26,37,51,0.18), 0 4px 12px rgba(26,37,51,0.10)',
      animation: 'notifDropIn 0.22s cubic-bezier(0.16,1,0.3,1)',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes notifDropIn{from{opacity:0;transform:translateY(-10px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        .pw-notif-item{transition:all 0.18s ease !important}
        .pw-notif-item:hover{background:${C.campusNavySoft} !important}
        .pw-notif-item:hover .pw-notif-actions{opacity:1 !important;transform:translateY(0) !important}
        .pw-notif-item:active{transform:scale(0.995)}
        .pw-markread-btn{transition:all 0.18s ease !important}
        .pw-markread-btn:hover{background:${C.campusNavySoft} !important;color:${C.campusNavy} !important;border-color:${C.campusNavy} !important}
        .pw-markall-btn{transition:all 0.15s ease !important}
        .pw-markall-btn:hover{background:${C.campusNavySoft} !important}
        .pw-viewall-link{transition:all 0.15s ease !important}
        .pw-viewall-link:hover{background:${C.campusNavySoft} !important;letter-spacing:0.2px !important}
        .pw-notif-scroll::-webkit-scrollbar{width:4px}
        .pw-notif-scroll::-webkit-scrollbar-thumb{background:${C.gray200};border-radius:4px}
        .pw-notif-scroll::-webkit-scrollbar-thumb:hover{background:${C.gray500}}
      `}</style>

      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${C.gray100}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: C.campusNavySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {NavIcons.Notifications(C.campusNavy)}
          </div>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.gray900, display: 'block', lineHeight: 1 }}>Notifications</span>
            <span style={{ fontSize: 11, color: C.gray500, marginTop: 2, display: 'block' }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </span>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={onMarkAllRead} className="pw-markall-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, fontWeight: 600, color: C.campusNavy,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px 12px', borderRadius: 8,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="pw-notif-scroll" style={{ maxHeight: 390, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: C.gray50, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.gray500} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.gray900, margin: '0 0 5px' }}>No notifications</p>
            <p style={{ fontSize: 13, color: C.gray500, margin: 0, lineHeight: 1.5 }}>When you receive notifications,<br/>they'll appear here.</p>
          </div>
        ) : (
          notifications.slice(0, 20).map((notif, idx) => {
            const isUnread = !(notif.isRead || notif.status === 'read');
            const tc = NOTIF_TYPE_META[notif.type] || NOTIF_TYPE_META.general;
            const notifKey = notif.notificationId || notif._id || notif.id;
            const isSelected = selectedNotificationId && selectedNotificationId === notifKey;
            return (
              <div
                key={notif.id || notif._id || notif.notificationId}
                className="pw-notif-item"
                style={{
                  padding: '14px 20px',
                  borderBottom: idx < 19 && idx < notifications.length - 1 ? `1px solid ${C.gray100}` : 'none',
                  background: isSelected ? '#F5D37A' : isUnread ? '#FFF8E6' : 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected ? 'inset 3px 0 0 #9A6700' : 'none',
                }}
                onClick={() => onView(notif)}
              >
                <div style={{ display: 'flex', gap: 14 }}>
                  {/* Type icon circle */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: isUnread ? tc.bg : C.gray50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${isUnread ? tc.color + '20' : C.gray200}`,
                    position: 'relative',
                  }}>
                    {tc.icon(isUnread ? tc.color : C.gray500)}
                    {isUnread && (
                      <div style={{
                        position: 'absolute', top: -2, right: -2,
                        width: 9, height: 9, borderRadius: '50%',
                        background: tc.dot,
                        border: `2px solid ${C.white}`,
                        boxShadow: `0 0 0 1px ${tc.dot}30`,
                      }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title + time */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 13, fontWeight: isUnread ? 700 : 500,
                        color: isSelected ? '#1F2937' : (isUnread ? C.gray900 : C.gray700),
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        flex: 1,
                      }}>{notif.title}</span>
                      <span style={{ fontSize: 11, color: isSelected ? '#374151' : C.gray500, flexShrink: 0, marginTop: 1 }}>{notifTimeAgo(notif.createdAt)}</span>
                    </div>

                    {/* Body preview */}
                    <p style={{
                      fontSize: 12, color: isSelected ? '#374151' : C.gray500, margin: '0 0 8px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      lineHeight: 1.4,
                    }}>{notif.body || notif.message}</p>

                    {/* Type badge + mark read button */}
                    <div className="pw-notif-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isUnread ? 1 : 0.7, transition: 'all 0.18s' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 6,
                        background: tc.bg, color: tc.color, textTransform: 'capitalize',
                        letterSpacing: '0.2px',
                      }}>{notif.type?.replace('_', ' ')}</span>

                      {isUnread && (
                        <button
                          onClick={e => { e.stopPropagation(); onMarkRead(notif); }}
                          className="pw-markread-btn"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 600, color: C.gray500,
                            background: C.white, border: `1px solid ${C.gray200}`,
                            cursor: 'pointer', padding: '3px 10px', borderRadius: 6,
                            lineHeight: 1,
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Mark as read
                        </button>
                      )}

                      {!isUnread && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: '#16A34A' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.gray100}` }}>
          <Link to="/notifications" onClick={onClose} className="pw-viewall-link" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '13px 20px',
            fontSize: 13, fontWeight: 700, color: C.campusNavy,
            textDecoration: 'none', borderRadius: '0 0 18px 18px',
          }}>
            View all notifications
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [showLogout,  setShowLogout]  = useState(false);
  const [userInfo,    setUserInfo]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('userInfo')); } catch { return null; }
  });

  /* ─── Notification state ─── */
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [selectedNotifId, setSelectedNotifId] = useState(null);
  const notifRef = useRef(null);
  const bellRef = useRef(null);

  const getToken = useCallback(() => {
    try {
      const info = JSON.parse(localStorage.getItem('userInfo'));
      return info?.token || localStorage.getItem('token') || localStorage.getItem('authToken');
    } catch { return localStorage.getItem('token') || localStorage.getItem('authToken'); }
  }, []);

  /* Fetch notifications */
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const [notifRes, statsRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/notifications/my`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/notifications/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const notificationList =
        notifRes.status === 'fulfilled' && Array.isArray(notifRes.value?.data)
          ? notifRes.value.data
          : [];

      const unreadFromList = notificationList.filter(
        (n) => !(n.isRead || n.status === 'read')
      ).length;

      const unreadFromStats =
        statsRes.status === 'fulfilled' ? statsRes.value?.data?.unread : undefined;

      setNotifications(notificationList);
      setUnreadCount(Number.isFinite(unreadFromStats) ? unreadFromStats : unreadFromList);

      try {
        localStorage.setItem('cachedNotifications', JSON.stringify(notificationList));
      } catch {
        // Ignore localStorage failures.
      }
    } catch { /* silent */ }
  }, [getToken]);

  /* Poll every 5 seconds */
  useEffect(() => {
    if (!userInfo) { setNotifications([]); setUnreadCount(0); return; }
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 5000);
    return () => clearInterval(iv);
  }, [userInfo, fetchNotifications]);

  /* Close dropdown on click outside */
  useEffect(() => {
    const handler = (e) => {
      if (
        notifOpen &&
        notifRef.current && !notifRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  /* Mark single as read */
  const handleMarkRead = async (notif) => {
    const token = getToken();
    if (!token) return;
    const nid = notif.notificationId || notif._id || notif.id;
    try {
      await axios.patch(`${API_URL}/api/notifications/read/${nid}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchNotifications();
    } catch { /* silent */ }
  };

  /* Mark all as read */
  const handleMarkAllRead = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.patch(`${API_URL}/api/notifications/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchNotifications();
    } catch { /* silent */ }
  };

  /* View notification detail */
  const handleViewNotif = (notif) => {
    setSelectedNotifId(notif.notificationId || notif._id || notif.id || null);
    setSelectedNotif(notif);
    setNotifOpen(false);
    // Auto mark as read when viewing
    const isUnread = !(notif.isRead || notif.status === 'read');
    if (isUnread) handleMarkRead(notif);
  };

  /* scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* auth sync */
  useEffect(() => {
    const sync = () => {
      try { setUserInfo(JSON.parse(localStorage.getItem('userInfo'))); }
      catch { setUserInfo(null); }
    };
    window.addEventListener('authChange', sync);
    window.addEventListener('storage',    sync);
    return () => {
      window.removeEventListener('authChange', sync);
      window.removeEventListener('storage',    sync);
    };
  }, []);

  /* close mobile menu on route change */
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const handleLogoutConfirm = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    setShowLogout(false);
    setMenuOpen(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  /* ── shared style helpers ── */
  const ff = { fontFamily: 'Inter, DM Sans, sans-serif' };

  const navLinkStyle = (active) => ({
    ...ff,
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 10,
    fontSize: 13, fontWeight: active ? 600 : 500,
    textDecoration: 'none', transition: 'all 0.2s',
    background: active ? C.orange : 'transparent',
    color:      active ? C.white  : C.gray700,
  });

  const mobileNavLinkStyle = (active) => ({
    ...ff,
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', borderRadius: 10,
    fontSize: 14, fontWeight: active ? 600 : 500,
    textDecoration: 'none', transition: 'all 0.2s',
    background: active ? C.orange : 'transparent',
    color:      active ? C.white  : C.gray700,
    marginBottom: 2,
  });

  const openProfile = () => {
    setMenuOpen(false);
    navigate('/profile');
  };

  return (
    <>
      {/* inject Inter font once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .pw-nav-link:hover { background: ${C.orangeBg} !important; color: ${C.orange} !important; }
        .pw-nav-link.active:hover { background: ${C.orangeHov} !important; color: #fff !important; }
        .pw-mobile-link:hover { background: ${C.orangeBg} !important; color: ${C.orange} !important; }
        .pw-mobile-link.active:hover { background: ${C.orangeHov} !important; color: #fff !important; }
        .pw-signin:hover { border-color: ${C.orange} !important; color: ${C.orange} !important; }
        .pw-cta:hover { background: ${C.orangeHov} !important; }
        .pw-logout-btn:hover { border-color: ${C.red} !important; color: ${C.red} !important; }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : C.white,
        borderBottom: `1px solid ${scrolled ? C.gray200 : C.gray100}`,
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.07)' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.35s ease',
        ...ff,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

            {/* ── Logo ── */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Parliament icon */}
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: `linear-gradient(135deg, ${C.orange}, ${C.orangeHov})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 22V10M21 22V10M12 2L2 10h20L12 2z"/>
                  <rect x="9" y="15" width="6" height="7"/>
                </svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.gray900, letterSpacing: '-0.5px' }}>
                Janaya<span style={{ color: C.orange }}>360</span>
              </span>
            </Link>

            {/* ── Desktop nav links ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hidden-mobile">
              {NAV_LINKS.map(link => {
                const active = isActive(link.path);
                const iconColor = active ? C.white : C.gray500;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`pw-nav-link${active ? ' active' : ''}`}
                    style={navLinkStyle(active)}
                  >
                    {link.icon && NavIcons[link.icon] && NavIcons[link.icon](iconColor)}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* ── Desktop auth ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hidden-mobile">
              {userInfo ? (
                <>
                  {/* User avatar + name */}
                  <button
                    onClick={openProfile}
                    title="View profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '5px 10px',
                      borderRadius: 10,
                      background: C.orangeBg,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${C.orange}, ${C.orangeHov})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: C.white, flexShrink: 0,
                    }}>
                      {userInfo.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.orange }}>
                      {userInfo.name}
                    </span>
                  </button>

                  {/* Notification bell + dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      ref={bellRef}
                      onClick={() => setNotifOpen(o => !o)}
                      title="Notifications"
                      style={{
                        position: 'relative',
                        width: 36, height: 36,
                        background: notifOpen || isActive('/notifications') ? C.orangeBg : C.gray50,
                        border: `1px solid ${notifOpen || isActive('/notifications') ? C.orange : C.gray200}`,
                        borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {NavIcons.Notifications(notifOpen || isActive('/notifications') ? C.orange : C.gray500)}
                      {unreadCount > 0 && (
                        <span style={{
                          position: 'absolute', top: -4, right: -4,
                          minWidth: 18, height: 18, padding: '0 5px',
                          background: '#DC2626', borderRadius: 20,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color: C.white,
                          border: `2px solid ${C.white}`,
                          lineHeight: 1,
                        }}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {notifOpen && (
                      <NotificationDropdown
                        notifications={notifications}
                        onMarkRead={handleMarkRead}
                        onMarkAllRead={handleMarkAllRead}
                        onView={handleViewNotif}
                        onClose={() => setNotifOpen(false)}
                        dropdownRef={notifRef}
                        selectedNotificationId={selectedNotifId}
                      />
                    )}
                  </div>

                  <button
                    onClick={() => setShowLogout(true)}
                    className="pw-logout-btn"
                    style={{
                      ...ff,
                      padding: '8px 18px', borderRadius: 10,
                      border: `1px solid ${C.gray200}`, background: 'transparent',
                      color: C.gray500, fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="pw-signin"
                    style={{
                      ...ff,
                      padding: '8px 18px', borderRadius: 10,
                      border: `1px solid ${C.gray200}`, background: 'transparent',
                      color: C.gray700, fontSize: 13, fontWeight: 500,
                      textDecoration: 'none', transition: 'all 0.2s',
                    }}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="pw-cta"
                    style={{
                      ...ff,
                      padding: '8px 20px', borderRadius: 10,
                      background: C.orange, color: C.white,
                      fontSize: 13, fontWeight: 700,
                      textDecoration: 'none', transition: 'background 0.2s',
                      boxShadow: `0 4px 14px rgba(234,88,12,0.35)`,
                    }}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                display: 'none', /* overridden by responsive style below */
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 6, borderRadius: 8,
              }}
              className="show-mobile"
              aria-label="Toggle menu"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ width: 22, height: 2, background: C.gray700, borderRadius: 2, transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
                <div style={{ width: 22, height: 2, background: C.gray700, borderRadius: 2, transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
                <div style={{ width: 22, height: 2, background: C.gray700, borderRadius: 2, transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
              </div>
            </button>
          </div>

          {/* ── Mobile menu dropdown ── */}
          {menuOpen && (
            <div style={{
              borderTop: `1px solid ${C.gray100}`,
              padding: '12px 0 16px',
              background: C.white,
              animation: 'mobileMenuIn 0.22s ease',
            }}>
              <style>{`@keyframes mobileMenuIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

              {NAV_LINKS.map(link => {
                const active = isActive(link.path);
                const iconColor = active ? C.white : C.gray500;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`pw-mobile-link${active ? ' active' : ''}`}
                    style={mobileNavLinkStyle(active)}
                  >
                    {link.icon && NavIcons[link.icon] && NavIcons[link.icon](iconColor)}
                    {link.label}
                  </Link>
                );
              })}

              <div style={{ borderTop: `1px solid ${C.gray100}`, marginTop: 10, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {userInfo ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <button
                        onClick={openProfile}
                        title="View profile"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: '8px 12px',
                          background: C.orangeBg,
                          borderRadius: 10,
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          flex: 1,
                        }}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${C.orange},${C.orangeHov})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.white }}>
                          {userInfo.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.orange }}>{userInfo.name}</span>
                      </button>

                      {/* Notification bell (mobile) */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setNotifOpen(o => !o)}
                          title="Notifications"
                          style={{
                            position: 'relative',
                            width: 40, height: 40, flexShrink: 0,
                            background: notifOpen || isActive('/notifications') ? C.orangeBg : C.gray50,
                            border: `1px solid ${notifOpen || isActive('/notifications') ? C.orange : C.gray200}`,
                            borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {NavIcons.Notifications(notifOpen || isActive('/notifications') ? C.orange : C.gray500)}
                          {unreadCount > 0 && (
                            <span style={{
                              position: 'absolute', top: -4, right: -4,
                              minWidth: 18, height: 18, padding: '0 5px',
                              background: '#DC2626', borderRadius: 20,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 700, color: C.white,
                              border: `2px solid ${C.white}`,
                              lineHeight: 1,
                            }}>
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </button>
                        {notifOpen && (
                          <NotificationDropdown
                            notifications={notifications}
                            onMarkRead={handleMarkRead}
                            onMarkAllRead={handleMarkAllRead}
                            onView={handleViewNotif}
                            onClose={() => setNotifOpen(false)}
                            dropdownRef={notifRef}
                            selectedNotificationId={selectedNotifId}
                          />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowLogout(true)}
                      style={{
                        ...ff,
                        width: '100%', padding: '11px 0', borderRadius: 10,
                        border: `1px solid ${C.gray200}`, background: 'transparent',
                        color: C.red, fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        ...ff,
                        display: 'block', textAlign: 'center',
                        padding: '11px 0', borderRadius: 10,
                        border: `1px solid ${C.gray200}`, background: 'transparent',
                        color: C.gray700, fontSize: 14, fontWeight: 500,
                        textDecoration: 'none', transition: 'all 0.2s',
                      }}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        ...ff,
                        display: 'block', textAlign: 'center',
                        padding: '11px 0', borderRadius: 10,
                        background: C.orange, color: C.white,
                        fontSize: 14, fontWeight: 700,
                        textDecoration: 'none', transition: 'background 0.2s',
                      }}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* responsive helpers */}
        <style>{`
          @media (max-width: 1024px) {
            .hidden-mobile { display: none !important; }
            .show-mobile   { display: flex !important; }
          }
          @media (min-width: 1025px) {
            .show-mobile { display: none !important; }
          }
        `}</style>
      </nav>

      {/* ── Notification detail modal ── */}
      {selectedNotif && (
        <NotificationDetailModal
          notification={selectedNotif}
          onClose={() => setSelectedNotif(null)}
          onMarkRead={handleMarkRead}
        />
      )}

      {/* ── Logout modal ── */}
      {showLogout && (
        <LogoutModal
          userName={userInfo?.name}
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
};

export default Navbar;
