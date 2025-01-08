
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const Task = sequelize.define('Task', {

      taskName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Task',
      tableName: 'tasks', 
      timestamps: true,   
    }
  );

  module.exports = Task;
















