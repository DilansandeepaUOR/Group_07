const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

router.post("/sendmail", async (req, res) => {
  const { name, email, phone, reason, message } = req.body;

  // Perform validation if needed
  if (!name || !email || !phone || !reason || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    let transporer = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    if (!transporer) {
      return res.status(500).json({ error: "Email service not available" });
    }

    // Styled HTML content for the email
    const htmlContent = `
         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
             <h2 style="color: #028478;">You have a new <span style="color: red">${reason}</span> E-mail from Your Client <span style="color: red">${name}</span></h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone}</p>
             <p><strong>Message:</strong></p>
             <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #028478;">
                 ${message}
             </p>
             <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
             <p style="font-size: 0.9em; color: #555;">
                 This email was sent from the Four Paws Clinic contact form.
             </p>
         </div>
     `;

    // Send email using the transporter
    await transporer.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `You have a new ${reason} E-mail`,
      html: htmlContent,
    });

    console.log("Email sent successfully");

    // Send a response back to the client
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error while sending email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

  // Here you can handle the contact information (e.g., save it to the database)
  // For demonstration purposes, we'll just send a success response
  // res.status(200).json({ message: "Contact information received" });
});

module.exports = router;
