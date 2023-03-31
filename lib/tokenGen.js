const jwt = require('jsonwebtoken');

const { 
  token: { 
      jwt: { 
          secret: secretKey,
          expiresIn
      } 
  } 
} = require('../config');

function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: expiresIn });
}

function validateToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (err) {
    return null;
  }
}

module.exports = {
    generateToken,
    validateToken
}