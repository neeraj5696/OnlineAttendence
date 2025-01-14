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
  const [employeeId, setEmployeeId] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
  e.preventDefault();

  if (!email || !password || !employeeId) {
    setMessage("All fields are required.");
    return;
  }

  if (password !== rpassword) {
    setMessage("Passwords do not match!");
    return;
  }

  const data = {
    email: email,
    password: password
  };

  try {
    const response = await axios.post("http://localhost:5000/auth/register", data, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.status === 201) {
      // Store employee ID and email in localStorage
      localStorage.setItem("email", email);
      localStorage.setItem("employeeId", employeeId);
      setMessage("Registered successfully! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
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

        <div className="input-container">
          <input
            type="text"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div className="input-container">
          <input
            type="password"
            placeholder="Repeat Password"
            value={rpassword}
            onChange={(e) => setRpassword(e.target.value)}
          />
        </div>

        <div className="input-container">
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>

        <div className="button-container">
          <button type="submit">Create an account</button>
        </div>

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
