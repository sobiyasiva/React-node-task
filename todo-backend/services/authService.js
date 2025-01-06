const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserDao = require('../dao/userDao');

const SECRET_KEY = "a3f5c1eaa2834c1f92f0568abed83b4b9f0fcd8a7e5cbfed4fbd01dc5762c8ab"; 
const REFRESH_SECRET_KEY = "e0a6c4bbd2484d92bba204a9057cb8c9c8d379a9e8367e2f9fa36b2b2467da9c"; 

class AuthService {
  static async signup(email, password) {
    if (!email || !password) throw new Error('Email and password are required');

    const userExists = await UserDao.findUserByEmail(email);
    if (userExists) throw new Error('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserDao.createUser({ email, password: hashedPassword });

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
      const refreshToken = this.generateRefreshToken(user.id);

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
    
    if (Date.now() > parseInt(exp, 10)) {
      throw new Error('Token expired');
    }

    return { userId: parseInt(userId, 10), exp: parseInt(exp, 10) };
  }

  static verifyRefreshToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token structure');
    
    const [userId, exp, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', REFRESH_SECRET_KEY).update(`${userId}.${exp}`).digest('hex');
    if (expectedSignature !== signature) throw new Error('Invalid refresh token');
    
    if (Date.now() > parseInt(exp, 10)) throw new Error('Refresh token expired');

    return { userId: parseInt(userId, 10), exp: parseInt(exp, 10) };
  }
  
}

module.exports = AuthService;
