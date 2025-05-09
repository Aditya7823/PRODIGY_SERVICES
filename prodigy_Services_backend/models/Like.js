const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true }, // Blog ID
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User ID
}, { timestamps: true });

module.exports = mongoose.model("Like", likeSchema);
