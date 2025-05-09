const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Comment schema
const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

// Create the Comment model from the schema
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
