const router = require("express").Router();
const { Error } = require("mongoose");
const Conversation = require("../models/Conversation");

//new conv

router.post("/", async (req, res) => {
  if (req.body.senderId !== null && req.body.receiverId !== null) {
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });
    try {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
  else {
    res.status(500).json({ err: "body is missing" });
  }
});

// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    if (conversation) {
      res.status(200).json(conversation);
    }
    else {
      return res.status(404).send("conversation not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


//get conv of a user

router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    if (conversation.length > 0) {
      res.status(200).json(conversation);
    }
    else {
      throw new Error("userId not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


//get conv includes two userId

router.get("/find/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id
    });
    if (conversation) {
      res.status(200).json(conversation)
    }
    else {
      return res.status(404).send("conversation not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
