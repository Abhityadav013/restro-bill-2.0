const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./model/auth.model"); // Your User model
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Secret for signing JWT
/**
* @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin Login
 *     description: Authenticate admin user and return a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "adminpassword"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "your.jwt.token"
 *       400:
 *         description: Invalid username or password
 *       500:
 *         description: Server error
 */

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username in the database
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: "Invalid username" });
        }

        // Compare input password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Generate a JWT token for the admin
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "4h" });

        // Respond with the token
        res.json({ token });
    } catch (err) {
        // Handle server errors
        res.status(500).json({ error: "Error logging in" });
    }
});

// Middleware to protect admin routes
const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization"); // Get the Authorization header

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized access, token required" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach the decoded payload to the request
        next(); // Continue to the next middleware/route handler
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token" }); // Token verification failed
    }
};

module.exports = { router, authMiddleware };
