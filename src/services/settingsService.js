import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const settingsRef = doc(db, "settings", "commissions");

// Default commission values
const DEFAULT_COMMISSIONS = {
  creator: 70,
  promoter: 20,
  syndra: 10,
};

// Initialize settings if they don't exist
export const initializeCommissionSettings = async () => {
  const snap = await getDoc(settingsRef);
  if (!snap.exists()) {
    await setDoc(settingsRef, {
      ...DEFAULT_COMMISSIONS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return snap.exists() ? snap.data() : DEFAULT_COMMISSIONS;
};

// Get current commission settings
export const getCommissionSettings = async () => {
  const snap = await getDoc(settingsRef);
  if (snap.exists()) {
    return snap.data();
  }
  return await initializeCommissionSettings();
};

// Update commission settings (admin only)
export const updateCommissionSettings = async (newSettings) => {
  await setDoc(settingsRef, {
    creator: newSettings.creator,
    promoter: newSettings.promoter,
    syndra: newSettings.syndra,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// Calculate commissions based on settings
export const calculateCommissionsFromSettings = async (amount) => {
  const settings = await getCommissionSettings();
  const total = settings.creator + settings.promoter + settings.syndra;
  
  return {
    creator: Math.round((amount * settings.creator / total) * 100) / 100,
    promoter: Math.round((amount * settings.promoter / total) * 100) / 100,
    syndra: Math.round((amount * settings.syndra / total) * 100) / 100,
  };
};