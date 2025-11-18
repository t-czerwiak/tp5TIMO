const db = require('../db');

const getAllPlatos = async (req, res) => {
    try {
        const platos = await db.Platos.findAll({
            order: [['tipo', 'ASC'], ['precio', 'ASC']]
        });
        return res.status(200).json(platos);
    } catch (error) {
        console.error('Error al obtener platos:', error);
        return res.status(500).json({ error: 'Error al obtener platos.' });
    }
};

const getPlatoById = async (req, res) => {
    const { id } = req.params;

    try {
        const plato = await db.Platos.findByPk(id);
        
        if (!plato) {
            return res.status(404).json({ error: 'Plato no encontrado.' });
        }

        return res.status(200).json(plato);
    } catch (error) {
        console.error('Error al obtener plato:', error);
        return res.status(500).json({ error: 'Error al obtener el plato.' });
    }
};

const getPlatosByTipo = async (req, res) => {
    const { tipo } = req.params;

    const tiposValidos = ['principal', 'combo', 'postre'];
    if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo inválido. Debe ser: principal, combo o postre.' });
    }

    try {
        const platos = await db.Platos.findAll({
            where: { tipo },
            order: [['precio', 'ASC']]
        });

        return res.status(200).json(platos);
    } catch (error) {
        console.error('Error al obtener platos por tipo:', error);
        return res.status(500).json({ error: 'Error al obtener platos por tipo.' });
    }
};

// Solo admin puede crear plato
const createPlato = async (req, res) => {
    const { tipo, nombre, precio, descripcion } = req.body;

    if (!tipo || !nombre || !precio) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: tipo, nombre y precio.' });
    }

    const tiposValidos = ['principal', 'combo', 'postre'];
    if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo inválido. Debe ser: principal, combo o postre.' });
    }

    try {
        const nuevoPlato = await db.Platos.create({
            tipo,
            nombre,
            precio,
            descripcion
        });

        return res.status(201).json(nuevoPlato);
    } catch (error) {
        console.error('Error al crear plato:', error);
        return res.status(500).json({ error: 'Error al crear el plato.' });
    }
};

// Solo admin puede editar plato
const updatePlato = async (req, res) => {
    const { id } = req.params;
    const { tipo, nombre, precio, descripcion } = req.body;

    try {
        const plato = await db.Platos.findByPk(id);

        if (!plato) {
            return res.status(404).json({ error: 'Plato no encontrado.' });
        }

        if (tipo) {
            const tiposValidos = ['principal', 'combo', 'postre'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({ error: 'Tipo inválido. Debe ser: principal, combo o postre.' });
            }
            plato.tipo = tipo;
        }

        if (nombre) plato.nombre = nombre;
        if (precio) plato.precio = precio;
        if (descripcion !== undefined) plato.descripcion = descripcion;

        await plato.save();

        return res.status(200).json(plato);
    } catch (error) {
        console.error('Error al actualizar plato:', error);
        return res.status(500).json({ error: 'Error al actualizar el plato.' });
    }
};

// Solo admin puede eliminar plato
const deletePlato = async (req, res) => {
    const { id } = req.params;

    try {
        const plato = await db.Platos.findByPk(id);

        if (!plato) {
            return res.status(404).json({ error: 'Plato no encontrado.' });
        }

        await plato.destroy();

        return res.status(200).json({ message: 'Plato eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar plato:', error);
        return res.status(500).json({ error: 'Error al eliminar el plato.' });
    }
};

module.exports = {
    getAllPlatos,
    getPlatoById,
    getPlatosByTipo,
    createPlato,
    updatePlato,
    deletePlato
};
