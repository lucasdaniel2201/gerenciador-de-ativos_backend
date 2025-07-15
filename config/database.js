require('dotenv').config();


const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'sqlite',
  logging: false,
  storage: './database.sqlite'
});

module.exports = sequelize;