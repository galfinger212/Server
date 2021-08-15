const User = require("../models/User");
const router = require("express").Router();

//get all users
router.get("/allUsers", async (req, res) => {
  try {
    User.find({}, function (err, users) {
      res.status(200).json(users);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a user by id or name
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
