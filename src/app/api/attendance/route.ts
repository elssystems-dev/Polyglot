import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AttendanceRecord } from '@/models/AttendanceRecord';
import { Enrollment, calculateAcademicStatus } from '@/models/Enrollment';
import { Classroom } from '@/models/Classroom';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const classroomId = url.searchParams.get('classroomId');
    const date = url.searchParams.get('date');

    const filter: any = {};
    if (classroomId) filter.classroomId = classroomId;
    if (date) filter.date = date;

    const records = await AttendanceRecord.find(filter)
      .populate('records.studentId')
      .populate('registeredBy', 'name email avatar')
      .sort({ date: -1 });

    return NextResponse.json({ success: true, records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar chamadas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const { classroomId, date, sessionNumber, topic, records } = await req.json();

    if (!classroomId || !date) {
      return NextResponse.json({ error: 'Turma e Data são obrigatórios' }, { status: 400 });
    }

    // If teacher, verify classroom ownership
    if (authUser.role === 'TEACHER') {
      const classroom = await Classroom.findById(classroomId);
      if (!classroom || classroom.teacherId.toString() !== authUser.userId) {
        return NextResponse.json(
          { error: 'Você só pode registrar chamadas para suas próprias turmas' },
          { status: 403 }
        );
      }
    }

    // Upsert attendance record for this class and date
    const attendanceRecord = await AttendanceRecord.findOneAndUpdate(
      { classroomId, date },
      {
        sessionNumber: Number(sessionNumber) || 1,
        topic: topic || '',
        records: records || [],
        registeredBy: authUser.userId,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Sync student absences across all recorded sessions for this class
    if (Array.isArray(records)) {
      // For each student, re-count unexcused absences (status: 'ABSENT') across all AttendanceRecords
      const allClassSessions = await AttendanceRecord.find({ classroomId });
      
      const studentAbsenceMap = new Map<string, number>();
      allClassSessions.forEach((session) => {
        session.records.forEach((rec) => {
          if (rec.status === 'ABSENT') {
            const sid = rec.studentId.toString();
            studentAbsenceMap.set(sid, (studentAbsenceMap.get(sid) || 0) + 1);
          }
        });
      });

      // Update student enrollments
      for (const [studentId, absencesCount] of studentAbsenceMap.entries()) {
        const enrollment = await Enrollment.findOne({ classroomId, studentId });
        if (enrollment) {
          enrollment.absences = absencesCount;
          const calc = calculateAcademicStatus(enrollment.grades, absencesCount, enrollment.totalClasses);
          enrollment.finalAverage = calc.finalAverage;
          enrollment.attendanceRate = calc.attendanceRate;
          enrollment.status = calc.status;
          await enrollment.save();
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Chamada e frequências sincronizadas com sucesso no diário de classe',
      record: attendanceRecord,
    });
  } catch (error: any) {
    console.error('Attendance save error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao registrar chamada' }, { status: 500 });
  }
}
