'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('Starting the creation of the Tasks table...');

      await queryInterface.createTable('Tasks', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        taskName: {
          type: Sequelize.STRING,
          allowNull: false, 
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false, 
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW 
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW 
        },
        
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,  
          references: {
            model: 'Users', 
            key: 'id',      
          },
          onUpdate: 'CASCADE', 
          onDelete: 'CASCADE',  
        }
      });

      console.log('Tasks table created successfully');
    } catch (error) {
      console.error('Error creating Tasks table:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('Starting the deletion of the Tasks table...');

      await queryInterface.dropTable('Tasks');

      console.log('Tasks table deleted successfully');
    } catch (error) {
      console.error('Error deleting Tasks table:', error);
    }
  }
};
