const guestService = require('../services/guestService');

const registerGuest = async (req, res) => {
  const { eventId } = req.params;
  const { name, email, phone } = req.body;

  try {
    const newGuest = await guestService.createGuest({
      name,
      email,
      phone,
      eventId,
    });

    return res.status(201).send(newGuest);  // 201 - Created
  } catch (error) {
    // טיפול בסוגי שגיאות שונים
    if (error.status === 500) {
      return res.status(500).send({ msg: error.message });
    }
    return res.status(400).send({ msg: error.message });
  }
};
class saveGuestController {
  /**
   * שמירת רשימת מוזמנים
   * @param {Object} req - בקשת HTTP
   * @param {Object} res - תגובת HTTP
   */
  async saveGuestList(req, res) {
    try {
      const { eventId, guests } = req.body;

      // בדיקת תקינות הקלט
      if (!eventId || !Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'נתונים חסרים או לא תקינים'
        });
      }

      // ניסיון לשמור את המוזמנים
      const result = await guestService.saveGuestList(eventId, guests);

      return res.status(201).json({
        success: true,
        data: result,
      });

    } catch (error) {
      // console.error('Error in saveGuestList:', error);
      // טיפול בשגיאות ידועות
      if (error.error === 'חלק מהמוזמנים כבר קיימים במערכת.' ||
        error.error === 'לא נמצאו אורחים לשמירה. כולם קיימים כבר במערכת.') {
        return res.status(409).json({ // קוד 409 Conflict מתאים לכפילויות
          success: false,
          error: error.error,
          savedCount: error.savedCount,
          duplicateCount: error.duplicateCount,
          totalSubmitted: error.totalSubmitted,
          unGuestsSaved: error.unGuestsSaved,
        });
      }

      // כל שגיאה אחרת לא צפויה
      return res.status(500).json({
        success: false,
        error: error.message || 'אירעה שגיאה בשרת'
      });
    }

  }
}

module.exports = {
  registerGuest,
  saveGuestList: new saveGuestController().saveGuestList,
};