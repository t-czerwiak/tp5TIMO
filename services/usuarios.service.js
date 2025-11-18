const db = require('../db');
const bcrypt = require('bcryptjs');

const registerUser = async (nombre, apellido, email, password) => {
    try {
        const existingUser = await db.Usuarios.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('El email ya está registrado.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.Usuarios.create({
            nombre,
            apellido,
            email,
            password: hashedPassword,
            admin: false
        });

        const user = newUser.toJSON();
        delete user.password;
        return user;
    } catch (error) {
        console.error('Error en registerUser service:', error);
        throw error;
    }
};

const findUserByEmail = async (email) => {
    const user = await db.Usuarios.findOne({ where: { email } });
    return user ? user.toJSON() : null;
};

module.exports = {
    registerUser,
    findUserByEmail,
};
