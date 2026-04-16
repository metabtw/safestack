import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { SeverityBadge } from '../components/interaction/SeverityBadge';
import { FileText, Plus, Clock, AlertTriangle } from 'lucide-react';
import { generateDoctorReportPDF } from '../lib/reportGenerator';
import { usePremium } from '../hooks/usePremium';

export function StackDetail() {
  const { id } = useParams<{ id: string }>();
  const [stack, setStack] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { canExportPDF } = usePremium();

  useEffect(() => {
    if (!id || !auth.currentUser) return;

    const fetchStack = async () => {
      const docRef = doc(db, 'stacks', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStack({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchStack();

    const itemsQ = query(collection(db, 'stack_items'), where('stack_id', '==', id));
    const unsubItems = onSnapshot(itemsQ, (snapshot) => {
      setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const intQ = query(collection(db, 'interaction_results'), where('stack_id', '==', id));
    const unsubInt = onSnapshot(intQ, (snapshot) => {
      setInteractions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubItems();
      unsubInt();
    };
  }, [id]);

  const handleExport = () => {
    if (!canExportPDF()) {
      alert("PDF Raporu oluşturmak için Pro veya Caregiver planına geçmelisiniz.");
      return;
    }
    generateDoctorReportPDF({
      personName: stack?.person_label || auth.currentUser?.displayName || 'Kullanıcı',
      items,
      interactions
    });
  };

  if (loading) return <div className="p-6 text-center text-lg">Yükleniyor...</div>;
  if (!stack) return <div className="p-6 text-center text-lg">Kutu bulunamadı.</div>;

  const hasMajor = interactions.some(i => i.severity === 'major' || i.severity === 'contraindicated');

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="p-6 text-white" style={{ backgroundColor: stack.color || 'var(--color-primary)' }}>
        <h1 className="text-[32px] font-bold mb-1">{stack.name}</h1>
        {stack.person_label && <p className="text-[18px] opacity-90">{stack.person_label}</p>}
      </div>

      {/* Severity Banner */}
      {hasMajor && (
        <div className="bg-[#FFF1F2] border-l-8 border-warning-critical p-5 m-4 rounded-r-[16px] shadow-sleek">
          <div className="flex items-center gap-3 text-warning-critical font-bold text-[20px] mb-2">
            <span>⚠️ KRİTİK ETKİLEŞİM TESPİT EDİLDİ</span>
          </div>
          <p className="text-[#475569] text-[16px]">İlaçlarınız arasında ciddi etkileşimler bulundu. Lütfen doktorunuza danışın.</p>
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Interaction Summary */}
        {interactions.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-[12px] bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C]">
              <div className="text-[14px] font-semibold uppercase tracking-wider">Kontrendike</div>
              <div className="text-[32px] font-extrabold">{interactions.filter(i => i.severity === 'contraindicated').length}</div>
            </div>
            <div className="text-center p-4 rounded-[12px] bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C]">
              <div className="text-[14px] font-semibold uppercase tracking-wider">Majör</div>
              <div className="text-[32px] font-extrabold">{interactions.filter(i => i.severity === 'major').length}</div>
            </div>
            <div className="text-center p-4 rounded-[12px] bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1]">
              <div className="text-[14px] font-semibold uppercase tracking-wider">Orta</div>
              <div className="text-[32px] font-extrabold">{interactions.filter(i => i.severity === 'moderate').length}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link 
            to="/scan" 
            className="h-[64px] rounded-[16px] bg-primary text-white flex items-center justify-center text-[18px] font-bold gap-2 transition-transform active:scale-95 shadow-sleek"
          >
            📸 Şişe Tara
          </Link>
          <button 
            onClick={handleExport}
            className="h-[64px] rounded-[16px] bg-white border-2 border-border text-text-main flex items-center justify-center text-[18px] font-bold gap-2 transition-transform active:scale-95 shadow-sleek"
          >
            📄 PDF Raporu
          </button>
        </div>

        {/* Items */}
        <div className="bg-card-bg border border-border rounded-[16px] shadow-sleek p-5">
          <h2 className="text-[24px] font-bold mb-4">İlaçlarım ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-text-muted text-center py-4">Henüz ilaç eklenmemiş.</p>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-[#F1F5F9] rounded-[12px] border border-transparent">
                  <div>
                    <div className="font-bold text-[20px]">{item.drug_name}</div>
                    <div className="text-[16px] text-text-muted">{item.dosage} • {item.frequency}</div>
                  </div>
                  <span className="text-[14px] font-extrabold uppercase bg-white px-3 py-1 rounded-[20px] border border-border shadow-sm">
                    {item.item_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactions List */}
        {interactions.length > 0 && (
          <div className="bg-card-bg border border-border rounded-[16px] shadow-sleek p-5">
            <h2 className="text-[24px] font-bold mb-4">Etkileşim Detayları</h2>
            <div className="space-y-4">
              {interactions.map(int => (
                <div key={int.id} className="border border-border rounded-[12px] p-4 bg-[#F8FAFC]">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-[18px] leading-tight pr-2">
                      {int.drug_a} <span className="text-text-muted mx-1">+</span> {int.drug_b}
                    </h3>
                    <SeverityBadge severity={int.severity} />
                  </div>
                  <p className="text-text-main mb-2">{int.plain_explanation}</p>
                  {int.timing_advice && (
                    <div className="flex items-start mt-3 bg-white p-3 rounded-[8px] border border-border">
                      <Clock size={18} className="text-primary mr-2 shrink-0 mt-0.5" />
                      <p className="text-[14px] text-text-main">{int.timing_advice}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
