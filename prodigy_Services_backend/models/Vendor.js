const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: false,
  },
  vendorType: {
    type: String, // e.g., "Panipuri Wala", "Chai Wala"
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  },
  description: {
    type: String,
  },
  contact: {
    location: {
      address: String,
      latitude: Number,
      longitude: Number,
    },
    directions: String,
    openingHours: String,
  },
  menu: [
    {
      itemName: {
        type: String,
        required: false,
      },
      description: String,
      price: {
        type: Number,
        required: false,
      },
      available: {
        type: Boolean,
        default: false,
      }
    }
  ],
  offers: [
    {
      title: String,
      description: String,
      discountPercent: Number, // e.g. 10 for 10% off
      validTill: Date,
    }
  ],
  availability: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    availableDays: [String], // e.g. ["Monday", "Wednesday", "Friday"]
    availableTime: {
      start: String, // "09:00 AM"
      end: String,   // "09:00 PM"
    }
  },
  pricingNote: {
    type: String, // e.g., "Prices may vary based on quantity"
  },
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
    }
  ],
  images: [
    {
      type: String, // URLs or file paths
    }
  ],
  updates: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      message: String,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Vendor = mongoose.model("Vendor", VendorSchema);
module.exports = Vendor;
