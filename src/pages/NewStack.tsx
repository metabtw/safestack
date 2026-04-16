import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { usePremium } from '../hooks/usePremium';

export function NewStack() {
  const [name, setName] = useState('');
  const [personLabel, setPersonLabel] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { plan, canCreateStack } = usePremium();

  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    // In a real app, we would check the actual count from Firestore
    // For now, we just assume they can create it or show a paywall
    if (!canCreateStack(0)) {
      alert("Ücretsiz planda sadece 1 kutu oluşturabilirsiniz. Lütfen yükseltin.");
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'stacks'), {
        user_id: auth.currentUser.uid,
        name,
        person_label: personLabel,
        color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      navigate(`/stack/${docRef.id}`);
    } catch (error) {
      console.error("Error creating stack", error);
      alert("Kutu oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-[32px] font-bold mb-8">Yeni İlaç Kutusu</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[18px] font-bold text-text-main mb-2">Kutu Adı</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Sabah İlaçlarım"
            className="w-full border-2 border-border rounded-[12px] p-4 text-[18px] focus:border-primary focus:ring-0 bg-white"
          />
        </div>

        {plan === 'caregiver' && (
          <div>
            <label className="block text-[18px] font-bold text-text-main mb-2">Kimin İçin? (İsteğe Bağlı)</label>
            <input 
              type="text" 
              value={personLabel}
              onChange={(e) => setPersonLabel(e.target.value)}
              placeholder="Örn: Annem"
              className="w-full border-2 border-border rounded-[12px] p-4 text-[18px] focus:border-primary focus:ring-0 bg-white"
            />
          </div>
        )}

        <div>
          <label className="block text-[18px] font-bold text-text-main mb-3">Renk Seçin</label>
          <div className="flex gap-4 flex-wrap">
            {colors.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-14 h-14 rounded-full border-4 ${color === c ? 'border-text-main' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !name}
          className="w-full h-[64px] bg-primary text-white rounded-[16px] text-[20px] font-bold flex items-center justify-center shadow-sleek transition-transform active:scale-95 mt-8 disabled:opacity-50"
        >
          {loading ? 'Oluşturuluyor...' : 'Kutuyu Oluştur'}
        </button>
      </form>
    </div>
  );
}
