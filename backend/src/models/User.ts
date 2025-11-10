import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  lastSeen?: Date;
  online?: boolean;
}

const UserSchema: Schema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  lastSeen: { type: Date },
  online: { type: Boolean, default: false },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
