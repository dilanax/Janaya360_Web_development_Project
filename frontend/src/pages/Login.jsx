import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Janaya360 Color Tokens
const COLORS = {
  parliament: {
    50:  '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    500: '#F97316',
    600: '#EA580C',   // PRIMARY — buttons, active nav, logo
    700: '#C2410C',   // Hover state
    800: '#9A3412',
  },
  civic: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',   // Links, info buttons, CTAs
    700: '#1D4ED8',
  },
  maroon: {
    600: '#7B0000',   // Parliament crest / NPP
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
};

const Login = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const navigate = useNavigate();
  const API_URL  = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user?.role === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/api/users/login`, { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.dispatchEvent(new Event('authChange'));
      toast.success('Login successful');
      if (data.role === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: `linear-gradient(135deg, ${COLORS.parliament[50]} 0%, ${COLORS.gray[100]} 50%, ${COLORS.parliament[100]} 100%)` }}
    >
      {/* Decorative background circles */}
      <div
        style={{
          position: 'fixed', top: '-80px', right: '-80px', width: '320px', height: '320px',
          borderRadius: '50%', background: COLORS.parliament[100], opacity: 0.5, pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed', bottom: '-60px', left: '-60px', width: '240px', height: '240px',
          borderRadius: '50%', background: COLORS.parliament[200], opacity: 0.35, pointerEvents: 'none',
        }}
      />

      <div className="max-w-md w-full space-y-8 relative">

        {/* ── Logo & Header ── */}
        <div className="text-center">
          <Link to="/" className="inline-block group">
            <h1 className="text-4xl font-bold tracking-tight">
              <span style={{ color: COLORS.gray[900] }}>Janaya</span>
              <span style={{ color: COLORS.parliament[600] }}>360</span>
            </h1>
          </Link>

          {/* Parliament crest accent line */}
          <div
            className="mx-auto mt-3 mb-6 h-0.5 w-16 rounded-full"
            style={{ background: `linear-gradient(90deg, ${COLORS.parliament[600]}, ${COLORS.parliament[500]})` }}
          />

          <h2
            className="text-2xl font-extrabold"
            style={{ color: COLORS.gray[900] }}
          >
            Welcome Back
          </h2>
          <p className="mt-2 text-sm" style={{ color: COLORS.gray[500] }}>
            Sign in to track political promises and stay informed
          </p>
        </div>

        {/* ── Card ── */}
        <div
          className="rounded-2xl shadow-xl p-8 space-y-6"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${COLORS.gray[200]}`,
            boxShadow: `0 8px 32px rgba(234, 88, 12, 0.08), 0 1px 4px rgba(0,0,0,0.06)`,
          }}
        >

          {/* ── Error Banner ── */}
          {error && (
            <div
              className="rounded-lg p-4 border flex gap-3"
              style={{
                background: '#FEE2E2',
                borderColor: '#DC2626',
              }}
            >
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0016 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm" style={{ color: '#7F1D1D' }}>{error}</p>
            </div>
          )}

          <div className="space-y-5">

            {/* ── Email Field ── */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: COLORS.gray[700] }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5" style={{ color: COLORS.gray[400] }} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all duration-200"
                  style={{
                    border: `1.5px solid ${COLORS.gray[300]}`,
                    color: COLORS.gray[900],
                    outline: 'none',
                    background: COLORS.gray[50],
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.parliament[600];
                    e.target.style.boxShadow   = `0 0 0 3px ${COLORS.parliament[100]}`;
                    e.target.style.background  = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = COLORS.gray[300];
                    e.target.style.boxShadow   = 'none';
                    e.target.style.background  = COLORS.gray[50];
                  }}
                />
              </div>
            </div>

            {/* ── Password Field ── */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: COLORS.gray[700] }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5" style={{ color: COLORS.gray[400] }} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 rounded-lg text-sm transition-all duration-200"
                  style={{
                    border: `1.5px solid ${COLORS.gray[300]}`,
                    color: COLORS.gray[900],
                    outline: 'none',
                    background: COLORS.gray[50],
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.parliament[600];
                    e.target.style.boxShadow   = `0 0 0 3px ${COLORS.parliament[100]}`;
                    e.target.style.background  = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = COLORS.gray[300];
                    e.target.style.boxShadow   = 'none';
                    e.target.style.background  = COLORS.gray[50];
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                  style={{ color: COLORS.gray[400] }}
                  onMouseEnter={(e) => e.currentTarget.style.color = COLORS.parliament[600]}
                  onMouseLeave={(e) => e.currentTarget.style.color = COLORS.gray[400]}
                >
                  {showPassword
                    ? <EyeSlashIcon className="h-5 w-5" />
                    : <EyeIcon      className="h-5 w-5" />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* ── Remember + Forgot ── */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded"
                style={{ accentColor: COLORS.parliament[600] }}
              />
              <span className="text-sm" style={{ color: COLORS.gray[700] }}>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-medium transition-colors"
              style={{ color: COLORS.civic[600] }}
              onMouseEnter={(e) => e.target.style.color = COLORS.civic[700]}
              onMouseLeave={(e) => e.target.style.color = COLORS.civic[600]}
            >
              Forgot password?
            </Link>
          </div>

          {/* ── Sign In Button ── */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${COLORS.parliament[600]}, ${COLORS.parliament[500]})`,
              boxShadow: `0 4px 14px rgba(234, 88, 12, 0.35)`,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background  = `linear-gradient(135deg, ${COLORS.parliament[700]}, ${COLORS.parliament[600]})`;
                e.currentTarget.style.boxShadow   = `0 6px 20px rgba(234, 88, 12, 0.45)`;
                e.currentTarget.style.transform   = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = `linear-gradient(135deg, ${COLORS.parliament[600]}, ${COLORS.parliament[500]})`;
              e.currentTarget.style.boxShadow   = `0 4px 14px rgba(234, 88, 12, 0.35)`;
              e.currentTarget.style.transform   = 'translateY(0)';
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: COLORS.gray[200] }} />
            <span className="text-xs" style={{ color: COLORS.gray[400] }}>or</span>
            <div className="flex-1 h-px" style={{ background: COLORS.gray[200] }} />
          </div>

          {/* ── Sign Up Link ── */}
          <p className="text-center text-sm" style={{ color: COLORS.gray[500] }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors"
              style={{ color: COLORS.parliament[600] }}
              onMouseEnter={(e) => e.target.style.color = COLORS.parliament[700]}
              onMouseLeave={(e) => e.target.style.color = COLORS.parliament[600]}
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* ── Info Footer ── */}
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: COLORS.parliament[50],
            border: `1px solid ${COLORS.parliament[200]}`,
          }}
        >
          <p className="text-xs" style={{ color: COLORS.gray[500] }}>
            🇱🇰 &nbsp;
            <span style={{ color: COLORS.parliament[700], fontWeight: 600 }}>Janaya360</span>
            {' '}— Accountability starts with transparency
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;