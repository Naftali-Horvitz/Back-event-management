const jwt = require('jsonwebtoken');
const  {jwtDecode} = require( "jwt-decode");
require('dotenv').config();


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (token == null) return res.status(401).json({ msg: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'Token has expired' });
      }
      return res.status(403).json({ msg: 'Token is not valid' });
    }
    req.user = user;
    next();
  });
};
module.exports = authenticateToken;
