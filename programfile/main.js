const socket = io();

const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const nameInput = document.getElementById("name-input");
const chatLog = document.getElementById("chat-log");
const colorPicker = document.getElementById("name-color-picker");

let userColor = colorPicker?.value || "#000000";

// 色変更（メッセージの文字に適用する用）
colorPicker?.addEventListener("input", () => {
  userColor = colorPicker.value;
  localStorage.setItem("name-color", userColor);
});

// 送信処理
function sendMessage() {
  const name = nameInput.value.trim();
  const msg = input.value.trim();
  if (!msg) return;
  socket.emit("chat", { name, msg, color: userColor });
  input.value = "";
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// 表示側：メッセージの色を反映
socket.on("chat", ({ name, msg, color }) => {
  const p = document.createElement("p");
  const span = document.createElement("span");
  span.textContent = `${name}: `;
  const messageText = document.createElement("span");
  messageText.textContent = msg;
  messageText.style.color = color || "#000";
  p.append(span, messageText);
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
});
