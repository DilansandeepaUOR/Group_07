const express = require("express");
const router = express.Router();
const db = require("../../db");

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
        "SELECT po.Owner_name, po.E_mail, po.Phone_number, po.Owner_address, p.Pet_id, p.Pet_name, p.Pet_type, p.Pet_dob, p.Pet_gender FROM pet_owner po JOIN pet p ON po.Owner_id = p.Owner_id WHERE po.Owner_id = ?;",
        [id]
      );

    //console.log("Database results:", results);

    if (results.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(results[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error retrieving user" });
  }
});

router.put("/update", async (req, res) => {
  const { id } = req.query;

  //console.log("ID:", id); // Log the ID to check if it's being received correctly
  //console.log("Request Body:", req.body); // Log the request body to check the data being sent

  if (!id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const { Owner_name, E_mail, Phone_number, Owner_address } = req.body;
    const ownersql =
      "UPDATE pet_owner SET Owner_name = ?, E_mail = ?, Phone_number = ?, Owner_address = ? WHERE Owner_id = ?";

    db.query(
      ownersql,
      [Owner_name, E_mail, Phone_number, Owner_address, id],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting pet owner" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const { Pet_name, Pet_type, Pet_dob, Pet_gender } = req.body;
        const petsql =
          "UPDATE pet SET Pet_name = ?, Pet_type = ?, Pet_dob = ?, Pet_gender =? WHERE Owner_id = ?";
        db.query(petsql, [Pet_name, Pet_type, Pet_dob, Pet_gender, id], (err, results) => {
          if (err) {
            return res.status(500).json({ error: "Error inserting pet" });
          }
          if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Pet not found" });
          }

          res.status(200).json({ message: "User updated successfully DB" });
        });
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating user" });
  }
});

module.exports = router;
