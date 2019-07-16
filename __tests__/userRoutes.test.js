const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");


describe("User Routes Test", async function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });
    
    testUserToken = jwt.sign({ username: "test1" }, SECRET_KEY);

  });

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
  describe("GET /users", function () {
    test("can get a list of users", async function () {
      let response = await request(app)
        .get("/users")
        .send({ _token: testUserToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ users: [{ username: "test1", first_name: "Test1", last_name: "Testy1", phone: "+14155550000" }]});
    });
  })

  describe("GET /:username", function () {
    test("can get a list of users", async function () {
      let response = await request(app)
        .get("/users/test1")
        .send({ _token: testUserToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ user: { username: "test1", first_name: "Test1", last_name: "Testy1", phone: "+14155550000", join_at: expect.any(String), last_login_at: expect.any(String) } });
    });
  })




  afterAll(async function () {
    await db.end();
  });
});