
import React from 'react';
import { PromptItem } from '../types';

interface PromptCardProps {
  item: PromptItem;
  onClick: (item: PromptItem) => void;
  onCopy: (text: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ item, onClick, onCopy }) => {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(item.promptText);
  };

  return (
    <div 
      className="masonry-item relative group cursor-pointer overflow-hidden rounded-xl border border-white/5 transition-all duration-300 hover:ring-2 hover:ring-cyber-cyan/50 hover:scale-[1.02]"
      onClick={() => onClick(item)}
    >
      {/* Image */}
      <img 
        src={item.imageURL} 
        alt={item.promptText} 
        className="w-full h-auto object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
        loading="lazy"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="flex justify-between items-center mb-2">
           <span className="text-xs font-display tracking-widest text-cyber-cyan uppercase">{item.modelName}</span>
           <button 
             onClick={handleCopy}
             className="bg-cyber-cyan/20 hover:bg-cyber-cyan text-cyber-cyan hover:text-white p-2 rounded-full border border-cyber-cyan/30 transition-colors"
             title="Copy Prompt"
           >
             <i className="fas fa-copy"></i>
           </button>
        </div>
        <p className="text-sm text-slate-200 line-clamp-2 italic mb-3">"{item.promptText}"</p>
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
