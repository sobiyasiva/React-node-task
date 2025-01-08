const MainController = require('../controllers/MainController');
const express = require('express');
const router = express.Router();

router.post('/addtasks', MainController.authenticateUser, MainController.createTask);
router.get('/gettasks', MainController.authenticateUser, MainController.getTasks);
router.put('/updatetasks/:taskId', MainController.authenticateUser, MainController.updateTask);
router.delete('/deletetasks/:taskId', MainController.authenticateUser, MainController.deleteTask);
module.exports = router;
