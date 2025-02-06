const Task = require('../models/task');

class MainDAO {
  static async getTasks(userId, status) {
    try {
      const whereClause = { user_id: userId, deleteFlag: 0 }; 

      if (status !== 0) {
        whereClause.status = status;
      }
  
      console.log('DAO: Querying tasks with filter:', whereClause);
  
      const tasks = await Task.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
      });
  
      // tasks.forEach(task => {
      //   console.log(`Task ID: ${task.id}, Task Status: ${task.status === 0 ? 'In-progress' : task.status === 1 ? 'Completed' : 'Unknown'}`);
      // });
  
      return tasks;
    } catch (error) {
      console.error('DAO: Error fetching tasks:', error.message);
      throw new Error('Database error: ' + error.message);
    }
  }
  



  static async createTask(userId, taskName) {
    try {
      if (!userId || !taskName) throw new Error('User ID and Task Name are required');

      const newTask = await Task.create({
        user_id: userId,
        taskName,
        status: 0, 
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
      if (status !== undefined) updateData.status = parseInt(status);

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

      const [updatedRowCount] = await Task.update(
        { deleteFlag: true }, 
        {
          where: {
            id: taskId,
            user_id: userId,
            deleteFlag: false, 
          },
        }
      );
  
      if (updatedRowCount === 0) {
        console.error('Task not found or already deleted for taskId:', taskId);
        return null;
      }
  
      console.log('Task deleted successfully for taskId:', taskId);
      return true;
    } catch (error) {
      console.error('Error soft deleting task:', error.message, error.stack);
      throw new Error('Error soft deleting task from the database: ' + error.message);
    }
  }
  
  
}

module.exports = MainDAO;
