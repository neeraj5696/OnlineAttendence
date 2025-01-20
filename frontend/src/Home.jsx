import React, { useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For navigation to login/signup

const AttendancePage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [location, setLocation] = useState(null);
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [employeeId, setEmployeeId] = useState(""); // Store employeeId

  const webcamRef = React.useRef(null);
  const navigate = useNavigate();

  // Check login status on component mount
  useEffect(() => {
    const user = localStorage.getItem("employeeId");
    if (user) {
      setIsLoggedIn(true);
      setEmployeeId(user);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("employeeId");

    setIsLoggedIn(false);
    setEmployeeId(""); // Clear employeeId state
    alert("Logged out successfully!");
    navigate("/"); // Redirect to login page
  };

  const handleMarkAttendance = async () => {
    if (!isLoggedIn) {
      alert("Please log in to mark attendance.");
      return;
    }

    if (!webcamRef.current) {
      alert("Webcam not initialized. Please try again.");
      return;
    }

    const capturedImage = webcamRef.current.getScreenshot();
    if (!capturedImage) {
      alert("Failed to capture image. Please try again.");
      return;
    }
    setImageSrc(capturedImage);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        const attendanceData = new FormData();
        attendanceData.append("image", dataURItoBlob(capturedImage), "attendance.jpg");
        attendanceData.append("latitude", latitude);
        attendanceData.append("longitude", longitude);
        attendanceData.append("timestamp", new Date().toISOString());

        try {
          const response = await axios.post(
            "https://online-attendence-backend-m93mf58wz-neeraj5696s-projects.vercel.app/api/attendance" || "https://online-attendence-backend.vercel.app/api/attendance"|| "https://online-attendence-backend.vercel.app/",
            attendanceData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          alert("Attendance marked successfully!");
          setImageSrc(null);
          setWebcamEnabled(false);
        } catch (error) {
          console.error("Error marking attendance:", error);
          alert("Failed to mark attendance. Please check your network connection and try again.");
        }
      },
      (error) => {
        console.error("Error fetching location:", error);
        alert("Unable to fetch location. Please check location permissions.");
      }
    );
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([uintArray], { type: mimeString });
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
      <div className="absolute top-4 right-4">
      {isLoggedIn && (
          <span className="text-gray-700 font-bold">
            Employee ID: {employeeId}
          </span>
        )}
        {isLoggedIn ? (
          <button
            className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow-md"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>
     

      <div className="flex flex-col items-center justify-center border-4 border-gray-400 rounded-xl p-8 bg-white shadow-lg max-w-lg w-11/12">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-4 tracking-wide uppercase text-center">
          Online Attendance
        </h1>
        <div className="flex items-center justify-center w-full max-w-md aspect-[4/3] bg-gray-200 border-2 border-gray-300 rounded-lg shadow-md">
          {webcamEnabled && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-auto max-h-full rounded-lg object-contain"
            />
          )}
        </div>
        <div className="flex gap-5 justify-center mt-5">
          <button
            className="px-6 py-3 text-lg font-bold rounded-lg cursor-pointer transition-all duration-300 shadow-md text-white bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-600 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 hover:border-green-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-sm focus:outline-none focus:ring-4 focus:ring-green-400"
            onClick={handleMarkAttendance}
          >
            Mark Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
