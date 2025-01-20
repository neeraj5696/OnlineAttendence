const cron = require('node-cron');  // Import node-cron
const nodemailer = require('nodemailer'); // Already imported in your code
const mongoose = require('mongoose'); // Already imported in your code
const xlsx = require('xlsx');  // Import xlsx library

// Define your transporter (email sender configuration)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'neerajkumar5696@gmail.com',  // your email here
    pass: process.env.EMAIL_PASS,  // your email password or app password here
  },
});

// Function to send email about daily attendance
const sendDailyAttendanceEmail = async () => {
  try {
    // Fetch attendance data from the database
    const attendances = await Attendance.find(); // Assuming Attendance is your model

    if (attendances.length === 0) {
      console.log("No attendance records found for today.");
      return;
    }

    // Prepare data for Excel sheet
    const attendanceData = [];
    attendances.forEach(attendance => {
      const timestamp = new Date(attendance.timestamp).toLocaleString();
      attendanceData.push({
        Timestamp: timestamp,
        Latitude: attendance.latitude,
        Longitude: attendance.longitude,
        Image: `data:image/jpeg;base64,${attendance.image}`,
      });
    });

    // Create a new workbook and add the attendance data to it
    const ws = xlsx.utils.json_to_sheet(attendanceData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Attendance Report');

    // Write the workbook to a file (in memory)
    const filePath = './attendance_report.xlsx';
    xlsx.writeFile(wb, filePath);

    // Prepare the email with the Excel file as an attachment
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: 'neerajkumaryadava5696@gmail.com', // Recipient address (you can add more email addresses here)
      subject: 'Daily Attendance Report', // Email subject
      text: 'Please find attached the daily attendance report in Excel format.', // Email text
      attachments: [
        {
          filename: 'attendance_report.xlsx',
          path: filePath, // Path to the generated Excel file
        },
      ],
    };

    // Send the email with the attachment
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending daily email:", error);
      } else {
        console.log("Daily email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
  }
};

// Schedule the cron job to run every day at 8:00 PM
cron.schedule('0 20 * * *', () => {
  console.log("Sending daily attendance email at 8 PM...");
  sendDailyAttendanceEmail();
});
