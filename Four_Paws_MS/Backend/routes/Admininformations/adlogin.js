const express=require('express');
const router=express.Router();
const db=require('../../db');
const bcrypt= require('bcrypt');
const jwt = require("jsonwebtoken");
const validADLogin=require('../../validations/loginvalidator');
const cookieParser = require('cookie-parser');

router.use(express.json());
router.use(express.urlencoded({extended: true}));
router.use(cookieParser());

const SECRET_KEY = "12345";

router.use((req,res,next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

router.post("/adlogin", validADLogin, async (req,res) => {

    const {email, password}=req.body;

    try {
        const emailquery='SELECT * FROM employee WHERE email = ?';

        db.query(emailquery, [email], async (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }

            if (result.length === 0) {
                return res.status(401).json({error: "email or password does not match"});
            }

            const user=result[0];

            const pwmatch= await bcrypt.compare(password,user.password);

            if(!pwmatch) {
                return res.status(401).json({error: "email or password does not match"});
            }
            

            const token = jwt.sign({ id: user.employee_id, fname: user.first_name, lname: user.last_name , email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "3h" });

            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 3* 60* 60* 1000,
            });

            res.status(200).json({ message: "Login successful", user: { role: user.role} });

            
        });

    } catch (error) {
        return res.status(500).json({error: "Internal server error"});
    }

});

module.exports = router;