import mongoose from 'mongoose';

const personaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  apellido: {
    type: String,
    required: true,
    trim: true,
  },
  genero: {
    type: String,
    enum: ['Masculino', 'Femenino', 'Otro'],
    default: 'Otro',
  },
  fechaNacimiento: {
    type: Date,
    default: null,
  },
  padre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Persona',
    default: null,
  },
  madre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Persona',
    default: null,
  },
  observaciones: {
    type: String,
    default: '',
  },
}, { timestamps: true });

personaSchema.virtual('nombreCompleto').get(function () {
  return `${this.nombre} ${this.apellido}`.trim();
});

personaSchema.set('toJSON', { virtuals: true, versionKey: false });
personaSchema.set('toObject', { virtuals: true, versionKey: false });

export default mongoose.model('Persona', personaSchema);
