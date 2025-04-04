const jwt = require("jsonwebtoken");
const SECRET_KEY = "12345";

const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // token from cookies or authorization header; // Get token from cookies 

    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Forbidden: Invalid token" });

        req.user = decoded; // Attach user info to request
        next();
    });
};

module.exports = verifyToken;

