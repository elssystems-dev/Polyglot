import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClassroom extends Document {
  code: string;
  name: string;
  courseId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  capacity: number;
  semester: string;
  scheduleDays: string[]; // e.g. ['SEG', 'QUA']
  startTime: string; // e.g. '19:00'
  endTime: string; // e.g. '20:30'
  room: string; // e.g. 'Sala 04 - Ala Oeste'
  startDate?: string;
  endDate?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const ClassroomSchema = new Schema<IClassroom>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    capacity: { type: Number, required: true, default: 18, min: 1, max: 50 },
    semester: { type: String, required: true, default: '2025.1' },
    scheduleDays: { type: [String], default: ['SEG', 'QUA'] },
    startTime: { type: String, default: '19:00' },
    endTime: { type: String, default: '20:30' },
    room: { type: String, default: 'Sala 01' },
    startDate: { type: String, default: '2025-03-03' },
    endDate: { type: String, default: '2025-06-30' },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' },
  },
  { timestamps: true }
);

export const Classroom: Model<IClassroom> = 
  mongoose.models.Classroom || mongoose.model<IClassroom>('Classroom', ClassroomSchema);
