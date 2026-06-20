import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AICompanion from './components/AICompanion';
import Home from './pages/Home';
import Sessions from './pages/Sessions';
import Clubs from './pages/Clubs';
import Tutors from './pages/Tutors';
import Projects from './pages/Projects';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import LiveSession from './pages/LiveSession';

function AppShell() {
  const [page, setPage] = useState('home');
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'signup'
  const [selectedMood, setSelectedMood] = useState(null);
  const { user } = useAuth();

  function navigate(target) {
    setPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openAuth(mode) {
    setAuthMode(mode);
  }

  function handleAuthSuccess() {
    setAuthMode(null);
    navigate('dashboard');
  }

  function goUpgrade() {
    navigate('pricing');
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="starfield" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <NavBar page={page} onNavigate={navigate} onOpenAuth={openAuth} />

        {page === 'home' && (
          <Home onNavigate={navigate} onOpenAuth={openAuth} selectedMood={selectedMood} onSelectMood={setSelectedMood} />
        )}
        {page === 'sessions' && <Sessions onOpenAuth={openAuth} onUpgrade={goUpgrade} />}
        {page === 'clubs' && <Clubs onOpenAuth={openAuth} />}
        {page === 'tutors' && <Tutors onOpenAuth={openAuth} onUpgrade={goUpgrade} />}
        {page === 'projects' && <Projects onOpenAuth={openAuth} />}
        {page === 'pricing' && <Pricing onOpenAuth={openAuth} />}
        {page === 'live' && <LiveSession onNavigate={navigate} />}
        {page === 'dashboard' && (user ? (user.role === 'tutor' ? <InstructorDashboard onNavigate={navigate} /> : <Dashboard onNavigate={navigate} />) : <Home onNavigate={navigate} onOpenAuth={openAuth} selectedMood={selectedMood} onSelectMood={setSelectedMood} />)}

        <Footer />
        <AICompanion mood={selectedMood} />

        {authMode && (
          <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSuccess={handleAuthSuccess} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
