import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdMovie } from "react-icons/md";
import axios from "axios";
import "../pages/auth.css";

function Login() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Added email state
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email, employeeId, and password
    if (!email || !employeeId || !password) {
      setMessage("All fields are required.");
      return;
    }

    try {
      // Sending login credentials to the backend
      const res = await axios.post("https://online-attendence-backend-m93mf58wz-neeraj5696s-projects.vercel.app/auth/login", {
        email, // Added email field
        
        password,
      });

      // Assuming backend returns a token upon successful login
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("employeeId", employeeId);
      setMessage("User logged in successfully");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error occurred", error);
      setMessage("Failed to log in. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form">
        {message && <div className="message">{message}</div>}

        <div className="movie-icon">
          <MdMovie />
        </div>

        {/* Email Input Field */}
        <div className="input-container">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {/* Custom message for empty email */}
        {email === "" && (
          <div className="error-message">Email is required</div>
        )}

        {/* Employee ID Input Field */}
        <div className="input-container">
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>

        {/* Password Input Field */}
        <div className="input-container">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <div className="button-container">
          <button type="submit">Login to your account</button>
        </div>

        <div className="bottom-container">
          <div className="account-message">Don't have an account?</div>
          <div>
            <button
              className="redirect-button"
              onClick={() => navigate("/signup")}
              type="button"
            >
              Signup
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;
