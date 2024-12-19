const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // For secure token generation
const UserDao = require('../dao/userDao');

const SECRET_KEY = "a3f5c1eaa2834c1f92f0568abed83b4b9f0fcd8a7e5cbfed4fbd01dc5762c8ab"; // Replace with a secure key

class AuthService {
  static async signup(email, password) {
    if (!email || !password) throw new Error('Email and password are required');

    const userExists = await UserDao.findUserByEmail(email);
    if (userExists) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserDao.createUser({ email, password: hashedPassword });

    // Generate a secure token
    const token = this.generateToken(newUser.id);

    return {
      status: 'success',
      message: 'User created successfully',
      token,
      userId: newUser.id,
    };
  }

  static async login(email, password) {
    try {
      const user = await UserDao.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new Error('Incorrect password');
      }

      // Generate a secure token
      const token = this.generateToken(user.id);

      return {
        status: 'success',
        message: 'Login successful',
        token,
        userId: user.id,
      };
    } catch (error) {
      throw new Error(`Error during login: ${error.message}`);
    }
  }

  // Generate a secure token with userId and expiration
  static generateToken(userId) {
    const payload = {
      userId,
      exp: Date.now() + 3600000, // 1-hour expiration in milliseconds
    };

    // Create a unique signature for the token
    const data = `${userId}.${payload.exp}`;
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');

    // Return token in a simple format
    return `${userId}.${payload.exp}.${signature}`;
  }

  // Helper function to verify the token
  static verifyToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token structure');
    }

    const [userId, exp, signature] = parts;

    // Recreate the signature
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(`${userId}.${exp}`).digest('hex');
    if (expectedSignature !== signature) {
      throw new Error('Invalid token');
    }

    // Check expiration
    if (Date.now() > parseInt(exp, 10)) {
      throw new Error('Token expired');
    }

    return { userId: parseInt(userId, 10), exp: parseInt(exp, 10) };
  }
}

module.exports = AuthService;
