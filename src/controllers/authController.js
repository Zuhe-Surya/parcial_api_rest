import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registrar = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({ username, password: hashedPassword });
    await nuevoUsuario.save();
    res.status(201).json({ state: true, message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ state: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const usuario = await Usuario.findOne({ username });
    if (!usuario) return res.status(400).json({ state: false, message: 'Usuario no encontrado' });

    const validPass = await bcrypt.compare(password, usuario.password);
    if (!validPass) return res.status(400).json({ state: false, message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: usuario._id, username: usuario.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ state: true, token });
  } catch (error) {
    res.status(500).json({ state: false, message: error.message });
  }
};