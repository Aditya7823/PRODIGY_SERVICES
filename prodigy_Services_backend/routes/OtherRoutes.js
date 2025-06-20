const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Other = require('../models/Other');

// Node.js (Express + Mongoose)
router.get('/api/other-service-providers', async (req, res) => {
  const { lat, lng, type } = req.query;

  if (!lat || !lng || !type) {
    return res.status(400).json({ message: "Missing latitude, longitude, or service type." });
  }

  const userLatitude = parseFloat(lat);
  const userLongitude = parseFloat(lng);

  try {
    const allVendors = await User.find({
      role: 'OTHER_SERVICE',
      location: { $exists: true, $ne: null },
      "location.coordinates.0": { $exists: true }
    });

    const matchingEmails = await Other.find({ serviceCategories: type }).distinct('email');

    const relevantEmails = allVendors
      .map(user => user.email)
      .filter(email => matchingEmails.includes(email));

    if (relevantEmails.length === 0) {
      return res.json([]);
    }

    const result = await User.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [userLongitude, userLatitude] },
          distanceField: "distance",
          maxDistance: 5000,
          spherical: true,
          query: {
            email: { $in: relevantEmails },
            role: 'OTHER_SERVICE'
          }
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    console.error("GeoNear error:", err);
    res.status(500).json({ message: "Server error while fetching nearby service providers." });
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