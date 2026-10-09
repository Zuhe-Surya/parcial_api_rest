import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    const db = mongoose.connection.db;

    const personasDel = await db.collection('personas').deleteMany({});
    console.log(`🗑️  Personas eliminadas: ${personasDel.deletedCount}`);

    console.log('✅ Colección vaciada. Base de datos lista para un nuevo árbol familiar.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
