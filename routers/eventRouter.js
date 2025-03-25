const express = require("express");
const router = express.Router();
const {createEvent, getEvents, getEventById, getEventDetailsById } = require('../controllers/eventController');
const authenticateToken = require('../Middleware/authMiddleware');

router.post("/create-event", authenticateToken,createEvent);
router.get("/view-events", authenticateToken, getEvents);
router.get("/:eventId", authenticateToken, getEventById);  // הוספת Route חדש
router.get("/details/:eventId", authenticateToken, getEventDetailsById);  // הוספת Route חדש


module.exports = router;
