import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { FirestoreUserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: FirestoreUserProfile | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  clearError: () => void;
  updateUserProfile: (data: Partial<FirestoreUserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('kavin_job_hub_demo_mode') === 'true';
  });

  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'userProfiles', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      const now = new Date().toISOString();
      if (!userSnap.exists()) {
        const initialProfile: FirestoreUserProfile = {
          ownerId: firebaseUser.uid,
          name: firebaseUser.displayName || 'Job Candidate',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          phone: firebaseUser.phoneNumber || '',
          location: 'San Francisco, CA (Remote)',
          linkedin: 'linkedin.com',
          portfolio: 'portfolio.dev',
          targetRoles: ['Senior Full-Stack Engineer', 'AI Platform Engineer', 'Staff Engineer'],
          targetLocations: ['San Francisco, CA', 'Remote US', 'New York, NY'],
          experienceLevel: 'Senior (6+ Years)',
          createdAt: now,
          updatedAt: now,
        };

        await setDoc(userRef, initialProfile);
        setUserProfile(initialProfile);
      } else {
        const existingData = userSnap.data() as FirestoreUserProfile;
        // Keep updated photo/name if changed in Google
        const updatedData: FirestoreUserProfile = {
          ...existingData,
          name: firebaseUser.displayName || existingData.name,
          email: firebaseUser.email || existingData.email,
          photoURL: firebaseUser.photoURL || existingData.photoURL,
          updatedAt: now,
        };
        await setDoc(userRef, updatedData, { merge: true });
        setUserProfile(updatedData);
      }
    } catch (err: any) {
      console.error('Error syncing user profile:', err);
      // Non-fatal, set fallback
      setUserProfile({
        ownerId: firebaseUser.uid,
        name: firebaseUser.displayName || 'Job Candidate',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        targetRoles: ['Senior Full-Stack Engineer'],
        targetLocations: ['Remote'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setError(null);
      if (currentUser) {
        setIsDemoMode(false);
        localStorage.removeItem('kavin_job_hub_demo_mode');
        setUser(currentUser);
        await syncUserProfile(currentUser);
      } else if (localStorage.getItem('kavin_job_hub_demo_mode') === 'true') {
        const mockUser = {
          uid: 'demo-user-candidate',
          displayName: 'Kavin A. (Preview Mode)',
          email: 'kavin.demo@commandcenter.local',
          photoURL: '',
          isAnonymous: true,
        } as unknown as User;
        setUser(mockUser);
        setUserProfile({
          ownerId: 'demo-user-candidate',
          name: 'Kavin A. (Candidate)',
          email: 'ambigapathikavin2@gmail.com',
          photoURL: '',
          targetRoles: ['Senior Full-Stack Engineer', 'AI Platform Engineer'],
          targetLocations: ['San Francisco, CA', 'Remote US'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    }, (authError) => {
      console.error('Auth state error:', authError);
      setError(authError.message || 'Authentication error occurred');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const enterDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('kavin_job_hub_demo_mode', 'true');
    const mockUser = {
      uid: 'demo-user-candidate',
      displayName: 'Kavin A. (Preview Mode)',
      email: 'kavin.demo@commandcenter.local',
      photoURL: '',
      isAnonymous: true,
    } as unknown as User;
    setUser(mockUser);
    setUserProfile({
      ownerId: 'demo-user-candidate',
      name: 'Kavin A. (Candidate)',
      email: 'ambigapathikavin2@gmail.com',
      photoURL: '',
      targetRoles: ['Senior Full-Stack Engineer', 'AI Platform Engineer'],
      targetLocations: ['San Francisco, CA', 'Remote US'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setError(null);
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setIsDemoMode(false);
        localStorage.removeItem('kavin_job_hub_demo_mode');
        setUser(result.user);
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      const isUnauthDomain =
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain');
      const isPopupClosed =
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request';

      if (isUnauthDomain) {
        console.warn('Firebase Auth: domain is not yet allowlisted in Firebase Console authorized domains list.');
        setError('Firebase: Error (auth/unauthorized-domain).');
      } else if (!isPopupClosed) {
        console.warn('Firebase sign-in notice:', err?.message || err);
        setError(err?.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setIsDemoMode(false);
      localStorage.removeItem('kavin_job_hub_demo_mode');
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<FirestoreUserProfile>) => {
    if (!user) return;
    if (isDemoMode) {
      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
      return;
    }
    try {
      const userRef = doc(db, 'userProfiles', user.uid);
      const updated = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, updated, { merge: true });
      setUserProfile((prev) => (prev ? { ...prev, ...updated } : null));
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        isDemoMode,
        signInWithGoogle,
        signOut,
        enterDemoMode,
        clearError,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
