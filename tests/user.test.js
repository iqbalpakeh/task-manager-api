const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

/**
 * Test #1
 */
test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Iqbal Pakeh",
      email: "iqbalpakeh@example.com",
      password: "56what!!"
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the responses
  expect(response.body).toMatchObject({
    user: {
      name: "Iqbal Pakeh",
      email: "iqbalpakeh@example.com"
    },
    token: user.tokens[0].token
  });
  expect(user.password).not.toBe("56what!!");
});

/**
 * Test #2
 */
test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);

  // Assert that new token is saved to database
  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

/**
 * Test #3
 */
test("Should not login non-existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "dummy email",
      password: userOne.password
    })
    .expect(400);

  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "dummy password"
    })
    .expect(400);
});

/**
 * Test #4
 */
test("Should get user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

/**
 * Test #5
 */
test("Should not get profile for unauthenticated user", async () => {
  await request(app)
    .get("/users/me")
    .send()
    .expect(401);
});

/**
 * Test #6
 */
test("Should delete user profile", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert if user is deleted from database
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

/**
 * Test #7
 */
test("Should not delete user profile for unauthenticated user", async () => {
  await request(app)
    .delete("/users/me")
    .send()
    .expect(401);
});

/**
 * Test #8
 */
test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  // Assert if the picture is saved
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

/**
 * Test #9
 */
test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "updated-name"
    })
    .expect(200);

  // Assert if the name is changed
  const user = await User.findById(userOneId);
  expect(user.name).toBe("updated-name");
});

/**
 * Test #10
 */
test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "Batam"
    })
    .expect(400);
});
