
const Task = require('../models/task'); 
class MainDAO {
  static async getTasks(userId, status = 'all') {
    try {
      console.log('Fetching tasks for user:', userId, 'with status:', status);

      const whereClause = { user_id: userId }; 
      if (status !== 'all') {
        whereClause.status = status; 
      }

      const tasks = await Task.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']], 
      });

      return tasks; 
    } catch (error) {
      console.error('Error fetching tasks:', error.message, error.stack);
      throw new Error('Error fetching tasks from database: ' + error.message);
    }
  }

  static async createTask(userId, taskName) {
    try {
      if (!userId || !taskName) throw new Error('User ID and Task Name are required');

      const newTask = await Task.create({
        user_id: userId,
        taskName,
        status: 'In-progress',
      });

      console.log('Task created successfully:', newTask);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error.message, error.stack);
      throw new Error('Error creating task in the database: ' + error.message);
    }
  }

  static async updateTask(userId, taskId, taskName, status) {
    try {
      console.log('Updating task for user:', userId, 'Task ID:', taskId, 'Task Name:', taskName, 'Status:', status);

      const updateData = { taskName }; 
      if (status) updateData.status = status;

      const [updatedRowCount] = await Task.update(updateData, {
        where: {
          id: taskId,
          user_id: userId,
        },
      });

      if (updatedRowCount === 0) {
        console.error('Task not found or update failed for taskId:', taskId);
        return null;
      }

      const updatedTask = await Task.findByPk(taskId); 
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error.message, error.stack);
      throw new Error('Error updating task in the database: ' + error.message);
    }
  }

  static async deleteTask(userId, taskId) {
    try {
      console.log(`Attempting to delete task for user ID: ${userId}, Task ID: ${taskId}`);

      const deletedRowCount = await Task.destroy({
        where: {
          id: taskId,
          user_id: userId,
        },
      });

      if (deletedRowCount === 0) {
        console.error('Task not found or user lacks permission for taskId:', taskId);
        return null;
      }

      console.log('Task deleted successfully for taskId:', taskId);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error.message, error.stack);
      throw new Error('Error deleting task from the database: ' + error.message);
    }
  }
}

module.exports = MainDAO;
