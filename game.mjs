// Escena 3D, raycaster, UI, audio. Sin import.meta; Three desde CDN.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// Expondremos selectObject si existe en window
const notifySelection = (v) => {
  if (typeof window !== 'undefined' && typeof window.selectObject === 'function') {
    window.selectObject(v);
  }
};

// Helpers visibles por defecto (puedes ocultarlos luego en consola: window.__showHelpers=false)
window.__showHelpers = true;

export function buildScene(canvas){
  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Escena + cámara
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1216);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(2.5, 1.8, 3.5);
  scene.add(camera);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1.0, 0);

  // 💡 Iluminación: fuerte y clara para evitar “pantalla negra”
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);      // clave: luz ambiental
  const hemi    = new THREE.HemisphereLight(0xffffff, 0x223344, 0.8);
  const dir     = new THREE.DirectionalLight(0xffffff, 1.4);
  dir.position.set(3, 6, 3);
  scene.add(ambient, hemi, dir);

  // Suelo + pared de fondo
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 6),
    new THREE.MeshStandardMaterial({ color: 0x171a1f, roughness: 0.85 })
  );
  backWall.position.set(0, 3, -5);
  scene.add(backWall);

  // ✅ Cubo de prueba (si lo ves, la escena está ok)
  const testCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x66ccff, metalness: 0.1, roughness: 0.3, emissive: 0x113355, emissiveIntensity: 0.4 })
  );
  testCube.position.set(0, 1.0, -1.2);
  scene.add(testCube);

  // Objetos clicables (taza, croissant, mesa)
  const objects = [];
  const addClickable = (mesh, data) => {
    mesh.userData.vocab = data;
    mesh.castShadow = true;
    scene.add(mesh);
    objects.push(mesh);
  };

  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.45, 0.6, 32, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.05, roughness: 0.4 })
  );
  cup.position.set(-0.8, 1.0, -1.0);
  addClickable(cup, { id:'cup', es:'taza', en:'cup', color:'white', ipa:'/kʌp/', def:'A small open container used for drinking.' });

  const croissant = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.18, 12, 32, Math.PI * 1.3),
    new THREE.MeshStandardMaterial({ color: 0xc48a3a, roughness: 0.6 })
  );
  croissant.rotation.set(Math.PI/2, 0, Math.PI/8);
  croissant.position.set(0.6, 0.95, -1.2);
  addClickable(croissant, { id:'croissant', es:'croissant', en:'croissant', color:'brown', ipa:'/krwɑːˈsɒ̃/', def:'A flaky, crescent-shaped pastry of French origin.' });

  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.08, 36),
    new THREE.MeshStandardMaterial({ color: 0x3b3b40, roughness: 0.8 })
  );
  table.position.set(0, 0.96, -1.2);
  addClickable(table, { id:'table', es:'mesa', en:'table', color:'gray', ipa:'/ˈteɪbəl/', def:'A piece of furniture with a flat top and one or more legs.' });

  // Helpers (grid + ejes) para confirmar orientación/escala
  const grid = new THREE.GridHelper(10, 20, 0x555555, 0x333333);
  grid.position.y = 0.001;
  const axes = new THREE.AxesHelper(1.2);
  axes.position.set(0, 0.01, 0);
  const updateHelpers = () => {
    const show = Boolean(window.__showHelpers);
    grid.visible = axes.visible = show;
  };
  scene.add(grid, axes);
  updateHelpers();

  // Raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  function onClick(ev){
    mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(objects, false)[0];
    if (hit) notifySelection(hit.object.userData.vocab);
  }
  renderer.domElement.addEventListener('pointerdown', onClick);

  // Resize
  function onResize(){
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  // Animación
  let t = 0;
  function animate(){
    t += 0.01;
    testCube.rotation.y += 0.01; // para confirmar que “vive”
    controls.update();
    updateHelpers();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
