import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    const db = mongoose.connection.db;

    const productosDel = await db.collection('productos').deleteMany({});
    console.log(`🗑️  Productos eliminados: ${productosDel.deletedCount}`);

    const categoriasDel = await db.collection('categorias').deleteMany({});
    console.log(`🗑️  Categorias eliminadas: ${categoriasDel.deletedCount}`);

    console.log('✅ Colecciones vaciadas. Base de datos en estado predeterminado.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
