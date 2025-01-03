import React, { useState, useEffect, useRef } from 'react';

function TaskInput({ addTask, isEditing, taskToEdit, taskInputRef, buttonText, showToast }) {
  const [task, setTask] = useState("");

  // Effect to set task value if editing an existing task
  useEffect(() => {
    if (taskToEdit && isEditing) {
      setTask(taskToEdit.taskName); // Set the task name if editing
      if (taskInputRef.current) {
        taskInputRef.current.focus(); // Focus the input field if editing
      }
    } else if (!isEditing) {
      setTask("");  // Clear the task input when not editing
    }
  }, [taskToEdit, isEditing, taskInputRef]);

  // Handle input changes
  const handleInputChange = (e) => {
    setTask(e.target.value); // Update task state with input value
  };

  const handleAddOrUpdateTask = () => {
    const trimmedTask = task.trim(); // Trim the input value

    if (trimmedTask === "") {
      showToast("Task cannot be empty", "warning"); // Show toast if input is empty
      return; // Do nothing if the task input is empty
    }

    addTask(trimmedTask, taskToEdit?.id); // Call addTask with trimmed value
    if (!isEditing) {
      setTask(""); // Only clear input if adding a new task
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddOrUpdateTask();  // Trigger the task saving logic on Enter
    }
  };

  return (
    <div className="TaskInput">
      <input
        type="text"
        value={task} // The input value is bound to the task state
        onChange={handleInputChange} // Handle input changes
        placeholder="Enter a task"
        ref={taskInputRef} // Focus the input if editing
        onKeyDown={handleKeyDown}  // Handle Enter key press
      />
      <button onClick={handleAddOrUpdateTask}>{buttonText}</button> {/* Button for adding or updating task */}
    </div>
  );
}

export default TaskInput;
