import { createContext, useEffect, useState, useCallback } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (user) => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data());
    } else {
      setUserProfile({ role: null });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      await fetchUserProfile(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  }, [currentUser]);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, logout, refreshUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};