const socket = io();

// --- 要素取得 ---
const chatLog = document.getElementById("chat-log");
const chatInput = document.getElementById("chat-input");
const nameInput = document.getElementById("name-input");
const sendBtn = document.getElementById("send-btn");
const adminPassInput = document.getElementById("admin-pass");
const colorPicker = document.getElementById("name-color-picker");
const usersList = document.getElementById("users-list");
const adminNotice = document.getElementById("admin-notice");

let isAdmin = false;
let nameColor = "#000000";

// --- Cookie操作 ---
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days*86400000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}
function getCookie(name) {
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    const [k, v] = c.trim().split("=");
    if (k === name) return v;
  }
  return "";
}

// --- 名前・色を localStorage / cookie から復元 ---
const savedName = getCookie("chat-name") || "名無し";
nameInput.value = savedName;
socket.emit("setName", savedName);

const savedColor = localStorage.getItem("name-color");
if (savedColor) {
  nameColor = savedColor;
  if (colorPicker) colorPicker.value = savedColor;
}

// 入力イベント
nameInput.addEventListener("input", () => {
  const newName = nameInput.value.trim() || "名無し";
  setCookie("chat-name", newName, 30);
  socket.emit("setName", newName);
});

if (colorPicker) {
  colorPicker.addEventListener("input", () => {
    nameColor = colorPicker.value;
    localStorage.setItem("name-color", nameColor);
  });
}

// --- SHA-256ハッシュ関数 ---
async function sha256(text) {
  const buffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// --- 管理者認証 ---
adminPassInput.addEventListener("input", async () => {
  const hash = await sha256(adminPassInput.value.trim());
  const correctHash = "b54cf84a09df7cbdf12c04ee8022f1225a9db4b729124d0c159b85eb80133e4e"; // Orangemikan
  isAdmin = (hash === correctHash);
  if (isAdmin) {
    adminNotice.classList.remove("hidden");
    setTimeout(() => adminNotice.classList.add("hidden"), 3000);
  }
});

// --- メッセージ送信 ---
function sendMessage() {
  const msg = chatInput.value.trim();
  const name = nameInput.value.trim() || "名無し";
  if (!msg) return;
  socket.emit("chat", { name, msg, isAdmin, color: nameColor });
  chatInput.value = "";
}
sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// --- ユーザー一覧更新 ---
socket.on("updateUsers", (users) => {
  usersList.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u;
    usersList.appendChild(li);
  });
});

// --- チャットメッセージ表示 ---
socket.on("chat", ({ name, msg, isAdmin, color }) => {
  const p = document.createElement("p");
  p.classList.add("message");

  const nameSpan = document.createElement("span");
  nameSpan.textContent = name;
  if (isAdmin) {
    nameSpan.classList.add("admin-name");
  }

  const msgSpan = document.createElement("span");
  msgSpan.textContent = ": " + msg;
  msgSpan.style.color = color || "#000";

  p.appendChild(nameSpan);
  p.appendChild(msgSpan);

  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
});

// --- 入退室通知 ---
socket.on("join", (name) => {
  const p = document.createElement("p");
  p.classList.add("message");
  p.innerHTML = `✅ <i>${name}</i> が入室しました`;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
});

socket.on("leave", (name) => {
  const p = document.createElement("p");
  p.classList.add("message");
  p.innerHTML = `👋 <i>${name}</i> が退出しました`;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
});

// --- ページ離脱時に退出通知 ---
window.addEventListener("beforeunload", () => {
  const name = nameInput.value.trim() || "名無し";
  socket.emit("leave", name);
});

// --- 接続時ユーザーリストリクエスト ---
socket.on("connect", () => socket.emit("requestUsers"));
