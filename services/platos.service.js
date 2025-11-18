const db = require('../db');

const getAllPlatos = async () => {
    const platos = await db.Platos.findAll({
        where: { activo: true }
    });
    return platos.map(p => p.toJSON());
};

const getPlatoById = async (id) => {
    const plato = await db.Platos.findByPk(id);
    return plato ? plato.toJSON() : null;
};

module.exports = {
    getAllPlatos,
    getPlatoById
};