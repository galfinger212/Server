const router = require("express").Router();
const Message = require("../models/Message");

//add

router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update message to seen

router.put("/:messageId", async (req, res) => {
  Message.findById(req.params.messageId).then((model) => {
    return Object.assign(model, { seen: true });
  }).then((model) => {
    return model.save();
  }).then((updateModel) => {
    res.status(200).json({ msg: 'model update', updateModel: updateModel });
  }).catch((err) => {
    res.status(500).json(err);
  })
});
module.exports = router;
