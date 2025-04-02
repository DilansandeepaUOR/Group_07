const express = require("express");
const verifyToken = require("../../verifications/verifyuser");

const router = express.Router();

router.get("/user", verifyToken, (req, res) => {
    res.json({ name: req.user.name });
});

module.exports = router;

