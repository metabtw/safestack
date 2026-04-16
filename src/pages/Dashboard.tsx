import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { loginWithGoogle, logout } from '../lib/firebase';
import { Pill, AlertTriangle, Plus } from 'lucide-react';

export function Dashboard() {
  const [user, setUser] = useState(auth.currentUser);
  const [stacks, setStacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        setStacks([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'stacks'), where('user_id', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStacks(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching stacks", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Pill size={48} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">SafeStack</h1>
        <p className="text-lg text-gray-600 mb-8">İlaçlarınızı ve etkileşimlerini güvenle takip edin.</p>
        <button 
          onClick={loginWithGoogle}
          className="w-full bg-primary text-white text-[20px] font-bold h-[64px] rounded-[16px] flex items-center justify-center gap-3 transition-transform active:scale-95"
        >
          Google ile Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[24px] font-bold">İlaç Kutularım</h1>
        <button onClick={logout} className="text-[16px] text-text-muted underline p-2">Çıkış</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-text-muted text-[18px]">Yükleniyor...</div>
      ) : stacks.length === 0 ? (
        <div className="text-center py-12 bg-card-bg rounded-[16px] border border-border shadow-sleek p-6">
          <Pill size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-[18px] text-text-muted mb-6">Henüz bir ilaç kutusu oluşturmadınız.</p>
          <Link 
            to="/stack/new"
            className="w-full bg-primary text-white text-[20px] font-bold h-[64px] rounded-[16px] flex items-center justify-center gap-3 transition-transform active:scale-95"
          >
            <Plus size={24} /> Yeni Kutu Oluştur
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {stacks.map(stack => (
            <Link 
              key={stack.id} 
              to={`/stack/${stack.id}`}
              className="block bg-card-bg border border-border rounded-[16px] p-5 shadow-sleek relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: stack.color || 'var(--color-primary)' }} />
              <div className="flex justify-between items-start pl-2">
                <div>
                  <h2 className="text-[24px] font-bold mb-1">{stack.name}</h2>
                  {stack.person_label && (
                    <span className="inline-block bg-[#F1F5F9] text-text-muted text-[16px] px-3 py-1 rounded-[12px] mb-2">
                      {stack.person_label}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          
          <Link 
            to="/stack/new"
            className="w-full bg-white border-2 border-border text-text-main text-[20px] font-bold h-[64px] rounded-[16px] flex items-center justify-center gap-3 transition-transform active:scale-95 mt-6"
          >
            <Plus size={24} /> Yeni Kutu
          </Link>
        </div>
      )}
    </div>
  );
}
