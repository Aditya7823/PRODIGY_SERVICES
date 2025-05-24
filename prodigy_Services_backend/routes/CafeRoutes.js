const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Cafe = require('../models/Cafe');

// Fetch all cafe/tea service providers
router.get('/api/cafe-service-providers', async (req, res) => {
  try {
    console.log('Fetching cafe service providers...');
    const cafeUsers = await User.find({ role: 'CAFE_SERVICE / TEA_POINT' }).select('-password -salt');
    res.json(cafeUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cafe service providers" });
  }
});

router.get('/api/cafe-service-providers/:email', async (req, res) => {
  try {
    const email = req.params.email;

    const cafe = await Cafe.findOne({ email });
console.log('Fetching cafe details for email:', email);
    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    res.json(cafe);
  } catch (error) {
    console.error('Error fetching cafe details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
