import Producto from '../models/Producto.js';
import mongoose from 'mongoose';

export const getProductos = async (req, res) => {
  try {
    const productos = await Producto.find().populate('categoria');
    res.json({ state: true, data: productos });
  } catch (error) {
    res.status(500).json({ state: false, message: error.message });
  }
};

export const createProducto = async (req, res) => {
  try {
    const { nombre, precio, categoria } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ state: false, message: 'El campo "nombre" es obligatorio' });
    }
    if (precio === undefined || precio === null || isNaN(Number(precio))) {
      return res.status(400).json({ state: false, message: 'El campo "precio" es obligatorio y debe ser un número' });
    }
    if (!categoria) {
      return res.status(400).json({ state: false, message: 'El campo "categoria" (ID) es obligatorio' });
    }
    if (!mongoose.Types.ObjectId.isValid(categoria)) {
      return res.status(400).json({ state: false, message: 'El campo "categoria" no es un ID válido de MongoDB' });
    }

    const nuevoProducto = new Producto({ nombre: nombre.trim(), precio: Number(precio), categoria });
    await nuevoProducto.save();
    const populado = await nuevoProducto.populate('categoria');
    res.status(201).json({ state: true, data: populado });
  } catch (error) {
    res.status(400).json({ state: false, message: error.message });
  }
};