const express = require("express");
const router = express.Router();
const db = require('../../db');
const bcrypt= require('bcrypt');
const validEMPRegister=require('../../validations/adregvalidator');

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.use((req,res,next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

router.post("/empregister",validEMPRegister, async (req, res) => {

    const {fname, lname, email, phone, dob, gender, role, address, password} =req.body;
    
    
    try {
        //existance of email
        db.query('SELECT * FROM employee WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length > 0) {
                return res.status(409).json({ error: "User already exists" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            const emp= "INSERT INTO employee (first_name, last_name, email, phone_number, role, date_of_birth, gender, address, password) VALUES (?, ?, ?, ?, ?,?,?,?,?)";

            db.query(emp,[fname,lname,email,phone,role,dob,gender,address,hashedPassword], (err, ownerResult) => {
                if(err) {
                    return res.status(500).json({error: "Error inserting employee"});
                }

                res.status(201).json({message: "employee added successfully"});

            });

        });

    } catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
})

module.exports = router;