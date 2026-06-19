import { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  firebaseReady,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from './firebase';

const AuthContext = createContext(null);

const DEMO_USER_KEY = 'zab_demo_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('zab_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setLoading(false);
      return;
    }

    if (!firebaseReady) {
      const demoSaved = localStorage.getItem(DEMO_USER_KEY);
      if (demoSaved) setUser(JSON.parse(demoSaved));
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profileRef = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(profileRef);
        const profile = snap.exists() ? snap.data() : {};
        setUser({
          uid: fbUser.uid,
          name: fbUser.displayName || profile.name || 'Friend',
          email: fbUser.email,
          plan: profile.plan || 'free',
          role: profile.role || 'student',
          ...profile,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signUp(name, email, password) {
    if (!firebaseReady) return demoSignIn(name || email.split('@')[0]);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), {
      name,
      email,
      plan: 'free',
      createdAt: serverTimestamp(),
    });
  }

  async function logIn(email, password) {
    if (!firebaseReady) return demoSignIn(email.split('@')[0]);
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logInWithGoogle() {
    if (!firebaseReady) return demoSignIn('Google Friend');
    const cred = await signInWithPopup(auth, googleProvider);
    const profileRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) {
      await setDoc(profileRef, {
        name: cred.user.displayName,
        email: cred.user.email,
        plan: 'free',
        role: 'student',
        createdAt: serverTimestamp(),
      });
    }
  }

  function demoSignIn(name) {
    const demoUser = {
      uid: 'demo-' + Date.now(),
      name,
      email: `${name}@demo.zab`,
      plan: 'free',
      role: 'student',
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
  }

  function setUserState(payload) {
    setUser(payload);
    localStorage.setItem('zab_user', JSON.stringify(payload));
  }

  async function logOut() {
    localStorage.removeItem('zab_user');
    localStorage.removeItem('zab_session');
    localStorage.removeItem('zab_user_email');
    if (!firebaseReady) {
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Firebase sign out failed', error);
    }
    setUser(null);
  }

  function setPlanLocally(plan) {
    setUser((u) => {
      const updated = { ...u, plan };
      localStorage.setItem('zab_user', JSON.stringify(updated));
      if (!firebaseReady) localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updated));
      return updated;
    });
    if (firebaseReady && user) {
      setDoc(doc(db, 'users', user.uid), { plan }, { merge: true });
    }
  }

  function setAuthUser(payload) {
    setUser(payload);
    localStorage.setItem('zab_user', JSON.stringify(payload));
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, logIn, logInWithGoogle, logOut, setPlanLocally, setAuthUser, firebaseReady }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
