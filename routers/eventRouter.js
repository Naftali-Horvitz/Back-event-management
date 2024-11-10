const express = require("express");
const router = express.Router();
const {createEvent, getEvents, getEventById } = require('../controllers/eventController');
const authenticateToken = require('../Middleware/authMiddleware');

router.post("/create-event", authenticateToken,createEvent);
router.get("/view-events", authenticateToken, getEvents);
router.get("/event/:eventId", authenticateToken, getEventById);  // הוספת Route חדש



module.exports = router;
