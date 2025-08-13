// Lógica pura (testeable) para pistas y validación
export function initialMask(answer) {
  if (!answer || typeof answer !== 'string') return '';
  const a = answer.trim().toLowerCase();
  if (!a.length) return '';
  return a[0] + ' ' + Array.from(a.slice(1)).map(()=>'_').join(' ');
}

export function revealNextLetter(masked, answer) {
  const cleanMasked = masked.replace(/\s+/g, '');
  const a = answer.trim().toLowerCase();
  const arr = cleanMasked.split('');
  for (let i=0;i<arr.length;i++){
    if (arr[i] === '_' && a[i]) { arr[i] = a[i]; break; }
  }
  return arr.join(' ').trim();
}

export function normalize(s){ return (s||'').trim().toLowerCase(); }
export function isCorrect(guess, answer) { return normalize(guess) === normalize(answer); }
export function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
export const MAX_HINTS = 5;
