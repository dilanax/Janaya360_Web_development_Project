import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
};

const NAV_LINKS = [
  { path: '/',              label: 'Home'          },
  { path: '/politicians',  label: 'Politicians'   },
  { path: '/promises',     label: 'Promises'      },
  { path: '/feedback',     label: 'Feedback'      },
  { path: '/news',         label: 'News'          },
  { path: '/notifications',label: 'Notifications' },
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
    display: 'inline-flex', alignItems: 'center',
    padding: '7px 14px', borderRadius: 10,
    fontSize: 13, fontWeight: active ? 600 : 500,
    textDecoration: 'none', transition: 'all 0.2s',
    background: active ? C.orange : 'transparent',
    color:      active ? C.white  : C.gray700,
  });

  const mobileNavLinkStyle = (active) => ({
    ...ff,
    display: 'block', padding: '10px 14px', borderRadius: 10,
    fontSize: 14, fontWeight: active ? 600 : 500,
    textDecoration: 'none', transition: 'all 0.2s',
    background: active ? C.orange : 'transparent',
    color:      active ? C.white  : C.gray700,
    marginBottom: 2,
  });

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
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`pw-nav-link${active ? ' active' : ''}`}
                    style={navLinkStyle(active)}
                  >
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 10, background: C.orangeBg }}>
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
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`pw-mobile-link${active ? ' active' : ''}`}
                    style={mobileNavLinkStyle(active)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div style={{ borderTop: `1px solid ${C.gray100}`, marginTop: 10, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {userInfo ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', background: C.orangeBg, borderRadius: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${C.orange},${C.orangeHov})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.white }}>
                        {userInfo.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.orange }}>{userInfo.name}</span>
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