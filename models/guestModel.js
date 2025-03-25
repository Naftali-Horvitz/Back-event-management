const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String, 
    required: true,
    trim: true,
  },
  eventId: { 
    type: String, 
    required: true, 

  },
  status: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// אינדקס מורכב עבור טלפון וeventId
guestSchema.index({ phone: 1, eventId: 1 }, { unique: true });

const Guest = mongoose.model('Guest', guestSchema, 'guests');
module.exports = Guest;