/** User class for message.ly */
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");

const { BCRYPT_WORK_FACTOR } = require('../config');

/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register(username, password, first_name, last_name, phone) {

    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (
        username, 
        password,
        first_name,
        last_name,
        phone,
        join_at,
        last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    // Query for user
    const result = await db.query(
      `SELECT password
        FROM users
        WHERE username=$1`,
      [username]
    );
    const user = result.rows[0];

    if (!user) {
      return false;
    } else {
      if (await bcrypt.compare(password, user.password) === true) {
        return true;
      }
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
        SET last_login_at=current_timestamp
        WHERE username=$1
        RETURNING username, last_login_at`,
      [username]
    );

    return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name 
      FROM users`
    );

    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
          first_name,
          last_name,
          phone,
          join_at,
          last_login_at
        FROM users
        WHERE username = $1`,
      [username]);

    if (result.rows[0] === undefined) {
      const err = new Error(`No such user: ${username}`);
      err.status = 404;
      throw err;
    }

    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_username, body, sent_at, read_at}]
   *
   * where to_username is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT 
        m.id, 
        m.to_username, 
        m.body, 
        m.sent_at, 
        m.read_at,
        u.username,
        u.first_name,
        u.last_name,
        u.phone
      FROM messages AS m
      JOIN users AS u ON u.username = m.to_username
      WHERE from_username = $1`,
      [username]
    );

    if (results.rows === []) {
      const err = new Error(`No messages from this user: ${username}`);
      err.status = 404;
      throw err;
    }

    return results.rows.map(row =>
      ({
        id: row.id,
        to_user: {
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          phone: row.phone
        },
        body: row.body,
        sent_at: row.sent_at,
        read_at: row.read_at
      }));
  }


  /** Return messages to this user.
   *
   * [{id, from_username, body, sent_at, read_at}]
   *
   * where from_username is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
      `SELECT 
        m.id,
        m.from_username, 
        m.body, 
        m.sent_at, 
        m.read_at,
        u.username,
        u.first_name,
        u.last_name,
        u.phone
      FROM messages AS m
      JOIN users AS u ON u.username = m.from_username
      WHERE to_username = $1`,
      [username]
    );

    if (results.rows === []) {
      const err = new Error(`No messages to this user: ${username}`);
      err.status = 404;
      throw err;
    }

    return results.rows.map(row => ({
        id: row.id,
        from_user: {
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          phone: row.phone
        },
        body: row.body,
        sent_at: row.sent_at,
        read_at: row.read_at
      }));
  }
}


module.exports = User;


// INSERT INTO users(
//   username,
//   password,
//   first_name,
//   last_name,
//   phone,
//   join_at)
// VALUES('Stephanie',
//  'shhh',
// 'Stephanie',
//   'Simms',
// '666-666-6666',
//  current_timestamp);

// INSERT INTO messages(
//   from_username,
//   to_username,
//   body,
//   sent_at)
//  VALUES('Stephanie',
//   'Hekmat',
//   'AHOY!',
//   current_timestamp);