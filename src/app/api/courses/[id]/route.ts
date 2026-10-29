import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course } from '@/models/Course';
import { Classroom } from '@/models/Classroom';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar curso' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem editar cursos' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const course = await Course.findByIdAndUpdate(
      id,
      {
        name: body.name?.trim(),
        language: body.language,
        cefrLevel: body.cefrLevel,
        workloadHours: Number(body.workloadHours),
        material: body.material,
        description: body.description,
      },
      { new: true, runValidators: true }
    );

    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Curso atualizado com sucesso', course });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar curso' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem remover cursos' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;

    const activeClasses = await Classroom.countDocuments({ courseId: id, status: { $ne: 'COMPLETED' } });
    if (activeClasses > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: existem ${activeClasses} turmas ativas vinculadas a este curso.` },
        { status: 400 }
      );
    }

    await Course.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Curso removido com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao excluir curso' }, { status: 500 });
  }
}
