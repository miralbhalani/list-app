const crypto = require('crypto');

module.exports = function generateHash(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}