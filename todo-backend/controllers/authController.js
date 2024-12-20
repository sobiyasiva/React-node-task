const AuthService = require('../services/authService');


class AuthController {
  static async signup(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Email and password are required' });
      }

      const newUserResponse = await AuthService.signup(email, password);

      res.status(201).json(newUserResponse); // { status, message, data }
    } catch (error) {
      console.error('Signup Error:', error);
      res.status(400).json({ status: 'fail', message: error.message });
    }
  }
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const loginResponse = await AuthService.login(email, password);

      // Return the structured response
      res.json(loginResponse);  // sends { status, message, token, userId }
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ status: 'fail', message: error.message });
    }
  }
}

module.exports = AuthController;
