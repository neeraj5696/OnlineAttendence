import mongoose from "mongoose";

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

const handler = async (req, res) => {
  try {
    if (req.method === "GET") {
      await connectDB();  // Connect to DB

      const attendances = await Attendance.find();
      return res.status(200).json(attendances);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error fetching attendances:", error);
    res.status(500).json({ message: "Failed to fetch attendance records." });
  }
};

export default handler;
