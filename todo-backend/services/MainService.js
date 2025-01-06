const MainDAO = require('../dao/MainDAO');
const AuthService = require('./authService'); 
const db = require('../config/database');
class MainService {

static async getTasks(userId, status = 'all') {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch tasks');
    }

    let tasks;
    tasks = await MainDAO.getTasks(userId, status);

    console.log('Tasks fetched from DAO:', tasks);  

    return tasks;
  } catch (error) {
    console.error('Error in service while fetching tasks:', error.message, error.stack);
    throw new Error('Error fetching tasks: ' + error.message);
  }
}

  static async createTask(userId, taskName, authorizationHeader) {
    try {
      console.log('Creating task for user:', userId, 'Task Name:', taskName);
      const token = MainService.extractToken(authorizationHeader);
      const payload = AuthService.verifyToken(token);

      if (payload.userId !== userId) {
        console.error('Token user ID mismatch:', payload.userId, '!=', userId);
        throw new Error('Invalid user ID in token');
      }
      console.log('Verified user ID from token:', payload.userId);
      const newTask = await MainDAO.createTask(userId, taskName); 
      console.log('Task created successfully:', newTask);

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error.message, error.stack);
      throw new Error('Error creating task: ' + error.message);
    }
  }
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
      if (!taskName || !userId || !taskId) {
        throw new Error('Missing required parameters: userId, taskId, and taskName are mandatory');
      }
      const updatedTask = await MainDAO.updateTask(userId, taskId, taskName, status);
  
      if (!updatedTask) {
        return null; 
      }
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error.message, error.stack);
      throw new Error('Error updating task: ' + error.message);
    }
  }    
   
  static async deleteTask(userId, taskId, authorizationHeader) {
    try {
      console.log('Service: Deleting task for user ID:', userId, 'Task ID:', taskId);
      const token = MainService.extractToken(authorizationHeader);
      const payload = AuthService.verifyToken(token);
      if (payload.userId !== userId) {
        console.error('Token user ID mismatch:', payload.userId, '!=', userId);
        throw new Error('Invalid user ID in token');
      } 
      console.log('Service: Verified user ID from token:', payload.userId);
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

  static extractToken(authorizationHeader) {
    if (!authorizationHeader) {
      throw new Error('Authorization header is missing');
    }
    const parts = authorizationHeader.split(' '); 
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid Authorization header format');
    }
    return parts[1]; 
  }
}

module.exports = MainService;
