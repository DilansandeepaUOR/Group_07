const express = require("express");
const router = express.Router();

router.get("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;







