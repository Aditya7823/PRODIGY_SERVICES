const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // The user who follows
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // The user being followed
    message: { type: String, required: true }, // Notification message
    createdAt: { type: Date, default: Date.now }, // Timestamp
    isRead: { type: Boolean, default: false }, // Whether the notification has been read
});

module.exports = mongoose.model("Notification", notificationSchema);
