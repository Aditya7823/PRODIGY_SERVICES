const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Mess = require('../models/Mess');

// Fetch all mess service providers
router.get('/api/mess-service-providers', async (req, res) => {
  try {
 const { lat, lng } = req.query;

 console.log('Fetching mess service providers...');

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
5
    const messUsers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lngNum, latNum] // [longitude, latitude]
          },
          distanceField: "distance", // returns calculated distance in meters
          spherical: true,
          maxDistance: 50000 // 5km radius
        }
      },
      {
        $match: { role: 'MESS_SERVICE' }
      },
      {
        $project: {
          password: 0,
          salt: 0
        }
      }
    ]);

    res.json(messUsers);
  } catch (error) {
    console.error("Error fetching sorted nearby mess users:", error);
    res.status(500).json({ message: "Error fetching nearby mess users" });
  }
});

// Fetch specific mess + user account details by email
router.get('/api/mess-account/:email', async (req, res) => {
  try {
    const mess = await Mess.findOne({ email: req.params.email });
    if (!mess) return res.status(404).json({ error: 'Mess not found' });

    const user = await User.findOne({ email: req.params.email }).select('-password -salt');
    if (!user) return res.status(404).json({ error: 'User not found' });
v
    res.json({ ...mess.toObject(), user: user.toObject() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update mess account details (excluding email)
router.put('/api/mess-account/:email', async (req, res) => {
  const { email } = req.params;
  const {
    fullname,
    details,
    pricing,
    menu,
    contact,
  } = req.body;

  try {
    const updatedMess = await Mess.findOneAndUpdate(
      { email },
      {
        $set: {
          fullname,
          details,
          pricing,
          menu,
          contact,
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedMess) {
      return res.status(404).json({ error: 'Mess account not found' });
    }

    res.status(200).json({
      message: 'Mess account updated successfully',
      mess: updatedMess,
    });
  } catch (err) {
    console.error('Error updating mess details:', err);
    res.status(500).json({ error: 'Server error while updating mess account' });
  }
});



router.post('/api/mess/feedback', async (req, res) => {
  const { rating, comments, name: fullname, messEmail } = req.body;

  try {
    const mess = await Mess.findOne({ email: messEmail });
    if (!mess) return res.status(404).json({ error: "Mess not found" });

    mess.feedback.push({
      user: fullname,
      rating,
      comments,
      date: new Date()
    });

    await mess.save();
    res.status(200).json({ message: "Feedback submitted" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/api/mess/add-update', async (req, res) => {
  const { message, messEmail } = req.body;
  // assuming auth middleware attaches user

  try {
    // Find Mess by email (sent from frontend)
    const mess = await Mess.findOne({ email: messEmail });
    if (!mess) return res.status(404).json({ error: "Mess not found" });

    // Add the update entry with current date and message
    mess.updates.push({
      message,
      date: new Date(),
    });

    await mess.save();
    res.status(200).json({ message: "Update added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
