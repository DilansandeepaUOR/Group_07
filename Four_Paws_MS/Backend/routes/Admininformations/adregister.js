const express = require("express");
const router = express.Router();
const db = require("../../db");
const bcrypt = require("bcrypt");
const validEMPRegister = require("../../validations/adregvalidator");

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

  try {
    //existance of email
    db.query(
      "SELECT * FROM employee WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
          return res.status(409).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const emp =
          "INSERT INTO employee (first_name, last_name, email, phone_number, role, date_of_birth, gender, address, password) VALUES (?, ?, ?, ?, ?,?,?,?,?)";

        db.query(
          emp,
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
          (err, result) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Error inserting employee" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "User not found!" });
              }

            res.status(201).json({ message: "employee added successfully" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/employees", async (req, res) => {
  const usersql = "SELECT * FROM employee;";
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

router.put("/empupdate", validEMPRegister ,async (req, res) => {
  const { employee_id } = req.query;

  console.log("ID:", employee_id); // Log the ID to check if it's being received correctly
  console.log("Request Body:", req.body); // Log the request body to check the data being sent

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
    } = req.body;
    const empsql =
      "UPDATE employee SET first_name = ?, last_name = ?, email = ?, phone_number = ?, role = ?, date_of_birth = ?, gender = ?, address = ? WHERE employee_id = ?";

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
        employee_id,
      ],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting pet owner" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating user" });
  }
});

module.exports = router;
