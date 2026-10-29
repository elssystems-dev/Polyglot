import mongoose, { Schema, Document, Model } from 'mongoose';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type LanguageType = 'Inglês' | 'Espanhol' | 'Francês' | 'Alemão' | 'Italiano' | 'Outro';

export interface ICourse extends Document {
  code: string;
  name: string;
  language: LanguageType;
  cefrLevel: CEFRLevel;
  workloadHours: number;
  material?: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    language: { 
      type: String, 
      enum: ['Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano', 'Outro'], 
      required: true,
      default: 'Inglês'
    },
    cefrLevel: { 
      type: String, 
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], 
      required: true,
      default: 'A1'
    },
    workloadHours: { type: Number, required: true, default: 60 },
    material: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
