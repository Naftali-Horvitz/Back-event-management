const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  guestId: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventId: { type: String, required: true },
  status: { type: Boolean, required: false, default: false },
  // ... כל שדה אחר שאתה צריך
});

module.exports = mongoose.model('Guest', guestSchema, 'guests');