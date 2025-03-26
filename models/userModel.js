const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
});

const User = mongoose.model("User", UserSchema, "users");
module.exports = { User};
