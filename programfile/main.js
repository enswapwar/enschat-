const socket = io();

const chatLog = document.getElementById("chat-log");
const chatInput = document.getElementById("chat-input");
const nameInput = document.getElementById("name-input");
const sendBtn = document.getElementById("send-btn");
const adminPassInput = document.getElementById("admin-pass");

let isAdmin = false;

// 名前を localStorage に保存＆復元
const savedName = localStorage.getItem("chat-name");
if (savedName) {
  nameInput.value = savedName;
}
nameInput.addEventListener("input", () => {
  localStorage.setItem("chat-name", nameInput.value.trim());
});

// SHA-256ハッシュ関数
async function sha256(text) {
  const buffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 管理者認証
adminPassInput.addEventListener("input", async () => {
  const hash = await sha256(adminPassInput.value.trim());
  const correctHash = "d09f64d92f514586282a0e18cd0a4654961501ecac0142e3bb2f181bd3edce7f"; // enswapwarpassword
  isAdmin = (hash === correctHash);
});

// メッセージ送信
function sendMessage() {
  const msg = chatInput.value.trim();
  const name = nameInput.value.trim() || "名無し";
  if (!msg) return;
  socket.emit("chat", { name, msg, isAdmin });
  chatInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// チャットメッセージ表示
socket.on("chat", ({ name, msg, isAdmin }) => {
  const p = document.createElement("p");
  p.classList.add("message");
  const nameHTML = isAdmin
    ? `<span class="admin-name">${name}</span>`
    : `<span>${name}</span>`;
  p.innerHTML = `${nameHTML}: ${msg}`;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
});

// 退出通知
socket.on("leave", (name) => {
  const p = document.createElement("p");
  p.classList.add("message");
  p.innerHTML = `👋 <i>${name}</i> が退出しました`;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
});

// ページ離脱前に通知
window.addEventListener("beforeunload", () => {
  const name = nameInput.value.trim() || "名無し";
  socket.emit("leave", name);
});
