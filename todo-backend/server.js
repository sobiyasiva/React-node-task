const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
// const todoRoutes = require('./routes/todoRoutes');
const crypto = require('crypto');
const app = express();
// Middleware for CORS
app.use(cors({
    origin: 'http://localhost:3000', // Your React frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'userid'],
  }));
  
app.use(express.json()); // Middleware to parse JSON requests

// Routes
app.use('/api', authRoutes);
// app.use('/api/todos', todoRoutes);

// Set up the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
