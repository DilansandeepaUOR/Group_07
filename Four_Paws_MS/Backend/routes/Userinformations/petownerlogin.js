const express=require('express');
const router=express.Router();
const db=require('../../db');
const bcrypt= require('bcrypt');
const jwt = require("jsonwebtoken");
const validLogin=require('../../validations/loginvalidator');

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.use((req,res,next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

router.post("/login", validLogin, async (req,res) => {

    const {email, password}=req.body;

    try {
        const emailquery='SELECT * FROM pet_owner WHERE E_mail = ?';

        db.query(emailquery, [email], async (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }

            if (result.length === 0) {
                return res.status(401).json({error: "email or password does not match"});
            }

            const user=result[0];

            const pwmatch= await bcrypt.compare(password,user.Password);

            if(!pwmatch) {
                return res.status(401).json({error: "email or password does not match"});
            }

            const token = jwt.sign({ id: user.Owner_id, email: user.E_mail }, "secret", { expiresIn: "3h" });
            res.status(200).json({ message: "Login successful", token });
        });

    } catch (error) {
        return res.status(500).json({error: "Internal server error"});
    }

});

module.exports = router;
