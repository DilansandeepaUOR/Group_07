const express = require("express");
const router = express.Router();
const db = require("../../db");
const bcrypt= require('bcrypt');
const upload = require("../../validations/imgvalidator");
const e = require("express");

//Manage regular user registration
//register new user
router.post("/reguserregister", upload.single("image"), async (req, res) => {
  const { Owner_name, Owner_address, Phone_number, E_mail, confirmPassword } = req.body;
  console.log("Request Body:", req.body); // Log the request body to check the data being sent

  const imagePath = req.file ? `/uploads/propics/${req.file.filename}` : null;

  try {
    //existance of email
    db.query(
      "SELECT * FROM pet_owner WHERE E_mail = ?",
      [E_mail],
      async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
          return res.status(409).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(confirmPassword, 10);
        const ownersql =
          "INSERT INTO pet_owner (Owner_name, Owner_address, Phone_number, E_mail, Password, Pro_pic) VALUES (?, ?, ?, ?, ?, ?);";

        db.query(
          ownersql,
          [Owner_name, Owner_address, Phone_number, E_mail, hashedPassword, imagePath],
          (err, ownerResult) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Error inserting pet owner" });
            }

            const ownerid = ownerResult.insertId;

            const { Pet_name, Pet_type, Pet_dob, Pet_gender } = req.body;
            const petsql =
              "INSERT INTO pet (Owner_id, Pet_name, Pet_type, Pet_dob, Pet_gender) VALUES (?, ?, ?, ?, ?)";

            db.query(
              petsql,
              [ownerid, Pet_name, Pet_type, Pet_dob, Pet_gender],
              (err) => {
                if (err) {
                  console.error("Error inserting pet", err);
                  return res.status(500).json({ error: "Error inserting pet" });
                }
                res
              .status(200)
              .json({ message: "pet and pet owner added successfully" });
              }
              
            );
            
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


//get all registered users
router.get("/regusers", async (req, res) => {
  const petinfosql =
    "SELECT po.*, p.Pet_id, p.Pet_name, p.Pet_type, p.Pet_dob, p.Pet_gender FROM pet_owner po JOIN pet p ON po.Owner_id = p.Owner_id;";
  try {
    db.query(petinfosql, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Error retrieving petinfo" });
      }

      //console.log("Database results:", results);

      if (results.length === 0) {
        return res.status(404).json({ error: "No Products Found" });
      }

      res.json(results);
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error retrieving petinfo" });
  }
});


//Update registered user
router.put("/reguserupdate", upload.single("image"), async (req, res) => {
  const { Owner_id } = req.query;

  console.log("ID:", Owner_id); // Log the ID to check if it's being received correctly
  console.log("Request Body:", req.body); // Log the request body to check the data being sent

  if (!Owner_id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const { Owner_name, E_mail, Phone_number, Owner_address, Account_status, oldImage } = req.body;
    const imagePath = req.file
      ? `/uploads/propics/${req.file.filename}`
      : oldImage;
    const petinfosql =
      "UPDATE pet_owner SET Owner_name = ?, E_mail = ?, Phone_number = ?, Owner_address = ?, Account_status = ?, Pro_pic = ? WHERE Owner_id = ?";

    db.query(
      petinfosql,
      [
        Owner_name, E_mail, Phone_number, Owner_address, Account_status, imagePath, Owner_id
      ],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error updating pet owner" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Pet owner not found" });
        }

        const { Pet_name, Pet_type, Pet_dob, Pet_gender } = req.body;
        const petsql =
          "UPDATE pet SET Pet_name = ?, Pet_type = ?, Pet_dob = ?, Pet_gender =? WHERE Owner_id = ?";
        db.query(petsql, [Pet_name, Pet_type, Pet_dob, Pet_gender, Owner_id], (err, results) => {
          if (err) {
            return res.status(500).json({ error: "Error inserting pet" });
          }
          if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Pet not found" });
          }

          res.status(200).json({ message: "Pet owner updated successfully" });
        });
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating Pet owner" });
  }
});


//Delete registered user
router.delete("/userdelete", async (req, res) => {
  const { Owner_id } = req.query;

  if (!Owner_id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    // Delete pet first
    const deletePetSql = "DELETE FROM pet WHERE Owner_id = ?";
    db.query(deletePetSql, [Owner_id], (err, petResult) => {
      if (err) {
        return res.status(500).json({ error: "Error deleting pet records" });
      }

      //delete pet owner
      const deleteOwnerSql = "DELETE FROM pet_owner WHERE Owner_id = ?";
      db.query(deleteOwnerSql, [Owner_id], (err, ownerResult) => {
        if (err) {
          return res.status(500).json({ error: "Error deleting pet owner" });
        }

        if (ownerResult.affectedRows === 0) {
          return res.status(404).json({ error: "Pet owner not found" });
        }

        res.status(200).json({ message: "Pet owner and pet deleted successfully" });
      });
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
