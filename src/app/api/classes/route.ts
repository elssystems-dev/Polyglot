import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Classroom } from '@/models/Classroom';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { Enrollment } from '@/models/Enrollment';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const teacherId = url.searchParams.get('teacherId');
    const language = url.searchParams.get('language');
    const semester = url.searchParams.get('semester');

    const authUser = getAuthUser(req);

    const filter: any = {};
    if (semester) {
      filter.semester = semester;
    }

    // If teacher is requested explicitly or if teacher is authenticated and didn't specify query
    if (teacherId) {
      filter.teacherId = teacherId;
    } else if (authUser && authUser.role === 'TEACHER' && url.searchParams.get('all') !== 'true') {
      filter.teacherId = authUser.userId;
    }

    const classrooms = await Classroom.find(filter)
      .populate('courseId')
      .populate('teacherId', 'name email avatar title specialties')
      .sort({ createdAt: -1 });

    // Filter by language if requested
    let filtered = classrooms;
    if (language && language !== 'all') {
      filtered = classrooms.filter((c: any) => {
        const courseLang = (c.courseId?.language || '').toLowerCase();
        if (language === 'ing') return courseLang.includes('ing');
        if (language === 'esp') return courseLang.includes('esp');
        if (language === 'fra') return courseLang.includes('fra');
        if (language === 'ale') return courseLang.includes('ale');
        return true;
      });
    }

    // Attach student enrollment count to each class
    const classIds = filtered.map((c) => c._id);
    const enrollments = await Enrollment.find({ classroomId: { $in: classIds } });

    const result = filtered.map((c) => {
      const classEnrollments = enrollments.filter((e) => e.classroomId.toString() === c._id.toString());
      const enrolledCount = classEnrollments.length;
      const occupancyRate = c.capacity > 0 ? Math.round((enrolledCount / c.capacity) * 100) : 0;
      return {
        ...c.toObject(),
        enrolledCount,
        occupancyRate,
      };
    });

    return NextResponse.json({ success: true, classrooms: result });
  } catch (error: any) {
    console.error('Classes GET error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao buscar turmas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem cadastrar turmas' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      code,
      name,
      courseId,
      teacherId,
      capacity,
      semester,
      scheduleDays,
      startTime,
      endTime,
      room,
      startDate,
      endDate,
    } = body;

    if (!code || !name || !courseId || !teacherId) {
      return NextResponse.json(
        { error: 'Código, Nome, Curso e Professor são obrigatórios' },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Classroom.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ error: `Já existe uma turma com o código "${cleanCode}"` }, { status: 409 });
    }

    // Verify course and teacher exist
    const [courseExists, teacherExists] = await Promise.all([
      Course.findById(courseId),
      User.findOne({ _id: teacherId, role: 'TEACHER' }),
    ]);

    if (!courseExists) {
      return NextResponse.json({ error: 'Curso selecionado não foi encontrado' }, { status: 404 });
    }
    if (!teacherExists) {
      return NextResponse.json({ error: 'Professor selecionado não foi encontrado' }, { status: 404 });
    }

    const classroom = await Classroom.create({
      code: cleanCode,
      name: name.trim(),
      courseId,
      teacherId,
      capacity: Number(capacity) || 18,
      semester: semester || '2025.1',
      scheduleDays: Array.isArray(scheduleDays) && scheduleDays.length > 0 ? scheduleDays : ['SEG', 'QUA'],
      startTime: startTime || '19:00',
      endTime: endTime || '20:30',
      room: room || 'Sala 01',
      startDate: startDate || '2025-03-03',
      endDate: endDate || '2025-06-30',
      status: 'IN_PROGRESS',
    });

    const populated = await Classroom.findById(classroom._id)
      .populate('courseId')
      .populate('teacherId', 'name email avatar title');

    return NextResponse.json({ success: true, message: 'Turma cadastrada com sucesso', classroom: populated }, { status: 201 });
  } catch (error: any) {
    console.error('Classes POST error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao cadastrar turma' }, { status: 500 });
  }
}
