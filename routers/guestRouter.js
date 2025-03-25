const express = require('express');
const router = express.Router();
const {registerGuest, saveGuestList} = require('../controllers/guestController');

router.post("/:eventId", registerGuest);
router.post("/saveGuests/:eventId", saveGuestList);

module.exports = router; 