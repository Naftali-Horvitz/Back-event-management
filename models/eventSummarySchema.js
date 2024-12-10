const mongoose = require('mongoose');

const eventSummarySchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event',
    required: true
  },
  eventName: { 
    type: String, 
    required: true 
  },
  eventDate: {       
    type: Date,
    required: true
  },
  totalGuests: { 
    type: Number, 
    default: 0 
  },
  confirmedGuests: { 
    type: Number, 
    default: 0 
  }
});

const EventSummary = mongoose.model("EventSummary", eventSummarySchema, "events");
module.exports = {EventSummary};