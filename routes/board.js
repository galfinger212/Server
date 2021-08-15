const router = require("express").Router();
const Board = require("../models/Board");

//add

router.post("/", async (req, res) => {
    const newBoard = new Board({
        members: [req.body.senderId, req.body.receiverId],
        board: req.body.currentBoard
    });

    try {
        const savedBoard = await newBoard.save();
        res.status(200).json(savedBoard);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get by members id
router.get("/:firstUserId/:secondUserId", async (req, res) => {
    try {
        const board = await Board.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] },
        });
        res.status(200).json(board)
    } catch (err) {
        res.status(500).json(err);
    }

});

//get by board id

router.get("/:BoardId", async (req, res) => {
    try {
        const board = await Board.find({
            _id: req.params.BoardId,
        });
        res.status(200).json(board);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
