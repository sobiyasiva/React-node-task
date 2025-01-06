import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import './Signup.css';

const Signup = ({ setShowLogin = () => {}, setShowSignUp = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setShowLogin(true);
        setShowSignUp(false);
      } else {
        setErrorMessage(data.message || 'Sign up failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      setErrorMessage('Error signing up. Please try again.');
    }
  };

  const handleKeyDown = (e, value) => {
    if (e.key === ' ' && value.length === 0) {
      e.preventDefault(); 
    }
  };

  return (
    <form className="signup-container" onSubmit={handleSignUp}>
      <h2>Sign Up Page</h2>
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
          onKeyDown={(e) => handleKeyDown(e, password)}
          className="input-box"
          required
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
      <div className="password-container">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} 
          onKeyDown={(e) => handleKeyDown(e, confirmPassword)}
          className="input-box"
          required
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
      <button type="submit" className="signin-button">
        Sign Up
      </button>
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      <p className="info-text">
        Already have an account?{' '}
        <a
          href="#"
          className="back-to-login-link"
          onClick={() => {
            console.log('Navigating back to Login form'); 
            setShowLogin(true); 
            setShowSignUp(false);
          }}
        >
          Back to Login
        </a>
      </p>
    </form>
  );
};

export default Signup;
