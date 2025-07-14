const express = require("express");
const router = express.Router();
const db = require("../../db");
const uploadpropic = require("../../validations/propicvalidator");
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

router.get("/profile", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const [results] = await db
      .promise()
      .query(
        "SELECT po.Owner_name, po.E_mail, po.Phone_number, po.Owner_address, po.Pro_pic, p.Pet_id, p.Pet_name, p.Pet_type, p.Pet_dob, p.Pet_gender FROM pet_owner po JOIN pet p ON po.Owner_id = p.Owner_id WHERE po.Owner_id = ?;",
        [id]
      );

    console.log("Database results:", results);

    if (results.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(results[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error retrieving user" });
  }
});

router.put("/update", uploadpropic.single("image"), async (req, res) => {
  const { id } = req.query;

  //console.log("ID:", id); // Log the ID to check if it's being received correctly
  //console.log("Request Body:", req.body); // Log the request body to check the data being sent

  if (!id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const { Owner_name, E_mail, Phone_number, Owner_address, oldImage } =
      req.body;

    const imagePath = req.file
      ? `/uploads/propics/${req.file.filename}`
      : oldImage;

    const ownersql =
      "UPDATE pet_owner SET Owner_name = ?, E_mail = ?, Phone_number = ?, Owner_address = ?, Pro_pic = ? WHERE Owner_id = ?";

    db.query(
      ownersql,
      [Owner_name, E_mail, Phone_number, Owner_address, imagePath, id],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting pet owner" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully DB" });
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating user" });
  }
});



// Update password
router.post("/passwordreset", async (req, res) => {
  const { id1, email, newPassword, currentPassword } = req.body;

  try {

    const currentPasswordQuery =
      "SELECT Password FROM pet_owner WHERE Owner_id = ?";
    const [currentPasswordResult] = await db
      .promise()
      .query(currentPasswordQuery, [id1]);

    if (currentPasswordResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      currentPasswordResult[0].Password
    );

    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const [user] = await db.promise().query(
      "SELECT Owner_id FROM pet_owner WHERE E_mail = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }

    const token = jwt.sign(
      { id: user[0].Owner_id, newPassword },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:3001/api/confirmpassword?token=${token}`;

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
router.get("/confirmpassword", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const hashedPassword = await bcrypt.hash(decoded.newPassword, 10);

    const updatesql = "UPDATE pet_owner SET Password = ? WHERE Owner_id = ?";
    await db.promise().query(updatesql, [hashedPassword, decoded.id]);

    res.redirect("http://localhost:5173/Passwordchange");

  } catch (err) {
    return res.status(400).send("Invalid or expired link.");
  }
});


// Deactivate account and delete account
// Send deactivation email
router.post("/account/deactivate", (req, res) => {
  const { email, id } = req.body;
  const token = uuidv4();
  tokens.set(token, { id, type: "deactivate" });

  const link = `http://localhost:3001/api/confirm-action?token=${token}`;

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

router.post("/account/delete", (req, res) => {
  const { email, id } = req.body;
  const token = uuidv4();
  tokens.set(token, { id, type: "delete" });

  const link = `http://localhost:3001/api/confirm-action?token=${token}`;

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

router.get("/confirm-action", async (req, res) => {
  const { token } = req.query;
  const data = tokens.get(token);

  if (!data) {
    return res.status(400).send("Invalid or expired confirmation link.");
  }

  if (data.type === "deactivate") {
    await db
      .promise()
      .query(
        "UPDATE pet_owner SET Account_status = 'Inactive' WHERE Owner_id = ?",
        [data.id]
      );
      tokens.delete(token);
      res.redirect("http://localhost:5173/Deactivate"); 
  } else if (data.type === "delete") {
    try {
      // Delete pet first
      const deletePetSql = "DELETE FROM pet WHERE Owner_id = ?";
      db.query(deletePetSql, [data.id], (err, petResult) => {
        if (err) {
          return res.status(500).json({ error: "Error deleting pet records" });
        }

        //delete pet owner
        const deleteOwnerSql = "DELETE FROM pet_owner WHERE Owner_id = ?";
        db.query(deleteOwnerSql, [data.id], (err, ownerResult) => {
          if (err) {
            return res.status(500).json({ error: "Error deleting pet owner" });
          }

          if (ownerResult.affectedRows === 0) {
            return res.status(404).json({ error: "Pet owner not found" });
          }
        });
      });

    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
    tokens.delete(token);
    res.redirect("http://localhost:5173/Delete"); 
  }

  
});

// Add a pet to the owner

router.post("/addpet", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const { petName, petType, petDob, petGender } = req.body;
    console.log("Request Body:", req.body); // Log the request body to check the data being sent
    const petsql =
      "INSERT INTO pet (Pet_name, Pet_type, Pet_dob, Pet_gender, Owner_id) VALUES (?, ?, ?, ?, ?)";
    db.query(
      petsql,
      [petName, petType, petDob, petGender, id],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting pet" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Pet not found" });
        }

        res.status(200).json({ message: "Pet added successfully" });
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error adding pet" });
  }
});

router.get("/pets", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const [results] = await db
      .promise()
      .query("SELECT * FROM pet WHERE Owner_id = ?;", [id]);

    console.log("Database results:", results);

    if (results.length === 0) {
      return res.status(404).json({ error: "Pets not found" });
    }

    res.json(results);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error retrieving pets" });
  }
});

router.put("/updatepets/:ownerid/:petid", async (req, res) => {
  const { ownerid, petid } = req.params;

  //console.log("ID:", id); // Log the ID to check if it's being received correctly
  //console.log("Request Body:", req.body); // Log the request body to check the data being sent

  if (!ownerid || !petid) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const { Pet_name, Pet_type, Pet_dob, Pet_gender } = req.body;
    const petsql =
      "UPDATE pet SET Pet_name = ?, Pet_type = ?, Pet_dob = ?, Pet_gender =? WHERE Owner_id = ? AND Pet_id = ?";
    db.query(
      petsql,
      [Pet_name, Pet_type, Pet_dob, Pet_gender, ownerid, petid],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting pet" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Pet not found" });
        }

        res.status(200).json({ message: "User updated successfully" });
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating user" });
  }
});

module.exports = router;
