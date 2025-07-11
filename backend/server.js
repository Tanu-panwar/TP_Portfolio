const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Nodemailer transporter configuration
const contactEmail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS, // from .env
  },
});

// Transporter verification
contactEmail.verify((error) => {
  if (error) {
    console.log("Email verification error:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

// Contact form endpoint
app.post("/contact", (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;
  const name = `${firstName} ${lastName}`;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9]{10,13}$/;

  if (!firstName || !email || !emailRegex.test(email)) {
    return res.status(400).json({
      code: 400,
      error: "First Name and valid Email are required",
    });
  }

  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({
      code: 400,
      error: "Invalid phone number format",
    });
  }

  const mail = {
    from: name,
    to: process.env.EMAIL_TO, // from .env
    subject: "Contact Form Submission - Portfolio",
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  contactEmail.sendMail(mail, (error) => {
    if (error) {
      console.error("Email send failed:", error);
      res.json({ code: 500, error: "Message failed to send" });
    } else {
      console.log("Email sent successfully");
      res.json({ code: 200, message: "Message sent successfully" });
    }
  });
});

// Newsletter endpoint
app.post("/newsletter", (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ code: 400, message: "Invalid email address" });
  }

  console.log("New newsletter subscriber:", email);
  return res.status(200).json({ code: 200, message: "Subscribed successfully" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
