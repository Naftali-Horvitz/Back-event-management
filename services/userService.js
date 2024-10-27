const { User } = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sanitize = require("express-mongo-sanitize");
const {
  validateName,
  validateIdNumber,
  validatePhoneNumber,
  validateEmail,
  validatePassword,
} = require("../validation");
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 דקות במיליסקנדות

exports.createUser = async (userData) => {
  const { email, password, fullName, phone, userId } = userData;
  try {
    validateName(fullName);
    validateIdNumber(userId);
    validatePhoneNumber(phone);
    validateEmail(email);
    validatePassword(password);

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("המשתמש עם האימייל הזה כבר קיים");
    }

    // הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    // יצירת משתמש חדש
    const newUser = new User({
      fullName,
      userId,
      phone,
      password: hashedPassword,
      email,
      loginAttempts: 0,
      lockUntil: null,
    });
    // שמירת המשתמש החדש במסד הנתונים
    const savedUser = await newUser.save();
    const { password: _, ...userWithoutPassword } = savedUser.toObject();

    // יצירת JWT
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return { user: userWithoutPassword, token };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.findUserLogin = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("משתמש לא קיים או סיסמה שגויה");
    }

    // בדיקת נעילת חשבון
    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new Error("החשבון נעול. נסה שוב מאוחר יותר");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // עדכון ניסיונות כניסה
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
      }
      await user.save();
      throw new Error("סיסמה שגויה");
    }

    // איפוס ניסיונות כניסה לאחר התחברות מוצלחת
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    const {
      password: _,
      loginAttempts,
      lockUntil,
      ...userWithoutSensitiveInfo
    } = user.toObject();

    // יצירת JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return { user: userWithoutSensitiveInfo, token };
  } catch (error) {
    throw new Error("שגיאה ברישום. נסה שוב מאוחר יותר.");
  }
};
