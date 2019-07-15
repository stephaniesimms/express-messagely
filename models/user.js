/** User class for message.ly */
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");


/** User of the site. */

class User {
  constructor({ username, password, first_name, last_name, phone }) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
  }
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    
    const result = await db.query(
      `INSERT INTO users (
        username, 
        password,
        first_name,
        last_name,
        phone,
        join_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, password, first_name, last_name, phone]);

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
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name, phone 
      FROM users`
    );

    return results.rows.map(user => new User(user));
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
    const results = await db.query(
      `SELECT username, 
          password,
          first_name,
          last_name,
          phone,
          join_at,
          last_login_at
        FROM users
        WHERE username = $1
        RETURNING username, password, first_name, last_name, phone, join_at, last_login_at`,
        [username]);
      
    return results.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const results = await db.query(
      `SELECT id, to_username, body, sent_at, read_at
        FROM messages
        WHERE from_username = $1`,
      [username]
    );

    return  { id, 
      to_user: {
        username, 
        first_name, 
        last_name, 
        phone
      }, 
      body, sent_at, read_at }
    }

    // return results.rows.map(row => )

  }

  const results = await db.query(
    `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
    [customerId]
  );

    return results.rows.map(row => new Reservation(row));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
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