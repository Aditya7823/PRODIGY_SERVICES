const mongoose = require('mongoose');
const { createHmac, randomBytes } = require('crypto');
const { createTokenForUser } = require('../Services/authentication');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
        default: '/images/profile.png'
    },
    role: {  
        type: String,
        enum: ["USER", "ADMIN"]
    }
}, { timestamps: true });

// Hashing the password before saving
userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) return next();
    
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');
    user.salt = salt;
    user.password = hashedPassword;
    next();
});

// Matching the password during login and generating a token
userSchema.statics.matchPasswordAndGenerateToken = async function(email, password) {
    const user = await this.findOne({ email });
    
    if (!user) {
        console.error("User not found");
        throw new Error("User not found");
    }

    const salt = user.salt;
    const storedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");
    
    if (storedPassword !== userProvidedHash) {
        console.error("Incorrect password");
        throw new Error("Incorrect password");
    }
    
    const token = createTokenForUser(user);
    return token;
};

module.exports = mongoose.model('User', userSchema);
