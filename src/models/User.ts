import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'COORDINATOR' | 'TEACHER';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  title?: string; // e.g. "Profª Doutora em Linguística" or "Coord. Pedagógica"
  specialties?: string[];
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['COORDINATOR', 'TEACHER'], required: true, default: 'TEACHER' },
    title: { type: String, default: 'Professor(a)' },
    specialties: { type: [String], default: [] },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
