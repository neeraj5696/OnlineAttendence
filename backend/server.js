const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Initialize app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/attendanceDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Attendance Schema and Model
const attendanceSchema = new mongoose.Schema({
  image: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

// API Routes
app.post("/api/attendance", async (req, res) => {
  try {
    const { image, latitude, longitude, timestamp } = req.body;

    // Save attendance to database
    const attendance = new Attendance({ image, latitude, longitude, timestamp });
    await attendance.save();

    res.status(201).json({ message: "Attendance marked successfully." });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Failed to mark attendance." });
  }
});

app.get("/api/attendance", async (req, res) => {
  try {
    const attendances = await Attendance.find();
    res.status(200).json(attendances);
  } catch (error) {
    console.error("Error fetching attendances:", error);
    res.status(500).json({ message: "Failed to fetch attendance records." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
