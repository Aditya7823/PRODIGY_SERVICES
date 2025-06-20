const express = require('express');
const router = express.Router();
const User = require('../models/user');

const Room = require('../models/Room');

const { upload } = require('../cloudinaryConfig'); // your cloudinary config file
router.post('/api/room-update/:email', upload.array('images', 5), async (req, res) => {
  try {
    console.log('Request received to update room account:', req.params.email);
    const email = decodeURIComponent(req.params.email);

    // Uploaded files' Cloudinary URLs
    const imageUrls = req.files.map(file => file.path); 

    // Extract fields from form-data (note: nested objects as JSON strings)
    const {
      fullname,
      details,
      pricing,
      contact,
      amenities,
    } = req.body;

    // Parse nested objects if sent as JSON strings, else default empty objects
    const pricingObj = pricing ? JSON.parse(pricing) : {};
    const contactObj = contact ? JSON.parse(contact) : {};
    const amenitiesObj = amenities ? JSON.parse(amenities) : {};

    // Update object:
    // Use $set for fields, $push for images array (append)
    const updatedRoom = await Room.findOneAndUpdate(
      { email },
      {
        $set: {
          fullname,
          details,
          pricing: pricingObj,
          contact: contactObj,
          amenities: amenitiesObj,
        },
        $push: {
          images: { $each: imageUrls }
        }
      },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Fetch all room rental service providers
router.get('/api/room-rental-service-providers', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    const roomUsers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lngNum, latNum] // longitude first
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: 5000 // 5 km
        }
      },
      {
        $match: { role: 'ROOM_RENTAL_SERVICE' }
      },
      {
        $project: {
          password: 0,
          salt: 0
        }
      }
    ]);

    res.json(roomUsers);
  } catch (error) {
    console.error("Error fetching nearby room rental users:", error);
    res.status(500).json({ message: "Error fetching nearby room rental users" });
  }
});

// Add update message for a room by email
router.post('/api/roomaccount/update/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const { message } = req.body;

    const newUpdate = {
      date: new Date(),
      message,
    };

    const updatedRoom = await Room.findOneAndUpdate(
      { email },
      { $push: { updates: newUpdate } },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ message: 'Update added successfully', update: newUpdate });
  } catch (err) {
    console.error('Error adding update:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/api/roomaccount/feedback/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const { user, rating, comments } = req.body;

    const newFeedback = {
      user,
      rating,
      comments,
      date: new Date(),
    };

    const updatedRoom = await Room.findOneAndUpdate(
      { email },
      { $push: { feedback: newFeedback } },
      { new: true } // return the updated document
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/api/room-account/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const room = await Room.findOne({ email });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (err) {
    console.error('Error fetching room details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
