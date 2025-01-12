const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can use other email services as well
  auth: {
    user: process.env.EMAIL_USER,       // sender email address
    pass: process.env.EMAIL_PASSWORD,   // sender email password or app password
  },
});


// Initialize app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://neerajkumar5696:a8QOGFvjlD9T3F7y@cluster0.sw64i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

// MongoDB Connection
mongoose.connect(MONGO_URI, {})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Define Attendance Schema and Model
const attendanceSchema = new mongoose.Schema({
  image: { type: String, required: true },  // Image stored as base64 string
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Attendance = mongoose.model("Attendance", attendanceSchema, "attendances"); // Explicitly set collection name

// Create Router
const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API Routes
// POST route to mark attendance and send an email
router.post("/attendance", upload.single("image"), async (req, res) => {
  try {
    const { latitude, longitude, timestamp, email, EmployeeId } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!EmployeeId) {
      return res.status(400).json({ message: "Employee ID is required." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location is required." });
    }

    // Convert image to base64
    const base64Image = req.file.buffer.toString('base64');

    // Save attendance to the database
    const attendance = new Attendance({
      image: base64Image,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: timestamp ? new Date(timestamp) : undefined
    });

    const savedAttendance = await attendance.save();

    // Email content
    const subject = "Attendance Logged Successfully";
    const text = `
      Hello,

      Attendance has been successfully logged for Employee ID: ${EmployeeId}.

      Details:
      - Employee ID: ${EmployeeId}
      - Email: ${email}
      - Latitude: ${latitude}
      - Longitude: ${longitude}
      - Timestamp: ${new Date(timestamp).toLocaleString()}
      - Image: See attachment.

      Thank you.
    `;
    const htmlContent = `
      <h1>Attendance Logged Successfully</h1>
      <p><strong>Employee ID:</strong> ${EmployeeId}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Latitude:</strong> ${latitude}</p>
      <p><strong>Longitude:</strong> ${longitude}</p>
      <p><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}</p>
      <p><strong>Image:</strong></p>
      <img src="data:image/jpeg;base64,${base64Image}" alt="Attendance Image" width="300px" />

      <p>Thank you.</p>
    `;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,  // Sender email
      to: neerajkumar5696@gmail.com,  // Recipient's email
      subject: subject,  // Subject of the email
      text: text,  // Plain text version of the email
      html: htmlContent,  // HTML version of the email
      attachments: [
        {
          filename: 'attendance_image.jpg',
          content: base64Image,
          encoding: 'base64',
        },
      ],
    };

    // Send the email using Nodemailer
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');
    res.status(201).json({ message: "Attendance marked and email sent successfully." });

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

    // Group attendance records by date
    const groupedByDate = {};
    attendances.forEach(attendance => {
      const date = new Date(attendance.timestamp).toLocaleDateString(); // Extract date
      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(attendance);
    });

    // Generate HTML for attendance records grouped by date
    let attendanceList = '';
    Object.keys(groupedByDate).forEach(date => {
      attendanceList += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #007BFF;">${date}</h2>
      `;

      groupedByDate[date].forEach(attendance => {
        const timestamp = new Date(attendance.timestamp).toLocaleTimeString(); // Extract time
        attendanceList += `
          <div class="attendance-item">
            <h3>Attendance at ${timestamp}</h3>
            <p><strong>Latitude:</strong> ${attendance.latitude}</p>
            <p><strong>Longitude:</strong> ${attendance.longitude}</p>
            <p><strong>Image:</strong></p>
            <img src="data:image/jpeg;base64,${attendance.image}" alt="Attendance Image">
          </div>
        `;
      });

      attendanceList += '</div>'; // Close date group
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
          h2 {
            color: #007BFF;
            text-align: left;
            margin: 20px 0;
          }
          .attendance-item {
            margin: 15px auto;
            padding: 15px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            max-width: 600px;
            text-align: left;
          }
         .attendance-item img {
  width: 200px;
  height: auto;
  border-radius: 5px;
  margin-top: 10px;
}

          p {
            margin: 5px 0;
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