import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import './Styles.css';
import ToastContainer from './ToastContainer';
import Tabs from './Tabs';
import TaskInput from './TaskInput';
import ConfirmationModal from './ConfirmationModal';
import Login from './Login';
import Signup from './Signup';

function Main() {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToToggle, setTaskToToggle] = useState(null);
  const [toastStatus, setToastStatus] = useState({ status: "", message: "" });
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showStatusToggleConfirmation, setShowStatusToggleConfirmation] = useState(false);
  //without page reloads directly updates
  const taskListRef = useRef(null);
  const taskInputRef = useRef(null);

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');
    const userId = sessionStorage.getItem('userId');
    if (accessToken && userId) {
      getTodos();
    } else {
      setShowLogin(true);
    }
  }, []);
  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };
  const confirmLogout = () => {
    sessionStorage.clear();
    setTasks([]); 
    setShowLogin(true); 
    setShowSignUp(false);
    setShowLogoutConfirmation(false);
  };
   
  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };
  const refreshAccessToken = async () => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    const userId = sessionStorage.getItem('userId');
    
    if (!refreshToken || !userId) {
      handleLogout();
      return null;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/user/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
          'UserId': userId,
        },
      });
  
      const data = await response.json();
      if (data.status === 'success') {
        sessionStorage.setItem('accessToken', data.token);
        console.log("Access token refreshed successfully.");
        return data.token;
      } else {
        showToast(data.message || "Unable to refresh token", "failure");
        handleLogout();
        return null;
      }
    } catch (error) {
      console.error("Error refreshing access token:", error);
      showToast("Error refreshing token", "failure");
      handleLogout();
      return null;
    }
  };
  
const handleSaveTask = async (
  taskName,
  taskId = null,
  status = null,
  showUpdateToast = true
) => {
  if (!taskName.trim()) {
    showToast("Task cannot be empty", "warning");
    return;
  }

  const hasNumbers = /\d/.test(taskName);
  if (hasNumbers) {
    showToast("Numbers are not allowed in the task name", "warning");
    return;
  }

  const regex = /^[a-zA-Z\s]*$/;
  if (!regex.test(taskName)) {
    showToast("Special characters are not allowed", "warning");
    return;
  }

  const normalizedTaskName = taskName.trim().replace(/\s+/g, ' ');

  if (taskToEdit && taskToEdit.taskName === normalizedTaskName) {
    showToast("No changes made", "warning");
    setIsEditing(false);
    setTaskToEdit(null);
    return;                    
  }

  const isDuplicate = tasks.some(
    (task) => task.taskName.toLowerCase() === normalizedTaskName.toLowerCase() && task.id !== taskId
  );
  if (isDuplicate) {
    showToast("This task already exists", "warning");
    return;
  }

  // Ensure the status is correctly set, toggling between 0 (Incomplete) and 1 (Complete)
  const taskStatus = status !== null ? status : (taskToEdit ? taskToEdit.status : 0);

  const newTask = { taskName: normalizedTaskName, status: taskStatus };

  try {
    const accessToken = sessionStorage.getItem('accessToken');
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    const endpoint = taskId
      ? `http://localhost:5000/api/task/updatetasks/${taskId}`
      : 'http://localhost:5000/api/task/addtasks';
    const method = taskId ? 'PUT' : 'POST';

    let response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'UserId': userId,
      },
      body: JSON.stringify(newTask),
    });
    const data = await response.json();
        if (data.message === "Token expired") {
          console.log("Token expired. Attempting to refresh...");
          await refreshAccessToken();
          return; 
        }
    if (data.status === "success") {
      const updatedTask = {
        ...newTask,
        id: taskId || data.data.id,
      };
      setTasks((prevTasks) => {
        if (taskId) {
          // editing
          return prevTasks.map((task) => (task.id === taskId ? updatedTask : task));
        } else {
          // new task adding
          return [updatedTask, ...prevTasks];
        }
      });
      setIsEditing(false);
      setTaskToEdit(null);
      if (taskListRef.current) {
        taskListRef.current.scrollTop = 0;
      }
      if (taskId && showUpdateToast) {
        showToast("Task updated successfully", "success");
      } else if (!taskId) {
        showToast("Task saved successfully", "success");
        setActiveTab('All');
      }
    } 
  } catch (error) {
    console.error("Error occurred during task save operation:", error);
    showToast("Error saving task", "failure");
  }
};

  
 
  const getTodos = async () => {
    console.log("Fetching tasks from the server...");
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      const userId = sessionStorage.getItem("userId");
  
      if (!accessToken || !userId) {
        console.log("Access token or user ID missing. Redirecting to login.");
        setShowLogin(true);
        return;
      }
  
      let response = await fetch("http://localhost:5000/api/task/gettasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "UserId": userId,
        },
      });  
      const data = await response.json();
      console.log("API response for tasks:", data);
  if (data.message === "Token expired") {
    console.log("Token expired in API response. Refreshing token...");
    await refreshAccessToken();
    return; 
  }
      if (data.status === "success") {
        const tasks = Array.isArray(data.data) ? data.data : [data.data];
        setTasks(tasks); 
        
      } else {
        console.log("Failed to fetch tasks:", data.message);
      }
    } catch (error) {
      console.log("Error while fetching tasks:", error);
    }
  };
  const handleEditTask = (task) => {
    setIsEditing(true);
    setTaskToEdit(task);
    const normalizedText = task.taskName.trim().replace(/\s+/g, ' ');
    setTaskToEdit({ ...task, taskName: normalizedText });
  };
  const handleOpenDeleteDialog = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      setIsEditing(false);
      setTaskToEdit(null); 
      handleDeleteTask(taskToDelete);
      setTaskToDelete(null);
      setShowDeleteConfirmation(false);  
    }
  };

  const handleDeleteTask = async (task) => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));
  
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/task/deletetasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      const data = await response.json();
    if (data.message === "Token expired") {
      console.log("Token expired. Attempting to refresh...");
      await refreshAccessToken();
      return;  
    }
      if (data.status === 'success') {
        showToast('Task deleted successfully', 'success');
        console.log('Task deleted successfully:', task);
        setTaskToEdit(null);
        setIsEditing(false);
      } else {
        showToast(data.message, 'failure');
      }
    } catch (error) {
      showToast('Error deleting task', 'failure');
      console.error("Error deleting task:", error);
    }
  };
  
  
  
  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 0 ? 1 : 0; 
    const taskStatusText = newStatus === 1 ? 'completed' : 'in-progress';
    console.log(`Task "${task.taskName}" is switching to the "${taskStatusText}" status.`);
    const message = newStatus === 1
      ? `Are you sure you want to mark the task "${task.taskName}" as completed?`
      : `Are you sure you want to mark the task "${task.taskName}" as in-progress?`;
  
    setTaskToToggle({
      task,
      newStatus,
      message,
    });
    setShowStatusToggleConfirmation(true);
  };
  
  const handleConfirmToggle = async () => {
    if (taskToToggle) {
      const { task, newStatus } = taskToToggle;
      const updatedTask = { ...task, status: newStatus };
      setTasks((prevTasks) => {
        return prevTasks.map((t) => (t.id === task.id ? updatedTask : t));
      });
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        const userId = sessionStorage.getItem('userId');
        if (!userId) return;
  
        const endpoint = `http://localhost:5000/api/task/updatetasks/${task.id}`;
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'UserId': userId,
          },
          body: JSON.stringify(updatedTask),
        });
  
        const data = await response.json();
      if (data.message === "Token expired") {
        console.log("Token expired. Attempting to refresh...");
        await refreshAccessToken();
        return;  
      }
        if (data.status === "success") {
          showToast(`Task marked as ${newStatus === 1 ? 'Completed' : 'In-progress'} successfully`, "success");
          // Automatically switch to the corresponding tab if not on "all" tab
        if (activeTab !== "all") {
          setActiveTab(newStatus === 1 ? "completed" : "in-progress");
        }
        } else {
          showToast(data.message, "failure");
        }
      } catch (error) {
        console.error("Error occurred during task status update:", error);
        showToast("Error updating task", "failure");
      }
  
      setTaskToToggle(null);
      setShowStatusToggleConfirmation(false);
    }
  };
   
  
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const taskName = taskInputRef.current.value;
      handleSaveTask(taskName);  
    }
  };

  const handleCancelToggle = () => {
    setShowStatusToggleConfirmation(false);
  };

  const showToast = (message, type) => {
    const toastEvent = new CustomEvent('show-toast', {
      detail: { message, type },
    });
    window.dispatchEvent(toastEvent);
  };
  const filteredTasks = tasks.filter((task) => {
    const taskStatus = task.status; 
    const activeTabLower = activeTab.toLowerCase(); 
    return (
      activeTabLower === 'all' || 
      (activeTabLower === 'in-progress' && taskStatus === 0) || 
      (activeTabLower === 'completed' && taskStatus === 1)
    );
  });
  
  
  
  

  return (
    <>
      {showSignUp ? (
        <Signup setShowSignUp={setShowSignUp} />
      ) : showLogin ? (
        <Login setShowLogin={setShowLogin} setShowSignUp={setShowSignUp} />//login-component, setShowLogin-manual name and {setShowLogin}-props
      ) : (
        <div className="MainContent">
          <div className="App">
            <header className="App-header">
              <h1>Todo List</h1>
              <Button label="Logout" className="logout-button" onClick={handleLogout} />
            </header>
            <TaskInput
              addTask={handleSaveTask}
              isEditing={isEditing}
              taskToEdit={taskToEdit}
              taskInputRef={taskInputRef}
              buttonText={isEditing ? "Save" : "Add Task"}
              showToast={showToast}
              onKeyDown={handleKeyDown}
            />
            <Tabs
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              taskCounts={{
                all: tasks.length,
                inProgress: tasks.filter(task => task.status === 0).length, 
                completed: tasks.filter(task => task.status === 1).length, 
              }}
            />
  
            <ToastContainer toastStatus={toastStatus} />
            <div className="task-list-header">
              <h2>List of Tasks</h2>
              <h2 className='actions'>Actions</h2>
            </div>
            {filteredTasks.length === 0 ? (
              <p className="no-tasks-message">No Tasks Available</p>
            ) : (
              <div className="task-list" ref={taskListRef}>
                {filteredTasks.map((task) => (
                  <div key={task.id} className="task-container">
                    <div className="task-content">
                      <input
                        type="checkbox"
                        checked={task.status === 1} 
                        onChange={() => handleToggleTaskStatus(task)}
                      />
                      <p className={`task-name ${task.status === 1 ? 'completed' : ''}`}>
                        {task.taskName}
                      </p>
                      <div className="task-actions">
                        <Button label="Edit" className="edit-button" onClick={() => handleEditTask(task)} />
                        <Button label="Delete" className="delete-button" onClick={() => handleOpenDeleteDialog(task)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
  
            {showLogoutConfirmation && (
              <ConfirmationModal
                message="Are you sure you want to log out?"
                onConfirm={confirmLogout}
                onCancel={cancelLogout}
              />
            )}
            {showDeleteConfirmation && (
              <ConfirmationModal
                message={`Are you sure you want to delete the task?`}
                task={taskToDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirmation(false)} 
              />
            )}
            {showStatusToggleConfirmation && (
              <ConfirmationModal
                message={taskToToggle?.newStatus === 1
                  ? `Are you sure you want to mark the task as Completed?`
                  : `Are you sure you want to mark the task as In-Progress?`}
                task={taskToToggle?.task}
                onConfirm={handleConfirmToggle}
                onCancel={handleCancelToggle}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
  
}

export default Main;
