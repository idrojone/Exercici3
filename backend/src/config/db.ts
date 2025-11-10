import mongoose from 'mongoose';

export async function connectDB(uri: string) {
  if (!uri) throw new Error('Missing MONGO_URI');
  return mongoose.connect(uri, {}).then(() => {
    console.log('Conectado a mongo');
  });
}

export default connectDB;
