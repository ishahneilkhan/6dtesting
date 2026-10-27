// SNK Architect — Phase 1 interactive 3D room (Three.js r160, ES modules).
// Scene, camera, materials, lighting, furniture and UI controls are kept in this one file
// to keep the first prototype beginner-friendly; split into modules as the project grows.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = s => document.querySelector(s), status = $('#status');
const WALLS = [['Warm white',0xF7F5F0],['Cool grey',0xB8C0C8],['Sage',0xA9BBA0],['Navy',0x2F4A6D],['Terracotta',0xC47A5A],['Charcoal',0x3A4047]];
const FLOORS = { oak:[0xB98A5A,.6], walnut:[0x6B4A32,.55], concrete:[0x9A9A96,.9], marble:[0xE8E6E1,.18] };
const LIGHTS = {
  day:{bg:0xCFE3F2,hemi:1.0,sun:2.6,sunC:0xFFF4E0,lamp:0,glass:.28},
  evening:{bg:0x4A3345,hemi:.45,sun:.9,sunC:0xFFA868,lamp:18,glass:.2},
  night:{bg:0x070B14,hemi:.12,sun:.25,sunC:0x7F9BFF,lamp:30,glass:.1}
};
try { start(); } catch (e) { fail(e); }
function fail(e){ console.error(e); status.hidden=false; status.classList.add('err');
  status.textContent='The 3D studio could not start ('+(e&&e.message||e)+'). Try another browser or a device with WebGL support.'; }

function start(){
  const stage=$('#stage'), cv=$('#c');
  const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});
  const mobile=matchMedia('(pointer:coarse)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(48,1,.1,60);
  const HOME={pos:new THREE.Vector3(4.6,2.6,6.4),target:new THREE.Vector3(0,1.05,0)};
  const ctl=new OrbitControls(camera,cv);
  ctl.enableDamping=true; ctl.minDistance=2; ctl.maxDistance=14; ctl.maxPolarAngle=Math.PI*.495;
  const reset=()=>{camera.position.copy(HOME.pos);ctl.target.copy(HOME.target);ctl.update()}; reset();

  // ---------- materials ----------
  const M=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const wallMat=M(0xF7F5F0,.95), floorMat=M(0xB98A5A,.6), ceilMat=M(0xFFFFFF,.95), woodMat=M(0x7A5230,.5);
  const glassMat=new THREE.MeshPhysicalMaterial({color:0xAAD4FF,roughness:.05,transparent:true,opacity:.28,depthWrite:false});

  // ---------- room: 5 x 4 x 2.8 m, front wall removed so you can see inside ----------
  const W=5,D=4,H=2.8,T=.12;
  const box=(g,w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m};
  const room=new THREE.Group(); scene.add(room);
  box(room,W,.1,D,floorMat,0,-.05,0);
  const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,D),ceilMat); ceil.rotation.x=Math.PI/2; ceil.position.y=H; ceil.receiveShadow=true; room.add(ceil); // faces down: see-through from above
  const bz=-D/2-T/2, lx=-W/2-T/2;
  box(room,3.1,H,T,wallMat,-.95,H/2,bz); box(room,.5,H,T,wallMat,2.25,H/2,bz);            // back wall around window
  box(room,1.4,.9,T,wallMat,1.3,.45,bz); box(room,1.4,.7,T,wallMat,1.3,2.45,bz);
  box(room,1.4,1.2,.03,glassMat,1.3,1.5,-D/2-T/2).castShadow=false;                        // glass
  box(room,.04,1.2,.05,woodMat,1.3,1.5,-D/2+.02);
  box(room,T,H,2.4,wallMat,lx,H/2,-.8); box(room,T,H,.7,wallMat,lx,H/2,1.65);              // left wall around door
  box(room,T,.7,.9,wallMat,lx,2.45,.85); box(room,.06,2.1,.9,woodMat,-W/2-.03,1.05,.85);   // door leaf
  box(room,T,H,D,wallMat,W/2+T/2,H/2,0);                                                    // right wall

  // ---------- furniture ----------
  const FURN={};
  const grp=(name,build)=>{const g=new THREE.Group();build(g);g.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true});scene.add(g);FURN[name]=g;return g};
  const cyl=(g,r1,r2,h,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,24),mat);m.position.set(x,y,z);g.add(m);return m};
  grp('rug',g=>box(g,2.6,.02,1.8,M(0x6B8FA3,1),.2,.01,.3));
  grp('sofa',g=>{const s=M(0x4A6572,.9);box(g,2.1,.4,.9,s,0,.25,-1.25);box(g,2.1,.5,.2,s,0,.65,-1.6);box(g,.2,.3,.9,s,-1.05,.45,-1.25);box(g,.2,.3,.9,s,1.05,.45,-1.25)});
  grp('table',g=>{box(g,1.1,.05,.6,woodMat,.2,.4,.35);[[-.5,-.25],[.5,-.25],[-.5,.25],[.5,.25]].forEach(([x,z])=>box(g,.05,.4,.05,woodMat,.2+x,.2,.35+z))});
  grp('shelf',g=>box(g,.35,1.9,1,M(0x8B6B4A,.7),W/2-.3,.95,-.9));
  grp('plant',g=>{cyl(g,.18,.14,.4,M(0x8A5A33,.8),-1.9,.2,-1.5);const l=new THREE.Mesh(new THREE.SphereGeometry(.38,20,16),M(0x4E8A4A,.9));l.position.set(-1.9,.8,-1.5);g.add(l)});
  const bulbMat=new THREE.MeshStandardMaterial({color:0xFFE9B0,emissive:0xFFD27A,emissiveIntensity:0});
  const lampL=new THREE.PointLight(0xFFD9A0,0,9,2);
  grp('lamp',g=>{cyl(g,.03,.03,1.4,M(0x333333,.4,.6),1.9,.7,-1.5);const b=new THREE.Mesh(new THREE.SphereGeometry(.17,20,16),bulbMat);b.position.set(1.9,1.5,-1.5);g.add(b);lampL.position.set(1.9,1.5,-1.5);g.add(lampL)});

  // ---------- lighting ----------
  const hemi=new THREE.HemisphereLight(0xffffff,0x555555,1); scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xFFF4E0,2.6); sun.position.set(4,6,5); sun.castShadow=true;
  sun.shadow.mapSize.set(mobile?512:1024,mobile?512:1024); Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:1,far:20}); sun.shadow.bias=-.0005; scene.add(sun);
  const ceilL=new THREE.PointLight(0xFFE2B0,0,10,2); ceilL.position.set(0,2.5,0); scene.add(ceilL);
  function setLight(k){const L=LIGHTS[k];scene.background=new THREE.Color(L.bg);hemi.intensity=L.hemi;sun.intensity=L.sun;sun.color.setHex(L.sunC);
    lampL.intensity=L.lamp;ceilL.intensity=L.lamp*.8;bulbMat.emissiveIntensity=L.lamp?2:0;glassMat.opacity=L.glass;
    document.querySelectorAll('#light button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.l===k))}

  // ---------- UI ----------
  WALLS.forEach(([n,c],i)=>{const b=document.createElement('button');b.type='button';b.style.background='#'+c.toString(16).padStart(6,'0');
    b.setAttribute('aria-label','Wall colour: '+n);b.title=n;b.setAttribute('aria-pressed',i===0);
    b.onclick=()=>{wallMat.color.setHex(c);document.querySelectorAll('#walls button').forEach(x=>x.setAttribute('aria-pressed',x===b))};$('#walls').appendChild(b)});
  $('#floor').onchange=e=>{const f=FLOORS[e.target.value];floorMat.color.setHex(f[0]);floorMat.roughness=f[1]};
  document.querySelectorAll('#light button').forEach(b=>b.onclick=()=>setLight(b.dataset.l));
  document.querySelectorAll('[data-f]').forEach(c=>c.onchange=()=>{FURN[c.dataset.f].visible=c.checked});
  $('#reset').onclick=reset;
  const fs=$('#fs'); if(stage.requestFullscreen){fs.onclick=()=>document.fullscreenElement?document.exitFullscreen():stage.requestFullscreen()}
  else{fs.disabled=true;fs.title='Fullscreen is not supported in this browser'}
  $('#shot').onclick=()=>{renderer.render(scene,camera);cv.toBlob(b=>{if(!b){alert('Screenshot is not supported in this browser.');return}
    const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='snk-architect-3d-view.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)})};
  setLight('day');

  // ---------- resize, render loop, cleanup ----------
  const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};
  new ResizeObserver(resize).observe(stage); resize();
  let visible=true,first=true; new IntersectionObserver(e=>visible=e[0].isIntersecting).observe(stage);
  renderer.setAnimationLoop(()=>{if(!visible||document.hidden)return;ctl.update();renderer.render(scene,camera);if(first){first=false;status.hidden=true}});
  addEventListener('pagehide',()=>{renderer.setAnimationLoop(null);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(m=>m.dispose())});ctl.dispose();renderer.dispose()});
}
