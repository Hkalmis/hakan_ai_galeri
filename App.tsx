
import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_ART_STYLES, SITE_CONFIG } from './constants';
import { PromptItem, ToastMessage } from './types';
import PromptCard from './components/PromptCard';
import PromptModal from './components/PromptModal';
import PromptOptimizer from './components/PromptOptimizer';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';
import SpeedInsights from './components/SpeedInsights';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [allPrompts, setAllPrompts] = useState<PromptItem[]>([]); // Boş başlıyoruz
  const [artStyles, setArtStyles] = useState(INITIAL_ART_STYLES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // VERİLERİ VERİTABANINDAN ÇEK
  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setAllPrompts(data);
      }
    } catch (error) {
      addToast('Sunucu bağlantısı kurulamadı.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = `${SITE_CONFIG.name} | AI Prompt Galerisi`;
    fetchPrompts();
  }, []);

  const categories = useMemo(() => {
    return ['Tümü', ...new Set(artStyles.flatMap(group => group.styles))];
  }, [artStyles]);

  const filteredPrompts = useMemo(() => {
    return allPrompts.filter((item) => {
      const matchesCategory = activeCategory === 'Tümü' || item.tags.includes(activeCategory);
      const matchesSearch = item.promptText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, allPrompts]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast('Prompt başarıyla panoya kopyalandı!');
    } catch (err) {
      addToast('Kopyalama işlemi başarısız oldu.', 'error');
    }
  };

  const addNewPrompt = async (newPrompt: PromptItem) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrompt)
      });
      if (response.ok) {
        const savedPrompt = await response.json();
        setAllPrompts(prev => [savedPrompt, ...prev]);
        addToast('İçerik veritabanına kaydedildi!');
      }
    } catch (error) {
      addToast('Veritabanına kaydedilemedi.', 'error');
    }
  };

  const updatePrompt = async (updatedPrompt: PromptItem) => {
    // Opsiyonel: PUT isteği buraya eklenebilir
    setAllPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
  };

  const deletePrompt = async (id: string) => {
    try {
      const response = await fetch(`/api/prompts?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setAllPrompts(prev => prev.filter(p => p.id !== id));
        addToast('İçerik kalıcı olarak silindi.', 'success');
      }
    } catch (error) {
      addToast('Silme işlemi başarısız.', 'error');
    }
  };

  const addNewStyle = (mainStyle: string, altStyle: string) => {
    setArtStyles(prev => {
      const existingGroupIndex = prev.findIndex(g => g.label.toLowerCase() === mainStyle.toLowerCase());
      if (existingGroupIndex > -1) {
        const newStyles = [...prev];
        if (!newStyles[existingGroupIndex].styles.includes(altStyle)) {
          newStyles[existingGroupIndex] = {
            ...newStyles[existingGroupIndex],
            styles: [...newStyles[existingGroupIndex].styles, altStyle]
          };
        }
        return newStyles;
      } else {
        return [...prev, { label: mainStyle, styles: [altStyle] }];
      }
    });
  };

  return (
    <div className="min-h-screen bg-cyber-black text-slate-200 font-sans selection:bg-cyber-cyan/30">
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyber-cyan to-cyber-purple rounded-xl flex items-center justify-center neon-border">
              <i className="fas fa-bolt text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-display font-bold">
              <span className="text-cyber-cyan">{SITE_CONFIG.name.slice(0, 5)}</span>
              <span className="text-white">{SITE_CONFIG.name.slice(5, 9)}</span>
              <span className="text-cyber-cyan">{SITE_CONFIG.name.slice(9)}</span>
            </h1>
          </div>

          <div className="relative flex-1 max-w-md w-full">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
              type="text" 
              placeholder="Prompt, model veya etiket ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/30 transition-all text-sm"
            />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-cyber-cyan hover:border-cyber-cyan/30 transition-all"
              title="Yönetim Paneli"
            >
              <i className="fas fa-cog"></i>
            </button>
            <button 
              onClick={() => setIsOptimizerOpen(true)}
              className="bg-cyber-cyan text-cyber-black font-bold px-6 py-2 rounded-full hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
            >
              <i className="fas fa-magic"></i>
              AI Lab
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 md:px-12 min-h-[calc(100vh-200px)]">
        <div className="flex flex-wrap items-center gap-2 pb-8 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-[11px] font-semibold transition-all duration-300 border uppercase tracking-wider ${
                activeCategory === cat 
                  ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 border-4 border-cyber-cyan/20 border-t-cyber-cyan rounded-full animate-spin"></div>
            <p className="mt-4 font-display tracking-widest text-cyber-cyan animate-pulse">VERİTABANINA BAĞLANILIYOR...</p>
          </div>
        ) : filteredPrompts.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 masonry-grid">
            {filteredPrompts.map((item) => (
              <PromptCard 
                key={item.id} 
                item={item} 
                onClick={setSelectedPrompt} 
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-40">
             <i className="fas fa-ghost text-5xl text-slate-700 mb-4"></i>
             <h2 className="text-2xl font-display text-slate-500 uppercase">Kalıcı Veri Bulunamadı</h2>
             <p className="text-slate-600">Yeni bir prompt ekleyerek başlayın.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 mt-20 py-12 px-6 glass">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-cyber-cyan rounded-lg flex items-center justify-center">
                <i className="fas fa-bolt text-cyber-black"></i>
              </div>
              <span className="text-xl font-display font-bold text-cyber-cyan">HAKAN<span className="text-white">_Aİ_</span>GALERİ</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-6">
              {SITE_CONFIG.description}
            </p>
          </div>
        </div>
      </footer>

      <PromptModal 
        item={selectedPrompt} 
        onClose={() => setSelectedPrompt(null)} 
        onCopy={copyToClipboard}
      />
      <PromptOptimizer 
        isOpen={isOptimizerOpen} 
        onClose={() => setIsOptimizerOpen(false)} 
        onCopy={copyToClipboard} 
      />
      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        allPrompts={allPrompts}
        onAddPrompt={addNewPrompt}
        onUpdatePrompt={updatePrompt}
        onDeletePrompt={deletePrompt}
        onAddStyle={addNewStyle}
        artStyles={artStyles}
        addToast={addToast}
      />
      <Toast toasts={toasts} onRemove={removeToast} />
      <SpeedInsights />
    </div>
  );
};

export default App;
