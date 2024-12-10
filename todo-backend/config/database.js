const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  'todo_db', // Database name
  'root',    // Username
  'sobi@123', // Password
  {
    host: '127.0.0.1', // Corrected to a string
    port: 3307,        // Correct custom port
    dialect: 'mariadb', // Corrected to a string
    dialectOptions: {
      allowPublicKeyRetrieval: true, // Optional but sometimes required for MariaDB
      ssl: false,                   // Ensure SSL is not enforced
    },
  }
);

module.exports = sequelize;
