import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdMovie } from "react-icons/md";
import axios from "axios";
import "../pages/auth.css";

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rpassword, setRpassword] = useState("");
  const [employeeId, setEmployeeId] = useState(""); // Added employee ID state
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    // Custom validation logic
    if (!email) {
      setMessage("Email is required");
      return; // Prevent further execution if email is empty
    }

    if (!password) {
      setMessage("Password is required");
      return; // Prevent further execution if password is empty
    }

    if (!employeeId) {
      setMessage("Employee ID is required");
      return; // Prevent further execution if employee ID is empty
    }

    if (password !== rpassword) {
      setMessage("Passwords do not match!");
      return; // Prevent further execution if passwords don't match
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
        employeeId, // Include employee ID in the registration request
      });
      setMessage("Registered successfully! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error occurred", error);
      setMessage("Failed to register. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleRegister} className="form">
        {message && <div className="message">{message}</div>}
        <div className="movie-icon">
          <MdMovie />
        </div>

        {/* Email input */}
        <div className="input-container">
          <input
            type="text"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password input */}
        <div className="input-container">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Repeat Password input */}
        <div className="input-container">
          <input
            type="password"
            placeholder="Repeat Password"
            value={rpassword}
            onChange={(e) => setRpassword(e.target.value)}
          />
        </div>

        {/* Employee ID input */}
        <div className="input-container">
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>

        {/* Submit button */}
        <div className="button-container">
          <button type="submit">Create an account</button>
        </div>

        {/* Link to login page */}
        <div className="account-message">
          Already have an account?
          <button
            className="redirect-button"
            onClick={() => navigate("/login")}
            type="button"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Signup;
