import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { extractDrugLabel } from '../lib/vision';
import { Camera, Check, X, Loader2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Scan() {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      processImage(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    try {
      const data = await extractDrugLabel(base64);
      setResult(data);
    } catch (error) {
      alert("Etiket okunamadı. Lütfen tekrar deneyin.");
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  const accept = () => {
    // In a real app, we would pass this to the stack builder
    // For now, just navigate back or to a specific stack
    navigate('/');
  };

  if (result) {
    return (
      <div className="p-6 flex flex-col h-full">
        <h2 className="text-[24px] font-bold mb-6 text-center">Bu doğru mu?</h2>
        
        <div className="bg-card-bg p-6 rounded-[16px] mb-8 border border-border shadow-sleek">
          <div className="mb-4">
            <p className="text-[14px] text-text-muted uppercase tracking-wider mb-1 font-semibold">İlaç Adı</p>
            <p className="text-[24px] font-bold text-text-main">{result.drug_name}</p>
            {result.brand_name && <p className="text-[18px] text-text-muted">{result.brand_name}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[14px] text-text-muted uppercase tracking-wider mb-1 font-semibold">Dozaj</p>
              <p className="text-[20px] font-bold">{result.dosage || '-'}</p>
            </div>
            <div>
              <p className="text-[14px] text-text-muted uppercase tracking-wider mb-1 font-semibold">Tür</p>
              <p className="text-[20px] font-bold capitalize">{result.item_type || '-'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-[14px] text-text-muted uppercase tracking-wider mb-1 font-semibold">Kullanım Sıklığı</p>
            <p className="text-[20px] font-bold">{result.frequency || '-'}</p>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <button 
            onClick={accept}
            className="w-full h-[64px] bg-safe text-white rounded-[16px] text-[20px] font-bold flex items-center justify-center shadow-sleek transition-transform active:scale-95"
          >
            <Check className="mr-2" size={28} /> Evet, Ekle
          </button>
          <button 
            onClick={reset}
            className="w-full h-[64px] bg-white border-2 border-border text-text-main rounded-[16px] text-[20px] font-bold flex items-center justify-center transition-transform active:scale-95"
          >
            <X className="mr-2" size={28} /> Hayır, Tekrar Tara
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-black flex flex-col">
      {!image ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Viewfinder overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
            <div className="w-full aspect-[3/4] border-4 border-white/50 rounded-3xl relative">
              <div className="absolute -top-10 left-0 w-full text-center text-white font-medium text-lg drop-shadow-md">
                Etiketi tam çerçeve içine al
              </div>
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
            </div>
          </div>
          
          <div className="absolute bottom-24 left-0 w-full flex justify-center items-center gap-8 px-6">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 bg-gray-800/80 rounded-full flex items-center justify-center text-white"
            >
              <Upload size={28} />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            
            <button 
              onClick={capture}
              className="w-24 h-24 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-2xl"
            >
              <Camera size={40} className="text-gray-800" />
            </button>
            <div className="w-16 h-16"></div> {/* Spacer for balance */}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-6">
          <img src={image} alt="Captured" className="w-full max-w-sm rounded-2xl mb-8 opacity-50" />
          {loading && (
            <div className="flex flex-col items-center">
              <Loader2 size={64} className="animate-spin text-blue-500 mb-4" />
              <p className="text-2xl font-medium text-center">Etiket Okunuyor...</p>
              <p className="text-gray-400 mt-2 text-center">Lütfen bekleyin, yapay zeka ilacı tanımlıyor.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
