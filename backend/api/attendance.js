import mongoose from "mongoose";
import multer from "multer";

// MongoDB connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return mongoose.connections[0];
  }
  return mongoose.connect("mongodb://127.0.0.1:27017/OnlinePresent");
};

// Define Attendance Schema and Model
const attendanceSchema = new mongoose.Schema({
  image: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const config = {
  api: {
    bodyParser: false,  // Important for file uploads
  },
};

const handler = async (req, res) => {
  try {
    if (req.method === "POST") {
      // Handle multipart form data (File Upload)
      const data = await new Promise((resolve, reject) => {
        upload.single("image")(req, res, (err) => {
          if (err) reject(err);
          resolve(req.body);
        });
      });

      const { latitude, longitude, timestamp } = data;
      const base64Image = req.file.buffer.toString("base64");

      await connectDB();  // Connect to DB

      const attendance = new Attendance({
        image: base64Image,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });

      await attendance.save();
      return res.status(201).json({ message: "Attendance marked successfully." });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Failed to mark attendance." });
  }
};

export default handler;
