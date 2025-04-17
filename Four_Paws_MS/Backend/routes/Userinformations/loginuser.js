const express = require("express");
const verifyToken = require("../../verifications/verifyuser");

const router = express.Router();

router.get("/user", verifyToken, (req, res) => {
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, status: req.user.status });
});

router.get("/admins", verifyToken, (req, res) => {
    res.json({ id: req.user.id, fname: req.user.fname, lname: req.user.lname, role: req.user.role, email: req.user.email });
});

module.exports = router;

