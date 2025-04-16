const express = require("express");
const router = express.Router();
const db = require("../../db");
const validEMPRegister = require("../../validations/adregvalidator");

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
        "SELECT first_name, last_name, email, phone_number, role, date_of_birth, gender, address, created_at FROM employee WHERE employee_id=?",
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

router.put("/adupdate", async (req, res) => {
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
  } = req.body;

  const updatesql =
    "UPDATE employee SET first_name=?, last_name=?, email=?, phone_number=?, date_of_birth=?, gender=?, address=? WHERE employee_id=?";

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

module.exports = router;
