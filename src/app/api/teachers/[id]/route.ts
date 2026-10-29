import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Classroom } from '@/models/Classroom';
import { getAuthUser, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const teacher = await User.findOne({ _id: id, role: 'TEACHER' }).select('-password');
    if (!teacher) {
      return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 });
    }

    const classrooms = await Classroom.find({ teacherId: id }).populate('courseId');

    return NextResponse.json({ success: true, teacher, classrooms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar professor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem editar professores' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const teacher = await User.findOne({ _id: id, role: 'TEACHER' });
    if (!teacher) {
      return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 });
    }

    const { name, email, password, title, specialties, phone, avatar, status } = body;

    if (email && email.toLowerCase().trim() !== teacher.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: `O e-mail "${email}" já está cadastrado em outro usuário` }, { status: 409 });
      }
      teacher.email = email.toLowerCase().trim();
    }

    if (name) teacher.name = name.trim();
    if (password) teacher.password = hashPassword(password);
    if (title !== undefined) teacher.title = title;
    if (specialties !== undefined) {
      teacher.specialties = Array.isArray(specialties)
        ? specialties
        : typeof specialties === 'string'
        ? specialties.split(',').map((s: string) => s.trim())
        : [];
    }
    if (phone !== undefined) teacher.phone = phone;
    if (avatar !== undefined) teacher.avatar = avatar;
    if (status) teacher.status = status;

    await teacher.save();

    const teacherObj = teacher.toObject();
    delete (teacherObj as any).password;

    return NextResponse.json({ success: true, message: 'Dados do professor atualizados com sucesso', teacher: teacherObj });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar professor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem remover professores' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;

    const teacher = await User.findOne({ _id: id, role: 'TEACHER' });
    if (!teacher) {
      return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 });
    }

    // Check if teacher is assigned to any active classroom
    const activeClasses = await Classroom.countDocuments({ teacherId: id, status: { $ne: 'COMPLETED' } });
    if (activeClasses > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: o professor possui ${activeClasses} turmas ativas vinculadas.` },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Professor removido com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao remover professor' }, { status: 500 });
  }
}
