
import React, { useState } from 'react';

interface PromptOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: (text: string) => void;
}

const PromptOptimizer: React.FC<PromptOptimizerProps> = ({ isOpen, onClose, onCopy }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Uygulama genelinde kullanılan sabit kullanıcı ID'si (Gerçek auth sisteminden gelmelidir)
  const CURRENT_USER_ID = 'demo-user';

  const handleOptimize = async () => {
    if (!input.trim()) return;
    
    setIsGenerating(true);
    try {
      /**
       * GÜVENLİK İYİLEŞTİRMESİ:
       * Doğrudan client-side SDK kullanımı yerine sunucu rotası (API Proxy) kullanılıyor.
       * Bu sayede API Key istemciye sızmaz ve yetki kontrolleri backend'de yapılır.
       */
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-authenticated-user-id': CURRENT_USER_ID // Sunucuya kendimizi tanıtıyoruz
        },
        body: JSON.stringify({ 
          userId: CURRENT_USER_ID, // Vercel güvenlik kontrolü için gerekli ID eşleşmesi
          prompt: input 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İstek işlenirken bir hata oluştu.');
      }

      if (data.result) {
        setOutput(data.result);
      } else {
        setOutput('İşlem başarısız oldu.');
      }
    } catch (error: any) {
      console.error("Optimize Error:", error);
      setOutput(error.message || 'Sinir ağına bağlanırken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg h-full glass border-l border-white/10 p-8 flex flex-col animate-slide-in-right">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-display font-bold text-cyber-cyan flex items-center gap-2">
            <i className="fas fa-microchip animate-pulse"></i>
            PROMPT OPTİMİZASYONU
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-xs font-display text-slate-500 uppercase tracking-widest">Temel Fikir</label>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Örn: Uzayda takım elbiseli bir kedi"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/30 transition-all resize-none text-sm italic"
            />
          </div>

          <button 
            onClick={handleOptimize}
            disabled={isGenerating || !input}
            className={`w-full py-4 rounded-xl font-bold font-display tracking-widest transition-all flex items-center justify-center gap-3 ${
              isGenerating ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white shadow-lg hover:shadow-cyber-cyan/20'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                GÜVENLİ İŞLEM YAPILIYOR...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                PROMPT'U İYİLEŞTİR
              </>
            )}
          </button>

          {output && (
            <div className="mt-4 space-y-2 animate-fade-in">
              <div className="flex justify-between items-center">
                <label className="text-xs font-display text-cyber-magenta uppercase tracking-widest">Geliştirilmiş Sonuç</label>
                <button 
                  onClick={() => onCopy(output)}
                  className="text-cyber-magenta text-xs hover:underline"
                >
                  Kopyala
                </button>
              </div>
              <div className="p-4 rounded-xl bg-cyber-magenta/5 border border-cyber-magenta/20 text-slate-200 leading-relaxed text-sm italic relative group">
                {output}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 text-[10px] text-slate-500 text-center italic uppercase">
          VERCEL SECURE PROXY • SUNUCU TARAFLI DOĞRULAMA AKTİF
        </div>
      </div>
    </div>
  );
};

export default PromptOptimizer;
