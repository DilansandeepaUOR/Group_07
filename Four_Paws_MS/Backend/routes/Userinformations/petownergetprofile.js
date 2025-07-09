const express = require("express");
const router = express.Router();
const db = require("../../db");
const uploadpropic = require("../../validations/propicvalidator");
const bcrypt = require("bcrypt");

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

router.put("/updatepassword", async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const { newPassword, currentPassword } = req.body;

    const currentPasswordQuery =
      "SELECT Password FROM pet_owner WHERE Owner_id = ?";
    const [currentPasswordResult] = await db
      .promise()
      .query(currentPasswordQuery, [id]);

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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatesql = "UPDATE pet_owner SET Password = ? WHERE Owner_id = ?";

    db.query(updatesql, [hashedPassword, id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error updating password" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "Password updated successfully" });
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating password" });
  }
});


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

        res.status(200).json({ message: "Pet added successfully DB" });
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

        res.status(200).json({ message: "User updated successfully DB" });
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating user" });
  }
});

module.exports = router;
