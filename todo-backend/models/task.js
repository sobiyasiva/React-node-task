
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Task = sequelize.define('Tasks', {

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
          model: 'User',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      deleteFlag: {
        type: DataTypes.INTEGER,
        default: 0,
      }
    },
    {
      sequelize,
      timestamps: true,   
    }
  );

  module.exports = Task;
















