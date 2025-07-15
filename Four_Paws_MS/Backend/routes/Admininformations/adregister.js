const express = require("express");
const router = express.Router();
const db = require("../../db");
const bcrypt = require("bcrypt");
const validEMPRegister = require("../../validations/adregvalidator");
const nodemailer = require("nodemailer");
const tempUsers = new Map(); // Temporary in-memory storage

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

router.post("/empregister", validEMPRegister, async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    date_of_birth,
    gender,
    role,
    address,
    password,
  } = req.body;

  // check email existence
  db.query(
    "SELECT * FROM employee WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Temporarily store data
      tempUsers.set(email, {
        first_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        gender,
        role,
        address,
        hashedPassword,
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

      const confirmationLink = `http://localhost:3001/api/adregform/empregister/confirm?email=${encodeURIComponent(
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

router.get("/empregister/confirm", (req, res) => {
  const email = req.query.email;
  const userData = tempUsers.get(email);

  if (!userData) {
    return res.status(400).send("Invalid or expired confirmation link.");
  }

  // Now insert into the database
  const {
    first_name,
    last_name,
    phone_number,
    date_of_birth,
    gender,
    role,
    address,
    hashedPassword,
  } = userData;

  const empSQL =
    "INSERT INTO employee (first_name, last_name, email, phone_number, role, date_of_birth, gender, address, password) VALUES (?, ?, ?, ?, ?,?,?,?,?)";

  db.query(
    empSQL,
    [
      first_name,
      last_name,
      email,
      phone_number,
      role,
      date_of_birth,
      gender,
      address,
      hashedPassword,
    ],
    (err, empResult) => {
      if (err) return res.status(500).send("Failed to save owner.");

      tempUsers.delete(email); // cleanup
      res.redirect("http://localhost:5173/Addashboard"); // redirect to login page
    }
  );
});

// router.post("/empregister", validEMPRegister, async (req, res) => {
//   const {
//     first_name,
//     last_name,
//     email,
//     phone_number,
//     date_of_birth,
//     gender,
//     role,
//     address,
//     password,
//   } = req.body;

//   try {
//     //existance of email
//     db.query(
//       "SELECT * FROM employee WHERE email = ?",
//       [email],
//       async (err, results) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({ error: "Database error" });
//         }

//         if (results.length > 0) {
//           return res.status(409).json({ error: "User already exists" });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const emp =
//           "INSERT INTO employee (first_name, last_name, email, phone_number, role, date_of_birth, gender, address, password) VALUES (?, ?, ?, ?, ?,?,?,?,?)";

//         db.query(
//           emp,
//           [
//             first_name,
//             last_name,
//             email,
//             phone_number,
//             role,
//             date_of_birth,
//             gender,
//             address,
//             hashedPassword,
//           ],
//           (err, result) => {
//             if (err) {
//               return res
//                 .status(500)
//                 .json({ error: "Error inserting employee" });
//             }

//             if (result.affectedRows === 0) {
//               return res.status(404).json({ error: "User not found!" });
//             }

//             res.status(201).json({ message: "employee added successfully" });
//           }
//         );
//       }
//     );
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

router.get("/employees", async (req, res) => {
  const usersql = "SELECT * FROM employee WHERE role <> 'Admin';";
  try {
    db.query(usersql, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Error retrieving users" });
      }

      //console.log("Database results:", results);

      if (results.length === 0) {
        return res.status(404).json({ error: "No users Found" });
      }

      res.json(results);
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error retrieving user" });
  }
});

router.put("/empupdate", async (req, res) => {
  const { employee_id } = req.body;

  //console.log("ID:", employee_id); // Log the ID to check if it's being received correctly
  //console.log("Request Body:", req.body); // Log the request body to check the data being sent

  if (!employee_id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const {
      first_name,
      last_name,
      email,
      phone_number,
      role,
      date_of_birth,
      gender,
      address,
      status,
    } = req.body;
    const empsql =
      "UPDATE employee SET first_name = ?, last_name = ?, email = ?, phone_number = ?, role = ?, date_of_birth = ?, gender = ?, address = ?, status = ? WHERE employee_id = ?";

    db.query(
      empsql,
      [
        first_name,
        last_name,
        email,
        phone_number,
        role,
        date_of_birth,
        gender,
        address,
        status,
        employee_id,
      ],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting user" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }
      }
    );
    res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating user" });
  }
});

router.delete("/empdelete", async (req, res) => {
  const { employee_id } = req.query;

  if (!employee_id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  const delsql = "DELETE FROM employee WHERE employee_id=?";
  try {
    db.query(delsql, [employee_id], (error, result) => {
      if (error) {
        res.status(500).json({ message: "Error deleting user!" });
      }
    });

    res.status(200).json({ message: "User Deleted!!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating user" });
  }
});

module.exports = router;
