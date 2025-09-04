const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = {}; // { socket.id: name }

// 静的ファイル配信（ルート直下の index.html を想定）
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

function broadcastUsers() {
  const userNames = Object.values(users);
  io.emit("updateUsers", userNames);
}

io.on("connection", (socket) => {
  console.log(`🟢 接続: ${socket.id}`);
  users[socket.id] = "名無し";
  broadcastUsers();

  io.emit("join", users[socket.id]);

  socket.on("setName", (name) => {
    users[socket.id] = name && name.trim() ? name : "名無し";
    broadcastUsers();
  });

  socket.on("chat", (data) => {
    const { name, msg, isAdmin, color } = data;
    users[socket.id] = name && name.trim() ? name : "名無し";
    broadcastUsers();
    io.emit("chat", { name: users[socket.id], msg, isAdmin, color });
  });

  socket.on("leave", (name) => {
    io.emit("leave", name || "名無し");
  });

  socket.on("requestUsers", () => {
    broadcastUsers();
  });

  socket.on("disconnect", () => {
    console.log(`🔴 切断: ${socket.id}`);
    const name = users[socket.id] || "名無し";
    delete users[socket.id];
    io.emit("leave", name);
    broadcastUsers();
  });
});

const PORT = process.env.PORT || 3000; // ← ここ重要（Render用）
server.listen(PORT, () => {
  console.log(`🚀 サーバー起動中: http://localhost:${PORT}`);
});
