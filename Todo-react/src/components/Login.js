import React, { useState } from 'react';
import './Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Main from './Main.js';

const Login = ({ setShowSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const refreshToken = sessionStorage.getItem('refreshToken');

  const accessToken = sessionStorage.getItem('accessToken');
  if (accessToken || isLoggedIn) {
    return <Main />;
  }

  const showToast = (message, type) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login form submitted'); 

    if (!email || !password) {
      console.log('Validation failed: Missing email or password'); 
      setErrorMessage('Both fields are required.');
      return;
    }

    try {
      console.log('Sending login request to the server...'); 
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error('Server responded with an error');
        throw new Error('Failed to connect to the server.');
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.status === 'success' && data.token) {
        console.log('Login successful! Saving token and userId...');
        sessionStorage.setItem('refreshToken', data.refreshToken);
        sessionStorage.setItem('accessToken', data.token);
        sessionStorage.setItem('userId', data.userId);
        setIsLoggedIn(true);
        showToast('Login successful', 'success');
      } else {
        console.log('Login failed:', data.message || 'Invalid login credentials'); 
        setErrorMessage(data.message || 'Invalid login credentials.');
      }
      
    } catch (error) {
      console.error('Error logging in:', error); 
      setErrorMessage('User not found. Please signup.');
    }
  };

  const handleKeyDown = (e, value) => {
    if (e.key === ' ' && value.length === 0) {
      e.preventDefault(); 
    }
  };

  return (
    <form className="login-container" onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, email)}
        className="input-box"
        required
      />
      <div className="password-container">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-box"
          required
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => {
            console.log('Toggling password visibility'); 
            setShowPassword(!showPassword);
          }}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
      <button type="submit" className="login-button">Login</button>
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      <p className="info-text">Don’t have an account? Create a new one!</p>
      <button
        type="button"
        onClick={() => {
          console.log('Navigating to Sign Up form'); 
          setShowSignUp(true);
        }}
        className="signup-button"
      >
        Sign Up
      </button>
    </form>
  );
};

export default Login;
