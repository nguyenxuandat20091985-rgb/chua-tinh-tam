/** Web Speech API TTS – giọng đọc tiếng Việt */

export function speak(text: string, lang = 'vi-VN', volume = 1) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  u.pitch = 1;
  u.volume = Math.max(0, Math.min(1, volume));
  // Prefer Vietnamese voice if available
  const voices = window.speechSynthesis.getVoices();
  const vi = voices.find((v) => v.lang.startsWith('vi'));
  if (vi) u.voice = vi;
  window.speechSynthesis.speak(u);
}

export function stopSpeak() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
