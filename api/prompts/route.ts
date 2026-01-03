
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

/**
 * Tabloyu initialize eden yardımcı fonksiyon
 */
async function ensureTableExists() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS prompts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        image_url TEXT NOT NULL,
        prompt_text TEXT NOT NULL,
        model_name TEXT,
        author TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        aspect_ratio TEXT DEFAULT 'portrait',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (e) {
    console.error("Table creation error:", e);
  }
}

export async function GET() {
  try {
    await ensureTableExists();
    const { rows } = await sql`SELECT * FROM prompts ORDER BY created_at DESC`;
    
    // DB kolon isimlerini Frontend (PromptItem) formatına çeviriyoruz
    const mappedRows = rows.map(row => ({
      id: row.id,
      imageURL: row.image_url,
      promptText: row.prompt_text,
      modelName: row.model_name,
      author: row.author,
      tags: row.tags,
      aspectRatio: row.aspect_ratio
    }));

    return NextResponse.json(mappedRows);
  } catch (error: any) {
    console.error("DB GET Error:", error);
    return NextResponse.json({ error: 'Veriler çekilemedi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTableExists();
    const body = await req.json();
    const { imageURL, promptText, modelName, author, tags, aspectRatio } = body;

    const { rows } = await sql`
      INSERT INTO prompts (image_url, prompt_text, model_name, author, tags, aspect_ratio)
      VALUES (${imageURL}, ${promptText}, ${modelName}, ${author}, ${tags}, ${aspectRatio})
      RETURNING *
    `;

    const newRow = rows[0];
    return NextResponse.json({
      id: newRow.id,
      imageURL: newRow.image_url,
      promptText: newRow.prompt_text,
      modelName: newRow.model_name,
      author: newRow.author,
      tags: newRow.tags,
      aspectRatio: newRow.aspect_ratio
    });
  } catch (error: any) {
    console.error("DB POST Error:", error);
    return NextResponse.json({ error: 'Kaydedilemedi' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

    await sql`DELETE FROM prompts WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}
