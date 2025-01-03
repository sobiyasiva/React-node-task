const MainService = require('../services/MainService');
const AuthService = require('../services/authService'); // Correctly import AuthService

class MainController {
  // Function to authenticate the user
  static async authenticateUser(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
      if (!token) {
        return res.status(401).json({ status: 'fail', message: 'Token not provided' });
      }

      // Use AuthService.verifyToken to validate the token
      const decoded = AuthService.verifyToken(token); // Corrected usage
      req.user = { id: decoded.userId }; // Attach user ID to the request object
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      res.status(401).json({ status: 'fail', message: error.message });
    }
  }
  static async getTasks(req, res) {
    try {
      const userId = req.user?.id;
      const status = req.query.status || 'all';
  
      if (!userId) {
        return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
      }
  
      const tasks = await MainService.getTasks(userId, status);
  
      // Log to ensure you're receiving tasks just once
      console.log('Fetched tasks:', tasks);
  
      if (tasks && tasks.length > 0) {
        // Avoid sending multiple responses
        if (!res.headersSent) {
          return res.status(200).json({ status: 'success', data: tasks });
        }
      } else {
        if (!res.headersSent) {
          return res.status(404).json({ status: 'fail', message: 'No tasks found' });
        }
      }
    } catch (error) {
      console.error('Error fetching tasks in controller:', error.message);
      if (!res.headersSent) {
        return res.status(500).json({ status: 'fail', message: 'Could not fetch tasks' });
      }
    }
  }
    
  static async createTask(req, res) {
  try {
    console.log('Received request to create task:', req.body);

    const authorizationHeader = req.headers.authorization; // Pass the Authorization header

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
    }

    const { taskName } = req.body;
    const userId = req.user.id; // Assuming user is authenticated

    // Check if taskName is provided and not empty
    if (!taskName || taskName.trim() === '') {
      return res.status(400).json({ status: 'fail', message: 'Task name cannot be empty' });
    }

    console.log('User ID:', userId);

    const newTask = await MainService.createTask(userId, taskName, authorizationHeader);
    console.log('Created task:', newTask);

    res.status(201).json({ status: 'success', message: 'Task created successfully', data: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}



  // Update an existing task for the authenticated user
// Update an existing task for the authenticated user
// Update an existing task for the authenticated user
// Update an existing task for the authenticated user
static async updateTask(req, res) {
  try {
    console.log('Received request to update task:', req.body);

    const authorizationHeader = req.headers.authorization; // Get the Authorization header
    if (!authorizationHeader) {
      return res.status(400).json({ status: 'fail', message: 'Authorization header is required' });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
    }

    const { taskName, status } = req.body; // Extract task name and status from the request body
    const { taskId } = req.params;  // Extract taskId from the request parameters
    const userId = req.user.id;    // User ID from the authenticated user

    // Validate task name and task ID
    if (!taskName || taskName.trim() === '') {
      return res.status(400).json({ status: 'fail', message: 'Task name cannot be empty' });
    }

    if (!taskId) {
      return res.status(400).json({ status: 'fail', message: 'Task ID is required' });
    }

    // Extract the token from the Authorization header
    const token = MainService.extractToken(authorizationHeader);  // Extract the token
    const payload = AuthService.verifyToken(token);  // Verify the token

    // Check if the user ID in the token matches the requested user ID
    if (payload.userId !== userId) {
      console.error('Token user ID mismatch:', payload.userId, '!=', userId);
      return res.status(403).json({ status: 'fail', message: 'Invalid user ID in token' });
    }

    console.log('Verified user ID from token:', payload.userId);

    // Call service layer to update the task (pass status as well)
    const updatedTask = await MainService.updateTask(userId, taskId, taskName, status);  // Pass status here

    if (!updatedTask) {
      return res.status(404).json({ status: 'fail', message: 'Task not found or you do not have permission to edit this task' });
    }

    console.log('Updated task:', updatedTask);
    res.status(200).json({ status: 'success', message: 'Task updated successfully', data: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error.message, error.stack);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}








  // Delete a task for the authenticated user
  static async deleteTask(req, res) {
    try {
      const authorizationHeader = req.headers.authorization;
      const { taskId } = req.params;
      const userId = req.user.id; // Authenticated user ID from middleware
  
      console.log(`Controller: Deleting task for user ID: ${userId}, Task ID: ${taskId}`);
  
      // Ensure the Authorization header is present
      if (!authorizationHeader) {
        return res.status(400).json({ status: 'fail', message: 'Authorization header is required' });
      }
  
      // Call service to delete the task
      const result = await MainService.deleteTask(userId, taskId, authorizationHeader);
  
      if (!result) {
        return res.status(404).json({ status: 'fail', message: 'Task not found or you lack permission to delete it' });
      }
  
      console.log('Controller: Task deleted successfully');
      res.status(200).json({ status: 'success', message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Controller Error deleting task:', error.message);
      res.status(500).json({ status: 'fail', message: error.message });
    }
  }
  
}  


module.exports = MainController;
