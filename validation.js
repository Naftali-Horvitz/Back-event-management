const validator = require("validator");

const validateName = (name) => {
    if (name.length < 2 || name.length > 30) {
        throw new Error("השם חייב להיות בין 2 ל-50 תווים.");
    }

    // בדיקה שהשם מכיל רק אותיות עבריות או אנגליות
    if (!/^[a-zA-Z\u0590-\u05FF\s]+$/.test(name)) {
        throw new Error("השם יכול להכיל רק אותיות עבריות או אנגליות וללא תווים מיוחדים או מספרים.");
    }
};

const validateIdNumber = (idNumber) => {
    if (!/^\d{9}$/.test(idNumber)) {
        throw new Error("תעודת זהות חייבת להכיל 9 ספרות.");
    }
    // חישוב תקינות תעודת זהות
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let digit = parseInt(idNumber[i], 10);
        let temp = digit * ((i % 2) + 1);
        if (temp > 9) temp -= 9;
        sum += temp;
    }

    // אם התוצאה מתחלקת ב-10, תעודת הזהות תקינה
    if (sum % 10 !== 0) {
        throw new Error("תעודת זהות אינה תקינה.");
    }
    //   validateIdNumber("123456782"); // תקין
    //   validateIdNumber("123456789"); // לא תקין
};

const validatePhoneNumber = (phoneNumber) => {
    if (!validator.isMobilePhone(phoneNumber, 'he-IL')) {
        throw new Error("מספר פלאפון אינו תקין.");
    }
};

const validateEmail = (email) => {
    if (!validator.isEmail(email)) {
        throw new Error("כתובת המייל אינה תקינה.");
    }
};

const validatePassword = (password) => {

    if (password.length < 6) {
        throw new Error("הסיסמה צריכה להיות באורך של לפחות 6 תווים.");
    }
    if (!/[a-z]/.test(password)) {
        throw new Error("הסיסמה צריכה להכיל לפחות אות אחת באנגלית קטנה.");
    }
    if (!/[A-Z]/.test(password)) {
        throw new Error("הסיסמה צריכה להכיל לפחות אות אחת באנגלית גדולה.");
    }
    if (!/[0-9]/.test(password)) {
        throw new Error("הסיסמה צריכה להכיל לפחות מספר אחד.");
    }
};

module.exports = {
    validateName,
    validateIdNumber,
    validatePhoneNumber,
    validateEmail,
    validatePassword,
};
