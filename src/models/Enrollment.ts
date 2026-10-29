import mongoose, { Schema, Document, Model } from 'mongoose';

export type AcademicStatus = 'CURSANDO' | 'APROVADO' | 'RECUPERACAO' | 'REPROVADO_NOTA' | 'REPROVADO_FALTA';

export interface IGrades {
  n1?: number | null; // 0.0 - 10.0
  n2?: number | null;
  n3?: number | null;
}

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  classroomId: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  grades: IGrades;
  absences: number;
  totalClasses: number;
  finalAverage: number | null;
  attendanceRate: number; // 0 - 100%
  status: AcademicStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Diferencial Sugerido (Bônus):
 * Cálculo automático da média final do aluno na turma e situação acadêmica.
 */
export function calculateAcademicStatus(
  grades: IGrades,
  absences: number = 0,
  totalClasses: number = 40
): { finalAverage: number | null; attendanceRate: number; status: AcademicStatus } {
  const enteredGrades: number[] = [];
  if (typeof grades?.n1 === 'number' && !isNaN(grades.n1)) enteredGrades.push(grades.n1);
  if (typeof grades?.n2 === 'number' && !isNaN(grades.n2)) enteredGrades.push(grades.n2);
  if (typeof grades?.n3 === 'number' && !isNaN(grades.n3)) enteredGrades.push(grades.n3);

  let finalAverage: number | null = null;
  if (enteredGrades.length > 0) {
    const sum = enteredGrades.reduce((acc, curr) => acc + curr, 0);
    finalAverage = Math.round((sum / enteredGrades.length) * 10) / 10;
  }

  const safeTotalClasses = totalClasses > 0 ? totalClasses : 40;
  const attendanceRate = Math.max(0, Math.min(100, Math.round(((safeTotalClasses - absences) / safeTotalClasses) * 100)));

  let status: AcademicStatus = 'CURSANDO';

  // Regra de infrequência (> 25% de faltas = reprovação por falta)
  if (attendanceRate < 75) {
    status = 'REPROVADO_FALTA';
  } else if (finalAverage !== null) {
    // Se tem notas lançadas
    if (enteredGrades.length >= 2 || enteredGrades.length === 3) {
      if (finalAverage >= 7.0) {
        status = 'APROVADO';
      } else if (finalAverage >= 5.0) {
        status = 'RECUPERACAO';
      } else {
        status = 'REPROVADO_NOTA';
      }
    } else {
      status = 'CURSANDO';
    }
  }

  return { finalAverage, attendanceRate, status };
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    grades: {
      n1: { type: Number, default: null, min: 0, max: 10 },
      n2: { type: Number, default: null, min: 0, max: 10 },
      n3: { type: Number, default: null, min: 0, max: 10 },
    },
    absences: { type: Number, default: 0, min: 0 },
    totalClasses: { type: Number, default: 40 },
    finalAverage: { type: Number, default: null },
    attendanceRate: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ['CURSANDO', 'APROVADO', 'RECUPERACAO', 'REPROVADO_NOTA', 'REPROVADO_FALTA'],
      default: 'CURSANDO',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Pre-save hook to calculate automated average and status
EnrollmentSchema.pre('save', function () {
  const calc = calculateAcademicStatus(this.grades, this.absences, this.totalClasses);
  this.finalAverage = calc.finalAverage;
  this.attendanceRate = calc.attendanceRate;
  this.status = calc.status;
});

// Ensure a student cannot be enrolled in the exact same classroom twice
EnrollmentSchema.index({ studentId: 1, classroomId: 1 }, { unique: true });

export const Enrollment: Model<IEnrollment> = 
  mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
