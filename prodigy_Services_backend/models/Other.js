const mongoose = require("mongoose");

const OtherServiceSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: false,
  },

  email: {
    type: String,
    required: true,
  },

  serviceName: {
    type: String, // e.g. "Ramesh Ironing", "Seema Blouse Stitching"
    required: false,
  },

  serviceCategories: {
    type: [String],
    enum: [
      "Home Tutoring",
      "AC Repair",
      "Dry Cleaning",
      "Laundry Service",
      "Appliance Repair",
      "Electrician",
      "Plumber",
      "Maid Service",
      "HVAC Service",
      "Locksmith",
      "Painting Service",
      "Cooking Service",
      "Home Cleaning"
    ],
    required: false,
  },

  description: {
    type: String,
    required: false,
  },

  // Specific service items / packages the vendor offers
  serviceItems: [
    {
      name: { type: String, required: false },
      details: { type: String, required: false },
      price: { type: Number, required: false },
      duration: { type: String, required: false }, // e.g. "30 mins", "2 hours"
    }
  ],

  // Promotional offers
  offers: [
    {
      title:   String,
      details: String,
      discountPercent: Number,
      validTill:       Date,
    }
  ],

  // Service Modes Supported
  modes: {
    onSite:      { type: Boolean, default: false },
    dropOff:     { type: Boolean, default: false  },
    pickUp:      { type: Boolean, default: false },
    emergency:   { type: Boolean, default: false },
    subscription:{ type: Boolean, default: false },
  },

  images: [
    { type: String }
  ],

  updates: [
    {
      date:    { type: Date, default: Date.now },
      message: { type: String },
    }
  ],

  feedback: [
    {
      user:     String,
      rating:   { type: Number, min: 1, max: 5 },
      comments: String,
      date:     { type: Date, default: Date.now },
    }
  ],

  contact: {
    phone: String,
    location: {
      address:   String,
      latitude:  Number,
      longitude: Number,
    },
    directions:   String,
    openingHours: String,
  }
}, { timestamps: false });

module.exports = mongoose.model("OtherService", OtherServiceSchema);
