import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course } from '@/models/Course';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const language = url.searchParams.get('language');
    const cefr = url.searchParams.get('cefr');

    const filter: any = { status: 'ACTIVE' };
    if (language && language !== 'all') {
      filter.language = language;
    }
    if (cefr && cefr !== 'all') {
      filter.cefrLevel = cefr;
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, courses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar cursos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem cadastrar cursos' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const { code, name, language, cefrLevel, workloadHours, material, description } = body;
    if (!code || !name) {
      return NextResponse.json({ error: 'Código e Nome do curso são obrigatórios' }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Course.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ error: `Já existe um curso cadastrado com o código "${cleanCode}"` }, { status: 409 });
    }

    const course = await Course.create({
      code: cleanCode,
      name: name.trim(),
      language: language || 'Inglês',
      cefrLevel: cefrLevel || 'B1',
      workloadHours: Number(workloadHours) || 60,
      material: material || '',
      description: description || '',
      status: 'ACTIVE',
    });

    return NextResponse.json({ success: true, message: 'Curso criado com sucesso', course }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar curso' }, { status: 500 });
  }
}
