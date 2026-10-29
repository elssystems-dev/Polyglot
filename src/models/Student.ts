import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudent extends Document {
  registration: string; // e.g. "2025-ENG-089"
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    registration: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    cpf: { type: String, default: '' },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const Student: Model<IStudent> = 
  mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
