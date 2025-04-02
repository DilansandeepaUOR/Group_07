const express = require("express");
const verifyToken = require("../../verifications/verifyuser"); // Import middleware

const router = express.Router();

router.get("/user", verifyToken, (req, res) => {
  res.json({ id: req.user.Owner_id, name: req.user.Owner_name, email: req.user.E_mail });
});

module.exports = router;
