const express = require('express');
const cors = require('cors');
// const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const app = express();

console.log('Initializing CORS middleware...');
app.use(
  cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'userid'],
  })
);
console.log('Initializing JSON parser middleware...');
app.use(express.json()); 
console.log('Registering routes...');
app.use('/api/user', authRoutes);
app.use('/api/task', taskRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
