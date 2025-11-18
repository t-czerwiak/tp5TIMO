const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'burgertic_secret_key_2024';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user.admin) {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdmin
};
