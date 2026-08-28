import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext(null);
const EMAIL_STORAGE_KEY = 'syl-cal-email-for-sign-in';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmailLink, setPendingEmailLink] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    const completeStoredEmailLink = async () => {
      if (!isSignInWithEmailLink(auth, window.location.href)) return;
      const savedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);
      if (!savedEmail) {
        setPendingEmailLink(true);
        return;
      }
      try {
        await signInWithEmailLink(auth, savedEmail, window.location.href);
        window.localStorage.removeItem(EMAIL_STORAGE_KEY);
        window.history.replaceState({}, document.title, '/dashboard');
      } catch {
        setPendingEmailLink(true);
      }
    };

    completeStoredEmailLink();
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    pendingEmailLink,
    async sendEmailLink(email) {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
    },
    async completeEmailLink(email) {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      setPendingEmailLink(false);
      window.history.replaceState({}, document.title, '/dashboard');
    },
    signOut: () => signOut(auth),
  }), [loading, pendingEmailLink, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
