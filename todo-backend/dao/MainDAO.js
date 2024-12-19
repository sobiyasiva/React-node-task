const db = require('../config/database'); // Import your Sequelize connection

class MainDAO {
  // Fetch user by username (email in this case)
  static async getUserByUsername(username) {
    if (!username) throw new Error('Username is required');
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [username]);
      return rows[0] || null; // Ensure null is returned if no user is found
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  

  // Get all tasks for a user
// In MainDAO - Modify getTasks to accept a status parameter
static async getTasks(userId, status = 'all') {
  try {
    if (!userId || isNaN(userId)) {
      throw new Error('Invalid userId passed to the query');
    }

    let query = `
      SELECT * FROM tasks
      WHERE user_id = ?
    `;
    
    // If status is specified, filter tasks by status
    if (status !== 'all') {
      query += ` AND status = ?`;
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const replacements = status === 'all' ? [userId] : [userId, status];

    console.log('Preparing SQL Query:', query);
    console.log('With replacements:', replacements);

    const rows = await db.query(query, {
      replacements,
      type: db.QueryTypes.SELECT,
    });

    console.log('SQL Query executed successfully. Retrieved rows:', rows);
    return rows;
  } catch (error) {
    console.error('Error executing SQL Query:', error.message, error.stack);
    throw new Error('Error fetching tasks from database: ' + error.message);
  }
}

  
  
  
  
  
  

  // Create a new task
// Create a new task
// Create a new task
// Create a new task
// In MainDAO
static async createTask(userId, taskName) {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = `
      INSERT INTO tasks (user_id, taskName, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      userId,
      taskName,
      'In-progress',  // Ensure task is created with 'In-progress' status
      timestamp,
      timestamp,
    ];

    console.log("SQL Query:", query);
    console.log("Query Parameters:", params);

    const [result] = await db.query(query, { replacements: params });

    // Return the created task
    return {
      id: result.insertId,
      userId,
      taskName,
      status: 'In-progress',  // Task status remains 'In-progress'
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  } catch (error) {
    console.error('Error creating task in the database:', error.message, error.stack);
    throw new Error('Error creating task in the database: ' + error.message);
  }
}








  
  

  // Update an existing task
// Update an existing task
// Update an existing task with task name and optional status
static async updateTask(userId, taskId, taskName, status) {
  try {
    console.log('Updating task for user:', userId, 'Task ID:', taskId, 'Task Name:', taskName, 'Status:', status);
  
    // Prepare the query to update the task (including taskName and status)
    let query = `
      UPDATE tasks
      SET taskName = ?, updatedAt = NOW()
    `;
    
    const params = [taskName];
    
    // If a status is provided, include it in the query
    if (status) {
      query += `, status = ?`;
      params.push(status);  // Add status to the parameters
    }
    
    query += ` WHERE id = ? AND user_id = ?`;

    // Add taskId and userId as the last parameters
    params.push(taskId, userId);

    const [result] = await db.query(query, {
      replacements: params,
      type: db.QueryTypes.UPDATE, // Explicitly specify the query type
    });

    // Check if any row was affected
    if (result.affectedRows === 0) {
      throw new Error('Task not found or you do not have permission to edit this task');
    }
  
    // Return the updated task (or any relevant response data)
    return { id: taskId, taskName, status: status || 'In-progress' };  // Default to 'In-progress' if no status is provided
  } catch (error) {
    console.error('Error updating task in the database:', error.message);
    throw new Error('Error updating task: ' + error.message);
  }
}





  // Delete a task
  static async deleteTask(userId, taskId) {
    try {
      const [result] = await db.query(
        'DELETE FROM tasks WHERE user_id = ? AND id = ?',
        [userId, taskId]
      );
      if (result.affectedRows === 0) {
        throw new Error('Task not found or you do not have permission to delete this task');
      }
    } catch (error) {
      throw new Error('Error deleting task from the database: ' + error.message);
    }
  }
}

module.exports = MainDAO;
