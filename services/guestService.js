const Guest = require('../models/guestModel');
const {EventSummary} = require('../models/eventSummarySchema');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const {
  validateName,
  validateIdNumber,
  validatePhoneNumber,
  validateEmail,
} = require("../validation");
const createGuest = async (guestData) => {
  const { email, name, phone, guestId , id, eventId} = guestData;
  try {
    validateName(name);
    validateIdNumber(guestId);
    validatePhoneNumber(phone);
    validateEmail(email);

    const newGuest = new Guest({
      ...guestData,
    });
  
    const savedGuest = await newGuest.save();
    // עדכון טבלת EventSummary
    await EventSummary.findOneAndUpdate(
      { eventId: newGuest.eventId },
      {
        $inc: {
          totalGuests: 1,
          confirmedGuests: savedGuest.status 
        }
      }
    );
    const qrCode = await generateQRCode(guestId, eventId);
    await sendEmailWithQRCode(guestData.email, qrCode, id);

    return savedGuest;
  } catch (error) {
    throw new Error(error.message);
  }
};

const generateQRCode = async (guestId, eventId) => {
  try {
    const qrData = JSON.stringify({ eventId, guestId });
    return await QRCode.toDataURL(qrData);
  } catch (error) {
    console.log('Error generating QR code:', error);
    throw { status: 500, message: 'Error generating QR code' };
  }
};
const sendEmailWithQRCode = async (toEmail, qrCode, id) => {
  const tempDir = path.join(__dirname, '../temp');
  const qrFilePath = path.join(tempDir, `${id}.png`);

  try {
    // וודא שהתיקייה temp קיימת
    await fs.mkdir(tempDir, { recursive: true });

    // המרת ה-Data URL לקובץ
    const qrBuffer = Buffer.from(qrCode.split(',')[1], 'base64');
    await fs.writeFile(qrFilePath, qrBuffer);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'הזמנה לאירוע - קוד QR שלך',
      html: `
        <h2>הזמנה לאירוע</h2>
        <p>אנו שמחים להזמינך:</p>
        <p>קוד ה-QR שלך מצורף למייל זה.</p>
      `,
      attachments: [
        {
          filename: 'QRCode.png',
          path: qrFilePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:');
    throw { status: 500, message: 'Error sending email' };
  } finally {
    // נסה למחוק את הקובץ הזמני, אבל אל תזרוק שגיאה אם זה נכשל
    try {
      await fs.unlink(qrFilePath);
    } catch (unlinkError) {
      console.error('Error deleting temporary file:');
    }
  }
};

module.exports = {
  createGuest,
};