require("dotenv").config();
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const express = require('express');
const ensureAuthenticated = require('./middlewares/auth');
const path = require('path');
const fs = require('fs');
const sendWelcomeEmail = require('./notifications/welcome');
const app = express();
const Follow = require("./models/Follow");
const Like = require("./models/Like");
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const Blog = require('./models/blog'); // Correct import
const Notification = require("./models/notification");// Correct import
const Comment = require('./models/blog'); // Correct import
const User = require('./models/user'); // Correct import
const cors = require("cors");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
app.use(bodyParser.json());
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const passport= require('passport');
const GoogleStrategy= require('passport-google-oauth20').Strategy;
app.use(passport.initialize());
const { upload } = require('./cloudinaryConfig');
const session = require('express-session'); 

app.use(session({
    secret: process.env.SESSION_SECRET || '$uperMan123', // Replace with a secure secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 10 * 60 * 1000, // 10 minutes
        secure: false           // Set to true in production with HTTPS
      }
}));





app.use(cors({
  origin: 'http://localhost:3000', // Replace with your React app's URL
  credentials: true,              // Allow credentials (cookies, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

// Middleware to make user available globally
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

const messRoutes = require('./routes/messRoutes');

// Use the routes
app.use(messRoutes);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve static files
app.use(express.static('public'));

// Middleware to parse cookies
app.use(cookieParser());

// Authentication middleware
app.use(checkForAuthenticationCookie());


app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Middleware to make user available globally
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            user = new User({
                email: profile.emails[0].value,
                fullname: profile.displayName || 'Google User',
                password: '',
                role: 'USER',
                profileImageUrl: profile.photos ? profile.photos[0].value : '/images/profile.png',
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser ((user, done) => {
    done(null, user.id);
});

passport.deserializeUser (async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/signin');
}

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/signin',
        successRedirect: '/home'
    }));

app.get('/signin', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/home'); // Redirect to home if already signed in
    }
    res.render("signin");
});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        res.cookie("token", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        const redirectTo = req.session.returnTo || '/home';
        delete req.session.returnTo;
        res.redirect(redirectTo);
    } catch (error) {
        console.error("Signin Error:", error);
        res.render("signin", { error: "Invalid email or password" });
    }
});















// signup  rotute

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Sender email from .env
      pass: process.env.EMAIL_PASS, // Sender email password from .env
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully.');
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Error sending OTP. Please try again.');
  }
};

app.use(session({
    secret:  process.env.SESSION_SECRET || '$uperMan123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true if using HTTPS
  }));





// Route to generate and send OTP
app.post('/user/send-otp', async (req, res) => {
    const { email } = req.body;
  
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      // Send the OTP to the user's email
      await sendOtpEmail(email, otp);
  
      // Save OTP to session with an expiration time (e.g., 5 minutes)
      req.session.otp = otp;
      req.session.otpExpiration = Date.now() + 95 * 60 * 1000; // Expires in 5 minutes
      
      console.log('OTP saved in session:', otp);
      console.log('Session after setting OTP:', req.session);
      res.status(200).send("OTP sent successfully.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).send("Error sending OTP. Please try again.");
    }
  });
  
  // Signup route with OTP verification
  app.post('/user/signup', async (req, res) => {
    const { fullname, email, password, otp, role, location } = req.body;
  
    console.log('Session in signup route:', req.session);
  
    // Check OTP expiration
    if (Date.now() > req.session.otpExpiration) {
      return res.status(400).send("OTP has expired. Please request a new one.");
    }
  
    if (otp !== req.session.otp) {
      return res.status(400).send("Invalid OTP. Please try again.");
    }
  
    try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send("Email already exists. Please use a different email.");
      }
  
      // Create a new user with role and location
      const newUser = await User.create({
        fullname,
        email,
        password,
        role: role || "USER", // fallback to "USER" if role is not provided
        location
      });
  
      // Send welcome email (optional)
      await sendWelcomeEmail(email, fullname);
  
      res.redirect("/user/signin");
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  

//edit the blog 


const notification = require("./models/notification");


// Configure Multer for file uploads


app.post('/edit/:id', upload.single('coverImage'), async (req, res) => {
    const blogId = req.params.id;

    try {
        // Validate Blog ID (if using MongoDB)
        if (!blogId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send('Invalid Blog ID');
        }

        // Extract form data
        const { title, body } = req.body;

        // Handle uploaded cover image (if provided)
        const coverImageURL = req.file ? req.file.path : null;

        // Find the blog by ID
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        // Update blog fields
        blog.title = title?.trim() || blog.title;
        blog.body = body?.trim() || blog.body;

        // Update the cover image if a new one is uploaded
        if (coverImageURL) {
            blog.coverImageURL = coverImageURL;
        }

        // Save the updated blog
        await blog.save();

        // Redirect to the home page or blogs page
        res.redirect('/myhome');
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).send('An error occurred while updating the blog.');
    }
});



app.post('/settings', upload.single('profileImageUrl'), async (req, res) => {
    try {
        console.log("Received POST request at /settings");

        // Fetch notifications for the user
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort notifications by most recent
            .populate("sender", "fullname"); // Populate sender's fullname
        console.log("Fetched notifications:", notifications);

        // Destructure incoming data
        const { fullname } = req.body;
        console.log("Received form data - Fullname:", fullname);

        const profileImageUrl = req.file ? req.file.path : null;
        console.log("Profile Image URL:", profileImageUrl);

        // Extract email from logged-in user
        const email = req.user.email; // Ensure `req.user` is populated correctly
        console.log("User email:", email);

        // Verify email exists
        if (!email) {
            console.log("Email is missing.");
            return res.status(400).send('Email is required to update the profile.');
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found with email:", email);
            return res.status(404).send('User not found.');
        }
        console.log("Found user:", user);

        // Update user details if provided
        if (fullname) {
            user.fullname = fullname;
            console.log("Updated fullname:", fullname);
        }

        if (profileImageUrl) {
            user.profileImageUrl = profileImageUrl;
            console.log("Updated profile image URL:", profileImageUrl);
        }

        // Save updated user details
        await user.save();
        console.log("User profile updated successfully.");

        // Count unread notifications
        const unreadCount = await Notification.countDocuments({
            receiver: req.user._id,
            isRead: false,
        });
        console.log("Unread notification count:", unreadCount);

        // Redirect to profile page
        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Internal server error. Please try again later.');
    }
});






 app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

 // Use user router
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
app.get('/user/blogs/likes-stats', async (req, res) => {
  

    const  blogs = await Blog.find({ createdBy: req.user._id }); // Filter by user ID

    // Create a mapping of blog IDs to their titles
    const blogMap = {};
    blogs.forEach(blog => {
        blogMap[blog._id.toString()] = blog.title;
    });

    // Fetch likes for blogs created by the user
    const likes = await Like.aggregate([
        {
            $match: {
                blog: { $in: blogs.map(blog => blog._id) }
            }
        },
        {
            $group: {
                _id: { blog: "$blog", day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.blog",
                data: {
                    $push: {
                        date: "$_id.day",
                        count: "$count"
                    }
                }
            }
        }
    ]);

    // Format the response for the frontend
    const response = likes.map(like => ({
        blogId: like._id.toString(),
        blogTitle: blogMap[like._id.toString()],
        data: like.data.sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort data by date
    }));
  
    JSON.stringify(response, null, 2)

        // Send the response as JSON
        res.json({ success: true, data: response });
    } 
);
 // thus the comment graph 
app.get("/stats", async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        const userId = new mongoose.Types.ObjectId(req.user._id);

        // Aggregation pipeline to get follower statistics
        const followerStats = await Follow.aggregate([
            {
                $match: { following: userId }, // Match followers of the current user
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
                    count: { $sum: 1 }, // Count followers for each date
                },
            },
            {
                $sort: { _id: 1 }, // Sort by date in ascending order
            },
        ]);

        // Extract dates and counts from the aggregation result
        const dates = followerStats.map(stat => stat._id); // Array of dates
        const counts = followerStats.map(stat => stat.count); // Array of counts

        const  blogs = await Blog.find({ createdBy: userId }); // Filter by user ID

        // Create a mapping of blog IDs to their titles
        const blogMap = {};
        blogs.forEach(blog => {
            blogMap[blog._id.toString()] = blog.title;
        });

        // Fetch likes for blogs created by the user
        const likes = await Like.aggregate([
            {
                $match: {
                    blog: { $in: blogs.map(blog => blog._id) }
                }
            },
            {
                $group: {
                    _id: { blog: "$blog", day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.blog",
                    data: {
                        $push: {
                            date: "$_id.day",
                            count: "$count"
                        }
                    }
                }
            }
        ]);

        // Format the response for the frontend
        const response = likes.map(like => ({
            blogId: like._id.toString(),
            blogTitle: blogMap[like._id.toString()],
            data: like.data.sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort data by date
        }));

        // Log the formatted response to check if everything is correct
        console.log(response);

        // Render the stats.ejs view with dates and counts
        res.render("stats", { dates, counts, user: req.user, notifications, data: response });
    } catch (err) {
        console.error("Error fetching follower statistics:", err);
        res.status(500).send("Internal server error.");
    }
});
app.get('/', (req, res) => {
    res.render("landing");
});

app.get('/contact', async(req, res) => {
    const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

            const unreadCount = await Notification.countDocuments({ 
                receiver: req.user._id, 
                isRead: false // Filter for unread notifications
            });
    res.render("contact",{ user: req.user,notifications,unreadCount});
});
app.get('/about', async(req, res) => {
    const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

            const unreadCount = await Notification.countDocuments({ 
                receiver: req.user._id, 
                isRead: false // Filter for unread notifications
            });
    res.render("about",{ user: req.user,notifications,unreadCount});
});
app.get('/generate', (req, res) => {
    res.render("generate",{ user: req.user});
});

app.get('/profile', async (req, res) => {
    // Simulating profile accessed data (replace with your actual user-fetching logic)


    const notifications = await Notification.find({ receiver: req.user._id })
    .sort({ createdAt: -1 }) // Sort by most recent
    .populate("sender", "fullname"); // Populate the sender's fullname from User schema
    const unreadCount = await Notification.countDocuments({ 
        receiver: req.user._id, 
        isRead: false // Filter for unread notifications
    });

    const user = req.user || {
        fullname: 'Guest',
        email: null,
        profileImageUrl: null,
        role: 'GUEST',
    };

    res.render('profile', { 
        user: {
            fullname: user.fullname,
            email: user.email,
            profileImageUrl: user.profileImageUrl || '/images/default-profile.png', // Fallback image
            role: user.role,
        },
        notifications,unreadCount
    });
});
 app.put('/notifications/:id/mark-read', async (req, res) => {
    try {
        const notificationId = req.params.id;

        // Update the `isRead` status of the notification to true
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });

        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark notification as read.' });
    }
});
 
 app.post("/generate", async (req, res) => {
    const { prompt } = req.body;
  
    // Validate the input
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
  
    try {
      // Get the model
      const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      // Generate content
      const result = await model.generateContent(prompt);
  
      // Send response
      res.json({ response: result.response.text() });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });
 
 app.get('/comments', async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.user || !req.user._id) {
            console.error('User is not authenticated');
            return res.status(401).send('Unauthorized');
        }

        // Fetch notifications for the user
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User

        // Count unread notifications
        const unreadCount = await Notification.countDocuments({ 
            receiver: req.user._id, 
            isRead: false // Filter for unread notifications
        });

        // Fetch blogs created by the authenticated user
        const blogs = await Blog.find({ createdBy: req.user._id })
            .populate('createdBy', 'fullname') // Populate blog author details
            .lean(); // Converts Mongoose objects to plain JavaScript objects

        // Fetch comments for each blog created by the current user
        const blogsWithComments = await Promise.all(
            blogs.map(async (blog) => {
                console.log('Blog:', blog._id); // Debugging log to check blog details
                const comment = await Comment.find({ blogId: blog._id })
                .populate('createdBy', 'fullname')  // Populate the user's fullname field
                .sort({ createdAt: -1 }); 
                console.log("ye mere commnets hai"+comment.length);
                // Fetch the comments associated with the current blog
                const comments = await Comment.find({ blogId: blog._id }) // Use blog._id to find comments
                    .populate('createdBy', 'fullname') // Populate the createdBy field with the user's fullname
                    .lean(); // Use lean() for better performance

                console.log('Comments:', comments); // Debugging log to check comments for the blog

                // Return the blog along with its comments
                return { ...blog, comments };
            })
        );

        // Render the comments.ejs template with blogs and comments
        res.render('comments', {
            blogs: blogsWithComments,
            user: req.user,
            notifications,
            unreadCount // Current logged-in user
        });
    } catch (error) {
        console.error('Error fetching blogs and comments:', error);
        res.status(500).send('An error occurred while fetching the data.');
    }
});

 app.get('/blog/edit/:id', async (req, res) => {
    const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema
            
            const unreadCount = await Notification.countDocuments({ 
                receiver: req.user._id, 
                isRead: false // Filter for unread notifications
            });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send('Blog not found');
    res.render('edit', { blog ,notifications,unreadCount});
    
});

 app.get('/settings', async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema
            
            const unreadCount = await Notification.countDocuments({ 
                receiver: req.user._id, 
                isRead: false // Filter for unread notifications
            });
        res.render('settings', { user: req.user || null ,notifications,unreadCount}); // Pass the user object or null
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error loading settings page');
    }
});
 
 app.post('/blog/delete/:id', async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/myhome'); // Redirect to the main page after deletion
});


// my home route

app.get('/myhome', async (req, res) => {
    const { title } = req.query; // Extract 'title' from query parameters

    try {
        let allBlogs;
        const notifications = await Notification.find({ receiver: req.user._id })
        .sort({ createdAt: -1 }) // Sort by most recent
        .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        if (!req.user) {
            // If no user is logged in, display a guest message or an empty blog list
            return res.render("home", {
                user: null,
                blogs: [],
                message: "You are not logged in. Please log in to view your blogs.",
            });
        }

        const userId = req.user._id; // Get the current user's ID

        if (title) {
            // Fetch blogs created by the current user and filter them by title
            allBlogs = await Blog.find({ createdBy: userId }); // Filter by user ID
            allBlogs = allBlogs.filter(blog => blog.title.toLowerCase().includes(title.toLowerCase())); // Filter by title
        } else {
            // Fetch all blogs created by the current user
            allBlogs = await Blog.find({ createdBy: userId });
        }
        const unreadCount = await Notification.countDocuments({ 
            receiver: req.user._id, 
            isRead: false // Filter for unread notifications
        });
        console.log("Home route accessed with title:", title);
        res.render("myhome", {
            user: req.user, // Pass the current user to the view
            blogs: allBlogs,
            notifications,unreadCount // Pass the filtered blogs to the view
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).send("An error occurred while loading the home page.");
    }
});

 
app.get('/home', async (req, res) => {
    const { title } = req.query; // Extract 'title' from query parameters

    try {
        // Fetch notifications for the logged-in user
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        let allBlogs;
        let followedAuthors = [];
        const unreadCount = await Notification.countDocuments({ 
            receiver: req.user._id, 
            isRead: false // Filter for unread notifications
        });
        // Fetch all blogs based on the search query
        if (title) {
            allBlogs = await Blog.find({});
            allBlogs = allBlogs.filter(blog => blog.title.toLowerCase().includes(title.toLowerCase()));
            console.log(allBlogs);
        } else {
            allBlogs = await Blog.find({});
        }

        const userId = req.user._id; // Get the curr

        // Fetch the list of users the current user is following
        const followingList = await Follow.find({ follower: userId }).populate('following', 'fullname _id profileImageUrl');

        // Extract the authors (following users)
        followedAuthors = followingList.map(follow => follow.following);

        // Fetch liked blog IDs for the current user
        let likedBlogs = [];
        likedBlogs = await Like.find({ user: userId }).select("blog").lean();
        likedBlogs = likedBlogs.map(like => like.blog.toString()); // Get an array of liked blog IDs

        // Create a hashmap of like counts for each blog
        let likeCountMap = {};
        const allLikes = await Like.find({}).lean(); // Fetch all likes from the database
        allLikes.forEach(like => {
            if (likeCountMap[like.blog]) {
                likeCountMap[like.blog] += 1; // Increment like count for the blog
            } else {
                likeCountMap[like.blog] = 1; // Initialize like count if it doesn't exist
            }
        });

        if (followedAuthors.length === 0) {
            console.log('User is not following anyone');
        }

        console.log("Home route accessed with title:", title);
        
        // Render the home view with additional data
        res.render("home", {
            user: req.user,
            blogs: allBlogs, // Pass the filtered blogs to the home view
            followedAuthors,
            notifications, 
            // Pass the set of authors the user is following
            likedBlogs, // Pass the liked blogs IDs to the frontend
            likeCountMap,
            req: req,
            unreadCount // Pass the like count map to the frontend
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).send("An error occurred while loading the home page.");
    }
});

 
 app.post("/follow/:authorId", async (req, res) => {
     try {
         const { authorId } = req.params; // Get the author ID (the user being followed)
         const { currentUserId } = req.body; // Get the current user ID (the follower)
 
         // Check if the current user is trying to follow themselves
         if (currentUserId === authorId) {
             return res.status(400).json({ message: "You cannot follow yourself." });
         }
 
         // Check if the follow relationship already exists
         const existingFollow = await Follow.findOne({ follower: currentUserId, following: authorId });
         if (existingFollow) {
             return res.status(400).json({ message: "You are already following this user." });
         }
 
         // Create a new follow relationship
         const newFollow = new Follow({
             follower: currentUserId,
             following: authorId
         });
         await newFollow.save();
 
         // Send a notification to the followed user
         const notificationMessage = `User  has started following you.`;
 
         const newNotification = new Notification({
             sender: currentUserId,
             receiver: authorId,
             message: notificationMessage,
         });
 
         await newNotification.save();
 
         return res.status(200).json({ message: "Followed successfully and notification sent!" });
     } catch (error) {
         console.error("Error following user:", error);
         return res.status(500).json({ message: "Internal server error." });
     }
 });
 
 
 
app.use('/user', userRouter);
app.use('/blog', blogRouter);



app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Error logging out:", err);
            return res.status(500).send("An error occurred while logging out.");
        }
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).send("An error occurred while logging out.");
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.redirect('/'); // Redirect to the home page or login page
        });
    });
});

// POST route to handle form submission
app.post("/send", async (req, res) => {
    console.log("Received data:", req.body); // Debugging

    const { name, email, subject, message } = req.body;

    // Validate input fields
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Nodemailer transport configuration
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Sender email from .env
                pass: process.env.EMAIL_PASS, // App password from .env
            },
        });

        // Email details
        const mailOptions = {
            from: `"${name}" <${email}>`, // Use sender's name and email
            to: process.env.EMAIL_USER, // Your email to receive the message
            subject: `[Blogify Contact] ${subject}`, // Subject with prefix
            text: `Message from ${name} (${email}):\n\n${message}`, // Plain text body
        };

        // Send email
        await transporter.sendMail(mailOptions);

        console.log("Email sent successfully.");
        res.status(200).json({ message: "Email sent successfully." });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email. Please try again later." });
    }
});


// notification fetch and showing  phase 


app.get("/notifications/:userId", async (req, res) => {
    try {
        
        const { userId } = req.params;
        const notifications = await Notification.find({ receiver: req.user._id })
        .sort({ createdAt: -1 }) // Sort by most recent
        .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        // Fetch notifications for the user and populate sender details
        const n = await Notification.find({ receiver: userId })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        // Render the notifications view, passing the notifications data
        res.render("notification", { n, user:req.user, notifications});
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).send("Internal server error.");
    }
});




//followers   gate away 
app.get("/followers", async (req, res) => {
    try {
        const userId = req.user._id; // Assuming `req.user` contains the logged-in user's info
       
        const notifications = await Notification.find({ receiver: userId })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        // Fetch followers for the current user
        const followers = await Follow.find({ following: userId })
            .populate("follower", "fullname email profileImageUrl") // Populate follower details
            .exec();

        // Render the followers.ejs view, passing the followers list
        res.render("followers", {  user: req.user,followers ,notifications });
    } catch (err) {
        console.error("Error fetching followers:", err);
        res.status(500).send("Internal server error.");
    }
});
//followings route or gateaway 
app.get("/followings/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch notifications for the current user
        const notifications = await Notification.find({ receiver: req.user?._id || null })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        // Fetch followings where the current user is the follower
        const followings = await Follow.find({ follower: userId })
            .populate({
                path: "following",
                select: "fullname email profileImageUrl", // Only retrieve necessary fields
            })
            .exec();

        // Filter out entries where `following` is null
        const validFollowings = followings.filter(f => f.following);

        // Log invalid entries for debugging
        const invalidFollowings = followings.filter(f => !f.following);
        if (invalidFollowings.length > 0) {
            console.warn("Invalid Followings Found:", invalidFollowings);
        }

        res.render("followings", {
            notifications, 
            user: req.user,
            followings: validFollowings,
           
            notifications,
        });
    } catch (err) {
        console.error("Error fetching followings:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//route to like  a  blog 

app.post("/blog/:id/like", async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.body.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        // Find the blog by ID
        const blog = await Blog.findById(blogId).populate("createdBy");
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        // Check if the user has already liked the blog
        const existingLike = await Like.findOne({ blog: blogId, user: userId });

        if (existingLike) {
            // If liked, remove the like (unlike the blog)
            await Like.deleteOne({ _id: existingLike._id });
        } else {
            // If not liked, create a new like
            await Like.create({ blog: blogId, user: userId });

            // Send notification to the blog author
            if (blog.createdBy) {
                const notificationMessage = ` User liked your blog titled "${blog.title}".`;

                const newNotification = new Notification({
                    sender: userId,
                    receiver: blog.createdBy._id, // Blog author's user ID
                    message: notificationMessage,
                });

                await newNotification.save();
            }
        }

        // Get updated like count for the blog
        const likeCount = await Like.countDocuments({ blog: blogId });

        res.status(200).json({ success: true, likes: likeCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// read more blog route 

app.get('/:id' , async (req, res) => {
    const { id } = req.params; // Get the blog ID from the URL params
     const notifications = await Notification.find({ receiver:  null })
               .sort({ createdAt: -1 }) // Sort by most recent
               .populate("sender", "fullname"); // Populate the sender's fullname from User schema
   
    try {
        const blog = await Blog.findById(id).populate('createdBy'); // Populate createdBy field
        const { blogId } = req.params;
          
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        
        const comments = await Comment.find({ blogId: blogId })
        .populate('createdBy', 'fullname')  // Populate the user's fullname field
        .sort({ createdAt: -1 });  
      
        // Render blog details page, passing the populated blog data
        res.render('blog', { blog, comments,  user: req.user ,notifications});
    } catch (error) {
        console.error('Error fetching blog:', error);


        res.status(500).send('Internal Server Error');


    }
});

// Start the server
app.use((req, res, next) => {
    res.status(404).render('404', { user: req.user });
});
// Example Express route to fetch mess service users
app.get('/api/mess-service-providers', async (req, res) => {
    try {
      const messUsers = await User.find({ role: 'MESS_SERVICE' });
      console.log(messUsers);  // Debugging: Log the result
      res.json(messUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching mess users" });
    }
  });
  

  
// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log("Server has been started on port", port);
});



