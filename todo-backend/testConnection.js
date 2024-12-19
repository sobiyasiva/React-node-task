const sequelize = require('./config/database.js'); // Adjust the path as needed

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  } finally {
    await sequelize.close(); // Close the connection after testing
  }
}

testConnection();
