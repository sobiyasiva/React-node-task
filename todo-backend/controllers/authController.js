const AuthService = require('../services/authService');

class AuthController {
  static async signup(req, res) {
    try {
      const { email, password } = req.body;
      const newUserResponse = await AuthService.signup(email, password);
      res.status(201).json(newUserResponse);
    } catch (error) {
      console.error('Signup Error:', error);
      res.status(500).json({ status: 'fail', message: error.message });
    }
  }
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const loginResponse = await AuthService.login(email, password);
      res.status(200).json(loginResponse);
    } catch (error) {
      res.status(500).json({ status: 'fail', message: error.message });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ status: 'fail', message: 'Refresh token is required' });
      }
      const { userId } = AuthService.verifyRefreshToken(refreshToken);
      const newToken = AuthService.generateAccessToken(userId);
      res.json({
        status: 'success',
        message: 'New access token generated',
        token: newToken,
      });
    } catch (error) {
      console.error('Refresh Token Error:', error);
      res.status(500).json({ status: 'fail', message: error.message });
    }
  }
}

module.exports = AuthController;
