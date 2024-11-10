const eventService = require('../services/eventService');

exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      hostId: req.user.userId,
    };

    const savedEvent = await eventService.createEvent(eventData);
    
    return res.status(201).json({ 
      success: true,
      msg: 'Event created successfully', 
      eventId: savedEvent._id 
    });

  } catch (error) {
    console.error('Error creating event:', error);
    
    if (error.message === 'All fields are required') {
      return res.status(400).json({ 
        success: false,
        msg: error.message 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      msg: 'Server error' 
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    // וידוא שיש userId
    if (!req.user?.userId) {
      return res.status(401).json({ msg: 'User ID not found' });
    }

    const events = await eventService.getEventsByHost(req.user.userId);
    
    // בדיקה אם יש אירועים
    if (!events || events.length === 0) {
      return res.json([]); // מחזיר מערך ריק במקום null
    }

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ msg: 'Error fetching events' });
  }
};

exports.getEventById = async (req, res) => {
  const { eventId } = req.params;

  try {
    // בדיקה שהתקבל ID
    if (!eventId) {
      return res.status(400).send({ msg: 'נדרש ID של אירוע' });
    }

    const event = await eventService.getEventById(eventId);
    return res.status(200).send(event);
    
  } catch (error) {
    if (error.message === 'אירוע לא נמצא') {
      return res.status(404).send({ msg: error.message });
    }
    
    console.error('Error fetching event:', error);
    return res.status(500).send({ msg: 'שגיאה בשליפת האירוע' });
  }
};