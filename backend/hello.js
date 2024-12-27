const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require('fs');

// Initialize app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/OnlinePresent', {
})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Define Attendance Schema and Model
const attendanceSchema = new mongoose.Schema({
  image: { type: String, required: true },  // We store image path or base64 here
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});


const Attendance = mongoose.model("Attendance", attendanceSchema, "attendances"); // Explicitly set collection name

// Create Router
const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./public";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create folder if it doesn't exist
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to the filename
  },
});

const upload = multer({ storage: storage });


// API Routes
router.post("/attendance", upload.single("image"), async (req, res) => {
  try {
    // Extract data from request body
    const { latitude, longitude, timestamp } = req.body;
    const imagePath = req.file ? req.file.path : null; // Save the path of the uploaded image


    console.log("Received from frontend:", { latitude, longitude, timestamp, imagePath });

    if (!imagePath) {
      return res.status(400).json({ message: "Image is required." });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location is required." });
    }


     // Convert image to base64
     const base64Image = req.file.buffer.toString("base64");
    // Check if file exists
 
    if (!fs.existsSync(imagePath)) {
      console.error("File upload failed: File does not exist.");
      return res.status(500).json({ message: "Failed to upload image." });
    }

        // Save attendance to database
    const attendance = new Attendance({
      image: base64Image,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: timestamp ? new Date(timestamp) : undefined,
    });

    const result = await attendance.save();
    console.log('Saved Attendance', result)

    res.status(201).json({ message: "Attendance marked successfully." });
    console.log('Attendance marked successfully')
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Failed to mark attendance." });
  }
});

router.get('/attendance', async (req, res) => {
  try {
    const attendances = await Attendance.find();

    // If no attendances are found
    if (attendances.length === 0) {
      return res.send("<h2>No attendance records found</h2>");
    }

    let attendanceList = '';
    attendances.forEach(attendance => {
      const timestamp = new Date(attendance.timestamp).toLocaleString();
      attendanceList += `
        <div style="margin: 20px 0; padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 5px;">
          <h3>Attendance at ${timestamp}</h3>
          <p>Latitude: ${attendance.latitude}</p>
          <p>Longitude: ${attendance.longitude}</p>
          <p>Image:</p>
          <img src="data:image/jpeg;base64,${attendance.image}" alt="Attendance Image" style="width: 100px; height: auto; border-radius: 5px;">
        </div>
      `;
    });

    // Send HTML page with attendance records
    const htmlPage = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Attendance Logs</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f4f4f4;
            padding: 20px;
          }
          h1 {
            color: #333;
          }
          .attendance-item {
            margin: 20px 0;
            padding: 15px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .attendance-item img {
            width: 100px;
            height: auto;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <h1>Attendance Logs</h1>
        ${attendanceList}
      </body>
      </html>
    `;
    res.send(htmlPage);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).send("Error fetching attendance records.");
  }
});

app.get('/', (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Attendance Log</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          background-color: #f4f4f4;
          padding: 20px;
        }
        h1 {
          color: #333;
        }
        a {
          text-decoration: none;
          color: white;
          background-color: #007BFF;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 16px;
        }
        a:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to the Attendance Log System</h1>
      <p>Click the button below to view all attendance records:</p>
      <a href="/api/attendance" target="_blank">View Attendance Logs</a>
    </body>
    </html>
  `;
  res.send(htmlContent);
});


// Use Router in App
app.use("/api", router);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});