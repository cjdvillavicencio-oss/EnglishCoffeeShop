// Escena 3D, raycaster, UI, audio. Sin import.meta; Three desde CDN.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { initialMask, revealNextLetter, isCorrect, MAX_HINTS, clamp } from './logic.mjs';

export function makeSfx() {
  let ctx;
  const ensureCtx = ()=> ctx ||= new (window.AudioContext || window.webkitAudioContext)();
  const ping = (freq=880, time=0.12)=>{
    const ac = ensureCtx();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g).connect(ac.destination);
    o.type='sine'; o.frequency.setValueAtTime(freq, ac.currentTime);
    g.gain.setValueAtTime(.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.25, ac.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + time);
    o.start(); o.stop(ac.currentTime + time);
  };
  return { click: ()=> ping(600, .07), ok: ()=> ping(1000, .18), bad: ()=> ping(200, .20) };
}

export function speak(text, lang='en-US') {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function buildScene(canvas){
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b0c);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, .1, 200);
  camera.position.set(0, 1.6, 3);
  scene.add(camera);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0,1,0);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 1.0);
  const dir = new THREE.DirectionalLight(0xffffff, 1.5);
  dir.position.set(5,10,5);
  scene.add(hemi, dir);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshStandardMaterial({ color: 0x2a2a2d, roughness:.9, metalness:.0 }));
  floor.rotation.x = -Math.PI/2;
  floor.receiveShadow = true;
  scene.add(floor);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20,6), new THREE.MeshStandardMaterial({ color: 0x1c1c20, roughness:.8 }));
  backWall.position.set(0,3,-5);
  scene.add(backWall);

  const objects = [];

  function addClickable(mesh, data){
    mesh.userData.vocab = data;
    mesh.castShadow = true;
    scene.add(mesh);
    objects.push(mesh);
  }

  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4,0.45,0.6,32,1,true),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness:.05, roughness:.4 })
  );
  cup.position.set(-0.8, 1.0, -1.0);
  addClickable(cup, { id:'cup', es:'taza', en:'cup', color:'white', ipa:'/kʌp/', def:'A small open container used for drinking.' });

  const croissant = new THREE.Mesh(
    new THREE.TorusGeometry(0.45,0.18,12,32,Math.PI*1.3),
    new THREE.MeshStandardMaterial({ color: 0xc48a3a, roughness:.6 })
  );
  croissant.rotation.set(Math.PI/2, 0, Math.PI/8);
  croissant.position.set(0.6, 0.95, -1.2);
  addClickable(croissant, { id:'croissant', es:'croissant', en:'croissant', color:'brown', ipa:'/krwɑːˈsɒ̃/', def:'A flaky, crescent-shaped pastry of French origin.' });

  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2,1.2,0.08,36),
    new THREE.MeshStandardMaterial({ color: 0x3b3b40, roughness:.8 })
  );
  table.position.set(0,0.96,-1.2);
  addClickable(table, { id:'table', es:'mesa', en:'table', color:'gray', ipa:'/ˈteɪbəl/', def:'A piece of furniture with a flat top and one or more legs.' });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onResize(){
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w,h);
    camera.aspect = w/h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  // Define selectObject to reenviar al manejador global si existe
  const selectObject = (v) => {
    if (typeof window !== 'undefined' && typeof window.selectObject === 'function') {
      window.selectObject(v);
    }
  };

  function onClick(ev){
    mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(objects, false)[0];
    if (hit) { selectObject(hit.object.userData.vocab); }
  }
  renderer.domElement.addEventListener('pointerdown', onClick);

  function animate(){
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return { };
}
