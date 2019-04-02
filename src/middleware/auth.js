const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    // get the token from bearer auth header
    const token = req.header("Authorization").replace("Bearer ", "");
    // decribe the token that contain user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // find the user that has this id
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    });
    // check if user exist
    if (!user) {
      throw new Error();
    }
    // assign the token and user to request object
    req.token = token;
    req.user = user;
    // continue with the next process after this
    // middleware operation
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate!" });
  }
};

module.exports = auth;
