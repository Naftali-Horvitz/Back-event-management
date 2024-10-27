const express = require("express");
const router = express.Router();
const {createEvent, getEvents} = require('../controllers/eventController');
const authenticateToken = require('../Middleware/authMiddleware');

router.post("/create-event", authenticateToken,createEvent);
router.get("/view-events", authenticateToken, getEvents);



module.exports = router;
