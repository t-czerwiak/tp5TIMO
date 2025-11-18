module.exports = (sequelize, DataTypes) => {
  const Platos = sequelize.define("Platos", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [["principal", "combo", "postre"]],
      },
    },
    nombre: {
      type: DataTypes.STRING(70),
      allowNull: false,
    },
    precio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(400),
      allowNull: true,
    },
  }, {
    timestamps: false,
  });

  return Platos;
};