const express = require("express");
const verifyToken = require("../../verifications/verifyuser");

const router = express.Router();

router.get("/user", verifyToken, (req, res) => {
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
});

module.exports = router;

