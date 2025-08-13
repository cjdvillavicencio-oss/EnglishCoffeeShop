import { buildScene, makeSfx, speak } from './game.mjs';
import { initialMask, revealNextLetter, isCorrect, MAX_HINTS, clamp } from './logic.mjs';

const sfx = makeSfx();

const canvas = document.getElementById('scene');
const ui = {
  spanishName: document.getElementById('spanishName'),
  colorEn: document.getElementById('colorEn'),
  ipa: document.getElementById('ipa'),
  definition: document.getElementById('definition'),
  clue: document.getElementById('clue'),
  guess: document.getElementById('guess'),
  hintBtn: document.getElementById('hintBtn'),
  ttsBtn: document.getElementById('ttsBtn'),
  checkBtn: document.getElementById('checkBtn'),
  status: document.getElementById('status'),
};

let current = null;
let masked = '';
let hintCount = 0;

function updateUIFor(v){
  current = v;
  hintCount = 0;
  masked = initialMask(v.en);
  ui.spanishName.textContent = v.es;
  ui.colorEn.textContent = v.color;
  ui.ipa.textContent = v.ipa;
  ui.definition.textContent = v.def;
  ui.clue.textContent = masked;
  ui.hintBtn.disabled = false;
  ui.hintBtn.textContent = `Pista (${hintCount}/${MAX_HINTS})`;
  ui.status.textContent = '';
  ui.guess.value = '';
}

function requestHint(){
  if (!current) return;
  if (hintCount >= MAX_HINTS) return;
  hintCount = clamp(hintCount+1, 0, MAX_HINTS);
  masked = revealNextLetter(masked, current.en);
  ui.clue.textContent = masked;
  ui.hintBtn.textContent = `Pista (${hintCount}/${MAX_HINTS})`;
  sfx.click();
  if (hintCount >= MAX_HINTS) ui.hintBtn.disabled = true;
}

function pronounce(){
  if (!current) return;
  speak(current.en);
}

function check(){
  if (!current) return;
  const g = ui.guess.value;
  if (isCorrect(g, current.en)){
    ui.status.textContent = '✅ ¡Correcto!';
    sfx.ok();
  } else {
    ui.status.textContent = '❌ Inténtalo de nuevo';
    sfx.bad();
  }
}

// Construye la escena; los clics llamarán a window.selectObject
buildScene(canvas);

// Provee el callback global que el motor invoca
window.selectObject = (v)=> updateUIFor(v);

// Conecta UI
ui.hintBtn.addEventListener('click', requestHint);
ui.ttsBtn.addEventListener('click', pronounce);
ui.checkBtn.addEventListener('click', check);

// Selección inicial por defecto
setTimeout(()=>{
  updateUIFor({ id:'cup', es:'taza', en:'cup', color:'white', ipa:'/kʌp/', def:'A small open container used for drinking.' });
}, 300);
