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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  updateUserProfile: (data: Partial<FirestoreUserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setUser(currentUser);
        await syncUserProfile(currentUser);
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

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
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
        signInWithGoogle,
        signOut,
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
