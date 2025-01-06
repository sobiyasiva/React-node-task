const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(
  'todo_db', 
  'root',   
  'sobi@123', 
  {
    host: '127.0.0.1', 
    port: 3307,        
    dialect: 'mariadb', 

  }
);

module.exports = sequelize;
