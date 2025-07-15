// --- 既存スニペット省略 ---
// 名前色保存と反映
const colorPicker = document.getElementById("name-color-picker");
const savedColor = localStorage.getItem("name-color") || "#000000";
colorPicker.value = savedColor;
let nameColor = savedColor;

colorPicker.addEventListener("input", () => {
  nameColor = colorPicker.value;
  localStorage.setItem("name-color", nameColor);
});

// 接続者リスト管理
const usersList = document.getElementById("users-list");
let currentUsers = [];

// 管理者通知
const adminNotice = document.getElementById("admin-notice");
function showAdminNotice() {
  adminNotice.classList.remove("hidden");
  setTimeout(() => adminNotice.classList.add("hidden"), 3000);
}

// パスワード入力処理修正
adminPassInput.addEventListener("input", async () => {
  const hash = await sha256(adminPassInput.value.trim());
  const correctHash = "d09f..."; // same hash
  isAdmin = (hash === correctHash);
  if (isAdmin) showAdminNotice();
});

// socket イベント
socket.on("connect", () => socket.emit("requestUsers"));
socket.on("updateUsers", (users) => {
  currentUsers = users;
  usersList.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u;
    usersList.appendChild(li);
  });
});

// 送信と表示にも名前色反映
socket.on("chat", ({ name, msg, isAdmin }) => {
  const p = document.createElement("p");
  const nameSpan = document.createElement("span");
  nameSpan.textContent = name;
  nameSpan.style.color = isAdmin ? "red" : nameColor;
  p.innerHTML = "";
  p.append(nameSpan, document.createTextNode(": " + msg));
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
});

// server.js 追記
io.on("connection", (socket) => {
  // 接続後ユーザー追加・一覧ブロードキャスト
  socket.on("requestUsers", () => {
    const users = Array.from(io.of("/").sockets.values()).map(s => s.id);
    io.emit("updateUsers", users);
  });
  socket.on("disconnect", () => {
    const users = Array.from(io.of("/").sockets.values()).map(s => s.id);
    io.emit("updateUsers", users);
  });
});
