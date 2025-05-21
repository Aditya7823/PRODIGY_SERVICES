const express = require('express');
const router = express.Router();
const User = require('../models/user');

const Room = require('../models/Room');

// Fetch all room rental service providers
router.get('/api/room-rental-service-providers', async (req, res) => {
  try {
     
    const roomUsers = await User.find({ role: 'ROOM_RENTAL_SERVICE' }).select('-password -salt');
    res.json(roomUsers);
  } catch (error) {
    console.error("Error fetching room rental users:", error);
    res.status(500).json({ message: "Error fetching room rental users" });
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
