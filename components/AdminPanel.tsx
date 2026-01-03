
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'styles'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    promptText: '',
    modelName: 'Gemini 3 Pro',
    author: SITE_CONFIG.defaultAuthor,
    tags: [] as string[],
    imageURL: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [newStyleGroup, setNewStyleGroup] = useState('');
  const [newStyleName, setNewStyleName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setIsAuthorized(false);
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
    setSelectedFile(null);
    setEditingId(null);
    setIsSubmitting(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'hakan123') {
      setIsAuthorized(true);
      setLoginError(false);
      addToast('Yetkilendirme başarılı.', 'success');
    } else {
      setLoginError(true);
      addToast('Hatalı giriş!', 'error');
      setTimeout(() => setLoginError(false), 500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!selectedFile && !editingId) || !formData.promptText || !formData.author) {
      addToast('Lütfen zorunlu alanları doldurun.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.imageURL;

      // 1. Yeni görsel varsa Vercel Blob'a yükle
      if (selectedFile) {
        addToast('Görsel buluta yükleniyor...', 'success');
        const uploadRes = await fetch(`/api/upload?filename=${selectedFile.name}`, {
          method: 'POST',
          body: selectedFile,
        });
        const blobData = await uploadRes.json();
        if (blobData.url) {
          finalImageUrl = blobData.url;
        } else {
          throw new Error('Görsel yükleme başarısız.');
        }
      }

      // 2. Metadata'yı Postgres'e kaydet
      const payload: PromptItem = {
        id: editingId || '',
        imageURL: finalImageUrl,
        promptText: formData.promptText,
        modelName: formData.modelName,
        author: formData.author,
        tags: formData.tags.length > 0 ? formData.tags : ['Genel'],
        aspectRatio: 'portrait' 
      };

      if (editingId) {
        onUpdatePrompt(payload);
      } else {
        await onAddPrompt(payload);
      }
      
      resetForm();
      setActiveTab('manage');
    } catch (err: any) {
      addToast(err.message || 'Bir hata oluştu.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStyle = () => {
    if (!newStyleGroup || !newStyleName) return;
    onAddStyle(newStyleGroup, newStyleName);
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

  if (!isOpen) return null;

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
        <div className={`relative w-full max-w-md glass border rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] transition-all ${loginError ? 'border-red-500 animate-shake' : 'border-cyber-cyan/30'}`}>
          <div className="text-center mb-8">
            <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">Giriş Gerekli</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="text" 
              placeholder="admin" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white" 
              value={loginForm.username}
              onChange={e => setLoginForm({...loginForm, username: e.target.value})}
            />
            <input 
              type="password" 
              placeholder="hakan123" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white"
              value={loginForm.password}
              onChange={e => setLoginForm({...loginForm, password: e.target.value})}
            />
            <button type="submit" className="w-full bg-cyber-cyan text-black font-bold py-4 rounded-xl uppercase">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-7xl h-[90vh] glass border border-cyber-cyan/30 rounded-2xl overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <i className="fas fa-database text-cyber-cyan"></i>
            Kalıcı Depolama Paneli
          </h2>
          <div className="flex gap-2">
            <button onClick={() => { resetForm(); setActiveTab('create'); }} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'create' ? 'bg-cyber-cyan text-black' : 'text-slate-400'}`}>YENİ EKLE</button>
            <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'manage' ? 'bg-cyber-cyan text-black' : 'text-slate-400'}`}>YÖNET ({allPrompts.length})</button>
            <button onClick={onClose} className="ml-4 text-slate-400"><i className="fas fa-times"></i></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'manage' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPrompts.map(item => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex h-32">
                  <img src={item.imageURL} className="w-24 h-full object-cover" />
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 line-clamp-2 italic">"{item.promptText}"</p>
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(item)} className="text-[10px] text-cyber-cyan uppercase font-bold">DÜZENLE</button>
                      <button onClick={() => onDeletePrompt(item.id)} className="text-[10px] text-red-500 uppercase font-bold">SİL</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-white/5"
                >
                  {preview ? <img src={preview} className="w-full h-full object-cover" /> : <span className="text-slate-500">Görsel Seç</span>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              <div className="md:w-2/3 space-y-6">
                <textarea 
                  required
                  value={formData.promptText}
                  onChange={e => setFormData({...formData, promptText: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-32 text-white"
                  placeholder="Promptunuzu buraya yazın..."
                />
                <input 
                  type="text" 
                  value={formData.author} 
                  onChange={e => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white" 
                  placeholder="Yazar" 
                />
                
                <div className="flex-1 overflow-y-auto max-h-[200px] border border-white/10 p-4 rounded-xl">
                  <div className="flex flex-wrap gap-2">
                    {artStyles.flatMap(g => g.styles).map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleTag(style)}
                        className={`px-3 py-1 rounded-lg text-xs ${formData.tags.includes(style) ? 'bg-cyber-cyan text-black' : 'bg-white/5 text-slate-500'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-cyber-cyan text-black font-bold py-4 rounded-xl shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'BULUTA İŞLENİYOR...' : (editingId ? 'GÜNCELLE' : 'KALICI OLARAK YAYINLA')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
