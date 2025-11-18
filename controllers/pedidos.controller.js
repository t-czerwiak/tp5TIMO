const PedidosService = require("../services/pedidos.service.js");

// Admin puede ver todos los pedidos
const getPedidos = async (req, res) => {
    try {
        const pedidos = await PedidosService.getAllPedidos();
        return res.status(200).json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        return res.status(500).json({ message: 'Error al obtener todos los pedidos.' });
    }
};

// Usuario autenticado puede ver su historial (incluye pedidos confirmados)
const getPedidosByUser = async (req, res) => {
    const usuarioId = req.user.id;

    try {
        const pedidos = await PedidosService.getPedidosByUsuario(usuarioId);
        return res.status(200).json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        return res.status(500).json({ message: 'Error al obtener pedidos del usuario.' });
    }
};

// Admin puede ver pedido por id
const getPedidoById = async (req, res) => {
    const { id } = req.params;

    try {
        const pedido = await PedidosService.getPedidoById(id);
        
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        return res.status(200).json(pedido);
    } catch (error) {
        console.error('Error al obtener pedido por id:', error);
        return res.status(500).json({ message: 'Error al obtener el pedido.' });
    }
};

// Usuario autenticado puede crear pedido
const createPedido = async (req, res) => {
    const { platos } = req.body;
    const usuarioId = req.user.id;

    if (!platos || !Array.isArray(platos) || platos.length === 0) {
        return res.status(400).json({ message: 'Debe incluir al menos un plato en el pedido.' });
    }

    try {
        const nuevoPedido = await PedidosService.createPedido(usuarioId, platos);
        return res.status(201).json(nuevoPedido);
    } catch (error) {
        console.error('Error al crear pedido:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Admin puede confirmar pedido (cambiar estado a "aceptado")
const aceptarPedido = async (req, res) => {
    const { id } = req.params;

    try {
        const pedido = await PedidosService.getPedidoById(id);
        
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        if (pedido.estado !== 'pendiente') {
            return res.status(400).json({ message: 'El pedido no está en estado pendiente.' });
        }

        const pedidoActualizado = await PedidosService.updateEstadoPedido(id, 'aceptado');
        return res.status(200).json(pedidoActualizado);
    } catch (error) {
        console.error('Error al aceptar pedido:', error);
        return res.status(500).json({ message: 'Error al aceptar el pedido.' });
    }
};

// Admin puede cambiar estado a "en camino"
const comenzarPedido = async (req, res) => {
    const { id } = req.params;

    try {
        const pedido = await PedidosService.getPedidoById(id);
        
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        if (pedido.estado !== 'aceptado') {
            return res.status(400).json({ message: 'El pedido no está en estado aceptado.' });
        }

        const pedidoActualizado = await PedidosService.updateEstadoPedido(id, 'en camino');
        return res.status(200).json(pedidoActualizado);
    } catch (error) {
        console.error('Error al comenzar pedido:', error);
        return res.status(500).json({ message: 'Error al comenzar el pedido.' });
    }
};

// Admin puede cambiar estado a "entregado"
const entregarPedido = async (req, res) => {
    const { id } = req.params;

    try {
        const pedido = await PedidosService.getPedidoById(id);
        
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        if (pedido.estado !== 'en camino') {
            return res.status(400).json({ message: 'El pedido no está en camino.' });
        }

        const pedidoActualizado = await PedidosService.updateEstadoPedido(id, 'entregado');
        return res.status(200).json(pedidoActualizado);
    } catch (error) {
        console.error('Error al entregar pedido:', error);
        return res.status(500).json({ message: 'Error al entregar el pedido.' });
    }
};

// Admin puede cancelar pedido (cambiar estado a "cancelado")
const cancelarPedido = async (req, res) => {
    const { id } = req.params;

    try {
        const pedido = await PedidosService.getPedidoById(id);

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        if (pedido.estado === 'cancelado') {
            return res.status(400).json({ message: 'El pedido ya está cancelado.' });
        }

        const pedidoActualizado = await PedidosService.updateEstadoPedido(id, 'cancelado');
        return res.status(200).json(pedidoActualizado);
    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        return res.status(500).json({ message: 'Error al cancelar el pedido.' });
    }
};

// Admin puede eliminar pedido
const deletePedido = async (req, res) => {
    const { id } = req.params;

    try {
        const pedido = await PedidosService.getPedidoById(id);
        
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        await PedidosService.deletePedido(id);
        return res.status(200).json({ message: 'Pedido eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        return res.status(500).json({ message: 'Error al eliminar el pedido.' });
    }
};

module.exports = {
    getPedidos,
    getPedidosByUser,
    getPedidoById,
    createPedido,
    aceptarPedido,
    comenzarPedido,
    entregarPedido,
    cancelarPedido,
    deletePedido,
};
