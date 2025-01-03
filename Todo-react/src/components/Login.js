import React, { useState } from 'react';
import './Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Main from './Main.js';

const Login = ({ setShowSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  const accessToken = sessionStorage.getItem('accessToken');
  console.log('Access Token:', accessToken); // Debug: Check accessToken from sessionStorage
  console.log('Is Logged In:', isLoggedIn); // Debug: Check the state of isLoggedIn

  if (accessToken || isLoggedIn) {
    console.log('Redirecting to Main component...'); // Debug: Confirm redirect condition
    return <Main />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login form submitted'); // Debug: Log form submission

    if (!email || !password) {
      console.log('Validation failed: Missing email or password'); // Debug: Validation failure
      setErrorMessage('Both fields are required.');
      return;
    }

    try {
      console.log('Sending login request to the server...'); // Debug: API call initiated
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error('Server responded with an error'); // Debug: Server error
        throw new Error('Failed to connect to the server.');
      }

      const data = await response.json();
      console.log('Server response:', data); // Debug: Log the response from the server

      if (data.status === 'success' && data.token) {
        console.log('Login successful! Saving token and userId...'); // Debug: Successful login
        sessionStorage.setItem('accessToken', data.token); // Save the token as accessToken
        sessionStorage.setItem('userId', data.userId);
        setIsLoggedIn(true); // Update the state to trigger redirection
      } else {
        console.log('Login failed:', data.message || 'Invalid login credentials'); // Debug: Log failure message
        setErrorMessage(data.message || 'Invalid login credentials.');
      }
      
    } catch (error) {
      console.error('Error logging in:', error); // Debug: Catch unexpected errors
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };
  const handleKeyDown = (e, value) => {
    if (e.key === ' ' && value.length === 0) {
      e.preventDefault(); // Prevent space from being entered at the start
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
            console.log('Toggling password visibility'); // Debug: Toggle password visibility
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
          console.log('Navigating to Sign Up form'); // Debug: Sign-up navigation
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
