const { Schema, model } = require("mongoose");

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    coverImageURL: {
        type: String, // Corrected 'string' to 'String'
        required: false,
    },
    createdBy: {
        type: Schema.Types.ObjectId, // Corrected to Schema.Types.ObjectId
        ref: "User",
    },
}, { timestamps: true }); // Added comma and proper syntax for the 'timestamps' option

const Blog = model('Blog', blogSchema); // Corrected 'Blogschema' to 'blogSchema'

module.exports = Blog;
