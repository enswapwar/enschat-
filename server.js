const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ルートに置いた index.html や CSS/JS を配信
app.use(express.static(__dirname));

// "/" にアクセスされたら index.html を返す
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ソケット通信処理
io.on("connection", (socket) => {
  console.log(`🟢 接続: ${socket.id}`);

  // 接続者一覧を全員に送信
  function broadcastUsers() {
    const users = Array.from(io.of("/").sockets.values()).map(s => s.id);
    io.emit("updateUsers", users);
  }

  // チャット受信→全員に送信
  socket.on("chat", (data) => {
    io.emit("chat", data); // { name, msg, isAdmin }
  });

  // 退出通知受信→全員に送信
  socket.on("leave", (name) => {
    io.emit("leave", name);
  });

  // ユーザー一覧のリクエスト
  socket.on("requestUsers", () => {
    broadcastUsers();
  });

  // 切断時もユーザー一覧を更新
  socket.on("disconnect", () => {
    console.log(`🔴 切断: ${socket.id}`);
    broadcastUsers();
  });
});

// ポート設定
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 サーバー起動中: http://localhost:${PORT}`);
});
