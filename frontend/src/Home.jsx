import React, { useState } from "react";
import Webcam from "react-webcam";
import './Attendence.css';
import axios from "axios";

const AttendancePage = () => {
  const [imageSrc, setImageSrc] = useState(null); // Holds captured image
  const [location, setLocation] = useState(null); // Holds geolocation data
  const [webcamEnabled, setWebcamEnabled] = useState(true); // Webcam state

  const webcamRef = React.useRef(null);

  // Function to mark attendance
  const handleMarkAttendance = async () => {
    if (!webcamEnabled) {
      alert("Webcam is stopped. Please enable the webcam to mark attendance.");
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
  
    setImageSrc(capturedImage); // For displaying captured image locally
  
    // Check for geolocation support
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude }); // For local display
  
        // Prepare data for API call
        const attendanceData = new FormData();
        attendanceData.append('image', dataURItoBlob(capturedImage), 'attendance.jpg');
        attendanceData.append('latitude', latitude);
        attendanceData.append('longitude', longitude);
        attendanceData.append('timestamp', new Date().toISOString());  // Add the timestamp
  
        console.log('Sending Attendance Data:', attendanceData);
  
        try {
          // API call to mark attendance
          const response = await axios.post("http://localhost:5000/api/attendance", attendanceData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log("Attendance marked successfully:", response.data);
          alert("Attendance marked successfully!");
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
  
  // Helper function to convert base64 to Blob (for image upload)
  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([uintArray], { type: mimeString });
  };
  

  // Function to stop the webcam
  const handleStopWebcam = () => {
    setWebcamEnabled(false);
  };

  return (
    <div className="outer-container">
      <div className="content-container">
        <h1 className="header">Online Attendance</h1>
        <div className="webcam-container">
          {webcamEnabled ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam"
            />
          ) : (
            <p>Webcam is stopped.</p>
          )}
        </div>
        <div className="button-container">
          <button className="mark-attendance-button" onClick={handleMarkAttendance}>
            Mark Attendance
          </button>
          <button className="stop-webcam-button" onClick={handleStopWebcam}>
            Stop Webcam
          </button>
        </div>
        {imageSrc && (
          <div className="image-preview">
            <h3>Captured Image:</h3>
            <img src={imageSrc} alt="Captured" />
          </div>
        )}
        {location && (
          <div className="location-info">
            <h3>Location Data:</h3>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
