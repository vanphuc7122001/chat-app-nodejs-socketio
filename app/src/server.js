const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { createMessage } = require("./utils/createMsg");
const { getUserList, addUser, removeUser, findUser } = require("./utils/users");

//tạo server dùng http
const server = http.createServer(app);

//config static file
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));
const io = socketio(server);

let count = 0;

// lắng nghe từ client
io.on("connection", (socket) => {
  // xử lý join vào phòng nào
  socket.on("join room from client to server", ({ username, room }) => {
    socket.join(room);

    // gửi cho client vừa kết nối vào
    socket.emit(
      "send msg from server",
      createMessage(`Chào mừng bạn đã đến với phòng ${room}`, "Admin")
    );

    // gửi cho các client còn lại
    socket.broadcast
      .to(room)
      .emit(
        "send msg from server",
        createMessage(
          `client ${username} vừa tham gia vào phòng ${room}`,
          "Admin"
        )
      );

    // chat
    socket.on("send msg from client", (msg, callback) => {
      const filter = new Filter();
      if (filter.isProfane(msg)) {
        return callback("tin nhắn không hợp lệ");
      }

      const id = socket.id;
      const user = findUser(id);

      io.to(room).emit(
        "send msg from server",
        createMessage(msg, user.username)
      );
      callback();
    });

    //xử lý chia sẻ vị trí
    socket.on("share location from client", ({ latitude, longitude }) => {
      const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const id = socket.id;
      const user = findUser(id);
      io.to(room).emit(
        "share location from server",
        createMessage(linkLocation, user.username)
      );
    });

    // xử lý userList
    const newUser = {
      id: socket.id,
      username,
      room,
    };
    addUser(newUser);
    io.to(room).emit("send userlist", getUserList(room));

    // lắng nghe sự kiện ngắt kết nối
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.to(room).emit("send userlist", getUserList(room));
    });
  });
});

// initialize server
server.listen(port, () =>
  console.log(`App running on the port http://localhost:${port}`)
);
