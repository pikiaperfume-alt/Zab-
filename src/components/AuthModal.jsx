import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function AuthModal({ mode, onClose, onSuccess }) {
  const { setAuthUser } = useAuth();
  const [view, setView] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing. Please set environment variables.');
      }

      const body = {
        email: email.trim(),
        password,
        action: view === 'login' ? 'login' : 'signup',
      };

      if (view === 'signup') {
        body.role = role;
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/auth-handler`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccess(data.message);

      if (view === 'login' && data.session) {
        // Store session and user info in localStorage
        localStorage.setItem('zab_session', JSON.stringify(data.session));
        localStorage.setItem('zab_user', JSON.stringify(data.user));
        localStorage.setItem('zab_user_email', email);

        if (setAuthUser) {
          setAuthUser(data.user);
        }

        if (onSuccess) {
          onSuccess(data.user);
        }

        setTimeout(() => {
          onClose();
        }, 1500);
      } else if (view === 'signup') {
        // After signup, show login form
        setView('login');
        setEmail('');
        setPassword('');
        setSuccess('');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(11,8,32,0.75)', backdropFilter: 'blur(6px)', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{ width: '100%', maxWidth: 400, padding: 32, position: 'relative', background: 'var(--night-800)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 18, right: 18, color: 'var(--ink-400)' }}>
          <X size={20} />
        </button>

        <h3 style={{ fontSize: 24, marginBottom: 6 }}>{view === 'signup' ? 'Join ZAB' : 'Welcome back'}</h3>
        <p style={{ color: 'var(--ink-400)', fontSize: 14.5, marginBottom: 24 }}>
          {view === 'signup' ? 'Create an account to start your wellness journey.' : 'Sign in to your account'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          {view === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, color: 'var(--ink-400)', fontSize: 13.5 }}>I am a</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <RoleOption selected={role === 'student'} onClick={() => setRole('student')} label="Wellness member" description="Access sessions, tutors, and AI guidance." />
                <RoleOption selected={role === 'tutor'} onClick={() => setRole('tutor')} label="Tutor / Instructor" description="Offer guided video sessions and run your own classes." />
              </div>
            </div>
          )}

          {error && <p style={{ color: '#F08AA8', fontSize: 13 }}>{error}</p>}
          {success && <p style={{ color: '#98FB98', fontSize: 13 }}>{success}</p>}

          <button type="submit" className="btn-primary" disabled={busy} style={{ marginTop: 6, opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Please wait…' : view === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-400)', marginTop: 20 }}>
          {view === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setView(view === 'signup' ? 'login' : 'signup'); setError(''); setSuccess(''); }} style={{ color: 'var(--lotus-300)', fontWeight: 600 }}>
            {view === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, color: 'var(--ink-200)' }}>
      {label}
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: 'rgba(245,243,255,0.05)',
          border: '1px solid rgba(245,243,255,0.12)',
          borderRadius: 10,
          padding: '11px 14px',
          color: '#F5F3FF',
          fontSize: 14.5,
        }}
      />
    </label>
  );
}

function RoleOption({ selected, onClick, label, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        textAlign: 'left',
        padding: '14px 16px',
        borderRadius: 14,
        border: selected ? '1px solid #C9A8F0' : '1px solid rgba(245,243,255,0.12)',
        background: selected ? 'rgba(201,168,240,0.12)' : 'rgba(245,243,255,0.04)',
        color: '#F5F3FF',
      }}
    >
      <strong style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>{label}</strong>
      <span style={{ fontSize: 12.5, color: 'var(--ink-400)' }}>{description}</span>
    </button>
  );
}

function humanizeError(err) {
  const code = err?.code || '';
  if (code.includes('email-already-in-use')) return 'That email is already registered — try logging in instead.';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Incorrect email or password.';
  if (code.includes('user-not-found')) return "We couldn't find an account with that email.";
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
  return err.message || 'Something went wrong. Please try again.';
}
