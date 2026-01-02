
import { PromptItem } from './types';

/**
 * DÜZENLENEBİLİR YAZILAR BURADADIR
 */
export const SITE_CONFIG = {
  name: 'HAKAN_Aİ_GALERİ',
  description: 'Yüksek kaliteli yapay zeka promptları için bir numaralı adres. Gemini tarafından desteklenmektedir.',
  defaultAuthor: 'Hakan Kalmış'
};

export const PROMPTS: PromptItem[] = [
  {
    id: '1',
    imageURL: 'https://picsum.photos/seed/cyber1/600/800',
    promptText: 'Cyberpunk street market in rainy Neo-Tokyo, neon signs reflecting in puddles, cinematic lighting, 8k resolution, photorealistic.',
    modelName: 'Gemini 3 Pro',
    author: 'NexusVoyager',
    tags: ['Bilim Kurgu', 'Cyberpunk', 'Sinematik', 'Karanlık / Melankolik'],
    aspectRatio: 'portrait'
  },
  {
    id: '2',
    imageURL: 'https://picsum.photos/seed/arch/800/600',
    promptText: 'Futuristic organic architecture integrated with lush hanging gardens, sustainable city of the future, midday bright sun.',
    modelName: 'Midjourney v6',
    author: 'SolarpunkDreamer',
    tags: ['Mimari', 'Modern', 'Zarif'],
    aspectRatio: 'landscape'
  },
  {
    id: '3',
    imageURL: 'https://picsum.photos/seed/char/600/600',
    promptText: 'Portrait of an android with exposed internal circuitry made of gold and lapis lazuli, ethereal expression, soft bokeh background.',
    modelName: 'DALL-E 3',
    author: 'TechArtiste',
    tags: ['Karakterler', 'Portre', 'Bilim Kurgu', 'Zarif'],
    aspectRatio: 'square'
  }
];

export const INITIAL_ART_STYLES = [
  {
    label: 'Sanatsal Stiller',
    styles: [
      'Gerçekçi', 'Sinematik', 'Anime', 'Mimari', 'Karikatür', 
      '3D Render', 'Vektör', 'Suluboya', 'Eskiz / Çizim', 
      'Yağlı Boya', 'Soyut', 'Sürreal', 'Moda', 'Fotoğrafçılık', 'Portre'
    ]
  },
  {
    label: 'Kurumsal ve Profesyonel',
    styles: [
      'Kurumsal', 'İş Dünyası', 'Minimalist', 'Modern', 
      'Ürün / Poster', 'Logo', 'İnfografik', 'Konsept Sanatı'
    ]
  },
  {
    label: 'Tür ve Temalar',
    styles: ['Fantastik', 'Bilim Kurgu', 'Cyberpunk', 'Retro / Vintage', 'Grunge']
  },
  {
    label: 'Ruh Hali ve Ton',
    styles: ['Canlı / Renkli', 'Karanlık / Melankolik', 'Zarif']
  }
];
