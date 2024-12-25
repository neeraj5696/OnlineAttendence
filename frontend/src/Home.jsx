import React, { useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const AttendancePage = () => {
  const [imageSrc, setImageSrc] = useState(null); // Holds captured image
  const [location, setLocation] = useState(null); // Holds geolocation data
  const [webcamEnabled, setWebcamEnabled] = useState(true); // Webcam state

  const webcamRef = React.useRef(null);

  // Function to capture photo
  const handleCapturePhoto = () => {
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
    setWebcamEnabled(false); // Disable webcam after capturing
  };

  // Function to mark attendance
  const handleMarkAttendance = async () => {
    if (!imageSrc) {
      alert("Please capture an image before marking attendance.");
      return;
    }

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
        attendanceData.append("image", dataURItoBlob(imageSrc), "attendance.jpg");
        attendanceData.append("latitude", latitude);
        attendanceData.append("longitude", longitude);
        attendanceData.append("timestamp", new Date().toISOString()); // Add the timestamp

        try {
          // API call to mark attendance
          const response = await axios.post(
            "http://localhost:5000/api/attendance",
            attendanceData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("Attendance marked successfully:", response.data);
          alert("Attendance marked successfully!");
          setImageSrc(null);
          setWebcamEnabled(false); // Re-enable webcam for a new capture
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
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([uintArray], { type: mimeString });
  };

  // Function to reset the webcam
  const handleResetWebcam = () => {
    setImageSrc(null);
    setWebcamEnabled(true);
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
            imageSrc && <img src={imageSrc} alt="Captured" className="w-full h-auto rounded-lg" />
          )}
        </div>
        <div className="flex gap-5 justify-center mt-5">
          {webcamEnabled ? (
            <button
              className="px-6 py-3 text-lg font-bold rounded-lg cursor-pointer transition-all duration-300 shadow-md text-white bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:border-blue-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-400"
              onClick={handleCapturePhoto}
            >
              Capture
            </button>
          ) : (
            <button
              className="px-6 py-3 text-lg font-bold rounded-lg cursor-pointer transition-all duration-300 shadow-md text-white bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-600 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 hover:border-green-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-sm focus:outline-none focus:ring-4 focus:ring-green-400"
              onClick={handleResetWebcam}
            >
              Retake
            </button>
          )}
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
