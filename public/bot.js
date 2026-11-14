document.addEventListener("DOMContentLoaded", () => {
  const botHTML = `
    <div class="py-badge-bot" onclick="togglePyBot()" title="Ask PyBot">
      <span>🐍</span> Python 3.13 Ready
      <span style="width: 12px; height: 3px; background: #3b82f6; border-radius: 2px; display: inline-block; box-shadow: 0 0 8px #3b82f6; margin-left: 4px;"></span>
    </div>

    <div class="py-bot-window" id="pyBotWindow" style="display: none;">
      <div class="py-bot-header" style="border-bottom: 2px solid #3b82f6;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>🤖</span>
          <div>
            <div style="font-weight:700; font-size:13.5px;">PyBot 3.13</div>
            <div style="font-size:11px; color:#3b82f6; display:flex; align-items:center; gap:4px;">
              <span style="display:inline-block; width:16px; height:2px; background:#3b82f6;"></span> Online • Powered by Gemini AI
            </div>
          </div>
        </div>
        <button onclick="togglePyBot()" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">&times;</button>
      </div>

      <div class="py-bot-messages" id="pyBotMessages">
        <div class="bot-msg">
          Hey! I'm <strong>PyBot 3.13</strong>. Ask me anything about Python code, syntax, or concepts!
        </div>
      </div>

      <div class="py-bot-chips">
        <span class="py-chip" onclick="quickAsk('What is new in Python 3.13?')">Python 3.13</span>
        <span class="py-chip" onclick="quickAsk('How do list comprehensions work?')">Lists</span>
        <span class="py-chip" onclick="quickAsk('Explain OOP classes and objects')">OOP</span>
      </div>

      <div class="py-bot-input-area">
        <input type="text" id="pyBotInput" placeholder="Ask a Python question..." onkeypress="if(event.key==='Enter') sendPyMessage()">
        <button onclick="sendPyMessage()" style="background:#3b82f6;">Send</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", botHTML);
});

function togglePyBot() {
  const win = document.getElementById("pyBotWindow");
  win.style.display = win.style.display === "flex" ? "none" : "flex";
}

function quickAsk(text) {
  document.getElementById("pyBotInput").value = text;
  sendPyMessage();
}

async function sendPyMessage() {
  const input = document.getElementById("pyBotInput");
  const query = input.value.trim();
  if (!query) return;

  const messages = document.getElementById("pyBotMessages");
  messages.innerHTML += `<div class="user-msg">${escapeHTML(query)}</div>`;
  input.value = "";

  const loadingId = "loading_" + Date.now();
  messages.innerHTML += `<div class="bot-msg" id="${loadingId}">Thinking... 🤖</div>`;
  messages.scrollTop = messages.scrollHeight;

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query })
    });

    const textResponse = await response.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      throw new Error(`Server returned non-JSON response (Status ${response.status}): ${textResponse.slice(0, 100)}`);
    }

    document.getElementById(loadingId).remove();

    if (!response.ok) {
      messages.innerHTML += `<div class="bot-msg" style="color:#ef4444;">Error: ${escapeHTML(data.error || "Unknown server error")}</div>`;
      return;
    }

    const formattedReply = formatGeminiOutput(data.reply || "No reply received.");
    messages.innerHTML += `<div class="bot-msg">${formattedReply}</div>`;

  } catch (error) {
    document.getElementById(loadingId).remove();
    messages.innerHTML += `<div class="bot-msg" style="color:#ef4444;">Error: ${escapeHTML(error.message)}</div>`;
  }
  messages.scrollTop = messages.scrollHeight;
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag]));
}

function formatGeminiOutput(text) {
  return escapeHTML(text)
    .replace(/```python([\s\S]*?)```/g, '<code style="display:block; background:#0f172a; color:#60a5fa; padding:8px; border-radius:6px; margin-top:6px; font-family:monospace; white-space:pre-wrap;">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}