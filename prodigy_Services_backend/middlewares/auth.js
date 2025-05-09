
const jwt = require('jsonwebtoken');

function ensureAuthenticated(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        // Save the original URL the user wanted to access
        req.session.returnTo = req.originalUrl;
        return res.redirect('/user/signin'); // Redirect to the login page
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user; // Attach user info to the request object
        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        res.clearCookie("token");
        return res.redirect('/user/signin');
    }
}

module.exports = ensureAuthenticated;
