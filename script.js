import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';

const container = document.querySelector('#room-view');
const wallSwatches = [...document.querySelectorAll('.swatch')];
const floorChoices = [...document.querySelectorAll('.choice')];
const slider = document.querySelector('#light-slider');
const lightValue = document.querySelector('#light-value');
const resetButton = document.querySelector('#reset-room');

let renderer, scene, camera, controls, wallMaterial, floorMaterial, ambientLight, keyLight;
const initial = { wall: '#d9d2c6', floor: '#8b6448', light: 0.75 };

function createRoom() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#252f36');
  scene.fog = new THREE.Fog('#252f36', 8, 18);

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(5.8, 4.5, 7.2);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1.35, 0);
  controls.minDistance = 4;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI * 0.49;

  ambientLight = new THREE.HemisphereLight('#fff4df', '#5d6a70', 1.2);
  scene.add(ambientLight);
  keyLight = new THREE.DirectionalLight('#ffdfac', 2.5);
  keyLight.position.set(-3, 7, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight('#c5d9ff', 12, 12);
  fillLight.position.set(3, 3.2, -2.5);
  scene.add(fillLight);

  wallMaterial = new THREE.MeshStandardMaterial({ color: initial.wall, roughness: 0.88 });
  floorMaterial = new THREE.MeshStandardMaterial({ color: initial.floor, roughness: 0.72 });

  // Floor and three walls leave the front open for easy viewing.
  addBox(0, -0.12, 0, 6, 0.24, 6, floorMaterial, true);
  addBox(0, 1.55, -2.88, 6, 3.1, 0.22, wallMaterial);
  addBox(-2.88, 1.55, 0, 0.22, 3.1, 6, wallMaterial);
  addBox(2.88, 1.55, 0, 0.22, 3.1, 6, wallMaterial);

  // Back-wall feature panels.
  const panelMat = new THREE.MeshStandardMaterial({ color: '#b6a58b', roughness: 0.95 });
  addBox(-1.35, 1.65, -2.73, 1.15, 2.35, 0.04, panelMat);
  const darkFrame = new THREE.MeshStandardMaterial({ color: '#263238', roughness: 0.65 });
  addBox(0.45, 1.6, -2.70, 1.65, 2.25, 0.08, darkFrame);
  const windowMat = new THREE.MeshStandardMaterial({ color: '#8fa7aa', roughness: 0.2, metalness: 0.1, emissive: '#314247', emissiveIntensity: 0.25 });
  addBox(0.45, 1.6, -2.64, 1.45, 2.05, 0.025, windowMat);
  const mullionMat = new THREE.MeshStandardMaterial({ color: '#d0c4af', roughness: 0.5 });
  addBox(0.45, 1.6, -2.61, 0.045, 2.05, 0.025, mullionMat);
  addBox(0.45, 1.6, -2.60, 1.45, 0.045, 0.025, mullionMat);

  // Minimal furniture: sofa, seat cushions, side table, plant and rug.
  const sofaMat = new THREE.MeshStandardMaterial({ color: '#b8b0a2', roughness: 0.98 });
  const cushionMat = new THREE.MeshStandardMaterial({ color: '#e2d9c9', roughness: 1 });
  addBox(0.2, 0.48, 0.45, 2.45, 0.52, 0.88, sofaMat, true);
  addBox(0.2, 0.86, 0.02, 2.45, 0.42, 0.22, sofaMat);
  addBox(-0.94, 0.79, 0.40, 0.22, 0.78, 0.9, sofaMat);
  addBox(1.34, 0.79, 0.40, 0.22, 0.78, 0.9, sofaMat);
  addBox(-0.43, 0.76, 0.39, 0.66, 0.13, 0.55, cushionMat);
  addBox(0.42, 0.76, 0.39, 0.66, 0.13, 0.55, cushionMat);
  const rugMat = new THREE.MeshStandardMaterial({ color: '#d5c9b3', roughness: 1 });
  addBox(0.1, 0.015, 1.25, 3.8, 0.03, 2.05, rugMat);
  const tableMat = new THREE.MeshStandardMaterial({ color: '#5e4b3b', roughness: 0.42 });
  addCylinder(0.05, 0.48, 0.45, 0.48, 0.42, tableMat);
  addCylinder(0.05, 0.07, 0.45, 0.48, 0.42, tableMat);
  const tableLegMat = new THREE.MeshStandardMaterial({ color: '#282d2f', metalness: 0.35, roughness: 0.5 });
  addCylinder(0.035, 0.42, 0.45, 0.23, 0.42, tableLegMat);

  const plantPot = new THREE.MeshStandardMaterial({ color: '#b8a38a', roughness: 0.9 });
  addCylinder(0.17, 0.28, -2.05, 0.14, 1.35, plantPot);
  const stemMat = new THREE.MeshStandardMaterial({ color: '#536b54', roughness: 0.9 });
  addCylinder(0.035, 1.0, -2.05, 0.72, 1.35, stemMat);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), stemMat);
    leaf.position.set(-2.05 + Math.sin(i * 1.1) * 0.23, 0.78 + i * 0.12, 1.35 + Math.cos(i * 1.1) * 0.18);
    leaf.scale.set(0.65, 1.5, 0.7);
    leaf.rotation.z = (i % 2 ? -1 : 1) * 0.55;
    scene.add(leaf);
  }

  const grid = new THREE.GridHelper(6, 12, '#a3a9a7', '#77817f');
  grid.position.y = 0.006;
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  scene.add(grid);

  resize();
  window.addEventListener('resize', resize);
  animate();
}

function addBox(x, y, z, w, h, d, material, castShadow = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
function addCylinder(radiusTop, radiusBottom, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, 0.08, 24), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  scene.add(mesh);
  return mesh;
}
function resize() {
  if (!renderer || !camera) return;
  const width = container.clientWidth || 1;
  const height = container.clientHeight || 1;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
function setWall(color) {
  wallMaterial.color.set(color);
  wallSwatches.forEach(button => button.classList.toggle('active', button.dataset.color === color));
}
function setFloor(color) {
  floorMaterial.color.set(color);
  floorChoices.forEach(button => button.classList.toggle('active', button.dataset.color === color));
}
function setLight(value) {
  const normalized = Number(value) / 100;
  ambientLight.intensity = 0.35 + normalized * 1.2;
  keyLight.intensity = 0.7 + normalized * 2.4;
  renderer.toneMappingExposure = 0.75 + normalized * 0.55;
  lightValue.textContent = `${value}%`;
}
wallSwatches.forEach(button => button.addEventListener('click', () => setWall(button.dataset.color)));
floorChoices.forEach(button => button.addEventListener('click', () => setFloor(button.dataset.color)));
slider.addEventListener('input', event => setLight(event.target.value));
resetButton.addEventListener('click', () => {
  setWall(initial.wall);
  setFloor(initial.floor);
  slider.value = initial.light * 100;
  setLight(slider.value);
  controls.reset();
});
document.querySelector('#year').textContent = new Date().getFullYear();

createRoom();
setLight(slider.value);
