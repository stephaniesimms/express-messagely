const express = require("express");
const User = require("../models/user");
const ExpressError = require("../expressError");

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require('../config');

const router = new express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);

    if (user) {
      let token = jwt.sign({ username }, SECRET_KEY);
      await User.updateLoginTimestamp(username);
      return res.json({ token });
    }
    
    throw new ExpressError("Invalid user/password", 400);
  } catch (err) {
    console.error("/login", err);
    return next(err);
  }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function (req, res, next) {
  try {
    const user = await User.register(req.body);

    if (user) {
      let token = jwt.sign({ username: req.body.username }, SECRET_KEY);
      // console.log("/register token", token);

      await User.updateLoginTimestamp(req.body.username);
      return res.json({ token });
    }

    throw new ExpressError("Unable to register", 400);
  } catch (err) {
    // console.error(err);
    return next(err);
  }
});

 module.exports = router;