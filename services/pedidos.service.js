const db = require('../db');

const createPedido = async (usuarioId, platos) => {
    // Verificar que el usuario existe
    const usuario = await db.Usuarios.findByPk(usuarioId);
    if (!usuario) {
        throw new Error('Usuario no encontrado.');
    }

    // Crear el pedido
    const nuevoPedido = await db.Pedidos.create({
        id_usuario: usuarioId,
        fecha: new Date().toISOString().split('T')[0],
        estado: 'pendiente'
    });

    // Crear las relaciones en PlatosXPedidos
    for (const item of platos) {
        const plato = await db.Platos.findByPk(item.id);
        if (!plato) {
            throw new Error(`Plato con ID ${item.id} no encontrado.`);
        }

        await db.PlatosXPedidos.create({
            id_pedido: nuevoPedido.id,
            id_plato: item.id,
            cantidad: item.cantidad
        });
    }

    // Obtener el pedido completo con sus platos
    return await getPedidoById(nuevoPedido.id);
};

const getAllPedidos = async () => {
    const pedidos = await db.Pedidos.findAll({
        include: [
            {
                model: db.Usuarios,
                as: 'usuario',
                attributes: ['id', 'nombre', 'apellido', 'email']
            },
            {
                model: db.PlatosXPedidos,
                as: 'platos',
                include: [{
                    model: db.Platos,
                    as: 'plato'
                }]
            }
        ],
        order: [['id', 'DESC']]
    });

    return pedidos.map(p => formatPedido(p.toJSON()));
};

const getPedidosByUsuario = async (usuarioId) => {
    const pedidos = await db.Pedidos.findAll({
        where: { id_usuario: usuarioId },
        include: [{
            model: db.PlatosXPedidos,
            as: 'platos',
            include: [{
                model: db.Platos,
                as: 'plato'
            }]
        }],
        order: [['id', 'DESC']]
    });

    return pedidos.map(p => formatPedido(p.toJSON()));
};

const getPedidoById = async (id) => {
    const pedido = await db.Pedidos.findByPk(id, {
        include: [
            {
                model: db.Usuarios,
                as: 'usuario',
                attributes: ['id', 'nombre', 'apellido', 'email']
            },
            {
                model: db.PlatosXPedidos,
                as: 'platos',
                include: [{
                    model: db.Platos,
                    as: 'plato'
                }]
            }
        ]
    });

    return pedido ? formatPedido(pedido.toJSON()) : null;
};

const updateEstadoPedido = async (id, nuevoEstado) => {
    const pedido = await db.Pedidos.findByPk(id);
    if (!pedido) {
        throw new Error('Pedido no encontrado');
    }

    pedido.estado = nuevoEstado;
    await pedido.save();

    return await getPedidoById(id);
};

const deletePedido = async (id) => {
    const pedido = await db.Pedidos.findByPk(id);
    if (!pedido) {
        throw new Error('Pedido no encontrado');
    }

    await db.PlatosXPedidos.destroy({ where: { id_pedido: id } });
    await pedido.destroy();
    return true;
};

// Función helper para formatear el pedido según la consigna
function formatPedido(pedido) {
    return {
        id: pedido.id,
        id_usuario: pedido.id_usuario,
        fecha: pedido.fecha,
        estado: pedido.estado,
        platos: pedido.platos ? pedido.platos.map(p => ({
            id: p.plato.id,
            cantidad: p.cantidad
        })) : []
    };
}

module.exports = {
    createPedido,
    getAllPedidos,
    getPedidosByUsuario,
    getPedidoById,
    updateEstadoPedido,
    deletePedido
};
