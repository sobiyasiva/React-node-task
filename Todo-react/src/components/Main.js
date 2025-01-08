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
      const response = await fetch('http://localhost:5000/api/refresh-token', {
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
  //to prevent the changes of the task status when editing
    const taskStatus = status || (taskToEdit ? taskToEdit.status : "In-progress");
    const newTask = { taskName: normalizedTaskName, status: taskStatus };
  
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const userId = sessionStorage.getItem('userId');
      if (!userId) return;
  
      const endpoint = taskId
        ? `http://localhost:5000/api/tasks/${taskId}`
        : 'http://localhost:5000/api/tasks';
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
  
      if (response.status === 401) { 
        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) return; 
  
        response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newAccessToken}`,
            'UserId': userId,
          },
          body: JSON.stringify(newTask),
        });
      }
  
      const data = await response.json();
      if (data.status === "success") {
        const updatedTask = {
          ...newTask,
          //when updating task id will exist when adding newtask data.data.is from the server creates id for the task
          id: taskId || data.data.id,
        };
        setTasks((prevTasks) => {
          if (taskId) {//editing
            return prevTasks.map((task) => (task.id === taskId ? updatedTask : task));
          } else {//new task adding
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
      } else {
        showToast(data.message, "failure");
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
  
      let response = await fetch("http://localhost:5000/api/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "UserId": userId,
        },
      });
  
      if (response.status === 401) {
        console.log("Access token expired. Attempting to refresh...");
        const newAccessToken = await refreshAccessToken();  
        if (!newAccessToken) {
          console.log("Unable to refresh access token. Logging out...");
          setShowLogin(true);  
          return;
        }
  
        response = await fetch("http://localhost:5000/api/tasks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${newAccessToken}`,
            "UserId": userId,
          },
        });
      }
  
      const data = await response.json();
      console.log("API response for tasks:", data);
  
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
  
  // const getRefreshToken = async () => {
  //   console.log("Refreshing token...");
  //   try {
  //     const refreshToken = sessionStorage.getItem('refreshToken');
  //     console.log("refreshToken:", refreshToken);
  
  //     const response = await fetch('http://localhost:5000/api/refresh-token', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${refreshToken}`,
  //         'UserId': sessionStorage.getItem('userId'),
  //       },
  //     });  
  //     const data = await response.json();
  //     console.log("API response for token refresh:", data);
  
  //     if (data.status === "success") {
  //       sessionStorage.setItem("accessToken", data.data.accessToken);
  //       console.log("Token refreshed successfully.");
  //     } else {
  //       showToast(data.message, "failure");
  //       handleLogout();
  //     }
  //   } catch (error) {
  //     showToast("Error refreshing token", "failure");
  //     console.log("Error refreshing token:", error);
  //   }
  // };
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
      const response = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      const data = await response.json();
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
  
  const handleToggleTaskStatus = (task) => {
    const newStatus = task.status.toLowerCase() === 'in-progress' ? 'completed' : 'in-progress';
  
    if (activeTab.toLowerCase() === 'all') {
      const message =
        newStatus === 'completed'
          ? `Are you sure you want to mark the task "${task.taskName}" as completed?`
          : `Are you sure you want to mark the task "${task.taskName}" as in-progress?`;
  
      setTaskToToggle({
        task,
        newStatus,
        message,
      });
      setShowStatusToggleConfirmation(true);
    } else {
      const message =
        newStatus === 'completed'
          ? `Are you sure you want to mark the task "${task.taskName}" as completed?`
          : `Are you sure you want to mark the task "${task.taskName}" as in-progress?`;
  
      setTaskToToggle({
        task,
        newStatus,
        message,
      });
      setShowStatusToggleConfirmation(true);
    }
  };
  
  const handleConfirmToggle = () => {
    if (taskToToggle) {
      const { task, newStatus } = taskToToggle;
      const toggledTask = { ...task, status: newStatus };
  
      setTasks((prevTasks) => {
        //to ensure only the toggles task is updated and prevents the rest of the task remain unchanged
        const updatedTasks = prevTasks.map((t) => (t.id === task.id ? toggledTask : t));
        const reorderedTasks = updatedTasks
          .filter((t) => t.status.toLowerCase() === newStatus)
          .sort((a, b) => (a.id === task.id ? -1 : b.id === task.id ? 1 : 0))
          .concat(updatedTasks.filter((t) => t.status.toLowerCase() !== newStatus));
  
        return reorderedTasks;
      });
  
      const statusMessage =
        newStatus === 'completed'
          ? 'Task marked as Completed successfully'
          : 'Task marked as In-progress successfully';
      showToast(statusMessage, 'success'); 
      handleSaveTask(toggledTask.taskName, toggledTask.id, newStatus, false); 
      if (activeTab.toLowerCase() !== 'all' && activeTab.toLowerCase() !== newStatus) {
        setActiveTab(newStatus);
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
    const taskStatus = task.status.toLowerCase();
    const activeTabLower = activeTab.toLowerCase();
    return (
      activeTabLower === 'all' ||
      (activeTabLower === 'in-progress' && taskStatus === 'in-progress') ||
      (activeTabLower === 'completed' && taskStatus === 'completed')
    );
  });
  

  return (
    <>
      {showSignUp ? (
        <Signup setShowSignUp={setShowSignUp} />
      ) : showLogin ? (
        <Login setShowLogin={setShowLogin} setShowSignUp={setShowSignUp} />
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
    inProgress: tasks.filter(task => task.status.toLowerCase() === 'in-progress').length,
    completed: tasks.filter(task => task.status.toLowerCase() === 'completed').length,
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
            checked={task.status.toLowerCase() === 'completed'}
            onChange={() => handleToggleTaskStatus(task)}
          />
          <p className={`task-name ${task.status.toLowerCase() === 'completed' ? 'completed' : ''}`}>
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
                message={taskToToggle?.newStatus === 'completed'
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
