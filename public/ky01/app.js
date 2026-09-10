import * as THREE from './vendor/three.module.js';
const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const embedded = params.get('embed') === '1';
document.body.classList.toggle('embed', embedded);
let chinese = params.get('lang') === 'zh';
const stage = $('#stage');
let renderer;
try { renderer = new THREE.WebGLRenderer({antialias:true, alpha:true}); }
catch { $('#loading').textContent = '3D unavailable. Enable WebGL and reload. / 请启用 WebGL 后刷新。'; }
if (renderer) init();
function init() {
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setClearColor(0,0); renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.append(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32,1,1,1000); camera.position.set(0,0,215);
scene.add(new THREE.HemisphereLight(0xf8fcf6,0x788880,3));
for(const [x,y,z,p] of [[-70,90,130,4],[80,20,-80,3],[0,-80,90,1]]){const l=new THREE.DirectionalLight(0xffffff,p);l.position.set(x,y,z);scene.add(l);}
const device = new THREE.Group(); scene.add(device);
const bodyMat = new THREE.MeshStandardMaterial({color:0x0b1315,roughness:.68,metalness:.16});
const edgeMat = new THREE.MeshStandardMaterial({color:0x263032,roughness:.46,metalness:.35});
const darkMat = new THREE.MeshStandardMaterial({color:0x101719,roughness:.8});
function shape(w,h,r){const s=new THREE.Shape();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function slab(w,h,d,r,mat,z=0){const outline=shape(w-.5,h-.5,r);const g=new THREE.ExtrudeGeometry(outline,{depth:d-.5,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.25,bevelThickness:.25,curveSegments:12});g.translate(0,0,-(d-.5)/2);const m=new THREE.Mesh(g,mat);m.position.z=z;device.add(m);return m;}
const shell=slab(55,91,5.3,2.3,edgeMat);
slab(54.2,90.2,.55,2,bodyMat,2.45);
slab(54.2,90.2,.5,2,bodyMat,-2.45);
// Screen diagonal approximately 2.8 inches, matching the 4:5 device captures.
const screen = new THREE.Mesh(new THREE.PlaneGeometry(44.4,55.5),new THREE.MeshBasicMaterial({color:0xe5e7db}));
screen.position.set(0,6,2.76);device.add(screen);
function box(w,h,d,x,y,z,mat=darkMat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);device.add(m);return m;}
box(9,.5,.5,0,45,2.65); // earpiece
const sensor=slab(4,1.6,.12,.65,darkMat,2.79);sensor.position.set(-10,40.5,2.79);
box(.6,18,2,27.6,14,0,edgeMat);box(7,.5,2,14,45.65,0,edgeMat);
// Left SIM tray sits slightly above the opposite volume rocker.
function surface(geometry,material,x,y,z,rx=0,ry=0,rz=0){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);device.add(mesh);return mesh;}
const recessMat=new THREE.MeshBasicMaterial({color:0x050909});
// Subtract a corner recess from the sidewall mesh, keeping both broad faces intact.
// Split triangles against the box planes and retain only the outside fragments.
function cornerRecess(mesh){
 const source=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry;
 const positions=source.getAttribute('position'),normals=source.getAttribute('normal');
 const out=[],outNormals=[];
 const planes=[['x',24.4,1],['x',29,-1],['y',-47,1],['y',-39.4,-1],['z',-1.35,1],['z',1.35,-1]];
 function split(poly,axis,bound,sign){
  const inside=[],outside=[];
  for(let i=0;i<poly.length;i++){
   const a=poly[i],b=poly[(i+1)%poly.length];
   const da=(a.p[axis]-bound)*sign,db=(b.p[axis]-bound)*sign;
   (da>=0?inside:outside).push(a);
   if((da>=0)!==(db>=0)){const t=da/(da-db);const v={p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize()};inside.push(v);outside.push(v);}
  }
  return [inside,outside];
 }
 function emit(poly){for(let i=1;i+1<poly.length;i++)for(const v of [poly[0],poly[i],poly[i+1]]){out.push(v.p.x,v.p.y,v.p.z);outNormals.push(v.n.x,v.n.y,v.n.z);}}
 for(let i=0;i<positions.count;i+=3){
  let poly=[0,1,2].map(j=>({p:new THREE.Vector3().fromBufferAttribute(positions,i+j),n:new THREE.Vector3().fromBufferAttribute(normals,i+j)}));
  for(const [axis,bound,sign]of planes){if(poly.length<3)break;const parts=split(poly,axis,bound,sign);emit(parts[1]);poly=parts[0];}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(out,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(outNormals,3));
 if(source!==mesh.geometry)source.dispose();mesh.geometry.dispose();mesh.geometry=geometry;
}
cornerRecess(shell);
// The side and bottom mouths meet behind a small bridge, as in the supplied photo.
surface(new THREE.PlaneGeometry(2.7,6.1),darkMat,24.4,-42.45,0,0,Math.PI/2);
surface(new THREE.PlaneGeometry(3.1,2.7),darkMat,25.95,-39.4,0,Math.PI/2);
surface(new THREE.PlaneGeometry(3.1,6.1),darkMat,25.95,-42.45,-1.35);
surface(new THREE.PlaneGeometry(3.1,6.1),darkMat,25.95,-42.45,1.35,0,Math.PI);
box(1.1,.85,2.7,26.65,-43.95,0,edgeMat);
surface(new THREE.CircleGeometry(.62,24),recessMat,27.51,-35.8,0,0,Math.PI/2);
surface(new THREE.ShapeGeometry(shape(2.3,15,.6)),recessMat,-27.51,24,0,0,-Math.PI/2);
surface(new THREE.ShapeGeometry(shape(1.95,14.5,.45)),bodyMat,-27.54,24,0,0,-Math.PI/2);
surface(new THREE.CircleGeometry(.22,20),recessMat,-27.56,18,0,0,-Math.PI/2);

// Bottom face: serial marking left, microphone centre, Micro-USB right.
// Micro-B has asymmetric bevelled shoulders, unlike the oval Type-C opening.
function microOutline(w,h){const s=new THREE.Shape();s.moveTo(-w/2,h/2);s.lineTo(w/2,h/2);s.lineTo(w/2,-h*.12);s.lineTo(w/2-.7,-h/2);s.lineTo(-w/2+.7,-h/2);s.lineTo(-w/2,-h*.12);s.closePath();return s;}
surface(new THREE.ShapeGeometry(microOutline(7.5,2.6)),edgeMat,12.5,-45.52,0,Math.PI/2,0,Math.PI);
surface(new THREE.ShapeGeometry(microOutline(6.9,2.05)),recessMat,12.5,-45.54,0,Math.PI/2,0,Math.PI);
box(4.8,.06,.45,12.5,-45.58,-.4,edgeMat);
const contactMat=new THREE.MeshStandardMaterial({color:0x8b8875,metalness:.6,roughness:.5});
for(let i=0;i<5;i++)box(.24,.03,.45,11.1+i*.7,-45.62,-.2,contactMat);
surface(new THREE.CircleGeometry(.52,28),edgeMat,0,-45.52,0,Math.PI/2);
surface(new THREE.CircleGeometry(.35,28),recessMat,0,-45.54,0,Math.PI/2);
// Capacitive back/home marks, and a subdued rear wordmark.
function labelTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const navTex=labelTexture(550,140,c=>{c.strokeStyle='#536164';c.lineWidth=3;c.beginPath();c.moveTo(113,61);c.lineTo(140,45);c.lineTo(140,77);c.closePath();c.stroke();c.beginPath();c.arc(424,61,15,0,Math.PI*2);c.stroke();});
const nav=new THREE.Mesh(new THREE.PlaneGeometry(55,14),new THREE.MeshBasicMaterial({map:navTex,transparent:true,depthWrite:false}));nav.position.set(0,-34,2.8);device.add(nav);
function printedLabel(text,w,h,x,y,z,rx,ry,rz=0){const texture=labelTexture(1024,128,c=>{c.fillStyle='#697575';c.textAlign='center';c.textBaseline='middle';c.font='64px Arial';c.fillText(text,512,64);});return surface(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),x,y,z,rx,ry,rz);}
printedLabel('KY-01L',15,1.9,-27.56,-31,0,0,-Math.PI/2,-Math.PI/2);
// Illustrative digits only; the device's actual identifier was not supplied.
printedLabel('0000 0000 0000',15,1.1,-13,-45.56,0,Math.PI/2,0);
const rearTex=labelTexture(768,256,c=>{c.textAlign='center';c.fillStyle='#819092';c.font='bold 140px Arial';c.fillText('docomo',384,174);c.font='30px Arial';c.fillText('NTT',205,62);});
const rear=new THREE.Mesh(new THREE.PlaneGeometry(32,10.67),new THREE.MeshBasicMaterial({map:rearTex,transparent:true,depthWrite:false}));rear.position.set(0,0,-2.73);rear.rotation.y=Math.PI;device.add(rear);
let yaw=-.36,pitch=-.10,zoom=215,auto=false,raf=0,last=0,selected='home',uploadTexture=null,loadSequence=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const textureCache=new Map();
const names=['home','board','board-zh','cover'];
function render(){raf=0;device.rotation.set(pitch,yaw,0);camera.position.z=zoom*Math.max(1,.65/camera.aspect);renderer.render(scene,camera);if(auto&&!document.hidden){raf=requestAnimationFrame(animate);}}
function animate(now){if(last)yaw+=(Math.min(now-last,50)/1000)*.28;last=now;render();}
function invalidate(){if(!raf)raf=requestAnimationFrame(render);}
function resize(){const {width,height}=stage.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();invalidate();}
new ResizeObserver(resize).observe(stage);
function spin(value){auto=value;last=0;$('#spin').setAttribute('aria-pressed',String(auto));invalidate();}
function setView(v){spin(false);pitch=v==='angle'?-.1:0;yaw=v==='back'?Math.PI:v==='angle'?-.36:0;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===v)));invalidate();}
function clearView(){document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));}
function updateEmbed(){const url=new URL('./',location.href);url.search=new URLSearchParams({embed:'1',screen:selected,lang:chinese?'zh':'en'}).toString();$('#embed-code').value=`<iframe src="${url.href}" title="KY-01L interactive 3D preview" style="width:100%;height:620px;border:0;background:transparent" loading="lazy"></iframe>`;$('#embed-open').href=url.href;}
async function selectScreen(name){if(!names.includes(name))name='home';const seq=++loadSequence;try{let t=textureCache.get(name);if(!t){t=await new THREE.TextureLoader().loadAsync(`screens/${name}.png`);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();textureCache.set(name,t);}if(seq!==loadSequence)return;if(uploadTexture){uploadTexture.dispose();uploadTexture=null;}screen.material.map=t;screen.material.needsUpdate=true;selected=name;document.querySelectorAll('[data-screen]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.screen===name)));$('#loading').hidden=true;$('#status').textContent='';stage.dataset.screen=name;updateEmbed();invalidate();}catch{$('#loading').textContent='Screen could not load. Reload to retry. / 截图加载失败，请刷新重试。';$('#loading').hidden=false;}}
document.querySelectorAll('[data-screen]').forEach(b=>b.onclick=()=>selectScreen(b.dataset.screen));// Embedded, the screenshot rail is hidden, so a visitor would only ever meet
// the home screen. Cycle the bundled captures instead, and hold off while they
// have hold of the device rather than yanking the screen out from under them.
if (embedded) {
  const labels = {
    home: 'Home',
    board: 'Board',
    'board-zh': 'Board \u00b7 \u4e2d\u6587',
    cover: 'Sleep cover',
  };
  const caption = document.createElement('p');
  caption.id = 'screen-caption';
  caption.textContent = labels[selected] || selected;
  $('#hint').after(caption);
  let index = Math.max(0, names.indexOf(selected));
  let holdUntil = 0;
  const hold = () => { holdUntil = Date.now() + 12000; };
  for (const event of ['pointerdown', 'wheel', 'keydown'])
    stage.addEventListener(event, hold, { passive: true });
  // The stage is focusable so the device can be turned from the keyboard, and
  // it keeps its ring for that. Focusing it from a click drew a full-width rule
  // on the seam above the controls, which reads as a divider rather than focus.
  //
  // Suppressing that by marking pointer focus was not enough: the viewer's own
  // pointerdown handler is registered first and focuses the stage inside it, so
  // the ring was already painted by the time the mark was set. Track the input
  // that is actually in use instead, from the document and in the capture phase
  // so it is known first, and let the ring default to off.
  const syncModality = (keyboard) => {
    stage.toggleAttribute('data-keyboard', keyboard);
  };
  // A bare modifier is not navigation, and neither is a shortcut: holding Alt,
  // or Alt-Tabbing to another window, should not light up a focus ring here.
  const modifiers = new Set([
    'Alt',
    'Control',
    'Shift',
    'Meta',
    'CapsLock',
    'ContextMenu',
  ]);
  document.addEventListener(
    'keydown',
    (event) => {
      if (modifiers.has(event.key)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      syncModality(true);
    },
    { capture: true, passive: true },
  );
  for (const event of ['pointerdown', 'pointerup'])
    document.addEventListener(event, () => syncModality(false), {
      capture: true,
      passive: true,
    });
  for (const button of document.querySelectorAll('.view-controls button'))
    button.addEventListener('click', hold);
  setInterval(() => {
    if (reduced.matches || document.hidden || Date.now() < holdUntil) return;
    index = (index + 1) % names.length;
    selectScreen(names[index]);
    caption.textContent = labels[names[index]] || names[index];
  }, 5000);
}

document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('#spin').onclick=()=>{clearView();spin(!auto);};$('#reset').onclick=()=>{zoom=215;setView('angle');};
const pointers=new Map();let previousDistance=0;
stage.addEventListener('pointerdown',e=>{stage.focus();stage.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});previousDistance=0;spin(false);clearView();});
stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){yaw+=(e.clientX-prev.x)*.009;pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch+(e.clientY-prev.y)*.009));}else{const [a,b]=[...pointers.values()];const dist=Math.hypot(a.x-b.x,a.y-b.y);if(previousDistance)zoom=Math.max(145,Math.min(340,zoom*previousDistance/Math.max(1,dist)));previousDistance=dist;}invalidate();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(event,e=>{pointers.delete(e.pointerId);previousDistance=0;});
stage.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(145,Math.min(340,zoom+Math.sign(e.deltaY)*10));invalidate();},{passive:false});
stage.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key))return;e.preventDefault();spin(false);clearView();if(e.key==='ArrowLeft')yaw-=.15;if(e.key==='ArrowRight')yaw+=.15;if(e.key==='ArrowUp')pitch=Math.max(-Math.PI/2,pitch-.15);if(e.key==='ArrowDown')pitch=Math.min(Math.PI/2,pitch+.15);if(['+','='].includes(e.key))zoom=Math.max(145,zoom-10);if(e.key==='-')zoom=Math.min(340,zoom+10);if(e.key==='Home'){zoom=215;setView('angle');}invalidate();});
$('#upload').onchange=async e=>{const file=e.target.files[0];if(!file)return;const seq=++loadSequence;try{if(file.size>12*1024*1024)throw Error('Use an image under 12 MB. / 请选择小于 12 MB 的图片。');if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Use PNG, JPG or WebP.');const url=URL.createObjectURL(file);const img=new Image();try{img.src=url;await img.decode();}finally{URL.revokeObjectURL(url);}if(seq!==loadSequence)return;const c=document.createElement('canvas');c.width=960;c.height=1200;const ctx=c.getContext('2d');ctx.fillStyle='#e5e7db';ctx.fillRect(0,0,960,1200);const scale=Math.min(960/img.width,1200/img.height),w=img.width*scale,h=img.height*scale;ctx.drawImage(img,(960-w)/2,(1200-h)/2,w,h);if(uploadTexture)uploadTexture.dispose();uploadTexture=new THREE.CanvasTexture(c);uploadTexture.colorSpace=THREE.SRGBColorSpace;uploadTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();screen.material.map=uploadTexture;screen.material.needsUpdate=true;document.querySelectorAll('[data-screen]').forEach(b=>b.setAttribute('aria-pressed','false'));stage.dataset.screen='custom';$('#status').textContent=chinese?'已使用本地图片。嵌入代码仍使用上次选择的内置截图。':'Local screenshot loaded. Embed uses the last bundled screen.';$('#loading').hidden=true;invalidate();}catch(err){$('#status').textContent=err.message;}e.target.value='';};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText($('#embed-code').value);$('#status').textContent=chinese?'嵌入代码已复制。':'Embed code copied.';}catch{$('#embed-code').focus();$('#embed-code').select();$('#status').textContent=chinese?'请手动复制选中的代码。':'Select and copy the code manually.';}};
function localize(){document.documentElement.lang=chinese?'zh-CN':'en';const text={h1:['Pocket, in every dimension.','方寸之间，转个角度。'],'#subtitle':['Shaun OS on the KY-01L. A little device, a closer look.','搭载 Shaun OS 的 KY-01L。把这台小设备，拿近一点看。'],'#screen-title':['On the screen','屏幕内容'],'#hint':['Drag to rotate · Scroll or pinch to zoom','拖动旋转 · 滚轮或双指缩放'],'#upload-help':['PNG, JPG or WebP · Stays in your browser.','PNG、JPG 或 WebP · 仅在本地浏览器处理。'],'#device-detail':['Ink Black. E-paper. Card-sized.','墨黑机身，电子纸屏，卡片大小。'],'#model-note':['Display model with approximate hardware details. Board screens contain demo data.','展示模型，硬件细节为近似还原。看板截图包含演示数据。'],'#embed-title':['Embed this preview','嵌入这个预览'],'#embed-help':['Host this folder on your website, then copy the iframe. The selected bundled screen is included.','将此文件夹托管到网站后，复制 iframe 代码。代码会保留选中的内置截图。'],'#copy':['Copy embed code','复制嵌入代码'],'#embed-open':['Open minimal viewer','打开纯模型预览'],'#footer-note':['Built around real device screenshots.','采用真实设备截图制作。'],'#spec-link':['Device specifications ↗','设备规格 ↗'],'[data-view="front"]':['Front','正面'],'[data-view="angle"]':['Angle','透视'],'[data-view="back"]':['Back','背面'],'#spin':['Auto-rotate','自动旋转'],'#reset':['Reset','复位']};for(const [s,t]of Object.entries(text))$(s).textContent=t[+chinese];$('#language').textContent=chinese?'EN':'中文';$('#language').setAttribute('aria-label',chinese?'Switch to English':'切换中文');$('#upload-label').firstChild.textContent=chinese?'使用自己的截图':'Use your screenshot';updateEmbed();}
$('#language').onclick=()=>{chinese=!chinese;localize();};
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else invalidate();});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();spin(false);$('#loading').textContent='3D context lost. Reload to recover. / 3D 已中断，请刷新恢复。';$('#loading').hidden=false;});
localize();selectScreen(params.get('screen')||'home');resize();if(params.get('rotate')==='1'&&!reduced.matches)spin(true);
}
