
import React, { useState, useRef, useEffect } from 'react';
import { PromptItem } from '../types';
import { SITE_CONFIG } from '../constants';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  allPrompts: PromptItem[];
  onAddPrompt: (newPrompt: PromptItem) => void;
  onUpdatePrompt: (updatedPrompt: PromptItem) => void;
  onDeletePrompt: (id: string) => void;
  onAddStyle: (mainStyle: string, altStyle: string) => void;
  artStyles: { label: string; styles: string[] }[];
  addToast: (msg: string, type?: 'success' | 'error') => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  allPrompts, 
  onAddPrompt, 
  onUpdatePrompt, 
  onDeletePrompt, 
  onAddStyle, 
  artStyles, 
  addToast 
}) => {
  // Auth State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(false);

  // Management State
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'styles'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    promptText: '',
    modelName: 'Gemini 3 Pro',
    author: SITE_CONFIG.defaultAuthor,
    tags: [] as string[],
    imageURL: ''
  });
  const [newStyleGroup, setNewStyleGroup] = useState('');
  const [newStyleName, setNewStyleName] = useState('');
  
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setIsAuthorized(false); // Güvenlik: Panel her kapandığında çıkış yap
      setLoginForm({ username: '', password: '' });
      setLoginError(false);
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      promptText: '',
      modelName: 'Gemini 3 Pro',
      author: SITE_CONFIG.defaultAuthor,
      tags: [],
      imageURL: ''
    });
    setPreview(null);
    setEditingId(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // GİRİŞ BİLGİLERİ KONTROLÜ
    if (loginForm.username === 'admin' && loginForm.password === 'hakan123') {
      setIsAuthorized(true);
      setLoginError(false);
      addToast('Yönetici yetkisi onaylandı. Hoş geldiniz.', 'success');
    } else {
      setLoginError(true);
      addToast('Kimlik doğrulama başarısız!', 'error');
      // Sarsıntı efekti için kısa süre sonra hatayı sıfırla
      setTimeout(() => setLoginError(false), 500);
    }
  };

  if (!isOpen) return null;

  // GİRİŞ EKRANI (AUTH MODAL)
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
        <div className={`relative w-full max-w-md glass border rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] transition-all ${loginError ? 'border-red-500 animate-shake' : 'border-cyber-cyan/30'}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyber-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyber-cyan/20">
              <i className="fas fa-fingerprint text-cyber-cyan text-2xl"></i>
            </div>
            <h2 className="text-xl font-display font-bold text-white tracking-widest uppercase">ADMİN GİRİŞİ</h2>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-tighter">Yönetici paneline erişmek için yetkilendirme gerekiyor</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Kullanıcı Adı</label>
              <input 
                type="text"
                autoFocus
                required
                value={loginForm.username}
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/30 text-white placeholder:text-slate-700 transition-all text-sm"
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Şifre</label>
              <input 
                type="password"
                required
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-cyber-magenta/30 text-white placeholder:text-slate-700 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-purple text-cyber-black font-bold py-4 rounded-xl shadow-lg hover:shadow-cyber-cyan/40 transition-all font-display tracking-widest uppercase text-sm"
            >
              YETKİYİ DOĞRULA
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full text-slate-600 hover:text-white text-[10px] uppercase tracking-widest transition-colors"
            >
              İptal Et
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ANA PANEL (YETKİLİ GÖRÜNÜM)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        setFormData({ ...formData, imageURL: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageURL || !formData.promptText || !formData.author) {
      addToast('Lütfen tüm zorunlu alanları doldurun.', 'error');
      return;
    }

    if (editingId) {
      const updatedPrompt: PromptItem = {
        ...formData,
        id: editingId,
        aspectRatio: 'portrait' 
      };
      onUpdatePrompt(updatedPrompt);
      addToast('İçerik başarıyla güncellendi!');
    } else {
      const newPrompt: PromptItem = {
        id: Date.now().toString(),
        imageURL: formData.imageURL,
        promptText: formData.promptText,
        modelName: formData.modelName,
        author: formData.author,
        tags: formData.tags.length > 0 ? formData.tags : ['Genel'],
        aspectRatio: 'portrait' 
      };
      onAddPrompt(newPrompt);
      addToast('Yeni içerik başarıyla galeriye eklendi!');
    }
    
    resetForm();
    setActiveTab('manage');
  };

  const handleAddStyle = () => {
    if (!newStyleGroup || !newStyleName) {
      addToast('Lütfen ana stil ve alt stil alanlarını doldurun.', 'error');
      return;
    }
    onAddStyle(newStyleGroup, newStyleName);
    addToast(`Yeni stil eklendi: ${newStyleName}`);
    setNewStyleName('');
  };

  const startEditing = (item: PromptItem) => {
    setFormData({
      promptText: item.promptText,
      modelName: item.modelName,
      author: item.author,
      tags: item.tags,
      imageURL: item.imageURL
    });
    setPreview(item.imageURL);
    setEditingId(item.id);
    setActiveTab('create');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-7xl h-[90vh] glass border border-cyber-cyan/30 rounded-2xl overflow-hidden flex flex-col animate-zoom-in">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <i className="fas fa-user-shield text-cyber-cyan"></i>
            YÖNETİM PANELİ
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => { resetForm(); setActiveTab('create'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'create' ? 'bg-cyber-cyan text-cyber-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
              {editingId ? 'DÜZENLEME MODU' : 'YENİ EKLE'}
            </button>
            <button 
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'manage' ? 'bg-cyber-cyan text-cyber-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
              İÇERİKLERİ YÖNET ({allPrompts.length})
            </button>
            <button 
              onClick={() => setActiveTab('styles')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'styles' ? 'bg-cyber-cyan text-cyber-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
              STİLLERİ DÜZENLE
            </button>
            <button onClick={onClose} className="ml-4 text-slate-400 hover:text-white transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* TAB: STİLLER */}
          {activeTab === 'styles' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-fade-in">
              <h3 className="text-sm font-display text-cyber-cyan uppercase tracking-widest mb-6 flex items-center gap-2">
                <i className="fas fa-plus-circle"></i>
                YENİ STİL / KATEGORİ EKLE
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Ana Stil Grubu</label>
                  <div className="relative">
                    <input 
                      list="styleGroups"
                      type="text"
                      value={newStyleGroup}
                      onChange={e => setNewStyleGroup(e.target.value)}
                      placeholder="Örn: Sanatsal Stiller"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/30 text-sm"
                    />
                    <datalist id="styleGroups">
                      {artStyles.map(g => <option key={g.label} value={g.label} />)}
                    </datalist>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Yeni Alt Stil</label>
                  <input 
                    type="text"
                    value={newStyleName}
                    onChange={e => setNewStyleName(e.target.value)}
                    placeholder="Örn: Cyber-Noir"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/30 text-sm"
                  />
                </div>
                <button 
                  onClick={handleAddStyle}
                  className="bg-white/10 hover:bg-cyber-cyan hover:text-cyber-black text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <i className="fas fa-check"></i>
                  STİLİ KAYDET
                </button>
              </div>
            </div>
          )}

          {/* TAB: YÖNETİM */}
          {activeTab === 'manage' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPrompts.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex h-32 hover:border-cyber-cyan/30 transition-all group">
                    <img src={item.imageURL} className="w-24 h-full object-cover" />
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <p className="text-[10px] text-cyber-cyan uppercase font-bold">{item.modelName}</p>
                        <p className="text-xs text-slate-400 line-clamp-2 italic">"{item.promptText}"</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditing(item)}
                          className="flex-1 bg-white/5 hover:bg-cyber-cyan hover:text-cyber-black text-slate-400 py-1 rounded text-[10px] font-bold transition-all"
                        >
                          DÜZENLE
                        </button>
                        <button 
                          onClick={() => { if(window.confirm('Bu içeriği silmek istediğinize emin misiniz?')) onDeletePrompt(item.id); }}
                          className="px-3 bg-white/5 hover:bg-red-500 hover:text-white text-slate-400 py-1 rounded text-[10px] font-bold transition-all"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EKLE / DÜZENLE */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 animate-fade-in">
              <div className="md:w-1/3 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-display text-slate-500 uppercase tracking-widest">Görsel</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                      preview ? 'border-cyber-cyan bg-cyber-cyan/5' : 'border-white/10 hover:border-cyber-cyan/50 bg-white/5'
                    }`}
                  >
                    {preview ? (
                      <img src={preview} alt="Önizleme" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt text-4xl text-slate-600 mb-2"></i>
                        <span className="text-sm text-slate-500 text-center px-4">Görsel seçmek için tıklayın</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-display text-slate-500 uppercase tracking-widest">Model</label>
                    <input 
                      type="text"
                      value={formData.modelName}
                      onChange={e => setFormData({...formData, modelName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/30 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-display text-slate-500 uppercase tracking-widest">Yazar</label>
                    <input 
                      type="text"
                      required
                      value={formData.author}
                      onChange={e => setFormData({...formData, author: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/30 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="md:w-2/3 space-y-6 flex flex-col">
                <div className="space-y-2">
                  <label className="text-xs font-display text-slate-500 uppercase tracking-widest">Prompt Metni</label>
                  <textarea 
                    required
                    value={formData.promptText}
                    onChange={e => setFormData({...formData, promptText: e.target.value})}
                    placeholder="Görseli tanımlayan promptu girin..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-24 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/30 transition-all text-sm italic resize-none"
                  />
                </div>

                <div className="flex-1 space-y-6">
                  <h3 className="text-sm font-display text-cyber-cyan uppercase tracking-widest border-b border-cyber-cyan/20 pb-2">Türler / Etiketler</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto max-h-[300px] pr-2 no-scrollbar">
                      {artStyles.map((group) => (
                        <div key={group.label} className="space-y-3">
                          <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{group.label}</h4>
                          <div className="flex flex-wrap gap-2">
                            {group.styles.map(style => (
                              <button
                                key={style}
                                type="button"
                                onClick={() => toggleTag(style)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                                  formData.tags.includes(style)
                                    ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                }`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4">
                  {editingId && (
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-white/5 text-slate-400 font-bold py-4 rounded-xl hover:bg-white/10 transition-all"
                    >
                      İPTAL
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="flex-[2] bg-cyber-cyan text-cyber-black font-bold py-4 rounded-xl shadow-lg hover:shadow-cyber-cyan/40 transition-all font-display tracking-widest"
                  >
                    {editingId ? 'İÇERİĞİ GÜNCELLE' : 'İÇERİĞİ YAYINLA'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
