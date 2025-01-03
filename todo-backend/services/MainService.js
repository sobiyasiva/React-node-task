const MainDAO = require('../dao/MainDAO');
const AuthService = require('./authService'); // Import AuthService for token verification
const db = require('../config/database');
class MainService {
  // static async getUserByUsername(username) {
  //   if (!username) {
  //     throw new Error('Username is required');
  //   }
  //   return await MainDAO.getUserByUsername(username);
  // }
// In MainService
// In MainService
static async getTasks(userId, status = 'all') {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch tasks');
    }

    let tasks;
    // Fetch tasks based on status
    tasks = await MainDAO.getTasks(userId, status);

    console.log('Tasks fetched from DAO:', tasks);  // Log to see the result

    return tasks;
  } catch (error) {
    console.error('Error in service while fetching tasks:', error.message, error.stack);
    throw new Error('Error fetching tasks: ' + error.message);
  }
}

  static async createTask(userId, taskName, authorizationHeader) {
    try {
      console.log('Creating task for user:', userId, 'Task Name:', taskName);

      // Extract and verify the token
      const token = MainService.extractToken(authorizationHeader);
      const payload = AuthService.verifyToken(token);

      if (payload.userId !== userId) {
        console.error('Token user ID mismatch:', payload.userId, '!=', userId);
        throw new Error('Invalid user ID in token');
      }

      console.log('Verified user ID from token:', payload.userId);

      const newTask = await MainDAO.createTask(userId, taskName); // Pass userId and taskName
      console.log('Task created successfully:', newTask);

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error.message, error.stack);
      throw new Error('Error creating task: ' + error.message);
    }
  }

  // Helper function to extract the token from the Authorization header
  static extractToken(authorizationHeader) {
    if (!authorizationHeader) {
      throw new Error('Authorization header is missing');
    }

    const parts = authorizationHeader.split(' '); 
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.error('Invalid Authorization header format:', authorizationHeader);
      throw new Error('Invalid Authorization header format');
    }

    return parts[1]; 
  }
  

  static async updateTask(userId, taskId, taskName, status) {
    try {
      console.log('Updating task for user:', userId, 'Task ID:', taskId, 'Task Name:', taskName, 'Status:', status);
  
      // Ensure valid parameters
      if (!taskName || !userId || !taskId) {
        throw new Error('Missing required parameters: userId, taskId, and taskName are mandatory');
      }
  
      // Call DAO to perform the update
      const updatedTask = await MainDAO.updateTask(userId, taskId, taskName, status);
  
      if (!updatedTask) {
        return null; // Task not found or not updated
      }
  
      // Return the updated task details
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error.message, error.stack);
      throw new Error('Error updating task: ' + error.message);
    }
  }
  
  
  
  
  
  
  
  
  

  static async deleteTask(userId, taskId, authorizationHeader) {
    try {
      console.log('Service: Deleting task for user ID:', userId, 'Task ID:', taskId);
  
      // Extract the token and validate it
      const token = MainService.extractToken(authorizationHeader);
      const payload = AuthService.verifyToken(token);
  
      // Ensure the token's user ID matches the request user ID
      if (payload.userId !== userId) {
        console.error('Token user ID mismatch:', payload.userId, '!=', userId);
        throw new Error('Invalid user ID in token');
      }
  
      console.log('Service: Verified user ID from token:', payload.userId);
  
      // Call DAO to delete the task
      const result = await MainDAO.deleteTask(userId, taskId);
      if (!result) {
        console.error('Service: Task not found or deletion failed');
        return null;
      }
  
      console.log('Service: Task deleted successfully');
      return result;
    } catch (error) {
      console.error('Service Error deleting task:', error.message, error.stack);
      throw new Error('Error deleting task: ' + error.message);
    }
  }
  
  

  // Helper function to extract the token from the Authorization header
  static extractToken(authorizationHeader) {
    if (!authorizationHeader) {
      throw new Error('Authorization header is missing');
    }

    const parts = authorizationHeader.split(' '); // Expecting "Bearer <token>"
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid Authorization header format');
    }

    return parts[1]; // Return the token part
  }
}

module.exports = MainService;
