import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Enrollment } from '@/models/Enrollment';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

    const enrollments = await Enrollment.find({ studentId: id }).populate('classroomId');

    return NextResponse.json({ success: true, student, enrollments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar aluno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem editar dados de alunos' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const { name, email, phone, cpf, avatar, status } = body;

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

    if (email && email.toLowerCase().trim() !== student.email) {
      const existing = await Student.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: `O e-mail "${email}" já está cadastrado em outro aluno` }, { status: 409 });
      }
      student.email = email.toLowerCase().trim();
    }

    if (name) student.name = name.trim();
    if (phone !== undefined) student.phone = phone;
    if (cpf !== undefined) student.cpf = cpf;
    if (avatar !== undefined) student.avatar = avatar;
    if (status) student.status = status;

    await student.save();

    return NextResponse.json({ success: true, message: 'Dados do aluno atualizados com sucesso', student });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar aluno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem remover alunos' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

    // Delete student and their enrollments
    await Promise.all([
      Student.findByIdAndDelete(id),
      Enrollment.deleteMany({ studentId: id }),
    ]);

    return NextResponse.json({ success: true, message: 'Aluno e matrículas removidos com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao remover aluno' }, { status: 500 });
  }
}
