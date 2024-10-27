const { Event } = require('../models/eventModel');
const { EventSummary } = require('../models/eventSummarySchema');

const eventService = {
  async createEvent(eventData) {
    const { eventName, eventDate, eventLocation, eventDescription, hostId } = eventData;

    if (!eventName || !eventDate || !eventLocation || !eventDescription || !hostId) {
      throw new Error('All fields are required');
    }

    const newEvent = new Event({
      eventName,
      eventDate,
      eventLocation,
      eventDescription,
      hostId,
    });

    const savedEvent = await newEvent.save();

    // יצירת רשומה חדשה בטבלת EventSummary
    const newEventSummary = new EventSummary({
      eventId: savedEvent._id,
      eventName: savedEvent.eventName  // שים לב שיניתי מ-name ל-eventName
    });

    await newEventSummary.save();

    return savedEvent;
  },

  async getEventsByHost(hostId) {
    try {
      const eventIds = await Event.distinct('_id', { hostId });
      const events = await EventSummary.find({ eventId: { $in: eventIds } }).sort({ eventDate: 1 });

      return events;
    } catch (err) {
      throw new Error('Error fetching events');
    }
  },

  async getEventById(eventId) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    return event;
  },

  async getEventSummary(eventId) {
    return await EventSummary.findOne({ eventId: eventId });
  },

  async getEventDetails(eventId) {
    const [eventDetails, eventSummary] = await Promise.all([
      this.getEventById(eventId),
      this.getEventSummary(eventId)
    ]);

    return {
      eventDetails,
      summary: {
        totalGuests: eventSummary ? eventSummary.totalGuests : 0,
        confirmedGuests: eventSummary ? eventSummary.confirmedGuests : 0
      }
    };
  }
};

module.exports = eventService;