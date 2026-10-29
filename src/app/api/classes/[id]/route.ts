import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Classroom } from '@/models/Classroom';
import { Enrollment } from '@/models/Enrollment';
import { AttendanceRecord } from '@/models/AttendanceRecord';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const classroom = await Classroom.findById(id)
      .populate('courseId')
      .populate('teacherId', 'name email avatar title specialties phone');

    if (!classroom) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
    }

    // Retrieve all enrollments with student details
    const enrollments = await Enrollment.find({ classroomId: id })
      .populate('studentId')
      .sort({ 'studentId.name': 1 });

    // Retrieve attendance history
    const attendanceHistory = await AttendanceRecord.find({ classroomId: id })
      .sort({ date: -1 })
      .limit(30);

    // Calculate aggregated metrics
    const totalEnrolled = enrollments.length;
    let sumAverage = 0;
    let countGraded = 0;
    let sumAttendance = 0;

    enrollments.forEach((e) => {
      if (typeof e.finalAverage === 'number') {
        sumAverage += e.finalAverage;
        countGraded++;
      }
      if (typeof e.attendanceRate === 'number') {
        sumAttendance += e.attendanceRate;
      }
    });

    const classAverage = countGraded > 0 ? Math.round((sumAverage / countGraded) * 10) / 10 : 0;
    const classAttendanceRate = totalEnrolled > 0 ? Math.round((sumAttendance / totalEnrolled) * 10) / 10 : 100;

    return NextResponse.json({
      success: true,
      classroom,
      enrollments,
      attendanceHistory,
      metrics: {
        totalEnrolled,
        capacity: classroom.capacity,
        occupancyRate: classroom.capacity > 0 ? Math.round((totalEnrolled / classroom.capacity) * 100) : 0,
        classAverage,
        classAttendanceRate,
      },
    });
  } catch (error: any) {
    console.error('Class detail GET error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar detalhes da turma' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem editar configurações de turmas' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const classroom = await Classroom.findByIdAndUpdate(
      id,
      {
        name: body.name?.trim(),
        teacherId: body.teacherId,
        courseId: body.courseId,
        capacity: Number(body.capacity),
        scheduleDays: body.scheduleDays,
        startTime: body.startTime,
        endTime: body.endTime,
        room: body.room,
        startDate: body.startDate,
        endDate: body.endDate,
        status: body.status,
      },
      { new: true, runValidators: true }
    )
      .populate('courseId')
      .populate('teacherId', 'name email avatar title');

    if (!classroom) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Turma atualizada com sucesso', classroom });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar turma' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Apenas coordenadores podem remover turmas' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;

    // Delete associated enrollments and attendance records
    await Promise.all([
      Classroom.findByIdAndDelete(id),
      Enrollment.deleteMany({ classroomId: id }),
      AttendanceRecord.deleteMany({ classroomId: id }),
    ]);

    return NextResponse.json({ success: true, message: 'Turma e registros excluídos com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao excluir turma' }, { status: 500 });
  }
}
