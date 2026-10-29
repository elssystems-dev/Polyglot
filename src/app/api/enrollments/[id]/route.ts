import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Enrollment, calculateAcademicStatus } from '@/models/Enrollment';
import { Classroom } from '@/models/Classroom';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return NextResponse.json({ error: 'Matrícula não encontrada' }, { status: 404 });
    }

    // Check teacher authorization: teacher can only edit grades in their own classrooms
    if (authUser.role === 'TEACHER') {
      const classroom = await Classroom.findById(enrollment.classroomId);
      if (!classroom || classroom.teacherId.toString() !== authUser.userId) {
        return NextResponse.json(
          { error: 'Você só pode lançar notas e faltas para alunos das suas próprias turmas' },
          { status: 403 }
        );
      }
    }

    // Process new grades
    const newGrades = { ...enrollment.grades };
    if (body.grades) {
      if (body.grades.n1 !== undefined) {
        newGrades.n1 = body.grades.n1 === '' || body.grades.n1 === null ? null : Number(body.grades.n1);
      }
      if (body.grades.n2 !== undefined) {
        newGrades.n2 = body.grades.n2 === '' || body.grades.n2 === null ? null : Number(body.grades.n2);
      }
      if (body.grades.n3 !== undefined) {
        newGrades.n3 = body.grades.n3 === '' || body.grades.n3 === null ? null : Number(body.grades.n3);
      }
    }

    // Process absences
    const absences = body.absences !== undefined ? Number(body.absences) : enrollment.absences;
    const totalClasses = body.totalClasses !== undefined ? Number(body.totalClasses) : enrollment.totalClasses;

    // Automatic calculation of final average and academic status
    const calc = calculateAcademicStatus(newGrades, absences, totalClasses);

    enrollment.grades = newGrades;
    enrollment.absences = absences;
    enrollment.totalClasses = totalClasses;
    enrollment.finalAverage = calc.finalAverage;
    enrollment.attendanceRate = calc.attendanceRate;
    enrollment.status = calc.status;
    if (body.notes !== undefined) {
      enrollment.notes = body.notes;
    }

    await enrollment.save();

    const populated = await Enrollment.findById(enrollment._id).populate('studentId');

    return NextResponse.json({
      success: true,
      message: 'Notas e faltas atualizadas com cálculo de média automático',
      enrollment: populated,
    });
  } catch (error: any) {
    console.error('Enrollment update error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao atualizar notas e faltas' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem desmatricular alunos' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;
    await Enrollment.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Matrícula desfeita com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao desmatricular aluno' }, { status: 500 });
  }
}
