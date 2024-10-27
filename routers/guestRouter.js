const express = require('express');
const router = express.Router();
const {registerGuest} = require('../controllers/guestController');

router.post("/:eventId", registerGuest);

module.exports = router; 