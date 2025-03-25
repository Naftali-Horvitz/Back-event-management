const { Event } = require('../models/eventModel');
const { EventSummary } = require('../models/eventSummarySchema');
const  Guest  = require('../models/guestModel');

const eventService = {
  async createEvent(eventData) {
    const { eventName, eventDate, eventTime, eventLocation, eventDescription, hostId } = eventData;

    if (!eventName || !eventDate || !eventTime || !eventLocation || !eventDescription || !hostId) {
      throw new Error('All fields are required');
    }

    const newEvent = new Event({
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      eventDescription,
      hostId,
    });
    const savedEvent = await newEvent.save();

    // יצירת רשומה חדשה בטבלת EventSummary
    const newEventSummary = new EventSummary({
      eventId: savedEvent._id,
      eventName: savedEvent.eventName,
      eventDate: savedEvent.eventDate  // הוספת שדה חובה שחסר
    });
    await newEventSummary.save();
    return savedEvent;
  },

  async getEventsByHost(hostId) {
    try {
      const eventIds = await Event.distinct('_id', { hostId });
      const events = await EventSummary.find({ eventId: { $in: eventIds } })
        .sort({ eventDate: 1 })
        .lean()
        .then(events => events.map(event => ({
          _id: event.eventId,
          eventName: event.eventName,
          date: event.eventDate,
          time: event.eventTime,
          totalGuests: event.totalGuests,
          confirmedGuests: event.confirmedGuests
        })));

      return events;
    } catch (err) {
      throw new Error('Error fetching events');
    }
  },

  async getEventById(eventId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('אירוע לא נמצא');
      }
      return event;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getEventSummary(eventId) {
    try {
      const eventSummary = await EventSummary.findOne({ eventId: eventId });
      if (!eventSummary) {
        throw new Error('לא נמצאו נתונים');
      }
      return eventSummary;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getGuest(eventId) {
    try {
      const guest = await Guest.find({ eventId: eventId });
      if (!guest) {
        throw new Error(' לא נמצאו אורחים ');
      }
      console.log(guest);
      return guest;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getEventDetailsById(eventId) {
    const [eventDetails, eventSummary, guests] = await Promise.all([
      this.getEventById(eventId),
      this.getEventSummary(eventId),
      this.getGuest(eventId)
    ]);

    return {
      eventDetails,
      summary: {
        totalGuests: eventSummary ? eventSummary.totalGuests : 0,
        confirmedGuests: eventSummary ? eventSummary.confirmedGuests : 0
      },
      guests
    };
  }
};

module.exports = eventService;