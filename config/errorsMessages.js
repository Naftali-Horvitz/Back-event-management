
export const AuthErrors = {
  USER_ALREADY_EXISTS: {
    code: "AUTH_004",
    message: "המשתמש עם האימייל הזה כבר קיים",
  },
    USER_NOT_FOUND_OR_WRONG_PASSWORD: {
      code: "AUTH_001",
      message: "משתמש לא קיים או סיסמה שגויה",
    },
    WRONG_PASSWORD: {
      code: "AUTH_002",
      message: "סיסמה שגויה",
    },
    ACCOUNT_LOCKED: {
      code: "AUTH_003",
      message: "החשבון נעול. נסה שוב מאוחר יותר",
    },
  };
  
export function catchError(error){

const knownErrorCodes = Object.values(AuthErrors).map(e => e.code);
if (knownErrorCodes.includes(error.code)) {
  // console.error("Unexpected error:", error);
  throw error;
} else {
    throw new Error(error);
  }
    
}