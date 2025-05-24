const mongoose = require("mongoose");

const CafeSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  cafeName: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  menu: [
    {
      item: String,
      type: {
        type: String, // "Tea", "Coffee", "Snack", etc.
      },
      price: Number,
    }
  ],
  offers: [
    {
      title: String,
      description: String,
      discountPercent: Number,   // e.g. 10 for 10% off
      validTill: Date,
    }
  ],
  services: {
    dineIn: { type: Boolean, default: false },
    takeaway: { type: Boolean, default: true },
    homeDelivery: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    outdoorSeating: { type: Boolean, default: false },
    music: { type: Boolean, default: false },
    airConditioned: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false }
  },
  images: [
    {
      type: String, // filenames or URLs
    }
  ],
  updates: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      message: String,
    },
  ],
  feedback: [
    {
      user: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comments: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  contact: {
    phone: String,
    location: {
      address: String,
      latitude: Number,
      longitude: Number,
    },
    directions: String,
    openingHours: String,
  }
});

const Cafe = mongoose.model("Cafe", CafeSchema);
module.exports = Cafe;
