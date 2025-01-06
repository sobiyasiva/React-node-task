const MainController = require('../controllers/MainController');
const express = require('express');
const router = express.Router();

router.post('/tasks', MainController.authenticateUser, MainController.createTask);
router.get('/tasks', MainController.authenticateUser, MainController.getTasks);
router.put('/tasks/:taskId', MainController.authenticateUser, MainController.updateTask);
router.delete('/tasks/:taskId', MainController.authenticateUser, MainController.deleteTask);
module.exports = router;
