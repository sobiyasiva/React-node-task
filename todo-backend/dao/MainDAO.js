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

  // Get all tasks for a user with optional status filtering
  // Get all tasks for a user with optional status filtering
// Get all tasks for a user with optional status filtering
// Get all tasks for a user with optional status filtering
static async getTasks(userId, status = 'all') {
  try {
    let query = `SELECT * FROM tasks WHERE user_id = ?`;
    const replacements = [userId];

    if (status !== 'all') {
      query += ` AND status = ?`;
      replacements.push(status);
    }

    query += ' ORDER BY createdAt DESC';

    // Make sure to use let if the variable might be reassigned
    let tasks = await db.query(query, {
      replacements: replacements,
      type: db.QueryTypes.SELECT
    });

    if (!Array.isArray(tasks)) {
      tasks = [tasks]; // If it's not an array, wrap it in an array
    }

    console.log('SQL Query executed successfully. Retrieved rows:', tasks);
    return tasks;
  } catch (error) {
    console.error('Error in DAO while fetching tasks:', error.message, error.stack);
    throw new Error('Error fetching tasks from database: ' + error.message);
  }
}





  // Create a new task
// Create a new task
// Create a new task
static async createTask(userId, taskName) {
  try {
    if (!userId || !taskName) throw new Error('User ID and Task Name are required');

    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = `
      INSERT INTO tasks (user_id, taskName, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      userId,
      taskName,
      'In-progress', // Default status for a new task
      timestamp,
      timestamp,
    ];

    console.log("SQL Query:", query);
    console.log("Query Parameters:", params);

    // Execute the query with replacements and explicit INSERT type
    const [result] = await db.query(query, {
      replacements: params,
      type: db.QueryTypes.INSERT, // Explicit type
    });

    console.log('Raw query result:', result);

    // Retrieve the `insertId` (handles different formats)
    const insertId = typeof result === 'number' ? result : result.insertId || result[0]?.insertId || result.id;

    if (!insertId) {
      throw new Error('Failed to retrieve the insertId after task creation');
    }

    console.log('Task created successfully. Insert ID:', insertId);

    // Return the created task with the correct `id`
    return {
      id: insertId, // Use retrieved insertId
      userId,
      taskName,
      status: 'In-progress',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  } catch (error) {
    console.error('Error creating task in the database:', error.message, error.stack);
    throw new Error('Error creating task in the database: ' + error.message);
  }
}






  // Update an existing task
  static async updateTask(userId, taskId, taskName, status) {
    try {
      console.log('Updating task for user:', userId, 'Task ID:', taskId, 'Task Name:', taskName, 'Status:', status);

      if (!taskId || isNaN(taskId)) throw new Error('Invalid taskId provided');

      let query = `UPDATE tasks SET taskName = ?, updatedAt = NOW()`;
      const params = [taskName];

      if (status) {
        query += `, status = ?`;
        params.push(status);
      }

      query += ` WHERE id = ? AND user_id = ?`;
      params.push(taskId, userId);

      console.log('SQL Query:', query);
      console.log('Query Parameters:', params);

      const [result] = await db.query(query, { replacements: params });

      if (result.affectedRows === 0) {
        console.error('Task not found or update failed for taskId:', taskId);
        return null; // Task not found or not updated
      }

      return {
        id: taskId,
        userId,
        taskName,
        status: status || 'In-progress',
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating task in the database:', error.message, error.stack);
      throw new Error('Error updating task in the database: ' + error.message);
    }
  }

  // Delete a task
  static async deleteTask(userId, taskId) {
    try {
      console.log(`DAO: Attempting to delete task for user ID: ${userId}, Task ID: ${taskId}`);

      if (!userId || isNaN(userId)) throw new Error('Invalid userId');
      if (!taskId || isNaN(taskId)) throw new Error('Invalid taskId');

      const query = 'DELETE FROM tasks WHERE user_id = ? AND id = ?';
      const replacements = [userId, taskId];

      const [result] = await db.query(query, { replacements });

      if (result.affectedRows === 0) {
        console.error('Task not found or user lacks permission for taskId:', taskId);
        return null; // Task not found or not deleted
      }

      console.log('DAO: Task deleted successfully for taskId:', taskId);
      return true;
    } catch (error) {
      console.error('Error deleting task in the database:', error.message, error.stack);
      throw new Error('Error deleting task from the database: ' + error.message);
    }
  }
}

module.exports = MainDAO;
