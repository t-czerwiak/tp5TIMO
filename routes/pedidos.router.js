const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Usuario autenticado puede crear pedido y ver su historial
router.post('/', authenticateToken, pedidosController.createPedido);
router.get('/usuario', authenticateToken, pedidosController.getPedidosByUser);

// Admin puede ver todos los pedidos y cambiar estados
router.get('/', authenticateToken, isAdmin, pedidosController.getPedidos);
router.get('/:id', authenticateToken, isAdmin, pedidosController.getPedidoById);
router.put('/:id/aceptar', authenticateToken, isAdmin, pedidosController.aceptarPedido);
router.put('/:id/comenzar', authenticateToken, isAdmin, pedidosController.comenzarPedido);
router.put('/:id/entregar', authenticateToken, isAdmin, pedidosController.entregarPedido);
router.put('/:id/cancelar', authenticateToken, isAdmin, pedidosController.cancelarPedido);
router.delete('/:id', authenticateToken, isAdmin, pedidosController.deletePedido);

module.exports = router;
