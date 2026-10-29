import mongoose, { Schema, Document, Model } from 'mongoose';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'JUSTIFIED';

export interface IAttendanceItem {
  studentId: mongoose.Types.ObjectId;
  status: AttendanceStatus;
  arrivalTime?: string;
  justification?: string;
}

export interface IAttendanceRecord extends Document {
  classroomId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  sessionNumber: number;
  topic?: string;
  records: IAttendanceItem[];
  registeredBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceItemSchema = new Schema<IAttendanceItem>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'JUSTIFIED'], default: 'PRESENT' },
    arrivalTime: { type: String, default: '' },
    justification: { type: String, default: '' },
  },
  { _id: false }
);

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    date: { type: String, required: true },
    sessionNumber: { type: Number, default: 1 },
    topic: { type: String, default: '' },
    records: { type: [AttendanceItemSchema], default: [] },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Unique session per classroom per date
AttendanceRecordSchema.index({ classroomId: 1, date: 1 }, { unique: true });

export const AttendanceRecord: Model<IAttendanceRecord> =
  mongoose.models.AttendanceRecord || mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
