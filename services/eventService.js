const mongoose = require('mongoose');
const { Event } = require('../models/eventModel');
const { EventSummary } = require('../models/eventSummarySchema');

const ERROR_MESSAGES = {
  EVENT_NOT_FOUND: 'אירוע לא נמצא',
  MISSING_FIELDS: 'כל השדות נדרשים',
  INVALID_EVENT_NAME: 'שם האירוע אינו תקין',
  INVALID_EVENT_DATE: 'תאריך האירוע אינו תקין',
  INVALID_LOCATION: 'מיקום האירוע אינו תקין',
  INVALID_DESCRIPTION: 'תיאור האירוע אינו תקין',
  INVALID_HOST: 'מזהה המארח אינו תקין',
  FETCH_ERROR: 'אירעה שגיאה בטעינת האירועים',
  CREATE_ERROR: 'אירעה שגיאה ביצירת האירוע'
};

const eventService = {
  /**
   * Validates event data before creation
   * @param {Object} eventData - The event data to validate
   * @throws {Error} If validation fails
   */
  validateEventData(eventData) {
    const { eventName, eventDate, eventLocation, eventDescription, hostId } = eventData;
    if (!eventName || !eventDate || !eventLocation || !eventDescription || !hostId) {
      throw new Error(ERROR_MESSAGES.MISSING_FIELDS);
    }

    if (typeof eventName !== 'string' || eventName.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_EVENT_NAME);
    }

    if (!(eventDate instanceof Date) || isNaN(eventDate)) {
      throw new Error(ERROR_MESSAGES.INVALID_EVENT_DATE);
    }

    if (typeof eventLocation !== 'string' || eventLocation.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_LOCATION);
    }

    if (typeof eventDescription !== 'string' || eventDescription.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_DESCRIPTION);
    }

    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      throw new Error(ERROR_MESSAGES.INVALID_HOST);
    }
  },
  /**
   * Creates a new event and its corresponding summary
   * @param {Object} eventData - The event data
   * @param {string} eventData.eventName - Name of the event
   * @param {Date} eventData.eventDate - Date of the event
   * @param {string} eventData.eventLocation - Location of the event
   * @param {string} eventData.eventDescription - Description of the event
   * @param {string} eventData.hostId - ID of the event host
   * @returns {Promise<Event>} The created event
   * @throws {Error} When creation fails
   */
  async createEvent(eventData) {
    this.validateEventData(eventData);

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const newEvent = await Event.create([{
        eventName: eventData.eventName.trim(),
        eventDate: eventData.eventDate,
        eventLocation: eventData.eventLocation.trim(),
        eventDescription: eventData.eventDescription.trim(),
        hostId: eventData.hostId
      }], { session });

      await EventSummary.create([{
        eventId: newEvent[0]._id,
        eventName: newEvent[0].eventName,
        eventDate: newEvent[0].eventDate,
        totalGuests: 0,
        confirmedGuests: 0
      }], { session });

      await session.commitTransaction();
      return newEvent[0];
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`${ERROR_MESSAGES.CREATE_ERROR}: ${error.message}`);
    } finally {
      session.endSession();
    }
  },

  /**
   * Gets all events for a specific host
   * @param {string} hostId - ID of the host
   * @returns {Promise<Array>} Array of events
   * @throws {Error} When fetching fails
   */
  async getEventsByHost(hostId) {
    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      throw new Error(ERROR_MESSAGES.INVALID_HOST);
    }

    try {
      const events = await Event.aggregate([
        { 
          $match: { hostId: mongoose.Types.ObjectId(hostId) }
        },
        {
          $lookup: {
            from: 'eventSummaries',
            localField: '_id',
            foreignField: 'eventId',
            as: 'summary'
          }
        },
        {
          $unwind: '$summary'
        },
        {
          $project: {
            _id: 1,
            eventName: 1,
            date: '$eventDate',
            totalGuests: '$summary.totalGuests',
            confirmedGuests: '$summary.confirmedGuests'
          }
        },
        {
          $sort: { date: 1 }
        }
      ]);

      return events;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.FETCH_ERROR}: ${error.message}`);
    }
  },

  /**
   * Gets an event by its ID
   * @param {string} eventId - ID of the event
   * @returns {Promise<Event>} The event
   * @throws {Error} When event is not found
   */
  async getEventById(eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new Error(ERROR_MESSAGES.EVENT_NOT_FOUND);
    }

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error(ERROR_MESSAGES.EVENT_NOT_FOUND);
      }
      return event;
    } catch (error) {
      throw new Error(`Failed to get event: ${error.message}`);
    }
  },

  /**
   * Gets event summary by event ID
   * @param {string} eventId - ID of the event
   * @returns {Promise<EventSummary>} The event summary
   */
  async getEventSummary(eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return null;
    }
    return await EventSummary.findOne({ eventId });
  },

  /**
   * Gets complete event details including summary
   * @param {string} eventId - ID of the event
   * @returns {Promise<Object>} Event details and summary
   */
  async getEventDetails(eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new Error(ERROR_MESSAGES.EVENT_NOT_FOUND);
    }

    try {
      const [eventDetails, eventSummary] = await Promise.all([
        this.getEventById(eventId),
        this.getEventSummary(eventId)
      ]);

      return {
        eventDetails,
        summary: {
          totalGuests: eventSummary?.totalGuests ?? 0,
          confirmedGuests: eventSummary?.confirmedGuests ?? 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get event details: ${error.message}`);
    }
  }
};

// Add indexes
Event.schema.index({ hostId: 1 });
EventSummary.schema.index({ eventId: 1 }, { unique: true });

module.exports = eventService;