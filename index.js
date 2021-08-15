const app = require('./app.js')
const server = app.listen(8080, () => {
  console.log("Backend server is running!");
});

const io = require("socket.io")(server);

let users = [];
const addUser = (userId, socketId) => {
  if (!users.some((user) => user.userId === userId)) {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, messageId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
      messageId,
    });
  });

  //send and get seen status
  socket.on("sendSeen", ({ senderId, receiverId, conversation }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getSeen", {
      senderId,
      conversation,
    });
  });

  //send and get game request 
  socket.on("sendGameRequest", ({ senderId, receiverId, currentBoard }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getGameRequest", {
      senderId,
      currentBoard
    });
  });
  //send and get if the game request Approve
  socket.on("sendGameApproveRequest", ({ senderId, receiverId, currentBoard }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("approveGameRequest", {
      senderId,
      currentBoard
    });
  });
  //send and get current board
  socket.on("sendCurrentPoints", ({ senderId, receiverId, currentPoints, currentMiddleBar, currentOutsideBar }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getCurrentPoints", {
      senderId,
      currentPoints,
      currentMiddleBar,
      currentOutsideBar
    });
  });
  //send and get next turn
  socket.on("sendNextTurn", ({ senderId, receiverId }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getNextTurn", {
      senderId,
    });
  });
  //send and get if the user win
  socket.on("sendWin", ({ senderId, receiverId }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getWin", {
      senderId,
    });
  });
  //send and get if the user win
  socket.on("sendTyping", ({ senderId, receiverId, typing }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getTyping", {
      senderId,
      typing
    });
  });


  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
