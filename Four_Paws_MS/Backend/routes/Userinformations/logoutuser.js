const express = require("express");
const router = express.Router();
const verifyRoutes=require("../../verifications/verifyroutes");

router.get("/logout", verifyRoutes, (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;







