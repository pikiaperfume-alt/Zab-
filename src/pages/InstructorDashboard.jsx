import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { tutors, sessions } from '../data/demoData';

export default function InstructorDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const instructorSessions = sessions.filter((session) => session.tutorId === user?.uid);

  return (
    <div className="container" style={{ padding: '56px 24px 80px' }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>INSTRUCTOR SPACE</p>
      <h1 style={{ fontSize: 36, marginBottom: 14 }}>Manage your classes</h1>
      <p style={{ fontSize: 16, color: 'var(--ink-200)', maxWidth: 580, marginBottom: 36, lineHeight: 1.6 }}>
        Create Zoom-powered sessions, share your schedule, and connect with students on ZAB.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <button className="btn-primary" onClick={() => onNavigate('live')}>Open live room</button>
        <button className="btn-secondary" onClick={() => setShowForm(true)}>Create new session</button>
        <button className="btn-secondary" onClick={() => onNavigate('tutors')}>Browse students</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        {instructorSessions.length ? instructorSessions.map((session) => (
          <div key={session.id} className="glass-card" style={{ padding: 24 }}>
            <p style={{ fontSize: 13.5, color: 'var(--ink-400)', marginBottom: 10 }}>{session.session_type} · {session.duration}</p>
            <h3 style={{ fontSize: 20, marginBottom: 12 }}>{session.title}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-400)', marginBottom: 16 }}>{session.description}</p>
            <p style={{ fontSize: 13, marginBottom: 10 }}>Slot: {session.scheduled_slot || 'Not scheduled'}</p>
            <p style={{ fontSize: 13, marginBottom: 14 }}>Zoom: {session.zoom_join_url ? <a href={session.zoom_join_url} target="_blank" rel="noreferrer">Join link</a> : 'Pending'}</p>
            <button className="btn-secondary" onClick={() => setSelectedSession(session)}>View details</button>
          </div>
        )) : (
          <div className="glass-card" style={{ padding: 24 }}>
            <p style={{ fontSize: 15, color: 'var(--ink-200)' }}>No instructor sessions yet. Create a class to start coaching.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,8,32,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 520, padding: 28, position: 'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: 18, right: 18, color: 'var(--ink-400)' }}>✕</button>
            <h3 style={{ fontSize: 22, marginBottom: 16 }}>Create a new class</h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-400)', marginBottom: 18 }}>Use your instructor access to run live video and audio wellness sessions with students.</p>
            <button className="btn-primary" onClick={() => { setShowForm(false); onNavigate('live'); }}>Start live session</button>
          </div>
        </div>
      )}
    </div>
  );
}
