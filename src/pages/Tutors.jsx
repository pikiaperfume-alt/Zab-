import { useState } from 'react';
import { Star, X, Calendar } from 'lucide-react';
import { tutors } from '../data/demoData';
import { useAuth } from '../lib/AuthContext';

export default function Tutors({ onOpenAuth, onUpgrade }) {
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);

  function handleBook(tutor) {
    if (!user) return onOpenAuth('signup');
    if (user.plan !== 'pro') return onUpgrade();
    setBooking(tutor);
  }

  return (
    <div className="container" style={{ padding: '56px 24px 80px' }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>PERSONAL WELLNESS TUTORS</p>
      <h1 style={{ fontSize: 36, marginBottom: 14 }}>Real guidance from certified people</h1>
      <p style={{ fontSize: 16, color: 'var(--ink-200)', maxWidth: 580, marginBottom: 36, lineHeight: 1.6 }}>
        Book one-on-one sessions, chat securely, and change tutors whenever you want. Available on ZAB Pro.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
        {tutors.map((t) => (
          <div key={t.id} className="glass-card" style={{ padding: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: t.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'white', flexShrink: 0 }}>
                {t.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 16 }}>{t.name}</p>
                <p style={{ fontSize: 12.5, color: 'var(--lotus-300)' }}>{t.specialty}</p>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-400)', lineHeight: 1.55, marginBottom: 16 }}>{t.bio}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Star size={13} fill="#F0A8D8" color="#F0A8D8" /> {t.rating} · {t.sessions} sessions
              </span>
              <button onClick={() => handleBook(t)} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                Book
              </button>
            </div>
          </div>
        ))}
      </div>

      {booking && <BookingModal tutor={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}

const SLOTS = ['Tomorrow, 9:00 AM', 'Tomorrow, 2:30 PM', 'Thu, 11:00 AM', 'Thu, 5:00 PM', 'Fri, 10:00 AM'];

function BookingModal({ tutor, onClose }) {
  const [slot, setSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(11,8,32,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: 420, padding: 30, background: 'var(--night-800)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, color: 'var(--ink-400)' }}><X size={20} /></button>

        {!confirmed ? (
          <>
            <h3 style={{ fontSize: 21, marginBottom: 6 }}>Book {tutor.name}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-400)', marginBottom: 24 }}>{tutor.specialty} · Video session</p>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Choose a time</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {SLOTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: 10, fontSize: 14,
                    border: '1px solid ' + (slot === s ? 'var(--magenta-500)' : 'rgba(245,243,255,0.1)'),
                    background: slot === s ? 'rgba(217,70,168,0.1)' : 'rgba(245,243,255,0.03)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <Calendar size={14} /> {s}
                </button>
              ))}
            </div>
            <button disabled={!slot} className="btn-primary" style={{ width: '100%', opacity: slot ? 1 : 0.5 }} onClick={() => setConfirmed(true)}>
              Confirm booking
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>✓</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>You're booked</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-400)', marginBottom: 24 }}>{tutor.name} · {slot}</p>
            <button className="btn-secondary" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
