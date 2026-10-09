import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_URL;

    if (!mongoUri) {
      console.warn('No hay una URI de MongoDB configurada. La API continuará en modo memoria para pruebas locales.');
      return false;
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Atlas conectado correctamente');
    return true;
  } catch (error) {
    console.warn('No se pudo conectar a MongoDB. La API continuará en modo memoria:', error.message);
    return false;
  }
};