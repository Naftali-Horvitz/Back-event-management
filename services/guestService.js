const Guest = require('../models/guestModel');
const { EventSummary } = require('../models/eventSummarySchema');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const {
  validateName,
  validatePhoneNumber,
  validateEmail,
} = require("../validation");

const createGuest = async (guestData) => {
  const { email, name, phone, eventId } = guestData;
  
  try {
    validateName(name);
    validatePhoneNumber(phone);
    validateEmail(email);

    // בדיקה אם האורח כבר קיים באירוע
    const existingGuest = await Guest.findOne({ phone, eventId });
    if (existingGuest) {
      throw new Error('מספר טלפון זה כבר רשום לאירוע');
    }

    const newGuest = new Guest({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      eventId,
    });

    const savedGuest = await newGuest.save();
    
    // עדכון טבלת EventSummary
    await EventSummary.findOneAndUpdate(
      { eventId: savedGuest.eventId },
      {
        $inc: {
          totalGuests: 1
        }
      }
    );

    const qrCode = await generateQRCode(savedGuest.phone, savedGuest.eventId);
    await sendEmailWithQRCode(savedGuest.email, qrCode, savedGuest.phone); 

    return savedGuest;
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error
      throw new Error('מספר טלפון זה כבר רשום לאירוע');
    }
    throw new Error(error.message);
  }
};

const generateQRCode = async (phone, eventId) => {
  try {
    const qrData = JSON.stringify({ eventId, phone });
    return await QRCode.toDataURL(qrData);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw { status: 500, message: 'שגיאה ביצירת קוד QR' };
  }
};

const sendEmailWithQRCode = async (toEmail, qrCode, phone) => { 
  const tempDir = path.join(__dirname, '../temp');
  const qrFilePath = path.join(tempDir, `${phone}.png`);

  try {
    await fs.mkdir(tempDir, { recursive: true });
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
    console.error('Error sending email:', error);
    throw { status: 500, message: 'שגיאה בשליחת המייל' };
  } finally {
    try {
      await fs.unlink(qrFilePath);
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
    }
  }
};

module.exports = {
  createGuest,
};