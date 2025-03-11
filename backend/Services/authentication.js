const JWT = require('jsonwebtoken');
const secret = "$uperMan123";

function createTokenForUser(user) {
    const payload = {
        _id: user._id,  // Use _id instead of id
        fullname: user.fullname,  // Include fullname in the payload if needed
        email: user.email,
        profileImageUrl: user.profileImageUrl,  // Correct the casing to match the schema
        role: user.role
    };

    const token = JWT.sign(payload, secret);
    return token;
}

function validateToken(token) {
    const payload = JWT.verify(token, secret);
    return payload;
}

module.exports = {
    createTokenForUser,
    validateToken
}
