import React, { useState } from "react";
import Webcam from "react-webcam";

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
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center border-4 border-gray-400 rounded-xl p-8 bg-white shadow-lg max-w-lg w-11/12">
        <h1 className="header">Online Attendance</h1>
        <div className="flex items-center justify-center w-full max-w-md aspect-[4/3] bg-gray-200 border-2 border-gray-300 rounded-lg shadow-md">
          {webcamEnabled ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-auto max-h-full rounded-lg object-contain"
            />
          ) : (
            <p>Webcam is stopped.</p>
          )}
        </div>
        <div className="flex gap-5 justify-center mt-5">
          <button className="px-6 py-3 text-lg font-bold rounded-lg cursor-pointer transition-all duration-300 shadow-md text-white bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-600 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 hover:border-green-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-sm focus:outline-none focus:ring-4 focus:ring-green-400" onClick={handleMarkAttendance}>
            Mark Attendance
          </button>
          <button className="px-6 py-3 text-lg font-bold rounded-lg cursor-pointer transition-all duration-300 shadow-md text-white bg-red-600 border-2 border-red-600 hover:bg-red-700 hover:border-red-700 hover:shadow-lg hover:scale-105 active:scale-100 active:shadow-sm" onClick={handleStopWebcam}>
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
