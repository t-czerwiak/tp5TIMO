const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usuariosService = require('../services/usuarios.service');

const JWT_SECRET = process.env.JWT_SECRET || 'burgertic_secret_key_2024';

const register = async (req, res) => {
    const { nombre, apellido, email, password } = req.body;

    console.log('📝 Intento de registro:', { nombre, apellido, email }); // Debug

    if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, apellido, email y password.' });
    }

    try {
        const newUser = await usuariosService.registerUser(nombre, apellido, email, password);
        const token = jwt.sign({ id: newUser.id, admin: newUser.admin }, JWT_SECRET, { expiresIn: '30m' });

        console.log('✅ Usuario registrado exitosamente:', newUser.email); // Debug

        return res.status(201).json({
            message: 'Registro exitoso.',
            user: newUser,
            token: token
        });
    } catch (error) {
        console.error('❌ Error en registro:', error); // Debug mejorado
        if (error.message === 'El email ya está registrado.') {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Error interno del servidor: ' + error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: email y password.' });
    }

    try {
        const user = await usuariosService.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const tokenPayload = { id: user.id, admin: user.admin };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30m' });

        delete user.password;

        return res.status(200).json({
            message: 'Login exitoso.',
            user: user,
            token: token
        });

    } catch (error) {
        console.error('Error durante el login:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = {
    register,
    login,
};
