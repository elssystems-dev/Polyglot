import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Enrollment, calculateAcademicStatus } from '@/models/Enrollment';
import { Classroom } from '@/models/Classroom';
import { Student } from '@/models/Student';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas a coordenação pode matricular alunos em turmas' }, { status: 403 });
    }

    await connectToDatabase();
    const { studentId, classroomId, notes } = await req.json();

    if (!studentId || !classroomId) {
      return NextResponse.json({ error: 'Aluno e Turma são obrigatórios para matrícula' }, { status: 400 });
    }

    const [student, classroom, existingEnrollment, currentCount] = await Promise.all([
      Student.findById(studentId),
      Classroom.findById(classroomId),
      Enrollment.findOne({ studentId, classroomId }),
      Enrollment.countDocuments({ classroomId }),
    ]);

    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }
    if (!classroom) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
    }
    if (existingEnrollment) {
      return NextResponse.json({ error: 'Este aluno já está matriculado nesta turma' }, { status: 409 });
    }
    if (currentCount >= classroom.capacity) {
      return NextResponse.json(
        { error: `Esta turma já atingiu a capacidade máxima de ${classroom.capacity} alunos` },
        { status: 400 }
      );
    }

    const calc = calculateAcademicStatus({}, 0, 40);
    const enrollment = await Enrollment.create({
      studentId,
      classroomId,
      enrollmentDate: new Date(),
      grades: { n1: null, n2: null, n3: null },
      absences: 0,
      totalClasses: 40,
      finalAverage: calc.finalAverage,
      attendanceRate: calc.attendanceRate,
      status: calc.status,
      notes: notes || '',
    });

    const populated = await Enrollment.findById(enrollment._id).populate('studentId');
    return NextResponse.json({ success: true, message: 'Aluno matriculado com sucesso', enrollment: populated }, { status: 201 });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao matricular aluno' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const classroomId = url.searchParams.get('classroomId');

    const filter: any = {};
    if (classroomId) {
      filter.classroomId = classroomId;
    }

    const enrollments = await Enrollment.find(filter)
      .populate('studentId')
      .populate('classroomId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, enrollments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao listar matrículas' }, { status: 500 });
  }
}
