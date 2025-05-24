const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: false,
  },
  pricing: {
    monthlyRent: {
      type: Number,
      required: false,
    },
    depositAmount: {
      type: Number,
      required: false,
    },
    perDayRent: {
      type: Number,
      required: false,
    },
  },
  amenities: {
    wifi: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    kitchenAccess: { type: Boolean, default: false },
    attachedBathroom: { type: Boolean, default: false },
    cctv: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    waterPurifier: { type: Boolean, default: false },
    geyser: { type: Boolean, default: false },
    bed: { type: Boolean, default: false },
    cupboard: { type: Boolean, default: false },
    powerBackup: { type: Boolean, default: false },
    studyTable: { type: Boolean, default: false },
    cleaningService: { type: Boolean, default: false },
    securityGuard: { type: Boolean, default: false }
  },
  images: [
    {
      type: String,
      required: false,
    }
  ],
  updates: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      message: {
        type: String,
        required: false,
      },
    },
  ],
  feedback: [
    {
      user: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: false,
      },
      comments: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  contact: {
    phone: {
      type: String,
      required: false,
    },
    location: {
      address: {
        type: String,
        required: false,
      },
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
    },
    directions: {
      type: String,
    },
  },
});

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;
    