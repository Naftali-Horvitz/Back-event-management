const eventService = require('../services/eventService');

exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      hostId: req.user.userId, // מניח שה-userId מגיע מה-middleware של האימות
    };
    const savedEvent = await eventService.createEvent(eventData);
    res.status(201).json({ msg: 'Event created successfully', eventId: savedEvent._id });
  } catch (error) {
    console.error('Error creating event:', error);
    if (error.message === 'All fields are required') {
      return res.status(400).json({ msg: error.message });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await eventService.getEventsByHost(req.user.userId);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};