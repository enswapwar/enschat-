const socket = io();

const chatLog = document.getElementById("chat-log");
const chatInput = document.getElementById("chat-input");
const nameInput = document.getElementById("name-input");
const sendBtn = document.getElementById("send-btn");
const adminPassInput = document.getElementById("admin-pass");
let isAdmin = false;

// SHA-256でハッシュ化
async function sha256(text) {
  const buffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 管理者判定（パスワードが正しければ isAdmin を true に）
adminPassInput.addEventListener("input", async () => {
  const hash = await sha256(adminPassInput.value.trim());
  const correctHash = "d09f64d92f514586282a0e18cd0a4654961501ecac0142e3bb2f181bd3edce7f"; // enswapwarpassword のSHA256
  isAdmin = (hash === correctHash);
});

// 送信処理
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

// 受信表示
socket.on("chat", (data) => {
  const { name, msg, isAdmin } = data;
  const p = document.createElement("p");
  p.classList.add("message");
  if (isAdmin) p.innerHTML = `${msg} <span class="admin-name">: ${name}</span>`;
  else p.innerHTML = `${msg} : ${name}`;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
});
