const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    if (req.body.password.length < 6) {
      res.status(500).json(err)
    }

    const oldUser = await User.findOne({ username: req.body.username });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please try another username...");
    }

    const oldEmail = await User.findOne({ email: req.body.email });
    if (oldEmail) {
      return res.status(409).send("Email Already Exist. Please try another email...");
    }

    //create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err)
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).send({ message: "user not found" });
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (validPassword == false) {
      return res.status(400).send({ message: "wrong password..." })
    }
    const id = user._id;
    // // Create token
    const token = jwt.sign({ id }, "jwtSecret", { expiresIn: 3600 });
    // // save user token
    user.token = token;
    const newUser = await user.save();
    res.status(200).send(newUser)
  } catch (err) {
    res.status(500).send(err)
  }
});

//verify token middleware
const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("yo , we need a token. please give to us next time")
  }
  else {
    jwt.verify(token, "jwtSecret", (err, decoded) => {
      if (err) {
        res.json({ auth: false, msg: "auth failed..." })
      }
      else {
        req.userId = decoded.id;
        next();
      }
    })
  }
}

//isAuth
router.get("/isUserAuth", verifyJWT, (req, res) => {
  res.json({ auth: true, msg: "auth success!!!" })
});

module.exports = router;
