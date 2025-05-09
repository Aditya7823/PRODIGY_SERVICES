const mongoose = require("mongoose");
const { Schema } = mongoose;

const followSchema = new Schema(
    {
        follower: {
            type: Schema.Types.ObjectId, // User who is following
            ref: "User",
            required: true,
        },
        following: {
            type: Schema.Types.ObjectId, // User who is being followed
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Follow = mongoose.model("Follow", followSchema);

module.exports = Follow;
