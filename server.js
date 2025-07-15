const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 静的ファイルの提供（HTML, CSS, JS）
app.use(express.static(path.join(__dirname, "public"))); // ← HTML置くフォルダを "public" に統一

// ソケット通信
io.on("connection", (socket) => {
  // チャットメッセージ受信 → 全員に送信
  socket.on("chat", (data) => {
    io.emit("chat", data); // { name, msg, isAdmin }
  });

  // 退出通知受信 → 全員に送信
  socket.on("leave", (name) => {
    io.emit("leave", name);
  });
});

// ポート設定
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ サーバー起動中: http://localhost:${PORT}`);
});
