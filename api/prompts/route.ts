
// api/prompts/route.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM prompts ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, prompt_text, category } = await req.json();
    const { rows } = await sql`
      INSERT INTO prompts (title, prompt_text, category)
      VALUES (${title}, ${prompt_text}, ${category})
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 });
  }
}
