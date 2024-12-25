const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

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

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public"); // Save files in 'uploads' folder
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

    // Save attendance to database
    const attendance = new Attendance({ image: imagePath, latitude, longitude, timestamp });
    
    const result =  await attendance.save();
    console.log('Saved Attendance', result)

    res.status(201).json({ message: "Attendance marked successfully." });
    console.log('Attendance marked successfully')
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Failed to mark attendance." });
  }
});

router.get("/attendance", async (req, res) => {
  try {
    const attendances = await Attendance.find();
    res.status(200).json(attendances);
  } catch (error) {
    console.error("Error fetching attendances:", error);
    res.status(500).json({ message: "Failed to fetch attendance records." });
  }
});

// Use Router in App
app.use("/api", router);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
