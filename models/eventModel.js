const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  eventLocation: {
    type: String,
    required: true,
  },
  eventDescription: {
    type: String,
    required: true,
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const Event = mongoose.model("Event", EventSchema, "event");
module.exports = { Event };
