import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdMovie } from "react-icons/md";
import axios from "axios";
import "../pages/auth.css";

function Login() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId || !password) {
      setMessage("Employee ID and password are required.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        employeeId,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("employeeId", employeeId);
      setMessage("User logged in successfully");
      setTimeout(() => {
        navigate("/home");
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

        <div className="input-container">
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>

        <div className="input-container">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

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
