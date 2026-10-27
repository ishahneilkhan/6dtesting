import * as THREE from 'three';

const canvas = document.querySelector('#sceneCanvas');
const viewer = document.querySelector('#viewer');
const loading = document.querySelector('#loading');
const centerMessage = document.querySelector('#centerMessage');
const sceneLabel = document.querySelector('#sceneLabel');
const positionText = document.querySelector('#positionText');
const toast = document.querySelector('#toast');
const wallColorInput = document.querySelector('#wallColor');
const floorSelect = document.querySelector('#floorMaterial');
const lightRange = document.querySelector('#lightRange');
const lightOutput = document.querySelector('#lightOutput');

let renderer, scene, camera, clock;
let interiorGroup, exteriorGroup, wallMaterials = [], floorMaterial;
let ambientLight, keyLight, fillLight, sunLight;
let currentEnvironment = 'interior', timeMode = 'day';
let yaw = 0, pitch = 0, isDragging = false, pointerLocked = false;
let lastX = 0, lastY = 0, dragMoved = false;
const keys = new Set();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const interactables = [];
const defaultPosition = new THREE.Vector3(0, 1.65, 4.25);

function material(color, roughness=0.8, metalness=0){ return new THREE.MeshStandardMaterial({color, roughness, metalness}); }
function box(parent, name, size, pos, mat, opts={}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
  mesh.name = name; mesh.position.set(...pos); mesh.castShadow = opts.castShadow !== false; mesh.receiveShadow = opts.receiveShadow !== false;
  parent.add(mesh); if(opts.interactive) interactables.push(mesh); return mesh;
}
function addTexturedPlane(parent, size, pos, mat, rotation=null) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...size), mat); mesh.position.set(...pos); if(rotation) mesh.rotation.set(...rotation); mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function makeWindow(parent, x, y, z, width=1.7, height=1.45, rotationY=0) {
  const frame=material('#3c3933',0.45), glass=new THREE.MeshPhysicalMaterial({color:'#9eb6bd',roughness:.12,metalness:.12,transparent:true,opacity:.58});
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rotationY; parent.add(g);
  box(g,'window-frame',[width+.12,.08,.12],[0,height/2,0],frame); box(g,'window-frame',[width+.12,.08,.12],[0,-height/2,0],frame);
  box(g,'window-frame',[.08,height,.12],[-width/2,0,0],frame); box(g,'window-frame',[.08,height,.12],[width/2,0,0],frame);
  box(g,'window-glass',[width,height,.035],[0,0,-.035],glass,{castShadow:false}); box(g,'window-mullion',[.035,height,.05],[0,0,.025],frame);
  return g;
}
function buildInterior(){
  interiorGroup=new THREE.Group(); scene.add(interiorGroup);
  const wallMat=material(wallColorInput.value,.92); wallMaterials.push(wallMat);
  floorMaterial=material('#a9825d',.72);
  box(interiorGroup,'floor',[10,.18,10],[0,-.12,0],floorMaterial);
  // Walls are deliberately segmented to leave a large front opening for easy entry.
  box(interiorGroup,'back-wall',[10,3.6,.18],[0,1.68,-5],wallMat);
  box(interiorGroup,'left-wall',[.18,3.6,10],[-5,1.68,0],wallMat);
  box(interiorGroup,'right-wall',[.18,3.6,10],[5,1.68,0],wallMat);
  box(interiorGroup,'front-left-wall',[3.1,3.6,.18],[-3.45,1.68,5],wallMat);
  box(interiorGroup,'front-right-wall',[3.1,3.6,.18],[3.45,1.68,5],wallMat);
  box(interiorGroup,'front-header',[3.8,.45,.18],[0,3.25,5],wallMat);
  // Ceiling beams make the room feel architectural while leaving it open to the viewer.
  const beamMat=material('#b5a58e',.78); for(let x=-4;x<=4;x+=2) box(interiorGroup,'ceiling-beam',[.08,.12,9.6],[x,3.45,0],beamMat);
  makeWindow(interiorGroup,-2.2,2,-4.87,2.1,1.4); makeWindow(interiorGroup,2.1,2,-4.87,2.1,1.4);
  // Sofa: base, back and cushions.
  const sofaBase=material('#77786f',.95), cushion=material('#aaa99f',.98), dark=material('#4e514d',.9);
  box(interiorGroup,'sofa-base',[2.9,.42,1.05],[-1.55,.28,-1.55],sofaBase);
  box(interiorGroup,'sofa-back',[2.9,.92,.28],[-1.55,.78,-2.0],dark);
  for(let i=0;i<3;i++) box(interiorGroup,'sofa-cushion',[.88,.16,.78],[-2.48+i*.93,.56,-1.55],cushion);
  box(interiorGroup,'sofa-arm',[.22,.55,1.02],[-3.02,.52,-1.55],sofaBase); box(interiorGroup,'sofa-arm',[.22,.55,1.02],[-.08,.52,-1.55],sofaBase);
  // Coffee table and decor.
  const wood=material('#76583f',.48), black=material('#25282a',.42), ceramic=material('#d0c4b0',.45);
  box(interiorGroup,'coffee-table-top',[1.8,.12,.9],[-1.55,.72,.0],wood);
  for(const x of [-2.28,-.82]) for(const z of [-.3,.3]) box(interiorGroup,'table-leg',[.07,.65,.07],[x,.35,z],black);
  const vase=new THREE.Mesh(new THREE.CylinderGeometry(.13,.19,.35,20),ceramic); vase.position.set(-1.8,.95,.0); vase.castShadow=true; interiorGroup.add(vase);
  box(interiorGroup,'rug',[3.8,.025,2.7],[.25,.015,.2],material('#b5a48d',1));
  // Dining area on right.
  box(interiorGroup,'dining-top',[1.7,.12,1.25],[2.55,.95,-1.55],wood);
  for(const x of [1.9,3.2]) for(const z of [-1.95,-1.15]) box(interiorGroup,'dining-leg',[.07,.9,.07],[x,.45,z],black);
  for(const x of [2.15,3.0]) { box(interiorGroup,'chair-seat',[.48,.1,.48],[x,.55,-.45],dark); box(interiorGroup,'chair-back',[.48,.65,.08],[x,.86,-.22],dark); }
  // Pendant lights and interactive switch/lamp.
  const pendantMat=material('#c6a875',.28,.35);
  for(const x of [-1.7,2.55]){
    box(interiorGroup,'pendant-cord',[.025,.65,.025],[x,2.95,-.2],black,{castShadow:false});
    const shade=new THREE.Mesh(new THREE.ConeGeometry(.28,.22,24,1,true),pendantMat); shade.position.set(x,2.58,-.2); shade.rotation.x=Math.PI; interiorGroup.add(shade);
    const bulb=new THREE.PointLight('#ffdfad',45,7,2); bulb.position.set(x,2.45,-.2); bulb.castShadow=true; interiorGroup.add(bulb); bulb.userData.baseIntensity=45; bulb.userData.kind='pendant'; interactables.push(shade);
  }
  // Wall art and plant.
  box(interiorGroup,'art-frame',[1.15,1.25,.08],[0,2.15,-4.86],black);
  box(interiorGroup,'art-canvas',[.98,1.08,.035],[0,2.15,-4.8],material('#c1ad8d',.9));
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.23,.18,.38,20),material('#8b7968')); pot.position.set(3.95,.18,-2.9); pot.castShadow=true; interiorGroup.add(pot);
  const stemMat=material('#536b50',.9); for(let i=0;i<7;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.13,.85,8),stemMat);leaf.position.set(3.95+Math.sin(i*2.2)*.28,.75+i*.03,-2.9+Math.cos(i*2.2)*.22);leaf.rotation.z=Math.sin(i*2.2)*.45;leaf.castShadow=true;interiorGroup.add(leaf)}
  // A small interaction panel / wall switch.
  const switchPlate=box(interiorGroup,'light-switch',[.18,.28,.045],[4.86,1.3,1.2],black,{interactive:true}); switchPlate.userData.action='lights';
  box(interiorGroup,'light-switch-button',[.08,.12,.025],[4.83,1.3,1.17],pendantMat,{interactive:true}).userData.action='lights';
}
function buildExterior(){
  exteriorGroup=new THREE.Group(); scene.add(exteriorGroup);
  const ground=material('#687466',1), plaster=material('#d5c8b4',.86), trim=material('#514b43',.48), glass=new THREE.MeshPhysicalMaterial({color:'#7d9aa5',roughness:.15,metalness:.15,transparent:true,opacity:.68});
  box(exteriorGroup,'landscape-ground',[40,.25,40],[0,-.25,0],ground);
  // Two-storey modern residence shell.
  box(exteriorGroup,'house-main',[8,5.2,5.2],[0,2.6,0],plaster);
  box(exteriorGroup,'upper-volume',[5.6,2.2,4.3],[.65,6.25,-.1],material('#a99b88',.82));
  // Flat roof overhangs.
  box(exteriorGroup,'roof-slab',[8.7,.22,5.8],[0,5.25,0],trim); box(exteriorGroup,'upper-roof',[6.1,.18,4.8],[.65,7.42,-.1],trim);
  // Front facade window panels.
  box(exteriorGroup,'front-window-left',[2.2,2.0,.07],[-2.25,2.7,2.64],glass,{castShadow:false});
  box(exteriorGroup,'front-window-right',[2.2,2.0,.07],[2.1,2.7,2.64],glass,{castShadow:false});
  box(exteriorGroup,'upper-window',[3.2,1.05,.07],[.65,6.2,2.08],glass,{castShadow:false});
  // Dark vertical frames.
  for(const x of [-3.4,-1.1,1.0,3.2]) box(exteriorGroup,'facade-frame',[.07,2.05,.12],[x,2.7,2.7],trim);
  box(exteriorGroup,'entry-door',[1.15,2.4,.13],[0,1.2,2.68],material('#624b38',.6),{interactive:true}).userData.action='door';
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.055,12,12),material('#d6b979',.28,.65));knob.position.set(.38,1.2,2.77);exteriorGroup.add(knob);
  // Steps, path, planters and simplified trees.
  box(exteriorGroup,'entry-step',[2.0,.18,.65],[0,.0,3.1],material('#c1b9ab',.9)); box(exteriorGroup,'path',[2.0,.04,5.5],[0,-.1,5.9],material('#b8b2a6',.95));
  const planterMat=material('#444943',.8), leafMat=material('#435e43',.9);
  for(const x of [-5.5,5.5]){
    box(exteriorGroup,'planter',[1.2,.65,1.2],[x,.2,1.8],planterMat);
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.17,1.5,8),material('#665343'));trunk.position.set(x,1.2,1.8);trunk.castShadow=true;exteriorGroup.add(trunk);
    for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.75-i*.09,1),leafMat);crown.position.set(x+(i-1)*.3,2.05+i*.42,1.8);crown.castShadow=true;exteriorGroup.add(crown)}
  }
  // Boundary garden strips.
  for(let i=0;i<12;i++){const shrub=new THREE.Mesh(new THREE.IcosahedronGeometry(.28,1),leafMat);shrub.position.set(-5.2+i*.95,.12,-3.7);shrub.scale.set(1,.8,1);shrub.castShadow=true;exteriorGroup.add(shrub)}
  // Outdoor warm wall lights.
  for(const x of [-3.7,3.7]){const lamp=box(exteriorGroup,'facade-lamp',[.18,.32,.12],[x,3.5,2.7],material('#f3d5a0',.3),{interactive:true});lamp.userData.action='lights';const pl=new THREE.PointLight('#ffd6a0',30,5,2);pl.position.set(x,3.4,3.0);exteriorGroup.add(pl);pl.userData.baseIntensity=30;pl.userData.kind='exterior';}
}
function init(){
  scene=new THREE.Scene();scene.background=new THREE.Color('#b7c6cc');scene.fog=new THREE.Fog('#b7c6cc',22,65);
  camera=new THREE.PerspectiveCamera(68,1,.1,150);camera.position.copy(defaultPosition);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  ambientLight=new THREE.HemisphereLight('#e5e9ed','#786b5c',1.25);scene.add(ambientLight);
  keyLight=new THREE.DirectionalLight('#fff0d5',2.3);keyLight.position.set(-5,10,6);keyLight.castShadow=true;keyLight.shadow.mapSize.set(1024,1024);keyLight.shadow.camera.left=-15;keyLight.shadow.camera.right=15;keyLight.shadow.camera.top=15;keyLight.shadow.camera.bottom=-15;scene.add(keyLight);
  fillLight=new THREE.PointLight('#f0c990',24,18,2);fillLight.position.set(0,3,0);scene.add(fillLight);
  sunLight=new THREE.DirectionalLight('#fff0d9',2.2);sunLight.position.set(-8,12,5);sunLight.castShadow=true;scene.add(sunLight);
  buildInterior();buildExterior();clock=new THREE.Clock();resize();
  interiorGroup.visible=true;exteriorGroup.visible=false;loading.style.display='none';centerMessage.style.display='flex';
  viewer.addEventListener('pointerdown',onPointerDown);window.addEventListener('pointermove',onPointerMove);window.addEventListener('pointerup',onPointerUp);
  window.addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){keys.add(e.code);if(pointerLocked)e.preventDefault()}if(e.code==='Escape'){pointerLocked=false;centerMessage.style.display='flex'}});
  window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('resize',resize);
  document.querySelector('#startWalk').addEventListener('click',()=>{centerMessage.style.display='none';showToast('Click-drag to look around. WASD to move.');viewer.focus()});
  // Mouse/touch look works without pointer lock, so the prototype also works on mobile.
  document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>setEnvironment(b.dataset.scene)));
  document.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>setTime(b.dataset.time)));
  document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{wallColorInput.value=b.dataset.color;applyWallColor();}));
  wallColorInput.addEventListener('input',applyWallColor);floorSelect.addEventListener('change',applyFloor);lightRange.addEventListener('input',applyLight);
  document.querySelector('#fullscreenBtn').addEventListener('click',()=>{if(!document.fullscreenElement)viewer.requestFullscreen?.();else document.exitFullscreen?.()});
  document.querySelector('#screenshotBtn').addEventListener('click',takeScreenshot);document.querySelector('#resetBtn').addEventListener('click',resetScene);
  document.querySelector('#menuBtn').addEventListener('click',()=>document.querySelector('.topbar nav').classList.toggle('open'));
  document.querySelectorAll('.topbar nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.topbar nav').classList.remove('open')));
  document.querySelector('#contactForm').addEventListener('submit',sendEnquiry);document.querySelector('#year').textContent=new Date().getFullYear();
  animate();
}
function resize(){if(!renderer||!camera)return;const w=viewer.clientWidth,h=viewer.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function onPointerDown(e){if(e.target.closest('button'))return;isDragging=true;dragMoved=false;lastX=e.clientX;lastY=e.clientY;viewer.setPointerCapture?.(e.pointerId)}
function onPointerMove(e){if(!isDragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>1)dragMoved=true;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.004;pitch-=dy*.003;pitch=THREE.MathUtils.clamp(pitch,-1.15,1.15);updateCameraRotation()}
function onPointerUp(e){if(!isDragging)return;isDragging=false;if(!dragMoved){handleSceneClick(e)} }
function updateCameraRotation(){camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch}
function handleSceneClick(e){const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(interactables,true);if(!hits.length)return;let object=hits[0].object;while(object.parent&&!object.userData.action&&object.parent!==scene)object=object.parent;if(object.userData.action==='lights')toggleLights();else if(object.userData.action==='door')showToast('Entry door selected — door animation can be added with a detailed door model.');else if(object.name==='pendant-shade')toggleLights()}
function setEnvironment(mode){currentEnvironment=mode;interiorGroup.visible=mode==='interior';exteriorGroup.visible=mode==='exterior';document.querySelectorAll('[data-scene]').forEach(b=>b.classList.toggle('active',b.dataset.scene===mode));sceneLabel.textContent=mode==='interior'?'INTERIOR / LIVING ROOM':'EXTERIOR / MODERN RESIDENCE';camera.position.copy(mode==='interior'?defaultPosition:new THREE.Vector3(0,1.75,11.5));yaw=mode==='interior'?0:0;pitch=0;updateCameraRotation();centerMessage.style.display='flex';centerMessage.querySelector('b').textContent=mode==='interior'?'Walk into the space':'Explore the residence';showToast(mode==='interior'?'Interior environment loaded':'Exterior environment loaded')}
function applyWallColor(){const c=new THREE.Color(wallColorInput.value);wallMaterials.forEach(m=>m.color.copy(c));document.querySelector('#wallHex').textContent=({ '#d7c8b2':'Warm limestone','#eee9df':'Ivory','#8d9b92':'Sage','#8a7768':'Taupe','#343b43':'Charcoal' })[wallColorInput.value.toLowerCase()]||wallColorInput.value.toUpperCase()}
function applyFloor(){const v=floorSelect.value;if(v==='wood'){floorMaterial.color.set('#a9825d');floorMaterial.roughness=.72}else if(v==='marble'){floorMaterial.color.set('#d7d4cd');floorMaterial.roughness=.26;floorMaterial.metalness=.05}else{floorMaterial.color.set('#484a4b');floorMaterial.roughness=.32;floorMaterial.metalness=.12}}
function applyLight(){const value=Number(lightRange.value)/75;lightOutput.textContent=`${lightRange.value}%`;ambientLight.intensity=1.0*value;keyLight.intensity=1.8*value;fillLight.intensity=20*value;sunLight.intensity=2.0*value;scene.traverse(o=>{if(o.isPointLight&&o.userData.baseIntensity)o.intensity=o.userData.baseIntensity*value})}
function setTime(mode){timeMode=mode;document.querySelectorAll('[data-time]').forEach(b=>b.classList.toggle('active',b.dataset.time===mode));if(mode==='day'){scene.background.set('#b7c6cc');scene.fog.color.set('#b7c6cc');ambientLight.color.set('#e5e9ed');keyLight.color.set('#fff0d5');keyLight.intensity=2.3;sunLight.intensity=2.2;renderer.toneMappingExposure=1.0}else if(mode==='sunset'){scene.background.set('#d29b7a');scene.fog.color.set('#d29b7a');ambientLight.color.set('#e5b6a0');keyLight.color.set('#ffb06a');keyLight.intensity=1.55;sunLight.intensity=1.5;renderer.toneMappingExposure=1.05}else{scene.background.set('#151d30');scene.fog.color.set('#151d30');ambientLight.color.set('#9bb8e0');keyLight.color.set('#8ca9e8');keyLight.intensity=.45;sunLight.intensity=.25;renderer.toneMappingExposure=.85}showToast(`${mode[0].toUpperCase()+mode.slice(1)} lighting enabled`)}
function toggleLights(){scene.traverse(o=>{if(o.isPointLight&&o.userData.kind){o.visible=!o.visible}});showToast('Lighting toggled')}
function resetScene(){wallColorInput.value='#d7c8b2';applyWallColor();floorSelect.value='wood';applyFloor();lightRange.value='75';applyLight();setTime('day');setEnvironment('interior');camera.position.copy(defaultPosition);yaw=0;pitch=0;updateCameraRotation();showToast('Environment reset')}
function takeScreenshot(){try{renderer.render(scene,camera);const a=document.createElement('a');a.download=`snk-architect-${currentEnvironment}-${Date.now()}.png`;a.href=renderer.domElement.toDataURL('image/png');a.click();showToast('Screenshot saved as PNG')}catch(e){showToast('Screenshot failed. Try again after the scene loads.')}}
function sendEnquiry(e){e.preventDefault();const d=new FormData(e.currentTarget);const subject=encodeURIComponent(`SNK Architect enquiry — ${d.get('projectType')}`);const body=encodeURIComponent(`Name: ${d.get('name')}\nEmail: ${d.get('email')}\nProject type: ${d.get('projectType')}\n\nDetails:\n${d.get('message')}`);window.location.href=`mailto:hello@snkarchitect.com?subject=${subject}&body=${body}`;showToast('Opening your email app')}
let toastTimer;function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2400)}
function moveCamera(dt){const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight'))?6:3.2;const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const delta=new THREE.Vector3();if(keys.has('KeyW')||keys.has('ArrowUp'))delta.add(forward);if(keys.has('KeyS')||keys.has('ArrowDown'))delta.sub(forward);if(keys.has('KeyD')||keys.has('ArrowRight'))delta.add(right);if(keys.has('KeyA')||keys.has('ArrowLeft'))delta.sub(right);if(delta.lengthSq())delta.normalize().multiplyScalar(speed*dt);camera.position.add(delta);
  if(currentEnvironment==='interior'){camera.position.x=THREE.MathUtils.clamp(camera.position.x,-4.65,4.65);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-4.6,4.8)}else{camera.position.x=THREE.MathUtils.clamp(camera.position.x,-15,15);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-15,18)}camera.position.y=1.65;positionText.textContent=`POSITION ${camera.position.x.toFixed(1)} / ${camera.position.y.toFixed(1)} / ${camera.position.z.toFixed(1)}`}
function animate(){requestAnimationFrame(animate);if(!renderer)return;const dt=Math.min(clock.getDelta(),.05);moveCamera(dt);renderer.render(scene,camera)}
init();
