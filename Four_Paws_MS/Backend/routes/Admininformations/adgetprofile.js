const express = require("express");
const router = express.Router();
const db = require("../../db");
const uploadpropic = require("../../validations/emppropicvalidator");
const bcrypt = require("bcrypt");
const tokens = new Map(); // Temporary storage (use DB in production)
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

//get profile information to frontend
router.get("/adprofile", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const [result] = await db
      .promise()
      .query(
        "SELECT first_name, last_name, email, phone_number, role, date_of_birth, gender, address, Pro_pic, created_at FROM employee WHERE employee_id=?",
        [id]
      );

    if (result.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error retrieving user" });
  }
});

//edit profile information

router.put("/adupdate", uploadpropic.single("image"), async (req, res) => {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: "ID query parameter is required" });
  }

  const {
    first_name,
    last_name,
    email,
    phone_number,
    date_of_birth,
    gender,
    address,
    oldImage,
  } = req.body;

  const imagePath = req.file
    ? `/uploads/propics/emppropics/${req.file.filename}`
    : oldImage;

  const updatesql =
    "UPDATE employee SET first_name=?, last_name=?, email=?, phone_number=?, date_of_birth=?, gender=?, address=?, Pro_pic=? WHERE employee_id=?";

  try {
    db.query(
      updatesql,
      [
        first_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        gender,
        address,
        imagePath,
        id,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting pet owner" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }
      }
    );

    res.status(200).json({ message: "User updated successfully DB" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating user" });
  }
});

//update password
router.post("/adpasswordreset", async (req, res) => {
  const { id1, email, newPassword, currentPassword } = req.body;

  try {
    const currentPasswordQuery =
      "SELECT password FROM employee WHERE employee_id = ?";
    const [currentPasswordResult] = await db
      .promise()
      .query(currentPasswordQuery, [id1]);

    if (currentPasswordResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      currentPasswordResult[0].password
    );

    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const [user] = await db
      .promise()
      .query("SELECT employee_id FROM employee WHERE email = ?", [email]);

    if (user.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }

    const token = jwt.sign(
      { id: user[0].employee_id, newPassword },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:3001/api/adconfirmpassword?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirm Password Reset",
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: red;">Confirm Your 4Paws Account Password Resetting </h2>
    <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #028478;">
    Click below to confirm password resetting</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
             <a href="${resetLink}" style="padding:10px 20px; background-color:#4CAF50; color:white; text-decoration:none;">Confirm Password Reset</a>`,
    };

    sendMail(mailOptions, res);
  } catch (error) {
    console.error("Reset request error:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/adconfirmpassword", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const hashedPassword = await bcrypt.hash(decoded.newPassword, 10);

    const updatesql = "UPDATE employee SET password = ? WHERE employee_id = ?";
    await db.promise().query(updatesql, [hashedPassword, decoded.id]);

    res.redirect("http://localhost:5173/Addashboard");
  } catch (err) {
    return res.status(400).send("Invalid or expired link.");
  }
});

function sendMail(options, res) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.sendMail(options, (error, info) => {
    if (error) return res.status(500).json({ error: "Email sending failed" });
    res.status(200).json({ message: "Confirmation email sent" });
  });
}

// Deactivate account and delete account
// Send deactivation email
router.post("/adaccount/deactivate", (req, res) => {
  const { email, id } = req.body;

  const token = uuidv4();
  tokens.set(token, { id, type: "deactivate" });

  const link = `http://localhost:3001/api/adconfirm-action?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirm Account Deactivation",
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: red;">Confirm Your 4Paws Account Deactivation </h2>
             
             <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #028478;">
    Click below to confirm deactivation</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
           <a href="${link}" style="padding:10px 20px; background:#f59e0b; color:white; text-decoration:none;">Confirm Account Deactivation</a>`,
  };

  sendMail(mailOptions, res);
});

router.post("/adaccount/delete", (req, res) => {
  const { email, id } = req.body;

  const token = uuidv4();
  tokens.set(token, { id, type: "delete" });

  const link = `http://localhost:3001/api/adconfirm-action?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirm Account Deletion",
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: red;">Confirm Your 4Paws Account Deletion </h2>
             
             <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #028478;">
    Click below to confirm deletion</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
           <a href="${link}" style="padding:10px 20px; background:#dc2626; color:white; text-decoration:none;">Confirm Account Deletion</a>`,
  };

  sendMail(mailOptions, res);
});

router.get("/adconfirm-action", async (req, res) => {
  const { token } = req.query;
  const data = tokens.get(token);

  if (!data) {
    return res.status(400).send("Invalid or expired confirmation link.");
  }

  if (data.type === "deactivate") {
    try {
      // Prevent deletion of user with ID 16
      if (data.id === 13) {
        tokens.delete(token);
        return res.status(403).send("This account cannot be deactivated.");
      }
      await db
        .promise()
        .query(
          "UPDATE employee SET status = 'Inactive' WHERE employee_id = ?",
          [data.id]
        );
      tokens.delete(token);
      res.redirect("http://localhost:5173/Adlogin");
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (data.type === "delete") {
    try {
      // Prevent deletion of user with ID 16
      if (data.id === 13) {
        tokens.delete(token);
        return res.status(403).send("This account cannot be deleted.");
      }
      //delete employee from employee table
      const deleteEmployeeSql = "DELETE FROM employee WHERE employee_id = ?";
      db.query(deleteEmployeeSql, [data.id], (err, employeeResult) => {
        if (err) {
          return res.status(500).json({ error: "Error deleting Employee" });
        }

        if (employeeResult.affectedRows === 0) {
          return res.status(404).json({ error: "Employee not found" });
        }
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
    tokens.delete(token);
    res.redirect("http://localhost:5173/Adlogin");
  }
});

module.exports = router;
