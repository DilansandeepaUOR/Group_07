const express = require("express");
const router = express.Router();
const db = require('../../db');
const bcrypt= require('bcrypt');
const validRegister=require('../../validations/registervalidator');
// const tempUsers = new Map(); // Temporary in-memory storage
// const nodemailer = require("nodemailer");

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.use((req,res,next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});



// router.post("/register", validRegister, async (req, res) => {
//     const { name, address, phone, email, confirmPassword, petName, petDob, petType, petGender } = req.body;

//     // check email existence
//     db.query('SELECT * FROM pet_owner WHERE E_mail = ?', [email], async (err, results) => {
//         if (err) return res.status(500).json({ error: "Database error" });

//         if (results.length > 0) {
//             return res.status(409).json({ error: "User already exists" });
//         }

//         const hashedPassword = await bcrypt.hash(confirmPassword, 10);

//         // Temporarily store data
//         tempUsers.set(email, {
//             name, address, phone, email, hashedPassword,
//             petName, petDob, petType, petGender
//         });

//         // Send Email
//         const transporer = nodemailer.createTransport({
//               service: "gmail",
//               auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//               },
//             });
        
//             if (!transporer) {
//               return res.status(500).json({ error: "Email service not available" });
//             }

//         const confirmationLink = `http://localhost:3000/register/confirm?email=${encodeURIComponent(email)}`;

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: "Confirm your registration",
//             html: `<p>Click the button to confirm your registration and go to login.</p>
//                    <a href="${confirmationLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Go to Login Page</a>`
//         };

//         transporer.sendMail(mailOptions, (error, info) => {
//             if (error) return res.status(500).json({ error: "Email sending failed" });
//             res.status(200).json({ message: "Confirmation email sent. Please check your inbox." });
//         });
//     });
// });

// router.get("/register/confirm", (req, res) => {
//     const email = req.query.email;
//     const userData = tempUsers.get(email);

//     if (!userData) {
//         return res.status(400).send("Invalid or expired confirmation link.");
//     }

//     // Now insert into the database
//     const { name, address, phone, hashedPassword, petName, petDob, petType, petGender } = userData;

//     const ownerSQL = "INSERT INTO pet_owner (Owner_name, Owner_address, Phone_number, E_mail, Password) VALUES (?, ?, ?, ?, ?)";

//     db.query(ownerSQL, [name, address, phone, email, hashedPassword], (err, ownerResult) => {
//         if (err) return res.status(500).send("Failed to save owner.");

//         const ownerid = ownerResult.insertId;
//         const petSQL = "INSERT INTO pet (Owner_id, Pet_name, Pet_type, Pet_dob, Pet_gender) VALUES (?, ?, ?, ?, ?)";

//         db.query(petSQL, [ownerid, petName, petType, petDob, petGender], (err) => {
//             if (err) return res.status(500).send("Failed to save pet.");

//             tempUsers.delete(email); // cleanup
//             res.redirect("/login"); // redirect to login page
//         });
//     });
// });


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