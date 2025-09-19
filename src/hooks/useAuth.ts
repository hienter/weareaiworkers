'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// 허용된 관리자 이메일 목록
const ADMIN_EMAILS = [
  'sjhk01@gmail.com', // 형의 Gmail 계정
  'admin@weareaiworkers.com' // 예비 관리자 이메일
];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user ? ADMIN_EMAILS.includes(user.email || '') : false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // 관리자 이메일 확인
      if (!ADMIN_EMAILS.includes(result.user.email || '')) {
        await firebaseSignOut(auth);
        throw new Error('관리자 권한이 없습니다. 허용된 이메일로 로그인해주세요.');
      }
      
      return result.user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    isAdmin,
    signInWithGoogle,
    signOut
  };
};
