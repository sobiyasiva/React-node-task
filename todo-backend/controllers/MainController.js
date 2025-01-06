const MainService = require('../services/MainService');
const AuthService = require('../services/authService'); 

class MainController {
  static async authenticateUser(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1]; 
      if (!token) {
        return res.status(401).json({ status: 'fail', message: 'Token not provided' });
      }
      const decoded = AuthService.verifyToken(token); 
      req.user = { id: decoded.userId }; 
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
      console.log('Fetched tasks:', tasks); 
      if (tasks && tasks.length > 0) {
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
    const authorizationHeader = req.headers.authorization; 
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
    }

    const { taskName } = req.body;
    const userId = req.user.id; 
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

static async updateTask(req, res) {
  try {
    console.log('Received request to update task:', req.body);

    const authorizationHeader = req.headers.authorization; 
    if (!authorizationHeader) {
      return res.status(400).json({ status: 'fail', message: 'Authorization header is required' });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
    }

    const { taskName, status } = req.body; 
    const { taskId } = req.params;  
    const userId = req.user.id;   
    if (!taskName || taskName.trim() === '') {
      return res.status(400).json({ status: 'fail', message: 'Task name cannot be empty' });
    }
    if (!taskId) {
      return res.status(400).json({ status: 'fail', message: 'Task ID is required' });
    }
    const token = MainService.extractToken(authorizationHeader);  
    const payload = AuthService.verifyToken(token);  
    if (payload.userId !== userId) {
      console.error('Token user ID mismatch:', payload.userId, '!=', userId);
      return res.status(403).json({ status: 'fail', message: 'Invalid user ID in token' });
    }
    console.log('Verified user ID from token:', payload.userId);
    const updatedTask = await MainService.updateTask(userId, taskId, taskName, status);  
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
  static async deleteTask(req, res) {
    try {
      const authorizationHeader = req.headers.authorization;
      const { taskId } = req.params;
      const userId = req.user.id; 
  
      console.log(`Controller: Deleting task for user ID: ${userId}, Task ID: ${taskId}`);
      if (!authorizationHeader) {
        return res.status(400).json({ status: 'fail', message: 'Authorization header is required' });
      }
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
