import React, { useEffect } from 'react';
import './Styles.css';

function ConfirmationModal({ task, onCancel, onConfirm, message, type }) {
  useEffect(() => {
    console.log(`${type === 'logout' ? 'Logout' : 'Task'} Confirmation Modal is opening`);
  }, [type]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-heading">{message}</h2>
        {/* Display the task name below the heading only if it's a task-related modal */}
        {task && task.taskName && <p className="modal-task-name">{task.taskName}</p>}
        <div className="modal-buttons">
          {type === 'logout' ? (
            <>
              <button className="ok-button" onClick={onConfirm}>OK</button>
              <button className="cancel-button" onClick={onCancel}>Cancel</button>
            </>
          ) : (
            <>
              <button className="yes-button" onClick={onConfirm}>Yes</button>
              <button className="no-button" onClick={onCancel}>No</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
