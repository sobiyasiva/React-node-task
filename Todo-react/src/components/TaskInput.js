import React, { useState, useEffect, useRef } from 'react';

function TaskInput({ addTask, isEditing, taskToEdit, taskInputRef, buttonText, showToast }) {
  const [task, setTask] = useState("");

  useEffect(() => {
    if (taskToEdit && isEditing) {
      setTask(taskToEdit.taskName);
      if (taskInputRef.current) {
        taskInputRef.current.focus();
      }
    } else if (!isEditing) {
      setTask("");
    }
  }, [taskToEdit, isEditing, taskInputRef]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    if (value.startsWith(' ')) {
      console.log('Leading whitespace detected and removed');
      setTask(value.trimStart()); 
    } else {
      setTask(value); 
    }
  };

  const handleAddOrUpdateTask = () => {
    const trimmedTask = task.trim();
    if (trimmedTask === "") {
      showToast("Task cannot be empty", "warning");
      return;
    }

    addTask(trimmedTask, taskToEdit?.id);
    if (!isEditing) {
      setTask("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddOrUpdateTask();
    }
  };

  return (
    <div className="TaskInput">
      <input
        type="text"
        value={task}
        onChange={handleInputChange}
        placeholder="Enter a task"
        ref={taskInputRef}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleAddOrUpdateTask}>{buttonText}</button>
    </div>
  );
}

export default TaskInput;
