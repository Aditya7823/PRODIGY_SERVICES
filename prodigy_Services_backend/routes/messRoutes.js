const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Adjust the path based on your project structure

// Define the route for fetching mess service providers
router.get('/api/mess-service-providers', async (req, res) => {
  try {
    // Find users with the role 'MESS_SERVICE', excluding 'password' and 'salt' fields
    const messUsers = await User.find({ role: 'MESS_SERVICE' }).select('-password -salt');
    res.json(messUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching mess users" });
  }
});

module.exports = router;
