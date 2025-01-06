const User = require('../models/user'); 

class UserDao {
  static async createUser(data) {
    return await User.create(data);
  }

  static async findUserByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  static async findUserById(id) {
    return await User.findByPk(id);
  }
}

module.exports = UserDao;
