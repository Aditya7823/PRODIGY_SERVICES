const { Router } = require('express'); 
const router = Router();
const multer = require('multer');
const Blog = require('../models/blog'); // Import the Blog model
const Comment = require('../models/comment'); // Import the Blog model
const Notification = require('../models/notification'); // Import the Blog model
const { upload } = require('../cloudinaryConfig'); // Import Cloudinary upload setup
const ensureAuthenticated = require('../middlewares/auth');
router.get('/add-blog', async(req, res) => {
      const notifications = await Notification.find({ receiver: req.user._id })
                .sort({ createdAt: -1 }) // Sort by most recent
                .populate("sender", "fullname"); // Populate the sender's fullname from User schema
    
    return res.render('addBlog', {
        user: req.user,
        notifications
    });
});
// Route to handle form submission
router.post('/add-new', upload.single('coverImage'), async (req, res) => {
    try {
        const { title, body } = req.body;
        const coverImageURL = req.file ? req.file.path : null; // Get Cloudinary URL

        const newBlog = new Blog({
            title,
            body,
            coverImageURL,
            createdBy: req.user ? req.user._id : null, // Associate with logged-in user if available
        });

        await newBlog.save();
        res.redirect('/home'); // Redirect to the home page or a success page
    } catch (error) {
        console.error('Error saving blog:', error);
        res.status(500).send('An error occurred while saving the blog.');
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    console.log('Request received for blog ID:', id);

    try {
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 })
            .populate("sender", "fullname");
        console.log('Notifications fetched:', notifications.length);

        const blog = await Blog.findById(id).populate('createdBy');
        if (!blog) {
            console.error('Blog not found for ID:', id);
            return res.status(404).send('Blog not found');
        }
        console.log('Blog fetched:', blog);

        const comments = await Comment.find({ blogId: id })
            .populate('createdBy', 'fullname')
            .sort({ createdAt: -1 });
        console.log('Comments fetched for blog:', comments.length);

        res.render('blog', {
            blog,
            user,
            comments,
            notifications
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send('Internal Server Error');
    }
});


//router for the coment 

router.post('/comment/:blogId', async (req, res) => {
    
    const { content, user_id } = req.body;
    const { blogId } = req.params;

        // Ensure content is provided
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content cannot be empty' });
        }

        // Check if the blog post exists
        const blog = await Blog.findById(blogId).populate('createdBy');
        
        if (!blog) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        const comment = await Comment.create({
            content,
            blogId,        // The blog this comment is associated with
            createdBy: user_id  // The user who created the comment
        });
        const comments = await Comment.find({ blogId: blogId })
        .populate('createdBy', 'fullname')  // Populate the user's fullname field
        .sort({ createdAt: -1 });  // Optional: Sort comments by date (newest first)
   console.log(comments);
        // Create a new comment
        
  const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema


        res.render('blog', { blog, comments, user: req.user ,notifications}); 
       
    }
);

module.exports = router;
