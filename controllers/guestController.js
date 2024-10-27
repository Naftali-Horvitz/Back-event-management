const guestService = require('../services/guestService');

const registerGuest = async (req, res) => {
  const { eventId } = req.params;
  const { name, guestId, email, phone } = req.body;

  try {
    const newGuest = await guestService.createGuest({
      name,
      guestId,
      email,
      phone,
      eventId,
    });
    res.status(200).send(newGuest);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

module.exports = {
  registerGuest,
};

