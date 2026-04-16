import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function usePremium() {
  const [plan, setPlan] = useState<'free' | 'pro' | 'caregiver'>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setPlan(userDoc.data().plan || 'free');
        }
      } else {
        setPlan('free');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const canCreateStack = (currentStackCount: number) => {
    if (plan === 'free' && currentStackCount >= 1) return false;
    return true;
  };

  const canAddItem = (currentItemCount: number) => {
    if (plan === 'free' && currentItemCount >= 5) return false;
    return true;
  };

  const canExportPDF = () => {
    return plan === 'pro' || plan === 'caregiver';
  };

  const canUseCaregiver = () => {
    return plan === 'caregiver';
  };

  return {
    plan,
    loading,
    canCreateStack,
    canAddItem,
    canExportPDF,
    canUseCaregiver
  };
}
