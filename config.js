/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql:///messagely_test"
  : "postgresql:///messagely";

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;

const TWILIO_ACCOUNTSID = 'AC9e40a649ba749a34697da24165963059';
const TWILIO_AUTH_TOKEN = '92f93af9e719970b270baa7366c54df1';

// +19252810678

module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
  TWILIO_ACCOUNTSID,
  TWILIO_AUTH_TOKEN
};