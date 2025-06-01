const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Other = require('../models/Other');
router.get('/api/other-service-providers', async (req, res) => {
  try {
    console.log('Fetching cafe service providers...');
    const otherUsers = await User.find({ role: 'OTHER_SERVICE' }).select('-password -salt');
    res.json(otherUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cafe service providers" });
  }
});
// Node.js (Express + Mongoose)
router.get('/api/other-service-providers/:type', async (req, res) => {
  try {
    const decodedType = decodeURIComponent(req.params.type);
    console.log("Received type:", decodedType); // Debug log

    const providers = await Other.find({ serviceCategories: decodedType });

    console.log("Providers found:", providers.length);
    res.json(providers);
  } catch (error) {
    console.error('Error fetching other service providers:', error); // Full error
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});
router.get('/api/other-services/provider/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const provider = await Other.findOne({ email });

    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;