
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'image.png';

    if (!request.body) {
      return NextResponse.json({ error: 'Dosya içeriği boş' }, { status: 400 });
    }

    // Görseli Vercel Blob'a yükle (Global CDN)
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Yükleme başarısız' }, { status: 500 });
  }
}
