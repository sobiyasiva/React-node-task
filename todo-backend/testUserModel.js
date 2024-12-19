const sequelize = require('./config/database'); // Path to your database config file
const { DataTypes } = require('sequelize');
const User = require('./models/user')(sequelize, DataTypes);

(async () => {
  try {
    await sequelize.authenticate(); // Check the database connection
    console.log('Connection has been established successfully.');
    console.log('User Model:', User);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close(); // Close the connection after the test
  }
})();
