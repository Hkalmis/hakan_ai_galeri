
import React from 'react';
import { PromptItem } from '../types';

interface PromptModalProps {
  item: PromptItem | null;
  onClose: () => void;
  onCopy: (text: string) => void;
}

const PromptModal: React.FC<PromptModalProps> = ({ item, onClose, onCopy }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-cyber-black/90 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl max-h-full overflow-y-auto glass rounded-2xl shadow-2xl flex flex-col md:flex-row border border-cyber-cyan/20 overflow-hidden animate-zoom-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white w-10 h-10 rounded-full hover:bg-cyber-magenta transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="md:w-3/5 bg-black flex items-center justify-center p-2 min-h-[300px]">
          <img 
            src={item.imageURL} 
            alt={item.promptText} 
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>

        <div className="md:w-2/5 p-6 md:p-8 flex flex-col">
          <div className="mb-6">
            <h3 className="text-cyber-cyan font-display text-sm tracking-widest uppercase mb-1">Model</h3>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <i className="fas fa-robot text-cyber-cyan/60"></i>
              {item.modelName}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-cyber-cyan font-display text-sm tracking-widest uppercase mb-2">Prompt</h3>
            <div className="relative group">
               <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-200 leading-relaxed italic">
                 "{item.promptText}"
               </div>
               <button 
                 onClick={() => onCopy(item.promptText)}
                 className="mt-4 w-full bg-cyber-cyan/10 hover:bg-cyber-cyan text-cyber-cyan hover:text-cyber-black font-bold py-3 rounded-xl border border-cyber-cyan/30 transition-all flex items-center justify-center gap-2"
               >
                 <i className="fas fa-copy"></i>
                 Tüm Promptu Kopyala
               </button>
            </div>
          </div>

          <div className="mb-6">
             <h3 className="text-cyber-cyan font-display text-sm tracking-widest uppercase mb-2">Detaylar</h3>
             <div className="space-y-3">
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span className="text-slate-400">Yazar</span>
                 <span className="text-white">@{item.author}</span>
               </div>
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span className="text-slate-400">En-Boy Oranı</span>
                 <span className="text-white capitalize">{item.aspectRatio}</span>
               </div>
               <div className="flex flex-wrap gap-2 mt-4">
                 {item.tags.map(tag => (
                   <span key={tag} className="px-3 py-1 rounded-full bg-cyber-magenta/10 border border-cyber-magenta/30 text-cyber-magenta text-xs font-semibold">
                     #{tag}
                   </span>
                 ))}
               </div>
             </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
              AI Studio Pro ile oluşturuldu • Kamu Galerisi Lisansı
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
