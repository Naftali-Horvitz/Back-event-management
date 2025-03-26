const { User } = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sanitize = require("express-mongo-sanitize");
const { AuthErrors, catchError} = require("../config/errorsMessages")
const {
  validateName,
  validatePhoneNumber,
  validateEmail,
  validatePassword,
} = require("../validation");
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 דקות במיליסקנדות

exports.createUser = async (userData) => {
  const { email, password, fullName, phone } = userData;
  try {
    validateName(fullName);
    validatePhoneNumber(phone);
    validateEmail(email);
    validatePassword(password);

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error(AuthErrors.USER_ALREADY_EXISTS.message);
      error.code = AuthErrors.USER_ALREADY_EXISTS.code;
      throw error;    }

    // הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    // יצירת משתמש חדש
    const newUser = new User({
      fullName,
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
      expiresIn: "24h",
    });

    return { user: userWithoutPassword, token };
  } catch (error) {
    catchError(error);
  }
};

exports.findUserLogin = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error(AuthErrors.USER_NOT_FOUND_OR_WRONG_PASSWORD.message);
      error.code = AuthErrors.USER_NOT_FOUND_OR_WRONG_PASSWORD.code;
      throw error;

    }

    // בדיקת נעילת חשבון
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const error = new Error(AuthErrors.ACCOUNT_LOCKED.message);
      error.code = AuthErrors.ACCOUNT_LOCKED.code;
      throw error;    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // עדכון ניסיונות כניסה
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
      }
      await user.save();
      const error = new Error(AuthErrors.WRONG_PASSWORD.message);
      error.code = AuthErrors.WRONG_PASSWORD.code;
      throw error;    }

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
    catchError(error);
  }
};
