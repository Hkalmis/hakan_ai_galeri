
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

/**
 * api/chat/route.ts
 * 
 * Bu rota, istemciden gelen istekleri karşılar ve Gemini API anahtarını (process.env.API_KEY) 
 * asla tarayıcıya göndermeden sunucu tarafında işlemler.
 */

// NOT: Gerçek bir uygulamada Clerk (auth()), NextAuth (getServerSession()) gibi 
// bir kütüphane kullanarak aktif kullanıcı ID'sini almalısınız.
async function getSessionUserId(req: NextRequest): Promise<string | null> {
  // Örnek: Header üzerinden simüle edilmiş auth (Geliştirme aşaması için)
  // Üretimde bu değer güvenli bir session token veya cookie'den gelmelidir.
  return req.headers.get('x-authenticated-user-id'); 
}

export async function POST(req: NextRequest) {
  try {
    // 1. Kimlik Doğrulama (Authentication)
    const authenticatedId = await getSessionUserId(req);
    
    if (!authenticatedId) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, prompt } = body;

    // 2. Yetkilendirme Kontrolü (Authorization - Vercel Güvenlik Çözümü)
    // İSTEKTEKİ userId İLE OTURUMDAKİ userId KARŞILAŞTIRILMALIDIR.
    if (userId !== authenticatedId) {
      console.warn(`Güvenlik Uyarısı: Kullanıcı ${authenticatedId}, Kullanıcı ${userId} adına işlem yapmaya çalıştı.`);
      return NextResponse.json(
        { error: 'Erişim Engellendi: Sadece kendi hesabınız için prompt oluşturabilirsiniz.' },
        { status: 403 }
      );
    }

    // 3. Veri Doğrulama
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Geçersiz prompt metni.' }, { status: 400 });
    }

    // 4. Güvenli Gemini API İşlemi
    // GoogleGenAI instance'ı her istekte taze olarak oluşturulur.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Sen HAKAN_Aİ_GALERİ için uzman bir Prompt Mühendisisin. Kullanıcının basit fikirlerini zengin, betimleyici ve profesyonel görsel üretim komutlarına dönüştür.",
      },
    });

    // SDK kurallarına göre .text property'si üzerinden yanıt alınır.
    const result = response.text;

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('[SERVER_API_ERROR]:', error);
    
    return NextResponse.json(
      { error: 'Sunucu tarafında bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
}
