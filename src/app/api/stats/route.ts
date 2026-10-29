import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Classroom } from '@/models/Classroom';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { Student } from '@/models/Student';
import { Enrollment } from '@/models/Enrollment';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const authUser = getAuthUser(req);

    const [
      totalClassrooms,
      totalCourses,
      totalTeachers,
      totalStudents,
      totalEnrollments,
      enrollmentsList,
    ] = await Promise.all([
      Classroom.countDocuments({ status: { $ne: 'COMPLETED' } }),
      Course.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ role: 'TEACHER', status: 'ACTIVE' }),
      Student.countDocuments({ status: 'ACTIVE' }),
      Enrollment.countDocuments({}),
      Enrollment.find({}).select('finalAverage attendanceRate status'),
    ]);

    // Calculate global average attendance rate and grade averages
    let avgAttendance = 94.8;
    let avgGrade = 8.2;

    if (enrollmentsList.length > 0) {
      const validAttendance = enrollmentsList.filter((e) => typeof e.attendanceRate === 'number');
      if (validAttendance.length > 0) {
        avgAttendance = Math.round(
          (validAttendance.reduce((acc, curr) => acc + curr.attendanceRate, 0) / validAttendance.length) * 10
        ) / 10;
      }

      const validGrades = enrollmentsList.filter((e) => typeof e.finalAverage === 'number');
      if (validGrades.length > 0) {
        avgGrade = Math.round(
          (validGrades.reduce((acc, curr) => acc + (curr.finalAverage || 0), 0) / validGrades.length) * 10
        ) / 10;
      }
    }

    // If teacher is logged in, calculate specific teacher stats
    let teacherStats = null;
    if (authUser && authUser.role === 'TEACHER') {
      const teacherClasses = await Classroom.find({ teacherId: authUser.userId });
      const teacherClassIds = teacherClasses.map((c) => c._id);
      const teacherEnrollments = await Enrollment.find({ classroomId: { $in: teacherClassIds } });

      let teacherAvgAttendance = 95.0;
      if (teacherEnrollments.length > 0) {
        const sumAtt = teacherEnrollments.reduce((acc, curr) => acc + curr.attendanceRate, 0);
        teacherAvgAttendance = Math.round((sumAtt / teacherEnrollments.length) * 10) / 10;
      }

      teacherStats = {
        classesCount: teacherClasses.length,
        studentsCount: teacherEnrollments.length,
        avgAttendance: teacherAvgAttendance,
      };
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalClassrooms,
        totalCourses,
        totalTeachers,
        totalStudents,
        totalEnrollments,
        avgAttendance,
        avgGrade,
        semester: '2025.1',
        teacherStats,
      },
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar estatísticas' }, { status: 500 });
  }
}
