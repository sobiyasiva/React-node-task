const express = require('express');
const cors = require('cors');

const app = express();
const router = express.Router(); 

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
require('./routes/authRoutes')(router); 
require('./routes/taskRoutes')(router); 

app.use('/api/user', router); 
app.use('/api/task', router); 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
