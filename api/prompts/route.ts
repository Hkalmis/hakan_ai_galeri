import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM prompts ORDER BY created_at DESC`;
    // Veritabanındaki alt_tireli isimleri React'teki camelCase isimlere çeviriyoruz
    const mappedRows = rows.map(row => ({
      id: row.id,
      title: row.title,
      promptText: row.prompt_text,
      modelName: row.model_name,
      imageUrl: row.image_url,
      tags: row.tags || []
    }));
    return NextResponse.json(mappedRows);
  } catch (error) {
    return NextResponse.json({ error: 'Veriler çekilemedi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, promptText, modelName, imageUrl, tags } = body;
    const { rows } = await sql`
      INSERT INTO prompts (title, prompt_text, model_name, image_url, tags)
      VALUES (${title}, ${promptText}, ${modelName}, ${imageUrl}, ${tags})
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Kaydedilemedi' }, { status: 500 });
  }
}