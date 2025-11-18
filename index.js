const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const authRoutes = require('./routes/auth.router');
const platosRoutes = require('./routes/platos.router');
const pedidosRoutes = require('./routes/pedidos.router');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

app.use('/api/auth', authRoutes);
app.use('/api/platos', platosRoutes);
app.use('/api/pedidos', pedidosRoutes);

db.init().then(() => {
    app.listen(port, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
    });
}).catch(error => {
    console.error('❌ Fallo crítico al iniciar el servidor:', error);
    process.exit(1);
});
