import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, firebaseConfigured } from "../firebase/config";
import {
  createAccount,
  ensureUserProfile,
  logOut,
  requestPasswordReset,
  signIn,
  type UserProfile,
  updateWorkspaceProfile,
} from "../services/authService";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  signUp: typeof createAccount;
  signIn: typeof signIn;
  signOut: typeof logOut;
  resetPassword: typeof requestPasswordReset;
  updateProfile: typeof updateWorkspaceProfile;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        setProfile(await ensureUserProfile(nextUser));
      } catch (error) {
        console.error("Could not load the account profile", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    configured: firebaseConfigured,
    signUp: createAccount,
    signIn,
    signOut: logOut,
    resetPassword: requestPasswordReset,
    updateProfile: updateWorkspaceProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}