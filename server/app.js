const express = require("express");
const socket = require("socket.io");

const app = express();
app.use(express.json());

const server = app.listen(5678, () => {
  console.log(`listening to port No. 5678`);
});

const io = socket(server, {
  pingTimeOut: 30000,
  cors: {
    origin: [process.env.APP_BASE_URL_FRONTEND, "http://localhost:5173"],
  },
});

const users = {};

io.on("connection", (socket) => {
  socket.on("user-joined", (userName) => {
    users[socket.id] = userName;
    socket.broadcast.emit("user-joined-msg", {
      msg: `${userName} has joined the chat`,
      type: "mid",
      userName,
    });
    socket.emit("all-user", { users: Object.values(users) });
  });

  socket.on("send-message", (msg) => {
    socket.broadcast.emit("recieve-message", {
      msg,
      type: "left",
      from: users[socket.id],
    });
  });

  socket.on("disconnect", () => {
    console.log("object");
    socket.broadcast.emit("leave", {
      msg: `${users[socket.id]} leaves the group`,
      type: "mid",
      userName: users[socket.id],
    });
    delete users[socket.id];
  });
});
