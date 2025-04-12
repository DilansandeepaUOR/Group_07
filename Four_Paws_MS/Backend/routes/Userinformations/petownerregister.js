const express = require("express");
const router = express.Router();
const db = require('../../db');
const bcrypt= require('bcrypt');
const validRegister=require('../../validations/registervalidator');

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.use((req,res,next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

router.post("/register",validRegister, async (req, res) => {

    const {name, address, phone, email, confirmPassword} =req.body;
    
    try {
        //existance of email
        db.query('SELECT * FROM pet_owner WHERE E_mail = ?', [email], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length > 0) {
                return res.status(409).json({ error: "User already exists" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(confirmPassword, 10);
            const ownersql= "INSERT INTO pet_owner (Owner_name, Owner_address, Phone_number, E_mail, Password) VALUES (?, ?, ?, ?, ?)";

            db.query(ownersql,[name,address,phone,email,hashedPassword], (err, ownerResult) => {
                if(err) {
                    return res.status(500).json({error: "Error inserting pet owner"});
                }

                const ownerid=ownerResult.insertId;

                const {petName, petDob, petType, petGender} = req.body;
                const petsql= "INSERT INTO pet (Owner_id, Pet_name, Pet_type, Pet_dob, Pet_gender) VALUES (?, ?, ?, ?, ?)";

                db.query(petsql,[ownerid,petName,petType,petDob,petGender], (err) => {
                    if(err) {
                        console.error("Error inserting pet", err);
                        return res.status(500).json({ error: "Error inserting pet" });
                    }
                });
                res.status(201).json({message: "pet and pet owner added successfully"});

            });

        });

    } catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
})

module.exports = router;