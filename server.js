const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 静的ファイルの配信（HTML, CSS, JS）
app.use(express.static(path.join(__dirname, "public"))); // ← public フォルダがWebルート

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
