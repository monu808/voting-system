import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../services/firebase';

// Define the shape of our context
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  userRole: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<User>;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using our auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Register a new user
  async function register(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login an existing user
  async function login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      // Add select_account to force account selection even if user is already logged in
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      // Handle specific error codes with user-friendly messages
      if (error.code === 'auth/popup-blocked') {
        throw new Error('The sign-in popup was blocked by your browser. Please allow popups for this website.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email address but different sign-in credentials.');
      }
      
      throw error;
    }
  }

  // Logout the current user
  async function logout() {
    try {
      return signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Reset password
  async function resetPassword(email: string) {
    try {
      return sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Update user profile
  async function updateUserProfile(displayName: string) {
    if (currentUser) {
      try {
        return updateProfile(currentUser, { displayName });
      } catch (error) {
        console.error('Profile update error:', error);
        throw error;
      }
    }
    throw new Error('No user is logged in');
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      // In a real app, you would fetch the user's role from Firestore or 
      // another database here. For now, we'll assign admin role based on email.
      if (user) {
        // This is just a simple example. In a real app, you would check
        // the user's role in a database like Firestore.
        if (user.email && user.email.endsWith('@admin.com')) {
          setUserRole('admin');
        } else {
          setUserRole('voter');
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    userRole,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 