const mongoose = require("mongoose");

const MessSchema = new mongoose.Schema({
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
    oneTimeMeal: {
      type: Number,
      required: false,
    },
    oneMonthFullTiffin: {
      type: Number,
      required: false,
    },
    oneMonthHalfTiffin: {
      type: Number,
      required: false,
    },
   
   
  },
  menu: {
    breakfast: {
      type: String,
      required: false,
    },
    lunch: {
      type: String,
      required: false,
    },
    dinner: {
      type: String,
      required: false,
    },
  },
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

const Mess = mongoose.model("Mess", MessSchema);
module.exports = Mess;
