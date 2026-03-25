import React, { useState, useCallback } from 'react';
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
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/* ── Janaya360 Color Tokens ──────────────────────────────────── */
const C = {
  parliament: {
    50:  '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
  },
  civic: {
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
    errorBg:     '#FEE2E2',
    errorText:   '#7F1D1D',
    errorBdr:    '#DC2626',
    successBg:   '#DCFCE7',
    successText: '#14532D',
    successBdr:  '#16A34A',
  },
};

const DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale',
  'Nuwara Eliya','Galle','Matara','Hambantota',
  'Jaffna','Kilinochchi','Mannar','Vavuniya',
  'Mullaitivu','Batticaloa','Ampara','Trincomalee',
  'Kurunegala','Puttalam','Anuradhapura',
  'Polonnaruwa','Badulla','Monaragala',
  'Ratnapura','Kegalle',
];

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

/* ─────────────────────────────────────────────────────────────
   KEY FIX: Each input manages its own focused state internally.
   This means focus/blur styling never goes stale between renders,
   and the input is never blocked from receiving text.
───────────────────────────────────────────────────────────── */
const StyledInput = ({ hasError, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        display: 'block',
        width: '100%',
        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
        fontSize: '0.875rem',
        color: C.gray[900],
        background: focused ? '#fff' : C.gray[50],
        border: `1.5px solid ${hasError ? C.status.errorBdr : focused ? C.parliament[600] : C.gray[300]}`,
        borderRadius: '0.5rem',
        boxShadow: focused ? `0 0 0 3px ${hasError ? '#FEE2E2' : C.parliament[100]}` : 'none',
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
        boxSizing: 'border-box',
      }}
      onFocus={() => setFocused(true)}
      onBlur={()  => setFocused(false)}
    />
  );
};

const StyledSelect = ({ hasError, children, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        display: 'block',
        width: '100%',
        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
        fontSize: '0.875rem',
        color: C.gray[900],
        background: focused ? '#fff' : C.gray[50],
        border: `1.5px solid ${hasError ? C.status.errorBdr : focused ? C.parliament[600] : C.gray[300]}`,
        borderRadius: '0.5rem',
        boxShadow: focused ? `0 0 0 3px ${hasError ? '#FEE2E2' : C.parliament[100]}` : 'none',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
        boxSizing: 'border-box',
      }}
      onFocus={() => setFocused(true)}
      onBlur={()  => setFocused(false)}
    >
      {children}
    </select>
  );
};

const PasswordInput = ({ id, label, value, onChange, error, autoComplete }) => {
  const [show,    setShow]    = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={{ display:'block', fontSize:'0.875rem', fontWeight:500, color: C.gray[700], marginBottom:'0.375rem' }}>
        {label} <span style={{ color: C.parliament[600] }}>*</span>
      </label>
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute', top:0, bottom:0, left:0, display:'flex', alignItems:'center', paddingLeft:'0.75rem', pointerEvents:'none' }}>
          <LockClosedIcon style={{ width:'1.25rem', height:'1.25rem', color: C.gray[400] }} />
        </div>
        <input
          id={id} name={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem 2.5rem 0.75rem 2.5rem',
            fontSize: '0.875rem',
            color: C.gray[900],
            background: focused ? '#fff' : C.gray[50],
            border: `1.5px solid ${error ? C.status.errorBdr : focused ? C.parliament[600] : C.gray[300]}`,
            borderRadius: '0.5rem',
            boxShadow: focused ? `0 0 0 3px ${error ? '#FEE2E2' : C.parliament[100]}` : 'none',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
          }}
          onFocus={() => setFocused(true)}
          onBlur={()  => setFocused(false)}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position:'absolute', top:0, bottom:0, right:0,
            display:'flex', alignItems:'center', paddingRight:'0.75rem',
            background:'none', border:'none', cursor:'pointer', color: C.gray[400],
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.parliament[600]}
          onMouseLeave={e => e.currentTarget.style.color = C.gray[400]}
        >
          {show ? <EyeSlashIcon style={{ width:'1.25rem', height:'1.25rem' }} />
                : <EyeIcon      style={{ width:'1.25rem', height:'1.25rem' }} />}
        </button>
      </div>
      {error && <p style={{ marginTop:'0.25rem', fontSize:'0.75rem', color: C.status.errorBdr }}>{error}</p>}
    </div>
  );
};

const Field = ({ id, label, icon: Icon, error, hint, children }) => (
  <div>
    <label htmlFor={id} style={{ display:'block', fontSize:'0.875rem', fontWeight:500, color: C.gray[700], marginBottom:'0.375rem' }}>
      {label} <span style={{ color: C.parliament[600] }}>*</span>
    </label>
    <div style={{ position:'relative' }}>
      <div style={{ position:'absolute', top:0, bottom:0, left:0, display:'flex', alignItems:'center', paddingLeft:'0.75rem', pointerEvents:'none', zIndex:1 }}>
        <Icon style={{ width:'1.25rem', height:'1.25rem', color: C.gray[400] }} />
      </div>
      {children}
    </div>
    {error && <p style={{ marginTop:'0.25rem', fontSize:'0.75rem', color: C.status.errorBdr }}>{error}</p>}
    {hint && !error && <p style={{ marginTop:'0.25rem', fontSize:'0.75rem', color: C.gray[500] }}>{hint}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
const Register = () => {
  const navigate = useNavigate();
  const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [isLoading, setIsLoading] = useState(false);
  const [formData,  setFormData]  = useState({ name:'', email:'', password:'', confirmPassword:'', phone:'', district:'', role:'citizen' });
  const [errors,    setErrors]    = useState({});
  const [apiError,  setApiError]  = useState('');
  const [success,   setSuccess]   = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setErrors(p  => ({ ...p, [name]: '' }));
    setApiError('');
  }, []);

  const validate = () => {
    const e = {};
    if (!formData.name || formData.name.length < 2)                       e.name = 'Name must be at least 2 characters';
    if (formData.name.length > 50)                                         e.name = 'Name must be less than 50 characters';
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) e.email = 'Please enter a valid email address';
    if (!formData.email)                                                   e.email = 'Email is required';
    if (!formData.password)                                                e.password = 'Password is required';
    else if (!PASSWORD_RULE.test(formData.password))                       e.password = 'Password must be 8+ characters and include letters and numbers';
    if (formData.password !== formData.confirmPassword)                    e.confirmPassword = 'Passwords do not match';
    if (!formData.confirmPassword)                                         e.confirmPassword = 'Please confirm your password';
    if (!/^[0-9]{10}$/.test(formData.phone))                              e.phone = 'Phone number must be 10 digits';
    if (!formData.phone)                                                   e.phone = 'Phone number is required';
    if (!formData.district)                                                e.district = 'Please select your district';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(''); setSuccess('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/users/register`, {
        name: formData.name, email: formData.email, password: formData.password,
        phone: formData.phone, district: formData.district, role: formData.role,
      });
      if (data) {
        setSuccess('Registration successful! Redirecting to login…');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      if (err.response?.data?.message)     setApiError(err.response.data.message);
      else if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else if (err.request)                setApiError('Cannot connect to the server. Please make sure the backend is running.');
      else                                 setApiError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const btn = {
    display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
    width:'100%', padding:'0.75rem 1rem', marginTop:'1.5rem',
    borderRadius:'0.5rem', fontSize:'0.875rem', fontWeight:600, color:'#fff',
    background:`linear-gradient(135deg, ${C.parliament[600]}, ${C.parliament[500]})`,
    boxShadow:`0 4px 14px rgba(234,88,12,0.35)`,
    border:'none', cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.6 : 1, transition:'all 0.2s',
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 1rem',
      background:`linear-gradient(135deg, ${C.parliament[50]} 0%, ${C.gray[100]} 50%, ${C.parliament[100]} 100%)` }}>

      {/* blobs */}
      <div style={{ position:'fixed', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:C.parliament[100], opacity:0.5, pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-60px', left:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:C.parliament[200], opacity:0.3, pointerEvents:'none' }} />

      <div style={{ maxWidth:'28rem', width:'100%', position:'relative' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <h1 style={{ fontSize:'2.25rem', fontWeight:700, margin:0 }}>
              <span style={{ color:C.gray[900] }}>Janaya</span>
              <span style={{ color:C.parliament[600] }}>360</span>
            </h1>
          </Link>
          <div style={{ margin:'0.75rem auto 1.25rem', height:'2px', width:'4rem', borderRadius:'9999px', background:`linear-gradient(90deg,${C.parliament[600]},${C.parliament[500]})` }} />
          <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:C.gray[900], margin:'0 0 0.25rem' }}>Create Account</h2>
          <p style={{ fontSize:'0.875rem', color:C.gray[500], margin:0 }}>Join the movement for political transparency in Sri Lanka</p>
        </div>

        {/* Card */}
        <div style={{ background:'#fff', borderRadius:'1rem', padding:'2rem', border:`1px solid ${C.gray[200]}`, boxShadow:`0 8px 32px rgba(234,88,12,0.08),0 1px 4px rgba(0,0,0,0.06)` }}>

          {apiError && (
            <div style={{ display:'flex', gap:'0.75rem', padding:'1rem', background:C.status.errorBg, border:`1px solid ${C.status.errorBdr}`, borderRadius:'0.5rem', marginBottom:'1.25rem' }}>
              <ExclamationTriangleIcon style={{ width:'1.25rem', height:'1.25rem', color:C.status.errorBdr, flexShrink:0 }} />
              <p style={{ fontSize:'0.875rem', color:C.status.errorText, margin:0 }}>{apiError}</p>
            </div>
          )}

          {success && (
            <div style={{ display:'flex', gap:'0.75rem', padding:'1rem', background:C.status.successBg, border:`1px solid ${C.status.successBdr}`, borderRadius:'0.5rem', marginBottom:'1.25rem' }}>
              <CheckBadgeIcon style={{ width:'1.25rem', height:'1.25rem', color:C.status.successBdr, flexShrink:0 }} />
              <p style={{ fontSize:'0.875rem', color:C.status.successText, margin:0 }}>{success}</p>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

            <Field id="name" label="Full Name" icon={UserIcon} error={errors.name}>
              <StyledInput id="name" name="name" type="text" autoComplete="name" required
                value={formData.name} onChange={handleChange} placeholder="John Doe" hasError={!!errors.name} />
            </Field>

            <Field id="email" label="Email Address" icon={EnvelopeIcon} error={errors.email}>
              <StyledInput id="email" name="email" type="email" autoComplete="email" required
                value={formData.email} onChange={handleChange} placeholder="you@example.com" hasError={!!errors.email} />
            </Field>

            <Field id="phone" label="Phone Number" icon={PhoneIcon} error={errors.phone}>
              <StyledInput id="phone" name="phone" type="tel" autoComplete="tel" required
                value={formData.phone} onChange={handleChange} placeholder="0712345678" hasError={!!errors.phone} />
            </Field>

            <Field id="district" label="District" icon={MapPinIcon} error={errors.district}>
              <StyledSelect id="district" name="district" required
                value={formData.district} onChange={handleChange} hasError={!!errors.district}>
                <option value="">Select your district</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </StyledSelect>
            </Field>

            <PasswordInput id="password" label="Password"
              value={formData.password} onChange={handleChange}
              error={errors.password} autoComplete="new-password" />

            <PasswordInput id="confirmPassword" label="Confirm Password"
              value={formData.confirmPassword} onChange={handleChange}
              error={errors.confirmPassword} autoComplete="new-password" />

            {!errors.password && (
              <p style={{ marginTop:'-0.5rem', fontSize:'0.75rem', color:C.gray[500] }}>
                Use at least 8 characters with letters and numbers
              </p>
            )}
          </div>

          <button type="button" onClick={handleSubmit} disabled={isLoading} style={btn}
            onMouseEnter={e => { if(!isLoading){ e.currentTarget.style.background=`linear-gradient(135deg,${C.parliament[700]},${C.parliament[600]})`; e.currentTarget.style.transform='translateY(-1px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.background=`linear-gradient(135deg,${C.parliament[600]},${C.parliament[500]})`; e.currentTarget.style.transform='translateY(0)'; }}>
            {isLoading ? (
              <>
                <svg style={{ width:'1.25rem', height:'1.25rem', animation:'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity:0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path style={{ opacity:0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creating account…
              </>
            ) : 'Create Account'}
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', margin:'1.25rem 0' }}>
            <div style={{ flex:1, height:'1px', background:C.gray[200] }} />
            <span style={{ fontSize:'0.75rem', color:C.gray[400] }}>or</span>
            <div style={{ flex:1, height:'1px', background:C.gray[200] }} />
          </div>

          <p style={{ textAlign:'center', fontSize:'0.875rem', color:C.gray[500], margin:0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight:600, color:C.civic[600], textDecoration:'none' }}
              onMouseEnter={e => e.currentTarget.style.color=C.civic[700]}
              onMouseLeave={e => e.currentTarget.style.color=C.civic[600]}>
              Sign in
            </Link>
          </p>
        </div>

        <div style={{ marginTop:'1rem', borderRadius:'0.75rem', padding:'1rem', textAlign:'center', background:C.parliament[50], border:`1px solid ${C.parliament[200]}` }}>
          <p style={{ fontSize:'0.75rem', color:C.gray[500], margin:0 }}>
            🇱🇰 &nbsp;<span style={{ color:C.parliament[700], fontWeight:600 }}>Janaya360</span> — Accountability starts with transparency
          </p>
        </div>

        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
};

export default Register;
