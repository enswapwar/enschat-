const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 静的ファイル（index.htmlなど）を配信
app.use(express.static(path.join(__dirname, ".")));

io.on("connection", (socket) => {
  console.log("🟢 ユーザー接続:", socket.id);

  socket.on("chat", (msg) => {
    io.emit("chat", msg); // 全員にブロードキャスト
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 サーバー起動: http://localhost:${PORT}`);
});
