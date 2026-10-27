const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function frameDoc(code){
  const safe=code.replace(/<\/script/gi,'<\\/script');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;overflow:hidden;background:#0b1620}canvas{display:block;width:100%;height:100%}</style></head><body><canvas id="cv"></canvas><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"><\/script><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"><\/script><script>const canvas=document.getElementById('cv'),width=innerWidth,height=innerHeight,OrbitControls=THREE.OrbitControls;try{
${safe}
}catch(e){document.body.insertAdjacentHTML('beforeend','<p style="color:#f88;font:14px sans-serif;padding:12px">Error: '+e.message+'</p>')}<\/script></body></html>`;
}
function renderProject(app,p){
  app.innerHTML=`<div class="mono" style="margin-top:10px">Design Review</div><h1>${esc(p.title)}</h1>
  <div class="tb"><div><span class="mono">Client</span><b>${esc(p.client||'—')}</b></div><div><span class="mono">Dwg No</span><b>${esc(p.code)}</b></div><div><span class="mono">Date</span><b>${esc(p.date)}</b></div><div><span class="mono">Rev</span><b>A</b></div></div>
  <div class="pan"><div class="box"><div class="cap mono">01 · Hand Drawing</div>${p.img?`<img src="${p.img}" alt="Hand drawing">`:'<div style="padding:20px" class="mono">ছবি নেই</div>'}</div>
  <div class="box"><div class="cap mono">02 · 3D Model — drag to rotate</div><iframe id="fr" sandbox="allow-scripts" title="3D model"></iframe></div></div>
  <p class="mono" style="margin-top:14px">Prepared by Shah Neil Khan</p>`;
  app.querySelector('#fr').srcdoc=frameDoc(p.src);
}
