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

module.exports = {
  registerGuest,
};