const AuthController = require('../controllers/authController');

module.exports = (router) => {
  router.post('/signup', AuthController.signup);
  router.post('/login', AuthController.login);
  router.post('/refresh-token', AuthController.refreshToken);
};
