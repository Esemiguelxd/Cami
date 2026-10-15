/**
 * Cami - Asistente de Voz y Audio-Guía Turística de Ciudad del Carmen
 * Soporta síntesis de voz (Web Speech API), reconocimiento de voz por micrófono,
 * narración paso a paso de lugares turísticos y subtítulos en vivo.
 */

export class VoiceAssistant {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.recognition = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.isListening = false;
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.currentUtterance = null;
    this.onStateChangeCallbacks = [];
    this.onSubtitlesCallbacks = [];
    this.onVoiceCommandCallbacks = [];

    this.initSpeechSynthesis();
    this.initSpeechRecognition();
  }

  onStateChange(cb) {
    this.onStateChangeCallbacks.push(cb);
  }

  onSubtitle(cb) {
    this.onSubtitlesCallbacks.push(cb);
  }

  onVoiceCommand(cb) {
    this.onVoiceCommandCallbacks.push(cb);
  }

  notifyState() {
    this.onStateChangeCallbacks.forEach(cb => cb({
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      isListening: this.isListening
    }));
  }

  initSpeechSynthesis() {
    if (!this.synth) {
      console.warn("SpeechSynthesis no soportado en este navegador.");
      return;
    }

    // Cargar voces disponibles y priorizar voces en español de México / Latinoamérica
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // Buscar voz mexicana primero
      const mxVoice = voices.find(v => v.lang === "es-MX" || v.lang === "es_MX");
      const esVoice = voices.find(v => v.lang.startsWith("es"));
      this.selectedVoice = mxVoice || esVoice || voices[0] || null;
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition no soportado en este navegador.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = "es-MX";
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyState();
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        this.notifyState();
        this.onVoiceCommandCallbacks.forEach(cb => cb(transcript));
      };

      this.recognition.onerror = (err) => {
        console.warn("Error de reconocimiento de voz:", err);
        this.isListening = false;
        this.notifyState();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notifyState();
      };
    } catch (e) {
      console.warn("No se pudo iniciar SpeechRecognition:", e);
    }
  }

  speak(text, onEndCallback = null) {
    if (!this.synth) return;

    // Detener cualquier locución previa
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = "es-MX";
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyState();
      this.onSubtitlesCallbacks.forEach(cb => cb(text));
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.notifyState();
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (err) => {
      console.warn("Error en síntesis:", err);
      this.isSpeaking = false;
      this.isPaused = false;
      this.notifyState();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  narratePoi(poi, onEnd = null) {
    const intro = `Llegamos a ${poi.name}. ${poi.subtitle}. `;
    const fullNarration = intro + poi.narrativeVoice + ` Consejo de Cami: ${poi.healthTip}`;
    this.speak(fullNarration, onEnd);
  }

  pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
      this.isPaused = true;
      this.notifyState();
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notifyState();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.notifyState();
      this.onSubtitlesCallbacks.forEach(cb => cb(""));
    }
  }

  toggleListen() {
    if (!this.recognition) {
      alert("El reconocimiento por voz no es compatible con este navegador. Puedes usar el teclado para escribirle a Cami.");
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.notifyState();
    } else {
      this.stop(); // silenciar voz de Cami mientras escucha
      try {
        this.recognition.start();
      } catch (e) {
        console.warn("Error al iniciar reconocimiento:", e);
      }
    }
  }
}
