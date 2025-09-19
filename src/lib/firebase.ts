import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB9CwFN0Q4oxkqZVvedgtPRdHfMrJi6t50",
  authDomain: "weareaiworkers.firebaseapp.com",
  projectId: "weareaiworkers",
  storageBucket: "weareaiworkers.firebasestorage.app",
  messagingSenderId: "1069687815054",
  appId: "1:1069687815054:web:7073ed1f21cfa5ebccc2df",
  measurementId: "G-8FDPX52TWY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
