(function () {
  "use strict";

  const toggleBtn = document.getElementById("chatbox-toggle");
  const chatbox = document.getElementById("chatbox-container");
  const closeBtn = document.getElementById("chatbox-close");
  const sendBtn = document.getElementById("chatbox-send");
  const input = document.getElementById("chatbox-input");
  const messages = document.getElementById("chatbox-messages");

  if (!toggleBtn || !chatbox || !closeBtn || !sendBtn || !input || !messages) {
    console.warn("[chat.js] Thiếu một số phần tử chatbox-* trên trang. Không khởi tạo AI chat.");
    return;
  }

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

  const BACKEND_URL = isLocal
    ? `http://${window.location.hostname || "localhost"}:${window.location.port || "5500"}/ask`
    : "https://baldandbadgithubio-production-4f3f.up.railway.app/ask";

  console.debug("[chat.js] Backend URL:", BACKEND_URL);

  if (chatbox.parentElement !== document.body) {
    try { document.body.appendChild(chatbox); } catch (_) { /* ignore */ }
  }

  function openChat() {
    chatbox.classList.add("show");
    chatbox.setAttribute("aria-hidden", "false");
    setTimeout(() => { try { input.focus(); } catch (_) {} }, 150);
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }

  function closeChat() {
    chatbox.classList.remove("show");
    chatbox.setAttribute("aria-hidden", "true");
  }

  toggleBtn.addEventListener("click", () => {
    if (chatbox.classList.contains("show")) closeChat();
    else openChat();
  });
  closeBtn.addEventListener("click", closeChat);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chatbox.classList.contains("show")) closeChat();
  });

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.classList.add("chat-message", sender === "user" ? "chat-user" : "chat-ai");
    div.textContent = String(text || "");
    messages.appendChild(div);
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }

  let isSending = false;
  async function sendMessage() {
    if (isSending) return;
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    isSending = true;
    sendBtn.disabled = true;

    const tempId = "__ai_typing__";
    let typing = document.getElementById(tempId);
    if (!typing) {
      typing = document.createElement("div");
      typing.id = tempId;
      typing.classList.add("chat-message", "chat-ai");
      typing.style.opacity = "0.6";
      typing.textContent = "Đang suy nghĩ...";
      messages.appendChild(typing);
    }

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const raw = await res.text();
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      let data;
      if (ct.includes("json")) {
        try { data = JSON.parse(raw); }
        catch (e) {
          removeTyping();
          addMessage("Server trả về dữ liệu sai định dạng (lỗi JSON).", "ai");
          return;
        }
      } else {
        removeTyping();
        addMessage(`Server trả về lỗi không mong muốn (HTTP ${res.status}). Vui lòng kiểm tra Console.`, "ai");
        console.error("Non-JSON response:", raw);
        return;
      }

      removeTyping();

      if (!res.ok) {
        const errText =
          (data && (data.error || data.hint))
            ? `${data.error}${data.hint ? " — " + data.hint : ""}`
            : `HTTP ${res.status}: ${data?.error || "Lỗi không xác định"}`;
        addMessage(errText, "ai");
        return;
      }

      const reply =
        (data && (
          data.reply ||
          data.message ||
          (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
        )) || "(Không có nội dung trả về)";

      addMessage(reply, "ai");
    } catch (err) {
      removeTyping();
      console.error("[chat.js] Fetch/network error:", err);
      addMessage("Không thể kết nối đến máy chủ AI. Kiểm tra backend đã chạy chưa (npm start) hoặc mạng.", "ai");
    } finally {
      isSending = false;
      sendBtn.disabled = false;
    }

    function removeTyping() {
      if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
})();
