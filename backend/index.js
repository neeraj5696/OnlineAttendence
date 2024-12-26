// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const multer = require("multer");

// // Initialize app
// const app = express();
// const PORT = 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB Connection
// mongoose.connect('mongodb://127.0.0.1:27017/OnlinePresent', {})
//   .then(() => {
//     console.log('MongoDB connected successfully');
//   })
//   .catch((error) => {
//     console.error('MongoDB connection error:', error);
//   });

// // Define Attendance Schema and Model
// const attendanceSchema = new mongoose.Schema({
//   image: { type: String, required: true },  // Image stored as base64 string
//   latitude: { type: Number, required: true },
//   longitude: { type: Number, required: true },
//   timestamp: { type: Date, default: Date.now },
// });

// const Attendance = mongoose.model("Attendance", attendanceSchema, "attendances"); // Explicitly set collection name

// // Create Router
// const router = express.Router();

// // Configure multer for in-memory storage
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // API Routes
// router.post("/attendance", upload.single("image"), async (req, res) => {
//   try {
//     // Extract data from request body
//     const { latitude, longitude, timestamp } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ message: "Image is required." });
//     }
//     if (!latitude || !longitude) {
//       return res.status(400).json({ message: "Location is required." });
//     }

//     // Convert image to base64
//     const base64Image = req.file.buffer.toString('base64');

//     // Save attendance to database
//     const attendance = new Attendance({ 
//       image: base64Image, 
//       latitude: parseFloat(latitude), 
//       longitude: parseFloat(longitude), 
//       timestamp: timestamp ? new Date(timestamp) : undefined 
//     });

//     const result = await attendance.save();
//     console.log('Saved Attendance:', result);

//     res.status(201).json({ message: "Attendance marked successfully." });
//   } catch (error) {
//     console.error("Error marking attendance:", error);
//     res.status(500).json({ message: "Failed to mark attendance." });
//   }
// });

// router.get("/attendance", async (req, res) => {
//   try {
//     const attendances = await Attendance.find();
//     res.status(200).json(attendances);
//   } catch (error) {
//     console.error("Error fetching attendances:", error);
//     res.status(500).json({ message: "Failed to fetch attendance records." });
//   }
// });

// app.get('/', (req, res) => {
//   const link = `http://localhost:${PORT}/api/attendance`;
//   res.send(`To get All Log: ${link}`);
// });

// // Use Router in App
// app.use("/api", router);

// // Start Server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
