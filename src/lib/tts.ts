/** Web Speech API TTS – giọng đọc tiếng Việt với hàng đợi chống ngắt câu. */

const queue: SpeechSynthesisUtterance[] = [];
let speaking = false;
const MAX_QUEUE = 6;

function pumpQueue() {
  if (typeof window === 'undefined' || !window.speechSynthesis || speaking) return;
  const next = queue.shift();
  if (!next) return;
  speaking = true;
  next.onend = () => {
    speaking = false;
    pumpQueue();
  };
  next.onerror = () => {
    speaking = false;
    pumpQueue();
  };
  window.speechSynthesis.speak(next);
}

export function speak(text: string, lang = 'vi-VN', volume = 1) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) return;
  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = Math.max(0, Math.min(1, volume));
  const voices = window.speechSynthesis.getVoices();
  const vietnameseVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('vi'));
  if (vietnameseVoice) utterance.voice = vietnameseVoice;

  // Giữ tối đa 6 câu chờ để không tạo hàng đợi kéo dài khi LIVE đông.
  if (queue.length >= MAX_QUEUE) queue.shift();
  queue.push(utterance);
  pumpQueue();
}

export function stopSpeak() {
  queue.length = 0;
  speaking = false;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
