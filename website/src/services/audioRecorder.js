// Audio Recording and Waveform Visualizer Service
// Matches Groq Whisper large-v3-turbo pipeline from n8n workflow

export class AudioRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.audioContext = null;
    this.analyser = null;
    this.audioChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.startTime = 0;
    this.timerInterval = null;
    this.animationFrameId = null;
    this.simulated = false;
  }

  async startRecording(canvasElement, onTick) {
    this.audioChunks = [];
    this.isRecording = true;
    this.startTime = Date.now();

    if (onTick) {
      this.timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
        const secs = String(elapsedSeconds % 60).padStart(2, '0');
        onTick(`${mins}:${secs}`, elapsedSeconds);
      }, 500);
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        let preferredMime = 'audio/webm';
        if (typeof MediaRecorder.isTypeSupported === 'function') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            preferredMime = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
            preferredMime = 'audio/ogg;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            preferredMime = 'audio/mp4';
          }
        }
        this.recordingMimeType = preferredMime;

        this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: preferredMime });
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.start(200);
        this.simulated = false;
        this.drawWaveform(canvasElement);
        return { success: true, simulated: false };
      }
    } catch (err) {
      console.warn('Microphone permission denied or unavailable, running simulated audio visualizer:', err);
    }

    // Fallback: Simulated Waveform Visualizer for testing
    this.simulated = true;
    this.drawSimulatedWaveform(canvasElement);
    return { success: true, simulated: true };
  }

  stopRecording() {
    this.isRecording = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    return new Promise((resolve) => {
      const duration = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const mime = this.recordingMimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mime });
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
          }
          if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
          }
          resolve({
            blob: audioBlob,
            duration: duration || 5,
            simulated: false,
            mimeType: mime
          });
        };
        this.mediaRecorder.stop();
      } else {
        // Playable fallback WAV blob if microphone was blocked
        const fallbackWav = createFallbackWavBlob(duration || 4);
        resolve({
          blob: fallbackWav,
          duration: duration || 4,
          simulated: true,
          mimeType: 'audio/wav'
        });
      }
    });
  }

  drawWaveform(canvas) {
    if (!canvas || !this.analyser) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!this.isRecording) {
        this.drawIdleWaveform(canvas);
        return;
      }
      this.animationFrameId = requestAnimationFrame(render);
      this.analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height * 0.85);
        const y = (canvas.height - barHeight) / 2;

        ctx.fillStyle = `rgba(153, 77, 85, ${Math.max(0.3, dataArray[i] / 255)})`;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, Math.max(2, barWidth - 1), Math.max(4, barHeight), 2) : ctx.fillRect(x, y, barWidth - 1, barHeight);
        ctx.fill();

        x += barWidth;
        if (x > canvas.width) break;
      }
    };
    render();
  }

  drawSimulatedWaveform(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const render = () => {
      if (!this.isRecording) {
        this.drawIdleWaveform(canvas);
        return;
      }
      this.animationFrameId = requestAnimationFrame(render);
      phase += 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const totalBars = 48;
      const barWidth = canvas.width / totalBars;

      for (let i = 0; i < totalBars; i++) {
        const wave = Math.sin(i * 0.3 + phase) * Math.cos(i * 0.15 - phase * 0.5);
        const barHeight = Math.max(6, Math.abs(wave) * (canvas.height * 0.75));
        const y = (canvas.height - barHeight) / 2;
        const x = i * barWidth;

        ctx.fillStyle = `rgba(153, 77, 85, ${0.35 + Math.abs(wave) * 0.65})`;
        ctx.fillRect(x + 2, y, barWidth - 3, barHeight);
      }
    };
    render();
  }

  drawIdleWaveform(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fafbfd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const totalBars = 48;
    const barWidth = canvas.width / totalBars;
    const centerY = canvas.height / 2;

    for (let i = 0; i < totalBars; i++) {
      const barHeight = 4;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(i * barWidth + 2, centerY - 2, barWidth - 3, barHeight);
    }
  }
}

export const audioRecorder = new AudioRecorderService();

function createFallbackWavBlob(durationSeconds = 2) {
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  // fmt subchunk
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  // data subchunk
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Generate subtle pleasant tone (440 Hz)
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin((i / sampleRate) * 440 * 2 * Math.PI) * 0.15;
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
