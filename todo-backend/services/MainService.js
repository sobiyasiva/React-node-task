const MainDAO = require('../dao/MainDAO');
const AuthService = require('./authService'); // Import AuthService for token verification
const db = require('../config/database');
class MainService {
  static async getUserByUsername(username) {
    if (!username) {
      throw new Error('Username is required');
    }
    return await MainDAO.getUserByUsername(username);
  }
// In MainService
// In MainService
static async getTasks(userId, status = 'all') {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch tasks');
    }
    
    let tasks;
    if (status === 'all') {
      // Fetch all tasks for the user (no status filter)
      tasks = await MainDAO.getTasks(userId);
    } else if (status === 'in-progress') {
      // Fetch tasks that are specifically in progress
      tasks = await MainDAO.getTasks(userId, 'In-progress');
    } else {
      // Handle any other statuses as needed (e.g., 'completed', 'pending', etc.)
      tasks = await MainDAO.getTasks(userId, status);
    }

    console.log('Tasks fetched successfully from service:', tasks);
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
      console.error('Authorization header is missing');
      throw new Error('Authorization header is missing');
    }

    const parts = authorizationHeader.split(' '); // Expecting "Bearer <token>"
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.error('Invalid Authorization header format:', authorizationHeader);
      throw new Error('Invalid Authorization header format');
    }

    return parts[1]; // Return the token part
  }
  

  static async updateTask(userId, taskId, taskName, status) {
    try {
      console.log('Updating task for user:', userId, 'Task ID:', taskId, 'Task Name:', taskName, 'Status:', status);
  
      // Ensure valid parameters
      if (!taskName || !status || !userId || !taskId) {
        throw new Error('Missing required parameters for task update');
      }
  
      const query = `
        UPDATE tasks
        SET taskName = ?, status = ?, updatedAt = ?
        WHERE user_id = ? AND id = ?
      `;
  
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' '); // Current timestamp
  
      const params = [
        taskName,   // Task name to update
        status,     // New status
        timestamp,  // Updated timestamp
        userId,     // User ID
        taskId,     // Task ID
      ];
  
      console.log("SQL Query:", query);
      console.log("Query Parameters:", params);
  
      // Execute the query to update the task
      const [result] = await db.query(query, { replacements: params });
  
      // Check if the update was successful
      if (result.affectedRows === 0) {
        return null;  // No rows affected, meaning task wasn't found or not updated
      }
  
      // Return the updated task details
      return {
        id: taskId,
        userId,
        taskName,
        status,        // Updated status
        createdAt: timestamp, // Assuming 'createdAt' is not updated
        updatedAt: timestamp,
      };
    } catch (error) {
      console.error('Error updating task in the database:', error.message, error.stack);
      throw new Error('Error updating task in the database: ' + error.message);
    }
  }
  
  
  
  
  
  
  
  

  static async deleteTask(userId, taskId, authorizationHeader) {
    try {
      console.log('Deleting task for user:', userId, 'Task ID:', taskId);

      // Extract the token from the Authorization header
      const token = MainService.extractToken(authorizationHeader);

      // Verify the token using AuthService.verifyToken
      const payload = AuthService.verifyToken(token);

      // Check if the user ID in the token matches the requested user ID
      if (payload.userId !== userId) {
        throw new Error('Invalid user ID in token');
      }

      await MainDAO.deleteTask(userId, taskId);
    } catch (error) {
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
