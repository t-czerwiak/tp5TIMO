const express = require('express');
const router = express.Router();
const platosController = require('../controllers/platos.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/', platosController.getAllPlatos);
router.get('/tipo/:tipo', platosController.getPlatosByTipo);
router.get('/:id', platosController.getPlatoById);

// Rutas solo para admin
router.post('/', authenticateToken, isAdmin, platosController.createPlato);
router.put('/:id', authenticateToken, isAdmin, platosController.updatePlato);
router.delete('/:id', authenticateToken, isAdmin, platosController.deletePlato);

module.exports = router;
