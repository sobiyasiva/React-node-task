const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserDao = require('../dao/userDao');

class AuthService {
  static async signup(email, password) {
    try {
      // Check if user already exists
      const userExists = await UserDao.findUserByEmail(email);
      if (userExists) {
        throw new Error('User already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user in the database
      const newUser = await UserDao.createUser({ email, password: hashedPassword });

      // Return a structured response with status and message
      return {
        status: 'success',
        message: 'User created successfully',
        data: newUser
      };
    } catch (error) {
      // Handle errors and return structured error response
      throw new Error(`Error during signup: ${error.message}`);
    }
  }

  static async login(email, password) {
    try {
      // Find user by email
      const user = await UserDao.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new Error('Incorrect password');
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: user.id }, 'secretKey', { expiresIn: '1h' });

      // Return structured response
      return {
        status: 'success',
        message: 'Login successful',
        token,
        userId: user.id
      };
    } catch (error) {
      // Handle errors and return structured error response
      throw new Error(`Error during login: ${error.message}`);
    }
  }
}

module.exports = AuthService;
