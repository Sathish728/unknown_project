const User = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();  // ✅ Corrected dotenv configuration

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password are required" });
        }

        const email1 = email.toLowerCase();  // ✅ Fixed toLowerCase() usage

        const user = await User.findOne({ email: email1 });
        if (!user) {
            return res.status(400).json({ message: "User Not Found" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Wrong Credentials" });
        }

        // Generate Token
        const youtubetoken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", youtubetoken, {
        httpOnly: true,
        secure: isProduction, // only secure in prod
        sameSite: isProduction ? "none" : "lax"
        }).json({ message: "User Login Successfully", user });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { login };
