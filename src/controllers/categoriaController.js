import Categoria from '../models/Categoria.js';

export const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json({ state: true, data: categorias });
  } catch (error) {
    res.status(500).json({ state: false, message: error.message });
  }
};

export const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ state: false, message: 'El campo "nombre" es obligatorio' });
    }

    const nuevaCategoria = new Categoria({ nombre: nombre.trim(), descripcion });
    await nuevaCategoria.save();
    res.status(201).json({ state: true, data: nuevaCategoria });
  } catch (error) {
    // Error de duplicado (nombre unique)
    if (error.code === 11000) {
      return res.status(409).json({ state: false, message: 'Ya existe una categoría con ese nombre' });
    }
    res.status(400).json({ state: false, message: error.message });
  }
};