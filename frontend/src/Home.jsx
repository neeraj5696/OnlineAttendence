import React, { useState } from "react";
import Webcam from "react-webcam";
import './Attendence.css'

const AttendancePage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [location, setLocation] = useState(null);

  const webcamRef = React.useRef(null);

  const handleMarkAttendance = async () => {
    // Capture photo
    const capturedImage = webcamRef.current.getScreenshot();
    setImageSrc(capturedImage);

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Unable to fetch location. Please check location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="attendance-container">
      <h1 className="header">Online Attendance</h1>
      <div className="webcam-container">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam"
        />
      </div>
      <button className="mark-attendance-button" onClick={handleMarkAttendance}>
        Mark Attendance
      </button>
      {imageSrc && (
        <div className="image-container">
          <h2>Captured Image</h2>
          <img src={imageSrc} alt="Captured" className="captured-image" />
        </div>
      )}
      {location && (
        <div className="location-container">
          <h2>Location Details</h2>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
