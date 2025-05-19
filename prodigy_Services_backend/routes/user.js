const express = require('express');
const User = require('../models/user');
const Blog = require('../models/blog');
const Follow = require('../models/Follow');
const sendWelcomeEmail = require('../notifications/welcome');
const router = express.Router();

router.get('/signin', (req, res) => {
    res.render("signin");
});

router.get('/signup', (req, res) => {
    res.render("signup");
});
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);

        // Set the token in a cookie
        res.cookie("token", token, {
            httpOnly: true, // Secure the cookie
            maxAge: 60 * 60 * 1000, // Cookie expires in 1 hour
        });

        // Redirect to the saved URL or homepage
        const redirectTo = req.session.returnTo || '/home';
        delete req.session.returnTo; // Clear the session variable after redirecting
        res.redirect(redirectTo); // Redirect to the original URL or homepage
    } catch (error) {
        console.error("Signin Error:", error);
        res.render("signin", { error: "Invalid email or password" });
    }
});


router.post('/customsignin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Get the token by validating credentials
        const token = await User.matchPasswordAndGenerateToken(email, password);

        // Manually fetch the user from the DB
        const user = await User.findOne({ email }).select('-password -salt');

        // Set the token in a cookie
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        // Redirect logic
        const redirectTo = req.session.returnTo || '/home';
        delete req.session.returnTo;

        // Send success response
        res.status(200).json({
            success: true,
            message: "Login successful",
            redirectTo: redirectTo,
            user: user
        });

    } catch (error) {
        console.error("Signin Error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }
});

// router.post('/signup', async (req, res) => {
//     const { fullname, email, password } = req.body;

//     try {
//         // Create the user in the database
//         const newUser = await User.create({
//             fullname,
//             email,
//             password,
//             role: "USER"
//         });

//         // Send the welcome email
//         await sendWelcomeEmail(email, fullname);

//         // Fetch all blogs
//         const allBlogs = await Blog.find({});
    


        
//         // Optionally, handle the case where no users are followed
       

       
//         res.redirect("/user/signin");
//     } catch (error) {
//         console.error("Error creating user:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });









module.exports = router;










