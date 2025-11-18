const { Sequelize, DataTypes } = require('sequelize');
const PlatosModel = require('./models/platos.model');
const UsuariosModel = require('./models/usuarios.model');
const PedidosModel = require('./models/pedidos.model');
const PlatosXPedidosModel = require('./models/platosxpedidos.model');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Platos = PlatosModel(sequelize, DataTypes);
db.Usuarios = UsuariosModel(sequelize, DataTypes);
db.Pedidos = PedidosModel(sequelize, DataTypes);
db.PlatosXPedidos = PlatosXPedidosModel(sequelize, DataTypes);

// Asociaciones
db.Pedidos.belongsTo(db.Usuarios, { foreignKey: 'id_usuario', as: 'usuario' });
db.Usuarios.hasMany(db.Pedidos, { foreignKey: 'id_usuario', as: 'pedidos' });

db.PlatosXPedidos.belongsTo(db.Pedidos, { foreignKey: 'id_pedido', as: 'pedido' });
db.PlatosXPedidos.belongsTo(db.Platos, { foreignKey: 'id_plato', as: 'plato' });

db.Pedidos.hasMany(db.PlatosXPedidos, { foreignKey: 'id_pedido', as: 'platos' });
db.Platos.hasMany(db.PlatosXPedidos, { foreignKey: 'id_plato' });

db.init = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la DB establecida exitosamente.');
    await db.sequelize.sync({ force: false });
    console.log('✅ Tablas sincronizadas.');

    const count = await db.Platos.count();
    if (count === 0) {
      console.log('🍔 Inicializando menú de BurgerTIC...');
      await db.Platos.bulkCreate([
        { tipo: 'principal', nombre: 'Hamburguesa Clásica', descripcion: 'Hamburguesa de carne con lechuga, tomate y queso', precio: 300 },
        { tipo: 'principal', nombre: 'Hamburguesa Doble', descripcion: 'Doble carne, doble queso, lechuga, tomate y cebolla', precio: 450 },
        { tipo: 'principal', nombre: 'Hamburguesa Bacon', descripcion: 'Hamburguesa con bacon crocante, queso cheddar y salsa BBQ', precio: 400 },
        { tipo: 'combo', nombre: 'Combo BurgerTIC', descripcion: 'Hamburguesa Clásica + Papas Fritas Medianas + Gaseosa 500ml', precio: 500 },
        { tipo: 'combo', nombre: 'Combo Doble', descripcion: 'Hamburguesa Doble + Papas + Gaseosa', precio: 650 },
        { tipo: 'postre', nombre: 'Helado', descripcion: 'Helado de vainilla con salsa de chocolate', precio: 150 },
        { tipo: 'postre', nombre: 'Brownie', descripcion: 'Brownie de chocolate caliente con helado', precio: 200 }
      ]);
      console.log('✅ Menú inicializado.');
    }

  } catch (error) {
    console.error('❌ Error al conectar o inicializar la DB:', error);
    throw error;
  }
};

module.exports = db;