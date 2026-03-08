type VoiceCallback = (transcript: string) => void;
type StateCallback = () => void;

const LS_KEY_SPEAKER = "oc-voice-speaker-enabled";
const LS_KEY_BT_DEVICES = "oc-voice-bt-devices";
const LS_KEY_VOICE_MODE = "oc-voice-mode-active";

class VoiceManager {
  private _recognition: SpeechRecognition | null = null;
  private _listening = false;
  private _speakerEnabled = false;
  private _voiceModeActive = false;
  private _btAutoDevices: string[] = [];
  private _onTranscript: VoiceCallback | null = null;
  private _onStateChange: StateCallback | null = null;
  private _supported = false;
  private _synthSupported = false;
  private _useServerSTT = false;
  private _mediaRecorder: MediaRecorder | null = null;
  private _audioChunks: Blob[] = [];
  private _mediaStream: MediaStream | null = null;
  private _sttFailCount = 0;
  private _autoSend = false;
  private _onAutoSend: (() => void) | null = null;

  constructor() {
    this._speakerEnabled = localStorage.getItem(LS_KEY_SPEAKER) === "true";
    this._voiceModeActive = localStorage.getItem(LS_KEY_VOICE_MODE) === "true";
    try {
      this._btAutoDevices = JSON.parse(localStorage.getItem(LS_KEY_BT_DEVICES) || "[]");
    } catch {
      this._btAutoDevices = [];
    }

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const hasNativeSTT = Boolean(SpeechRecognitionCtor);
    this._synthSupported = "speechSynthesis" in window;

    if (hasNativeSTT) {
      this._supported = true;
      this._useServerSTT = false;
      this._recognition = new SpeechRecognitionCtor();
      this._recognition!.continuous = true;
      this._recognition!.interimResults = false;
      this._recognition!.lang = "en-US";

      this._recognition!.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results[event.results.length - 1];
        if (last?.isFinal) {
          const transcript = last[0]?.transcript ?? "";
          if (transcript && this._onTranscript) {
            this._onTranscript(transcript);
          }
        }
      };

      this._recognition!.onend = () => {
        const wasListening = this._listening;
        this._listening = false;
        this._notify();
        if (wasListening && this._voiceModeActive) {
          setTimeout(() => this.startListening(), 300);
        }
      };

      this._recognition!.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== "no-speech" && event.error !== "aborted") {
          console.warn("[voice] Recognition error:", event.error);
        }
        if (event.error === "no-speech" && this._listening && this._voiceModeActive) {
          return;
        }
        this._listening = false;
        this._notify();
      };
    } else if (typeof MediaRecorder !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      this._supported = true;
      this._useServerSTT = true;
    }

    this._initBluetoothDetection();
  }

  get supported(): boolean {
    return this._supported;
  }

  get synthSupported(): boolean {
    return this._synthSupported;
  }

  get listening(): boolean {
    return this._listening;
  }

  get speakerEnabled(): boolean {
    return this._speakerEnabled;
  }

  get voiceModeActive(): boolean {
    return this._voiceModeActive;
  }

  get btAutoDevices(): string[] {
    return [...this._btAutoDevices];
  }

  setOnTranscript(cb: VoiceCallback | null) {
    this._onTranscript = cb;
  }

  setOnStateChange(cb: StateCallback | null) {
    this._onStateChange = cb;
  }

  startListening() {
    if (!this._supported || this._listening) return;
    if (this._useServerSTT) {
      this._startServerSTT();
      return;
    }
    if (!this._recognition) return;
    try {
      this._recognition.start();
      this._listening = true;
      this._notify();
    } catch (e) {
      console.warn("[voice] Could not start recognition:", e);
    }
  }

  stopListening() {
    if (!this._listening) return;
    if (this._useServerSTT) {
      this._stopServerSTT();
      return;
    }
    if (!this._recognition) return;
    try {
      this._recognition.stop();
    } catch {
      // ignore
    }
    this._listening = false;
    this._notify();
  }

  private async _startServerSTT() {
    try {
      this._audioChunks = [];
      this._mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg;codecs=opus";
      this._mediaRecorder = new MediaRecorder(this._mediaStream, { mimeType });
      this._mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this._audioChunks.push(e.data);
      };
      this._mediaRecorder.onstop = () => {
        this._sendAudioToServer();
      };
      this._mediaRecorder.start();
      this._listening = true;
      this._notify();
    } catch (e) {
      console.warn("[voice] Could not start recording:", e);
      this._listening = false;
      this._notify();
    }
  }

  private _stopServerSTT() {
    if (this._mediaRecorder && this._mediaRecorder.state !== "inactive") {
      this._mediaRecorder.stop();
    }
    if (this._mediaStream) {
      this._mediaStream.getTracks().forEach(t => t.stop());
      this._mediaStream = null;
    }
    this._listening = false;
    this._notify();
  }

  private async _sendAudioToServer() {
    if (this._audioChunks.length === 0) return;
    const blob = new Blob(this._audioChunks, { type: this._audioChunks[0].type || "audio/webm" });
    this._audioChunks = [];
    if (blob.size < 1000) return;
    const ext = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "mp4" : "webm";
    const formData = new FormData();
    formData.append("file", blob, `recording.${ext}`);
    try {
      const token = localStorage.getItem("oc-token") ||
        document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith("oc-token="))?.split("=")[1] || "";
      const resp = await fetch("/api/voice/transcribe", {
        method: "POST",
        headers: token ? { "Authorization": "Bearer " + token } : {},
        body: formData,
      });
      const data = await resp.json();
      if (data.ok && data.text && data.text.trim()) {
        this._onTranscript?.(data.text.trim());
        this._sttFailCount = 0;
      } else if (data.error) {
        console.warn("[voice] Server transcription error:", data.error);
        this._sttFailCount++;
      }
    } catch (e) {
      console.warn("[voice] Server transcription failed:", e);
      this._sttFailCount++;
    }
    if (this._voiceModeActive && this._sttFailCount < 5) {
      const delay = Math.min(300 * Math.pow(2, this._sttFailCount), 10000);
      setTimeout(() => this.startListening(), delay);
    } else if (this._sttFailCount >= 5) {
      console.warn("[voice] Too many STT failures, stopping voice mode");
      this.setVoiceMode(false);
    }
  }

  toggleListening() {
    if (this._listening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  toggleSpeaker() {
    this._speakerEnabled = !this._speakerEnabled;
    localStorage.setItem(LS_KEY_SPEAKER, String(this._speakerEnabled));
    if (!this._speakerEnabled) {
      this.stopSpeaking();
    }
    this._notify();
  }

  setSpeaker(enabled: boolean) {
    this._speakerEnabled = enabled;
    localStorage.setItem(LS_KEY_SPEAKER, String(enabled));
    if (!enabled) this.stopSpeaking();
    this._notify();
  }

  speak(text: string) {
    if (!this._synthSupported || !this._speakerEnabled) return;
    this._doSpeak(text);
  }

  speakDirect(text: string) {
    if (!this._synthSupported) return;
    this._doSpeak(text);
  }

  private _doSpeak(text: string) {
    this.stopSpeaking();
    const clean = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#*_~>|]/g, "")
      .replace(/\n+/g, ". ")
      .trim();
    if (!clean) return;
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  }

  get isSpeaking(): boolean {
    return this._synthSupported && speechSynthesis.speaking;
  }

  get autoSend(): boolean {
    return this._autoSend;
  }

  setAutoSend(enabled: boolean) {
    this._autoSend = enabled;
    this._notify();
  }

  setOnAutoSend(cb: (() => void) | null) {
    this._onAutoSend = cb;
  }

  stopSpeaking() {
    if (this._synthSupported && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  }

  setVoiceMode(active: boolean) {
    this._voiceModeActive = active;
    localStorage.setItem(LS_KEY_VOICE_MODE, String(active));
    if (active) {
      this.setSpeaker(true);
      this.startListening();
    } else {
      this.stopListening();
    }
    this._notify();
  }

  toggleVoiceMode() {
    this.setVoiceMode(!this._voiceModeActive);
  }

  addBtDevice(name: string) {
    const trimmed = name.trim();
    if (!trimmed || this._btAutoDevices.includes(trimmed)) return;
    this._btAutoDevices.push(trimmed);
    localStorage.setItem(LS_KEY_BT_DEVICES, JSON.stringify(this._btAutoDevices));
    this._notify();
  }

  removeBtDevice(name: string) {
    this._btAutoDevices = this._btAutoDevices.filter((d) => d !== name);
    localStorage.setItem(LS_KEY_BT_DEVICES, JSON.stringify(this._btAutoDevices));
    this._notify();
  }

  private _notify() {
    this._onStateChange?.();
  }

  private async _initBluetoothDetection() {
    if (!navigator.mediaDevices?.enumerateDevices) return;

    const checkDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter((d) => d.kind === "audiooutput");
        const btConnected = audioOutputs.some((d) => {
          const label = (d.label || "").toLowerCase();
          if (this._btAutoDevices.length > 0) {
            return this._btAutoDevices.some((name) => label.includes(name.toLowerCase()));
          }
          return (
            label.includes("bluetooth") ||
            label.includes("car") ||
            label.includes("handsfree") ||
            label.includes("carplay") ||
            label.includes("android auto")
          );
        });

        if (btConnected && !this._voiceModeActive) {
          this.setVoiceMode(true);
        } else if (!btConnected && this._voiceModeActive && this._btAutoDevices.length > 0) {
          this.setVoiceMode(false);
        }
      } catch {
        // Permission denied or not available
      }
    };

    navigator.mediaDevices.addEventListener("devicechange", checkDevices);
    checkDevices();
  }
}

export const voiceManager = new VoiceManager();
