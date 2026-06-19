import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function AuthModal({ mode, onClose, onSuccess }) {
  const [view, setView] = useState(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { signUp, logIn, logInWithGoogle, firebaseReady } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (view === 'signup') {
        if (!name.trim()) throw new Error('Please tell us your name.');
        await signUp(name.trim(), email.trim(), password);
      } else {
        await logIn(email.trim(), password);
      }
      onSuccess();
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setBusy(true);
    try {
      await logInWithGoogle();
      onSuccess();
    } catch (err) {
      setError(humanizeError(err));
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

        <h3 style={{ fontSize: 24, marginBottom: 6 }}>{view === 'signup' ? 'Create your account' : 'Welcome back'}</h3>
        <p style={{ color: 'var(--ink-400)', fontSize: 14.5, marginBottom: 24 }}>
          {view === 'signup' ? 'Start your wellness journey with ZAB.' : 'Glad to see you again.'}
        </p>

        {!firebaseReady && (
          <p style={{ fontSize: 12.5, color: 'var(--lotus-300)', background: 'rgba(201,168,240,0.08)', padding: '8px 12px', borderRadius: 10, marginBottom: 18 }}>
            Demo mode — no Firebase keys yet, so this creates a local session only.
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {view === 'signup' && (
            <Field label="Name" value={name} onChange={setName} placeholder="Sarah Namutebi" />
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          {error && <p style={{ color: '#F08AA8', fontSize: 13 }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={busy} style={{ marginTop: 6, opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Please wait…' : view === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(245,243,255,0.1)' }} />
          <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(245,243,255,0.1)' }} />
        </div>

        <button onClick={handleGoogle} disabled={busy} className="btn-secondary" style={{ width: '100%' }}>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-400)', marginTop: 20 }}>
          {view === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setView(view === 'signup' ? 'login' : 'signup')} style={{ color: 'var(--lotus-300)', fontWeight: 600 }}>
            {view === 'signup' ? 'Log in' : 'Sign up'}
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

function humanizeError(err) {
  const code = err?.code || '';
  if (code.includes('email-already-in-use')) return 'That email is already registered — try logging in instead.';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Incorrect email or password.';
  if (code.includes('user-not-found')) return "We couldn't find an account with that email.";
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
  return err.message || 'Something went wrong. Please try again.';
}
