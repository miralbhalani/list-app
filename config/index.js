const env = process.env.NODE_ENV || 'development';

var fileToChoose = (env == "development" || env == "test") ? `${env}.json` : `${env}.js`

const config = require(`./config.${fileToChoose}`);
module.exports = config;