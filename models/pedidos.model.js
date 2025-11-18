module.exports = (sequelize, DataTypes) => {
  const Pedidos = sequelize.define('Pedidos', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id'
      }
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pendiente',
      validate: {
        isIn: [['pendiente', 'aceptado', 'en camino', 'entregado', 'cancelado']]
      }
    }
  }, {
    timestamps: false
  });

  return Pedidos;
};
