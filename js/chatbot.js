/**
 * Cami - Chatbot Interactivo para Ciudad del Carmen
 * Permite conversar sobre historia, playas, gastronomía, leyendas y solicitar rutas con Cami.
 */

export class ChatbotController {
  constructor(gemmaService, voiceAssistant) {
    this.gemma = gemmaService;
    this.voice = voiceAssistant;
    this.isOpen = false;
    this.messages = [];
    this.onRouteRequestedCallback = null;

    this.container = null;
    this.chatBody = null;
    this.inputField = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.chatBody = this.container.querySelector(".chat-messages-container");
    this.inputField = this.container.querySelector(".chat-input-text");
    const sendBtn = this.container.querySelector(".chat-btn-send");
    const closeBtn = this.container.querySelector(".chat-btn-close");
    const voiceBtn = this.container.querySelector(".chat-btn-mic");

    if (sendBtn) {
      sendBtn.addEventListener("click", () => this.handleSendMessage());
    }

    if (this.inputField) {
      this.inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.toggle(false));
    }

    if (voiceBtn) {
      voiceBtn.addEventListener("click", () => {
        this.voice.toggleListen();
      });
    }

    // Añadir mensaje de bienvenida inicial
    this.addMessage("bot", "¡Hola! Soy Cami 🦐, tu asistente virtual en Ciudad del Carmen. ¿Qué te gustaría saber hoy? Puedo contarte sobre el Museo Victoriano Niévares, Playa Norte y Bahamitas, la historia de los piratas o prepararte una ruta personalizada.");

    // Configurar chips sugeridos
    const chips = this.container.querySelectorAll(".quick-suggestion-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const text = chip.dataset.query || chip.textContent.trim();
        if (this.inputField) {
          this.inputField.value = text;
          this.handleSendMessage();
        }
      });
    });
  }

  toggle(forceState = null) {
    if (!this.container) return;
    this.isOpen = forceState !== null ? forceState : !this.isOpen;
    if (this.isOpen) {
      this.container.classList.add("chat-open");
      if (this.inputField) this.inputField.focus();
    } else {
      this.container.classList.remove("chat-open");
    }
  }

  async handleSendMessage() {
    if (!this.inputField) return;
    const text = this.inputField.value.trim();
    if (!text) return;

    this.inputField.value = "";
    this.addMessage("user", text);

    // Indicador de escritura
    const typingId = this.showTypingIndicator();

    try {
      const response = await this.gemma.chatWithCami(text, this.messages);
      this.removeTypingIndicator(typingId);
      this.addMessage("bot", response);

      // Reproducir con voz la respuesta específica para que el usuario la escuche
      this.voice.speak(response);

      // Si el usuario pidió armar ruta
      if (text.toLowerCase().includes("arma") || text.toLowerCase().includes("recorrido") || text.toLowerCase().includes("ruta")) {
        if (this.onRouteRequestedCallback) {
          this.onRouteRequestedCallback(text);
        }
      }
    } catch (err) {
      this.removeTypingIndicator(typingId);
      const fallbackMsg = "Ocurrió un detalle al procesar la respuesta. Pero puedes preguntarme sobre Playa Norte, el Museo Victoriano Niévares o el quiosco del Parque Zaragoza.";
      this.addMessage("bot", fallbackMsg);
      this.voice.speak(fallbackMsg);
    }
  }

  addMessage(sender, text) {
    this.messages.push({ sender, text, timestamp: new Date() });
    if (!this.chatBody) return;

    const msgEl = document.createElement("div");
    msgEl.className = `chat-message-bubble message-${sender}`;

    if (sender === "bot") {
      msgEl.innerHTML = `
        <div class="bot-msg-avatar">
          <img src="assets/cami-logo.jpg" alt="Cami" class="avatar-shrimp-img">
        </div>
        <div class="bot-msg-content">
          <div class="msg-text">${this.formatMessageText(text)}</div>
          <div class="msg-actions">
            <button class="btn-msg-speak" title="Escuchar con voz"><i class="fa-solid fa-volume-high"></i></button>
            <span class="msg-time">${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      `;

      const speakBtn = msgEl.querySelector(".btn-msg-speak");
      if (speakBtn) {
        speakBtn.addEventListener("click", () => {
          this.voice.speak(text);
        });
      }
    } else {
      msgEl.innerHTML = `
        <div class="user-msg-content">
          <div class="msg-text">${this.escapeHtml(text)}</div>
          <span class="msg-time">${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      `;
    }

    this.chatBody.appendChild(msgEl);
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  }

  showTypingIndicator() {
    if (!this.chatBody) return null;
    const id = "typing-" + Date.now();
    const typingEl = document.createElement("div");
    typingEl.id = id;
    typingEl.className = "chat-message-bubble message-bot typing-indicator-bubble";
    typingEl.innerHTML = `
      <div class="bot-msg-avatar">
        <img src="assets/cami-logo.jpg" alt="Cami" class="avatar-shrimp-img">
      </div>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    this.chatBody.appendChild(typingEl);
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
    return id;
  }

  removeTypingIndicator(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  formatMessageText(text) {
    return text.replace(/\n/g, "<br>");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
