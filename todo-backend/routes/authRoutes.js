const express = require('express');
const AuthController = require('../controllers/authController'); // Correct import for the AuthController
const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
// router.post('/todos',AuthController.todo);

module.exports = router;
