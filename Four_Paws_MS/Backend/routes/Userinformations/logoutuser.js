const express = require("express");

const router = express.Router();

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  });
  

module.exports = router;






