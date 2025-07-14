const socket = io();

const chatLog = document.getElementById("chat-log");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const darkBtn = document.getElementById("toggle-dark");
const clearBtn = document.getElementById("clear-logs");
const adminPass = document.getElementById("admin-pass");

// チャット送信
function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  socket.emit("chat", msg);
  chatInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// メッセージ受信
socket.on("chat", (msg) => {
  const p = document.createElement("p");
  p.textContent = msg;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
});

// ダークモード切替
darkBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// ログ削除（管理者パスワードチェック例付き）
clearBtn.addEventListener("click", () => {
  const pw = adminPass.value.trim();
  if (pw === "your_admin_password") {
    chatLog.innerHTML = "";
  } else {
    alert("パスワードが間違っています");
  }
});
