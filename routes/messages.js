const express = require("express");
const Message = require("../models/message");
const ExpressError = require("../expressError");

const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = req.user.username;
    const message = await Message.get(req.params.id);

    if (message.from_user.username !== username && message.to_user.username !== username) {
      throw new ExpressError("You are not authorized to read this message", 401);
    }

    return res.json({ message: message });
  } catch (err) {
    return next(err);
  }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

//ensureLoggedIn
//await to create a message
//on message object:
//assign from_username (from req), to_username (from body), body (from body)
//return json

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const result = await Message.create({
      "from_username": req.user.username,
      "to_username": req.body.to_username,
      "body": req.body.body 
    });

    return res.json({ message: result});

  } catch (err) {
    return next(err);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = req.user.username;
    const id = req.params.id;
    const message = await Message.get(id);

    if (message.to_user.username !== username) {
      throw new ExpressError("You are not authorized to read this message", 401);
    }

    const result = await Message.markRead(id);

    return res.json({ message: result });

  } catch (err) {
    return next(err);
  }
});



module.exports = router;