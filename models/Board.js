const mongoose = require("mongoose");

const BoardSchema = new mongoose.Schema(
    {
        BoardId: {
            type: String,
        },
        members: {
            type: Array,
        },
        board: {
            type: Array,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Board", BoardSchema);