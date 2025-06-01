const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Vendor = require('../models/Vendor');
const { upload } = require('../cloudinaryConfig'); // your cloudinary config file

// GET all street vendors
router.get('/api/street-vendors', async (req, res) => {
  try {
    const vendors = await User.find({ role: 'VENDOR' }).select('-password -salt');
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching street vendors:', error);
    res.status(500).json({ message: "Error fetching street vendors" });
  }
});

router.put("/api/vendor/update", async (req, res) => {
  console.log("Update request received with body:", req.body);
  const { email, ...updateFields } = req.body;
  try {
    const updated = await Vendor.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Vendor not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed", details: err });
  }
});

// GET a vendor by email
router.get('/api/vendor/:email', async (req, res) => {
  const email = req.params.email;
  console.log('Fetching vendor by email:', email);

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const vendor = await Vendor.findOne({ email: email });
    if (!vendor) {
      console.warn('Vendor not found for email:', email);
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Server error while fetching vendor' });
  }
});

// POST feedback to vendor using email
router.post('/api/vendor/:email/feedback', async (req, res) => {
  const { email } = req.params;
  console.log('Submitting feedback for vendor:', email);
  const { user, rating, comments } = req.body;

  if (!email || !user || !rating || !comments) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const vendor = await Vendor.findOne({ email: email });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const newFeedback = {
      user,
      rating: parseInt(rating),
      comments,
      date: new Date()
    };

    vendor.feedback.push(newFeedback);
    await vendor.save();

    res.status(200).json({ message: 'Feedback submitted successfully!' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error while submitting feedback' });
  }
});

module.exports = router;
