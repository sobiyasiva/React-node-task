import React from 'react';
import './Styles.css';

const Toast = ({ message, type, onClose }) => {
  return (
    <div className={`toast ${type}`} onClick={onClose}>
      {message}
    </div>
  );
};

export default Toast;
