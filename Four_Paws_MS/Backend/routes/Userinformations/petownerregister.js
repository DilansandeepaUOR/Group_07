const express = require("express");
const router = express.Router();
const db = require("../../db");
const bcrypt = require("bcrypt");
const validRegister = require("../../validations/registervalidator");
const tempUsers = new Map(); // Temporary in-memory storage
const nodemailer = require("nodemailer");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

router.post("/register", validRegister, async (req, res) => {
  const {
    name,
    address,
    phone,
    email,
    confirmPassword,
    petName,
    petDob,
    petType,
    petGender,
  } = req.body;

  // check email existence
  db.query(
    "SELECT * FROM pet_owner WHERE E_mail = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(confirmPassword, 10);

      // Temporarily store data
      tempUsers.set(email, {
        name,
        address,
        phone,
        email,
        hashedPassword,
        petName,
        petDob,
        petType,
        petGender,
      });

      // Send Email
      const transporer = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      if (!transporer) {
        return res.status(500).json({ error: "Email service not available" });
      }

      const confirmationLink = `http://localhost:3001/api/registerform/register/confirm?email=${encodeURIComponent(
        email
      )}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Confirm your registration",
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
             <h2 style="color: red;">Confirm Your 4Paws Account Registration </h2>
             
             <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #028478;">
                Click the button to confirm your registration and go to login.
                   
             </p>
             <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
             
                 <a href="${confirmationLink}" style="padding: 10px 20px; background-color: #028478; color: white; text-decoration: none;">Confirm Account Registration</a>
             
         </div>`,
      };

      transporer.sendMail(mailOptions, (error, info) => {
        if (error)
          return res.status(500).json({ error: "Email sending failed" });
        res.status(200).json({
          message: "Confirmation email sent. Please check your inbox.",
        });
      });
    }
  );
});

router.get("/register/confirm", (req, res) => {
  const email = req.query.email;
  const userData = tempUsers.get(email);

  if (!userData) {
    return res.status(400).send("Invalid or expired confirmation link.");
  }

  // Now insert into the database
  const {
    name,
    address,
    phone,
    hashedPassword,
    petName,
    petDob,
    petType,
    petGender,
  } = userData;

  const ownerSQL =
    "INSERT INTO pet_owner (Owner_name, Owner_address, Phone_number, E_mail, Password) VALUES (?, ?, ?, ?, ?)";

  db.query(
    ownerSQL,
    [name, address, phone, email, hashedPassword],
    (err, ownerResult) => {
      if (err) return res.status(500).send("Failed to save owner.");

      const ownerid = ownerResult.insertId;
      const petSQL =
        "INSERT INTO pet (Owner_id, Pet_name, Pet_type, Pet_dob, Pet_gender) VALUES (?, ?, ?, ?, ?)";

      db.query(
        petSQL,
        [ownerid, petName, petType, petDob, petGender],
        (err) => {
          if (err) return res.status(500).send("Failed to save pet.");

          tempUsers.delete(email); // cleanup
          res.redirect("http://localhost:5173/Login"); // redirect to login page
        }
      );
    }
  );
});

module.exports = router;
