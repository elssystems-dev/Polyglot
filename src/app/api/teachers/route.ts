import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Classroom } from '@/models/Classroom';
import { hashPassword, getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const search = url.searchParams.get('q');

    const filter: any = { role: 'TEACHER', status: 'ACTIVE' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialties: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const teachers = await User.find(filter).select('-password').sort({ name: 1 });

    // Attach active classes count to each teacher
    const teacherIds = teachers.map((t) => t._id);
    const classrooms = await Classroom.find({ teacherId: { $in: teacherIds }, status: { $ne: 'COMPLETED' } });

    const teachersWithCounts = teachers.map((t) => {
      const classCount = classrooms.filter((c) => c.teacherId.toString() === t._id.toString()).length;
      return {
        ...t.toObject(),
        activeClassesCount: classCount,
      };
    });

    return NextResponse.json({ success: true, teachers: teachersWithCounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar professores' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem cadastrar professores' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const { name, email, password, title, specialties, phone, avatar } = body;
    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e E-mail são obrigatórios' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json({ error: `O e-mail "${cleanEmail}" já está cadastrado` }, { status: 409 });
    }

    const defaultPassword = password ? hashPassword(password) : hashPassword('prof123');

    const teacher = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: defaultPassword,
      role: 'TEACHER',
      title: title || 'Professor(a) de Idiomas',
      specialties: Array.isArray(specialties) ? specialties : specialties ? specialties.split(',').map((s: string) => s.trim()) : [],
      phone: phone || '',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      status: 'ACTIVE',
    });

    const teacherObj = teacher.toObject();
    delete (teacherObj as any).password;

    return NextResponse.json({ success: true, message: 'Professor cadastrado com sucesso', teacher: teacherObj }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao cadastrar professor' }, { status: 500 });
  }
}
