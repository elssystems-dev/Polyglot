import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Enrollment } from '@/models/Enrollment';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const search = url.searchParams.get('q');
    const excludeClassId = url.searchParams.get('excludeClassId');

    const filter: any = { status: 'ACTIVE' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registration: { $regex: search, $options: 'i' } },
      ];
    }

    if (excludeClassId) {
      const alreadyEnrolled = await Enrollment.find({ classroomId: excludeClassId }).select('studentId');
      const alreadyEnrolledIds = alreadyEnrolled.map((e) => e.studentId);
      filter._id = { $nin: alreadyEnrolledIds };
    }

    const students = await Student.find(filter).sort({ name: 1 });
    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar alunos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem cadastrar alunos' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const { name, email, phone, cpf, avatar } = body;
    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e E-mail são obrigatórios' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Student.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json({ error: `O aluno com e-mail "${cleanEmail}" já está cadastrado` }, { status: 409 });
    }

    // Auto-generate student registration if not provided: e.g. 2025-MAT-1234
    const count = await Student.countDocuments();
    const registration = `2025-ALU-${String(count + 1).padStart(3, '0')}`;

    const student = await Student.create({
      registration,
      name: name.trim(),
      email: cleanEmail,
      phone: phone || '',
      cpf: cpf || '',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      status: 'ACTIVE',
    });

    return NextResponse.json({ success: true, message: 'Aluno cadastrado com sucesso', student }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao cadastrar aluno' }, { status: 500 });
  }
}
