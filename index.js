const io = require("socket.io")(8900, {
  cors: {
    origin: ["http://localhost:3000","https://www.zoko.cf","https://api.zoko.cf"],
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};
  
io.on("connection", (socket) => {
  //when connect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    try {
      const user = getUser(receiverId);
    console.log(user,"message send");
    socket.to(user.socketId).emit("getMessage", {
      senderId,
      text,
      createdAt:Date.now()
    });
    } catch (error) {
      console.log("user not available");
    }
    
  });
  //notifications

  socket.on("sendNotification", ({ senderId, type,userId }) => {
    console.log("emitted",userId);
    const receiver = getUser(userId);
    console.log(userId,receiver);
    socket.to(receiver?.socketId).emit("getNotification", {
      emiterId:senderId,
      text:type,
      createdAt:Date.now()
    });
  });

  socket.on("sendText", ({ senderName, receiverName, text }) => {
    const receiver = getUser(receiverName);
    io.to(receiver?.socketId).emit("getText", {
      senderName,
      text,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
