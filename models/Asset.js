const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Importa o modelo User

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  serialNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  responsible: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assignmentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  condition: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Chave estrangeira para o usuário que possui o ativo
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User, // Referencia o modelo User
      key: 'id',
    },
    allowNull: false,
  }
});

// Define o relacionamento: Um Usuário tem muitos Ativos
User.hasMany(Asset, { foreignKey: 'userId', as: 'assets' });
Asset.belongsTo(User, { foreignKey: 'userId' });

module.exports = Asset;