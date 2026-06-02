import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB524qNjWANRyROLloyHHJ9oziIUbr2lL8",
  authDomain: "syndra-16aec.firebaseapp.com",
  projectId: "syndra-16aec",
  storageBucket: "syndra-16aec.firebasestorage.app",
  messagingSenderId: "891890612114",
  appId: "1:891890612114:web:e178e1526f552f0194f34b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);