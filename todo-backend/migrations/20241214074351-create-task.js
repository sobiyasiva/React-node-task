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
          allowNull: false, // Ensuring that task name cannot be null
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false, // Ensuring that task status cannot be null
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW // Ensure the timestamp is automatically set
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW // Ensure the timestamp is automatically set
        },
        // Adding the user_id column
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,  // Assuming that every task must have an associated user
          references: {
            model: 'users', // Assuming your users table is called 'users'
            key: 'id',      // The primary key of the users table
          },
          onUpdate: 'CASCADE',  // Update tasks if user ID is updated
          onDelete: 'CASCADE',  // Delete tasks if user is deleted
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
