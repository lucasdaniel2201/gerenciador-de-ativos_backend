import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

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
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  }
});

// Relacionamentos
User.hasMany(Asset, { foreignKey: 'userId', as: 'assets' });
Asset.belongsTo(User, { foreignKey: 'userId' });

export default Asset;
