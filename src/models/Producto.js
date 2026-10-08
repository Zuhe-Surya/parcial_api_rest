import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  categoria: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Categoria', 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('Producto', productoSchema);