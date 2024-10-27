const userService = require("../services/userService");
const { User } = require("../models/userModel");

exports.registerUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await userService.createUser(user);
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.findUserLogin(email, password);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(400).json({ msg: error.message });
  }
};
