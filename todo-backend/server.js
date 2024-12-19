const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database'); // Sequelize instance
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const crypto = require('crypto');

const app = express();

// Function to generate a secure token
const generateToken = () => {
  return crypto.randomBytes(64).toString('hex');
};
console.log(generateToken());

// Middleware for CORS
console.log('Initializing CORS middleware...');
app.use(
  cors({
    origin: 'http://localhost:3000', // Your React frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'userid'],
  })
);

console.log('Initializing JSON parser middleware...');
app.use(express.json()); // Middleware to parse JSON requests

// Routes
console.log('Registering routes...');
app.use('/api', authRoutes);
app.use('/api', taskRoutes);

// Sync the database and start the server
const PORT = 5000;
sequelize
  .sync({ alter: true }) // Sync models with the database; set `force: true` for development resets
  .then(() => {
    console.log('Database connected and synced successfully.');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
