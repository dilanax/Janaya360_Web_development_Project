import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  MapPinIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// ── Janaya360 Color Tokens ──────────────────────────────────
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
    errorBg:    '#FEE2E2',
    errorText:  '#7F1D1D',
    errorBdr:   '#DC2626',
    errorIcon:  '#DC2626',
    successBg:  '#DCFCE7',
    successText:'#14532D',
    successBdr: '#16A34A',
    successIcon:'#16A34A',
  },
};

// ── Shared input style helpers ──────────────────────────────
const inputBase = {
  border: `1.5px solid ${C.gray[300]}`,
  color:  C.gray[900],
  outline: 'none',
  background: C.gray[50],
  borderRadius: '0.5rem',
  width: '100%',
  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
  fontSize: '0.875rem',
  transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
  appearance: 'none',
};
const inputError = { borderColor: C.status.errorBdr };

const onFocus  = (e) => {
  e.target.style.borderColor = C.parliament[600];
  e.target.style.boxShadow   = `0 0 0 3px ${C.parliament[100]}`;
  e.target.style.background  = '#FFFFFF';
};
const onBlur   = (e) => {
  e.target.style.borderColor = C.gray[300];
  e.target.style.boxShadow   = 'none';
  e.target.style.background  = C.gray[50];
};
const onFocusErr = (e) => {
  e.target.style.borderColor = C.status.errorBdr;
  e.target.style.boxShadow   = `0 0 0 3px #FEE2E2`;
  e.target.style.background  = '#FFFFFF';
};

const Register = () => {
  const navigate = useNavigate();
  const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [isLoading,           setIsLoading]           = useState(false);
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', district: '', role: 'citizen',
  });

  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [success,  setSuccess]  = useState('');

  const districts = [
    "Colombo","Gampaha","Kalutara","Kandy","Matale",
    "Nuwara Eliya","Galle","Matara","Hambantota",
    "Jaffna","Kilinochchi","Mannar","Vavuniya",
    "Mullaitivu","Batticaloa","Ampara","Trincomalee",
    "Kurunegala","Puttalam","Anuradhapura",
    "Polonnaruwa","Badulla","Monaragala",
    "Ratnapura","Kegalle",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p  => ({ ...p,  [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    if (apiError)     setApiError('');
  };

  const validateForm = () => {
    const e = {};
    if (!formData.name)                                    e.name = 'Name is required';
    else if (formData.name.length < 2)                     e.name = 'Name must be at least 2 characters';
    else if (formData.name.length > 50)                    e.name = 'Name must be less than 50 characters';

    const emailRe = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!formData.email)                                   e.email = 'Email is required';
    else if (!emailRe.test(formData.email))                e.email = 'Please enter a valid email address';

    if (!formData.password)                                e.password = 'Password is required';
    else if (formData.password.length < 6)                 e.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword)                         e.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';

    const phoneRe = /^[0-9]{10}$/;
    if (!formData.phone)                                   e.phone = 'Phone number is required';
    else if (!phoneRe.test(formData.phone))                e.phone = 'Phone number must be 10 digits';

    if (!formData.district)                                e.district = 'Please select your district';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(''); setSuccess('');
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/users/register`, {
        name: formData.name, email: formData.email, password: formData.password,
        phone: formData.phone, district: formData.district, role: formData.role,
      });
      if (response.data) {
        setSuccess('Registration successful! Redirecting to login…');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      if (error.response?.data?.message)       setApiError(error.response.data.message);
      else if (error.response?.data?.errors)   setErrors(error.response.data.errors);
      else                                     setApiError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Field component ─────────────────────────────────────
  const Field = ({ id, label, icon: Icon, error, hint, children }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5"
        style={{ color: C.gray[700] }}>
        {label} <span style={{ color: C.parliament[600] }}>*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5" style={{ color: C.gray[400] }} />
        </div>
        {children}
      </div>
      {error && <p className="mt-1 text-xs" style={{ color: C.status.errorBdr }}>{error}</p>}
      {hint  && !error && <p className="mt-1 text-xs" style={{ color: C.gray[500] }}>{hint}</p>}
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: `linear-gradient(135deg, ${C.parliament[50]} 0%, ${C.gray[100]} 50%, ${C.parliament[100]} 100%)` }}
    >
      {/* Decorative blobs */}
      <div style={{ position:'fixed', top:'-80px', right:'-80px', width:'300px', height:'300px',
        borderRadius:'50%', background: C.parliament[100], opacity:0.5, pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-60px', left:'-60px', width:'220px', height:'220px',
        borderRadius:'50%', background: C.parliament[200], opacity:0.3, pointerEvents:'none' }} />

      <div className="max-w-md w-full space-y-6 relative">

        {/* ── Logo ── */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold tracking-tight">
              <span style={{ color: C.gray[900] }}>Janaya</span>
              <span style={{ color: C.parliament[600] }}>360</span>
            </h1>
          </Link>
          <div className="mx-auto mt-3 mb-5 h-0.5 w-16 rounded-full"
            style={{ background: `linear-gradient(90deg, ${C.parliament[600]}, ${C.parliament[500]})` }} />
          <h2 className="text-2xl font-extrabold" style={{ color: C.gray[900] }}>
            Create Account
          </h2>
          <p className="mt-1 text-sm" style={{ color: C.gray[500] }}>
            Join the movement for political transparency in Sri Lanka
          </p>
        </div>

        {/* ── Card ── */}
        <div className="rounded-2xl p-8 space-y-5"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${C.gray[200]}`,
            boxShadow: `0 8px 32px rgba(234,88,12,0.08), 0 1px 4px rgba(0,0,0,0.06)`,
          }}>

          {/* API Error */}
          {apiError && (
            <div className="rounded-lg p-4 border flex gap-3"
              style={{ background: C.status.errorBg, borderColor: C.status.errorBdr }}>
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5"
                style={{ color: C.status.errorIcon }} />
              <p className="text-sm" style={{ color: C.status.errorText }}>{apiError}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-lg p-4 border flex gap-3"
              style={{ background: C.status.successBg, borderColor: C.status.successBdr }}>
              <CheckBadgeIcon className="h-5 w-5 flex-shrink-0 mt-0.5"
                style={{ color: C.status.successIcon }} />
              <p className="text-sm" style={{ color: C.status.successText }}>{success}</p>
            </div>
          )}

          <div className="space-y-4">

            {/* Name */}
            <Field id="name" label="Full Name" icon={UserIcon} error={errors.name}>
              <input id="name" name="name" type="text" autoComplete="name" required
                value={formData.name} onChange={handleChange} placeholder="John Doe"
                style={{ ...inputBase, ...(errors.name ? inputError : {}) }}
                onFocus={errors.name ? onFocusErr : onFocus} onBlur={onBlur} />
            </Field>

            {/* Email */}
            <Field id="email" label="Email Address" icon={EnvelopeIcon} error={errors.email}>
              <input id="email" name="email" type="email" autoComplete="email" required
                value={formData.email} onChange={handleChange} placeholder="you@example.com"
                style={{ ...inputBase, ...(errors.email ? inputError : {}) }}
                onFocus={errors.email ? onFocusErr : onFocus} onBlur={onBlur} />
            </Field>

            {/* Phone */}
            <Field id="phone" label="Phone Number" icon={PhoneIcon} error={errors.phone}>
              <input id="phone" name="phone" type="tel" autoComplete="tel" required
                value={formData.phone} onChange={handleChange} placeholder="0712345678"
                style={{ ...inputBase, ...(errors.phone ? inputError : {}) }}
                onFocus={errors.phone ? onFocusErr : onFocus} onBlur={onBlur} />
            </Field>

            {/* District */}
            <Field id="district" label="District" icon={MapPinIcon} error={errors.district}>
              <select id="district" name="district" required
                value={formData.district} onChange={handleChange}
                style={{ ...inputBase, ...(errors.district ? inputError : {}), cursor:'pointer' }}
                onFocus={errors.district ? onFocusErr : onFocus} onBlur={onBlur}>
                <option value="">Select your district</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>

            {/* Password */}
            <Field id="password" label="Password" icon={LockClosedIcon}
              error={errors.password} hint="Must be at least 6 characters">
              <input id="password" name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password" required
                value={formData.password} onChange={handleChange} placeholder="••••••••"
                style={{ ...inputBase, paddingRight:'2.5rem', ...(errors.password ? inputError : {}) }}
                onFocus={errors.password ? onFocusErr : onFocus} onBlur={onBlur} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                style={{ color: C.gray[400] }}
                onMouseEnter={e => e.currentTarget.style.color = C.parliament[600]}
                onMouseLeave={e => e.currentTarget.style.color = C.gray[400]}>
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </Field>

            {/* Confirm Password */}
            <Field id="confirmPassword" label="Confirm Password" icon={LockClosedIcon}
              error={errors.confirmPassword}>
              <input id="confirmPassword" name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password" required
                value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                style={{ ...inputBase, paddingRight:'2.5rem', ...(errors.confirmPassword ? inputError : {}) }}
                onFocus={errors.confirmPassword ? onFocusErr : onFocus} onBlur={onBlur} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                style={{ color: C.gray[400] }}
                onMouseEnter={e => e.currentTarget.style.color = C.parliament[600]}
                onMouseLeave={e => e.currentTarget.style.color = C.gray[400]}>
                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </Field>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${C.parliament[600]}, ${C.parliament[500]})`,
              boxShadow: `0 4px 14px rgba(234,88,12,0.35)`,
            }}
            onMouseEnter={e => {
              if (!isLoading) {
                e.currentTarget.style.background  = `linear-gradient(135deg, ${C.parliament[700]}, ${C.parliament[600]})`;
                e.currentTarget.style.boxShadow   = `0 6px 20px rgba(234,88,12,0.45)`;
                e.currentTarget.style.transform   = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = `linear-gradient(135deg, ${C.parliament[600]}, ${C.parliament[500]})`;
              e.currentTarget.style.boxShadow   = `0 4px 14px rgba(234,88,12,0.35)`;
              e.currentTarget.style.transform   = 'translateY(0)';
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account…
              </>
            ) : 'Create Account'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: C.gray[200] }} />
            <span className="text-xs" style={{ color: C.gray[400] }}>or</span>
            <div className="flex-1 h-px" style={{ background: C.gray[200] }} />
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm" style={{ color: C.gray[500] }}>
            Already have an account?{' '}
            <Link to="/login"
              className="font-semibold transition-colors"
              style={{ color: C.civic[600] }}
              onMouseEnter={e => e.target.style.color = C.civic[700]}
              onMouseLeave={e => e.target.style.color = C.civic[600]}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="rounded-xl p-4 text-center"
          style={{ background: C.parliament[50], border: `1px solid ${C.parliament[200]}` }}>
          <p className="text-xs" style={{ color: C.gray[500] }}>
            🇱🇰 &nbsp;
            <span style={{ color: C.parliament[700], fontWeight: 600 }}>Janaya360</span>
            {' '}— Accountability starts with transparency
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;