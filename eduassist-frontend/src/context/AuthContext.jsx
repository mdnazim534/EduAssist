import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../api/firebase';
import { authAPI } from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // Firebase user
  const [profile, setProfile] = useState(null);    // MongoDB profile
  const [loading, setLoading] = useState(true);

  // Sync MongoDB profile after Firebase auth
  async function syncProfile(firebaseUser) {
    if (!firebaseUser) return;
    try {
      const res = await authAPI.login();
      setProfile(res.user);
    } catch (e) {
      console.warn('Profile sync failed:', e.message);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) await syncProfile(firebaseUser);
      else setProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function register(email, password, name) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await authAPI.register({ name });
    await syncProfile(cred.user);
  }

  async function loginEmail(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
    await syncProfile(auth.currentUser);
  }

  async function loginGoogle() {
    await signInWithPopup(auth, googleProvider);
    await syncProfile(auth.currentUser);
  }

  async function loginGithub() {
    await signInWithPopup(auth, githubProvider);
    await syncProfile(auth.currentUser);
  }

  async function logout() {
    try { await authAPI.logout(); } catch (_) {}
    await signOut(auth);
    setProfile(null);
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  async function refreshProfile() {
    if (!user) return;
    await syncProfile(user);
  }

  const value = {
    user, profile, loading,
    register, loginEmail, loginGoogle, loginGithub,
    logout, resetPassword, refreshProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
