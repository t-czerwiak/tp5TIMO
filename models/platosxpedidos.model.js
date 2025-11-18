module.exports = (sequelize, DataTypes) => {
  const PlatosXPedidos = sequelize.define('PlatosXPedidos', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Pedidos',
        key: 'id'
      }
    },
    id_plato: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Platos',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    }
  }, {
    timestamps: false
  });

  return PlatosXPedidos;
};
