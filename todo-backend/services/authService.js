const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserDao = require('../dao/userDao');

const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

class AuthService {
  static async signup(email, password) {
    if (!email || !password) throw new Error('Email and password are required');

    const userExists = await UserDao.findUserByEmail(email);
    if (userExists) throw new Error('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserDao.createUser({ email, password: hashedPassword });

    if (!newUser) {
      throw new Error('User creation failed');
    }

    return {
      status: 'success',
      message: 'User created successfully',
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

      const token = this.generateAccessToken(user.id);
      if (!token) {
        throw new Error('Failed to generate access token');
      }
      const refreshToken = this.generateRefreshToken(user.id);
      if (!refreshToken) {
        throw new Error('Failed to generate refresh token');
      }
      return {
        status: 'success',
        message: 'Login successful',
        token,
        refreshToken,
        userId: user.id,
      };
    } catch (error) {
      throw new Error(`Error during login: ${error.message}`);
    }
  }

  static generateAccessToken(userId) {
    const payload = { userId, exp: Date.now() + 3600000 };
    const data = `${userId}.${payload.exp}`;
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    return `${userId}.${payload.exp}.${signature}`;
  }

  static generateRefreshToken(userId) {
    const payload = { userId, exp: Date.now() + 86400000 }; 
    const data = `${userId}.${payload.exp}`;
    const signature = crypto.createHmac('sha256', REFRESH_SECRET_KEY).update(data).digest('hex');
    return `${userId}.${payload.exp}.${signature}`;
  }

  static verifyToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token structure');
    
    const [userId, exp, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(`${userId}.${exp}`).digest('hex');
    if (expectedSignature !== signature) throw new Error('Invalid token');
    
    if (Date.now() > parseInt(exp)) {
      throw new Error('Token expired');
    }
    return { userId: parseInt(userId), exp: parseInt(exp) };
  }

  static verifyRefreshToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token structure');
    
    const [userId, exp, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', REFRESH_SECRET_KEY).update(`${userId}.${exp}`).digest('hex');
    if (expectedSignature !== signature) throw new Error('Invalid refresh token');
    
    if (Date.now() > parseInt(exp)) throw new Error('Refresh token expired');

    return { userId: parseInt(userId), exp: parseInt(exp) };
  }
  
}

module.exports = AuthService;
