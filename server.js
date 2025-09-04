const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ユーザー管理 { socket.id: 名前 }
const users = {};

function broadcastUsers() {
  io.emit("updateUsers", Object.values(users));
}

io.on("connection", (socket) => {
  console.log(`🟢 接続: ${socket.id}`);
  users[socket.id] = "名無し"; // 初期値

  // 名前をセット（接続時や変更時）
  socket.on("setName", (name) => {
    users[socket.id] = name || "名無し";
    broadcastUsers();
  });

  // チャット
  socket.on("chat", (data) => {
    const { name, msg, isAdmin, color } = data;
    users[socket.id] = name || "名無し"; // 更新
    broadcastUsers();
    io.emit("chat", { name, msg, isAdmin, color });
  });

  // 退出通知
  socket.on("leave", (name) => {
    io.emit("leave", name);
  });

  // ユーザー一覧リクエスト
  socket.on("requestUsers", () => {
    broadcastUsers();
  });

  // 切断
  socket.on("disconnect", () => {
    console.log(`🔴 切断: ${socket.id}`);
    delete users[socket.id];
    broadcastUsers();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 サーバー起動中: http://localhost:${PORT}`);
});
