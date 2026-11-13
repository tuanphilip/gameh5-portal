/* Cầu nối giữa game 3D gốc và các module online (js/online/*). Game vẫn chạy bình thường khi không có máy chủ. */
window.HiHi=window.HiHi||(function(){const L={},W=[];let g=null;
  return{online:false,hooks:{},game:null,
    on(t,f){(L[t]=L[t]||[]).push(f);},
    emit(t,d){(L[t]||[]).forEach(f=>{try{f(d);}catch(e){console.error(e);}});},
    ready(f){g?f(g):W.push(f);},
    _setGame(api){g=api;this.game=api;W.splice(0).forEach(f=>f(api));}};})();
function __game(){
'use strict';
document.getElementById('loadMsg').textContent='';
const $=s=>document.querySelector(s);
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const lerp=(a,b,t)=>a+(b-a)*t;

/* ================= RENDERER ================= */
const renderer=new THREE.WebGLRenderer({canvas:$('#c'),antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.82;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x2a2018);
scene.fog=new THREE.Fog(0x3a2e22,40,100);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,220);
camera.position.set(0,10,37);

function canvasTex(w,h,draw,rep){
  const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;
  if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}
  return t;
}
const glowTex=canvasTex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.22,'rgba(255,232,185,.65)');gr.addColorStop(1,'rgba(255,190,110,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
function glowSprite(color,scale,opacity){
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,transparent:true,opacity:opacity??1,blending:THREE.AdditiveBlending,depthWrite:false}));
  s.scale.setScalar(scale);return s;
}

/* ================= THEMES ================= */
const THEMES={
  gothic:{name:'Thánh Đường Vàng',desc:'Đá vàng ấm, phong cách Gothic',stone:0xc4a477,trim:0xa27f4c,vault:0x8a6c48,fA:'#ddd0b4',fB:'#352e2a',carpet:0x8e1b1b},
  stone:{name:'Nhà Thờ Đá',desc:'Đá xám cổ kính, trầm mặc',stone:0x9c978e,trim:0x77726a,vault:0x6f6b65,fA:'#d8d4cc',fB:'#2e3136',carpet:0x6b1420},
  pink:{name:'Nhà Thờ Hồng',desc:'Sắc hồng tươi sáng, nhẹ nhàng',stone:0xe8aaa4,trim:0xd88c86,vault:0xc98a85,fA:'#f5e9df',fB:'#7d4c47',carpet:0x9b1e2b}
};
let themeKey='gothic';
const stoneTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
  for(let i=0;i<2200;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.06})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}
  g.strokeStyle='rgba(0,0,0,.13)';g.lineWidth=2;
  for(let y=0;y<h;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();
    const off=(y/32)%2?32:0;for(let x=off;x<w;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke();}}
},[3,3]);
const stoneMat=new THREE.MeshStandardMaterial({color:THEMES.gothic.stone,map:stoneTex,roughness:.92});
const trimMat=new THREE.MeshStandardMaterial({color:THEMES.gothic.trim,roughness:.8});
const vaultMat=new THREE.MeshStandardMaterial({color:THEMES.gothic.vault,roughness:.95,side:THREE.DoubleSide});
const goldMat=new THREE.MeshStandardMaterial({color:0xd9a845,metalness:.75,roughness:.32,emissive:0x3a2405});
const woodMat=new THREE.MeshStandardMaterial({color:0x5a3a22,roughness:.7});
const darkWood=new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.75});
const whiteMat=new THREE.MeshStandardMaterial({color:0xf3eee4,roughness:.6});
const carpetMat=new THREE.MeshStandardMaterial({color:THEMES.gothic.carpet,roughness:1});
const floorMat=new THREE.MeshStandardMaterial({roughness:.55,metalness:.05});
function makeFloorTex(t){
  const tx=canvasTex(256,256,(g,w,h)=>{
    for(let i=0;i<2;i++)for(let j=0;j<2;j++){g.fillStyle=(i+j)%2?t.fB:t.fA;g.fillRect(i*128,j*128,128,128);}
    for(let k=0;k<1500;k++){g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},0,${Math.random()*.035})`;g.fillRect(Math.random()*w,Math.random()*h,3,3);}
    g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;g.strokeRect(0,0,128,128);g.strokeRect(128,128,128,128);
  },[14,36]);
  if(floorMat.map)floorMat.map.dispose();floorMat.map=tx;floorMat.needsUpdate=true;
}
function applyTheme(k){
  themeKey=k;const t=THEMES[k];
  stoneMat.color.setHex(t.stone);trimMat.color.setHex(t.trim);vaultMat.color.setHex(t.vault);carpetMat.color.setHex(t.carpet);
  makeFloorTex(t);
}

/* ================= WORLD ================= */
const world=new THREE.Group();scene.add(world);
function box(w,h,d,mat,x,y,z,parent){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);(parent||world).add(m);return m;}
function cyl(rt,rb,h,mat,x,y,z,seg,parent){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||16),mat);m.position.set(x,y,z);(parent||world).add(m);return m;}

// floor & carpet
const floor=new THREE.Mesh(new THREE.PlaneGeometry(28,72),floorMat);floor.rotation.x=-Math.PI/2;floor.position.z=2;world.add(floor);
const carpet=new THREE.Mesh(new THREE.PlaneGeometry(2.1,63),carpetMat);carpet.rotation.x=-Math.PI/2;carpet.position.set(0,.012,5.5);world.add(carpet);
[-1.08,1.08].forEach(x=>{const b=new THREE.Mesh(new THREE.PlaneGeometry(.08,63),goldMat);b.rotation.x=-Math.PI/2;b.position.set(x,.014,5.5);world.add(b);});

// walls
box(.6,12,72,stoneMat,-14.3,6,2);box(.6,12,72,stoneMat,14.3,6,2);
box(.6,4.6,72,stoneMat,-7,14.3,2);box(.6,4.6,72,stoneMat,7,14.3,2);
box(7,.4,72,vaultMat,-10.5,12.2,2);box(7,.4,72,vaultMat,10.5,12.2,2);
box(28.6,24,.6,stoneMat,0,12,-34.3);box(28.6,24,.6,stoneMat,0,12,38.3);
const vault=new THREE.Mesh(new THREE.CylinderGeometry(7,7,72,36,1,true,Math.PI/2,Math.PI),vaultMat);
vault.rotation.x=Math.PI/2;vault.position.set(0,16.5,2);world.add(vault);
for(let z=-30;z<=36;z+=6){const r=new THREE.Mesh(new THREE.TorusGeometry(6.92,.16,6,28,Math.PI),trimMat);r.position.set(0,16.5,z);world.add(r);}
const ridge=box(.3,.3,72,trimMat,0,23.35,2);

// columns + arches
const columns=[];
for(let z=-30;z<=36;z+=6){for(const x of[-7,7]){
  cyl(.55,.6,11.4,stoneMat,x,5.9,z,16);box(1.4,.6,1.4,trimMat,x,.3,z);box(1.4,.5,1.4,trimMat,x,11.75,z);
  columns.push({x,z,r:.85});
  if(z<36){const a=new THREE.Mesh(new THREE.TorusGeometry(2.45,.26,8,20,Math.PI),trimMat);a.rotation.y=Math.PI/2;a.position.set(x,9.5,z+3);world.add(a);}
}}
box(.8,.5,72,trimMat,-7,12.1,2);box(.8,.5,72,trimMat,7,12.1,2);

// stained glass
const GL=['#1d4fa8','#b3122e','#e8b020','#1f8a4c','#6b2fa0','#2aa5c9','#d9622b','#f0e6c0'];
function glassTex(seed){return canvasTex(128,256,(g,w,h)=>{
  g.fillStyle='#120c08';g.fillRect(0,0,w,h);const cs=16;
  for(let y=0;y<h;y+=cs)for(let x=0;x<w;x+=cs){g.fillStyle=GL[(x/cs*3+y/cs*7+seed*5+((x*y/cs)%5))%7];g.fillRect(x+1.5,y+1.5,cs-3,cs-3);}
  for(let i=0;i<3;i++){const cy=58+i*72;g.fillStyle=GL[(seed+i*2)%7];g.beginPath();g.arc(64,cy,30,0,7);g.fill();g.strokeStyle='#120c08';g.lineWidth=5;g.stroke();
    g.fillStyle='rgba(255,243,210,.95)';g.beginPath();g.arc(64,cy,11,0,7);g.fill();
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;g.strokeStyle='#120c08';g.lineWidth=3;g.beginPath();g.moveTo(64+Math.cos(a)*12,cy+Math.sin(a)*12);g.lineTo(64+Math.cos(a)*30,cy+Math.sin(a)*30);g.stroke();}}
  g.globalCompositeOperation='destination-in';g.beginPath();g.moveTo(0,h);g.lineTo(0,64);g.arc(64,64,64,Math.PI,0);g.lineTo(w,h);g.closePath();g.fill();
});}
const glassMats=[];
for(let i=0;i<6;i++)glassMats.push(new THREE.MeshBasicMaterial({map:glassTex(i),transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
for(let z=-27;z<=33;z+=6){
  for(const s of[-1,1]){
    const w=new THREE.Mesh(new THREE.PlaneGeometry(2.3,5.2),pick(glassMats));w.position.set(s*13.95,6.3,z);w.rotation.y=-s*Math.PI/2;world.add(w);
    const c=new THREE.Mesh(new THREE.PlaneGeometry(1.7,3.2),pick(glassMats));c.position.set(s*6.66,14.4,z);c.rotation.y=-s*Math.PI/2;world.add(c);
  }
}
const roseTex=canvasTex(256,256,(g)=>{
  g.translate(128,128);g.fillStyle='#120c08';g.beginPath();g.arc(0,0,128,0,7);g.fill();
  for(let ring=3;ring>=0;ring--){const n=[1,8,16,24][ring],r0=[0,26,62,96][ring],r1=[24,58,92,124][ring];
    for(let k=0;k<n;k++){const a0=k/n*Math.PI*2,a1=(k+1)/n*Math.PI*2;g.fillStyle=GL[(k+ring*3)%7];
      g.beginPath();g.arc(0,0,r1-2,a0+.03,a1-.03);g.arc(0,0,r0+2,a1-.03,a0+.03,true);g.closePath();g.fill();}}
  g.fillStyle='rgba(255,245,215,1)';g.beginPath();g.arc(0,0,20,0,7);g.fill();
});
const roseMat=new THREE.MeshBasicMaterial({map:roseTex,side:THREE.DoubleSide});glassMats.push(roseMat);
const rose=new THREE.Mesh(new THREE.CircleGeometry(4.2,48),roseMat);rose.position.set(0,15.6,-33.95);world.add(rose);
const roseFrame=new THREE.Mesh(new THREE.TorusGeometry(4.3,.25,8,48),trimMat);roseFrame.position.copy(rose.position);world.add(roseFrame);

// light shafts
const shaftTex=canvasTex(32,256,(g,w,h)=>{const gr=g.createLinearGradient(0,h,0,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.35,'rgba(255,255,255,.55)');gr.addColorStop(.9,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.globalCompositeOperation='destination-in';const gx=g.createLinearGradient(0,0,w,0);gx.addColorStop(0,'rgba(0,0,0,0)');gx.addColorStop(.5,'rgba(0,0,0,1)');gx.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gx;g.fillRect(0,0,w,h);});
const shaftMat=new THREE.MeshBasicMaterial({map:shaftTex,color:0xffd9a0,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
for(let z=-27;z<=27;z+=9){const sh=new THREE.Mesh(new THREE.PlaneGeometry(1.8,16.4),shaftMat);sh.position.set(2.4,7.1,z);sh.rotation.z=.55;world.add(sh);}

// dust
const dustN=420,dustPos=new Float32Array(dustN*3);
for(let i=0;i<dustN;i++){dustPos[i*3]=rand(-6.5,6.5);dustPos[i*3+1]=rand(.5,15);dustPos[i*3+2]=rand(-30,36);}
const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
const dustMat=new THREE.PointsMaterial({map:glowTex,size:.09,color:0xffe0a8,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false});
const dust=new THREE.Points(dustGeo,dustMat);world.add(dust);

// altar sanctuary
box(10,.3,7,trimMat,0,.15,-30.5);box(8,.3,5.6,trimMat,0,.45,-31.2);box(6.2,.3,4.2,stoneMat,0,.75,-31.9);
box(3.2,1.1,1.2,whiteMat,0,1.45,-31.6);box(3.34,.06,1.34,goldMat,0,2.03,-31.6);box(1.1,.8,.03,goldMat,0,1.45,-30.99);
box(6.4,7.4,.4,darkWood,0,4.6,-33.7);
const paintTex=canvasTex(256,320,(g,w,h)=>{
  const gr=g.createRadialGradient(128,130,10,128,150,220);gr.addColorStop(0,'#fff6d6');gr.addColorStop(.25,'#f3c766');gr.addColorStop(.6,'#b5512e');gr.addColorStop(1,'#2b1a3e');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.globalAlpha=.25;for(let k=0;k<36;k++){const a=k/36*Math.PI*2;g.strokeStyle='#fff3c4';g.lineWidth=k%2?2:5;g.beginPath();g.moveTo(128,130);g.lineTo(128+Math.cos(a)*300,130+Math.sin(a)*300);g.stroke();}
  g.globalAlpha=1;g.fillStyle='#ffffff';g.beginPath();g.ellipse(128,132,20,13,0,0,7);g.fill();
  g.beginPath();g.moveTo(112,130);g.quadraticCurveTo(70,90,46,104);g.quadraticCurveTo(80,118,112,138);g.fill();
  g.beginPath();g.moveTo(144,130);g.quadraticCurveTo(186,90,210,104);g.quadraticCurveTo(176,118,144,138);g.fill();
  g.beginPath();g.arc(128,116,8,0,7);g.fill();g.beginPath();g.moveTo(120,142);g.lineTo(128,170);g.lineTo(136,142);g.fill();
  g.strokeStyle='rgba(255,236,190,.8)';g.lineWidth=10;g.strokeRect(5,5,w-10,h-10);
});
const painting=new THREE.Mesh(new THREE.PlaneGeometry(4.2,5.3),new THREE.MeshBasicMaterial({map:paintTex}));painting.position.set(0,4.7,-33.48);world.add(painting);
box(4.6,.3,.3,goldMat,0,7.5,-33.4);box(4.6,.3,.3,goldMat,0,1.9,-33.4);box(.3,5.9,.3,goldMat,-2.25,4.7,-33.4);box(.3,5.9,.3,goldMat,2.25,4.7,-33.4);
box(.28,2.4,.28,goldMat,0,9.6,-33.4);box(1.3,.28,.28,goldMat,0,10.1,-33.4);
const flames=[];
function addFlame(x,y,z,parent,scale){
  const g=new THREE.Group();g.position.set(x,y,z);
  const f=new THREE.Mesh(new THREE.ConeGeometry(.03*scale,.11*scale,8),new THREE.MeshBasicMaterial({color:0xffd27a}));f.position.y=.05*scale;g.add(f);
  const gl=glowSprite(0xffb050,.5*scale,.9);gl.position.y=.05*scale;g.add(gl);
  (parent||world).add(g);flames.push({g,f,gl,s:scale,ph:Math.random()*10});return g;
}
for(const x of[-1.3,-.8,.8,1.3]){cyl(.045,.05,.6,whiteMat,x,2.36,-31.9);addFlame(x,2.66,-31.9,null,1.4);}
// organ pipes
for(let i=0;i<13;i++){const hgt=3+Math.sin(i/12*Math.PI)*3.2;cyl(.17,.17,hgt,new THREE.MeshStandardMaterial({color:0xcfd3d8,metalness:.85,roughness:.25}),-9.4+i*.4,1.6+hgt/2,-33.6,12);}
box(5.6,1.6,1.2,darkWood,-7,.8,-33.3);

// chandeliers
const chLights=[];
for(const z of[-20,-6,8,22]){
  const g=new THREE.Group();g.position.set(0,10.2,z);world.add(g);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.3,.06,8,32),goldMat);ring.rotation.x=Math.PI/2;g.add(ring);
  cyl(.02,.02,6,goldMat,0,3,0,4,g);
  for(let k=0;k<10;k++){const a=k/10*Math.PI*2;const s=glowSprite(0xffcf80,.7,.95);s.position.set(Math.cos(a)*1.3,.15,Math.sin(a)*1.3);g.add(s);}
  const big=glowSprite(0xffc070,3.4,.35);g.add(big);
  const pl=new THREE.PointLight(0xffc98a,1,24,1.6);pl.position.y=-.3;g.add(pl);chLights.push({pl,big});
}

// chairs (instanced)
const seats=[];
for(let z=-22.4;z<=24.01;z+=1.6)for(const sx of[-1,1])for(const ax of[1.7,2.55,3.4,4.25,5.1,5.95])seats.push({x:sx*ax,z,occ:null});
{
  const n=seats.length,m4=new THREE.Matrix4();
  const rush=new THREE.MeshStandardMaterial({color:0xc9a25a,roughness:.95});
  const sI=new THREE.InstancedMesh(new THREE.BoxGeometry(.6,.07,.55),rush,n);
  const bI=new THREE.InstancedMesh(new THREE.BoxGeometry(.6,.62,.06),woodMat,n);
  const lI=new THREE.InstancedMesh(new THREE.BoxGeometry(.05,.47,.05),woodMat,n*4);
  seats.forEach((s,i)=>{m4.makeTranslation(s.x,.47,s.z);sI.setMatrixAt(i,m4);m4.makeTranslation(s.x,.8,s.z+.27);bI.setMatrixAt(i,m4);
    [[-.26,-.24],[.26,-.24],[-.26,.25],[.26,.25]].forEach(([a,b],k)=>{m4.makeTranslation(s.x+a,.235,s.z+b);lI.setMatrixAt(i*4+k,m4);});});
  world.add(sI,bI,lI);
}

// candle rack
const RACK={x:-9.8,z:-27.4};
const rackGroup=new THREE.Group();rackGroup.position.set(RACK.x,0,RACK.z);world.add(rackGroup);
box(3.6,.8,1.1,darkWood,0,.4,0,rackGroup);
const rackSlots=[];
for(let r=0;r<3;r++){box(3.4,.08,.34,goldMat,0,.84+r*.26,.38-r*.32,rackGroup);
  for(let i=0;i<14;i++)rackSlots.push({x:-1.56+i*.24,y:.88+r*.26,z:.38-r*.32,c:null,t:0});}
box(.1,2.2,.1,goldMat,0,1.9,-.5,rackGroup);box(.6,.1,.1,goldMat,0,2.6,-.5,rackGroup);
const rackLight=new THREE.PointLight(0xffa850,.6,9,1.5);rackLight.position.set(0,1.6,.8);rackGroup.add(rackLight);
let candleCount=0;
function lightCandle(text,byPlayer){
  let free=rackSlots.filter(s=>!s.c);
  let slot;
  if(free.length)slot=pick(free);else{slot=rackSlots.reduce((a,b)=>a.t<b.t?a:b);rackGroup.remove(slot.c);const i=flames.findIndex(f=>f.g===slot.fl);if(i>=0)flames.splice(i,1);}
  const g=new THREE.Group();g.position.set(slot.x,slot.y,slot.z);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.04,.045,.16,10),new THREE.MeshStandardMaterial({color:pick([0xfff6e6,0xf3e0c0,0xe9c27a,0xf2d6d6]),roughness:.5}));body.position.y=.08;g.add(body);
  rackGroup.add(g);slot.c=g;slot.t=performance.now();slot.fl=addFlame(0,.17,0,g,1);
  candleCount++;rackLight.intensity=Math.min(2.4,.4+rackSlots.filter(s=>s.c).length*.045);
  if(byPlayer){
    burst(g);if(text)addLabel(g,'🕯️ '+esc(text),'bubble',.5,9000);
  }
}
for(let i=0;i<20;i++)lightCandle();

// christmas tree
const TREE={x:9.8,z:-28.4};
const treeG=new THREE.Group();treeG.position.set(TREE.x,0,TREE.z);world.add(treeG);
cyl(.25,.3,1,darkWood,0,.5,0,8,treeG);
const treeMat=new THREE.MeshStandardMaterial({color:0x1d5a33,roughness:.9});
for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(2.3-i*.42,2.1,14),treeMat);c.position.y=1.6+i*1.25;treeG.add(c);}
const star=new THREE.Mesh(new THREE.OctahedronGeometry(.38),new THREE.MeshBasicMaterial({color:0xffe17a}));star.position.y=8.2;treeG.add(star);
const starGlow=glowSprite(0xffd060,2.2,.9);starGlow.position.y=8.2;treeG.add(starGlow);
const twinkles=[];
for(let i=0;i<60;i++){const t=Math.random();const y=1+t*6.4;const r=(2.25*(1-t*.82))*.92;const a=Math.random()*Math.PI*2;
  if(i<34){const o=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),new THREE.MeshStandardMaterial({color:pick([0xc81f2e,0xe0b040,0x2f6ad0,0xf2f2f2]),metalness:.6,roughness:.25}));o.position.set(Math.cos(a)*r,y,Math.sin(a)*r);treeG.add(o);}
  else{const s=glowSprite(pick([0xffd27a,0xff7a7a,0x8ac7ff,0xa8ff9a]),.42,.9);s.position.set(Math.cos(a)*r,y,Math.sin(a)*r);treeG.add(s);twinkles.push({s,ph:Math.random()*6});}}
const presents=[];
[[-1.4,1.2,0xb3122e],[ .9,1.5,0x1f5fa8],[1.7,.2,0xe0b040],[-1.8,-.4,0x2a8a4c],[.2,1.9,0x7a3fa0],[-.6,1.7,0xf0f0f0]].forEach(([x,z,c])=>{
  const s=rand(.45,.7);const p=box(s,s,s,new THREE.MeshStandardMaterial({color:c,roughness:.6}),x,s/2,z,treeG);p.rotation.y=Math.random();
  box(s+.02,s+.02,.1,goldMat,0,0,0,p);box(.1,s+.02,s+.02,goldMat,0,0,0,p);presents.push(p);});
const treeLight=new THREE.PointLight(0xffc070,.8,10,1.6);treeLight.position.set(0,3,2);treeG.add(treeLight);

// confessional (góc tâm sự)
const BOOTH={x:-13.1,z:4};
const boothG=new THREE.Group();boothG.position.set(BOOTH.x,0,BOOTH.z);world.add(boothG);
box(1.6,3.2,3,darkWood,0,1.6,0,boothG);box(1.8,.3,3.2,woodMat,0,3.35,0,boothG);
const cur=new THREE.Mesh(new THREE.PlaneGeometry(.9,2.2),new THREE.MeshStandardMaterial({color:0x7a1622,roughness:1,side:THREE.DoubleSide}));cur.position.set(.81,1.25,0);cur.rotation.y=Math.PI/2;boothG.add(cur);
box(.08,.6,.08,goldMat,0,3.8,0,boothG);box(.35,.08,.08,goldMat,0,3.9,0,boothG);
const boothGlow=glowSprite(0xffd38a,1.2,.4);boothGlow.position.set(.9,2.6,0);boothG.add(boothGlow);

// offering box
const OFFER={x:3.8,z:-26.2};
box(.7,.9,.5,darkWood,OFFER.x,.45,OFFER.z);box(.4,.04,.06,goldMat,OFFER.x,.92,OFFER.z);

// doors
box(4.4,6.6,.3,darkWood,0,3.3,38);box(.08,6.6,.32,goldMat,0,3.3,38);

/* ================= LIGHTS ================= */
const hemi=new THREE.HemisphereLight(0xfff0dc,0x45342a,.42);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe0b0,.85);sun.position.set(30,40,8);scene.add(sun);
const altarLight=new THREE.PointLight(0xffd59a,1.2,16,1.4);altarLight.position.set(0,5,-29);scene.add(altarLight);

/* ================= LABELS ================= */
const labelLayer=$('#labels'),labels=[];const _v=new THREE.Vector3();
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function addLabel(obj,html,cls,offY,dur){const el=document.createElement('div');el.className='lbl '+(cls||'');el.innerHTML=html;labelLayer.appendChild(el);
  const L={el,obj,offY:offY??2,until:dur?performance.now()+dur:0};labels.push(L);return L;}
function removeLabel(L){const i=labels.indexOf(L);if(i>=0)labels.splice(i,1);L.el.remove();}
function updateLabels(now){
  for(let i=labels.length-1;i>=0;i--){const L=labels[i];
    if(L.until&&now>L.until){L.el.style.opacity=0;if(now>L.until+450){L.el.remove();labels.splice(i,1);}continue;}
    L.obj.updateWorldMatrix(true,false);_v.setFromMatrixPosition(L.obj.matrixWorld);_v.y+=L.offY;
    const dist=_v.distanceTo(camera.position);_v.project(camera);
    if(_v.z>1||dist>(L.el.classList.contains('name')?22:L.el.classList.contains('chat')?80:40)){L.el.style.display='none';continue;}
    L.el.style.display='';L.el.style.left=((_v.x+1)/2*innerWidth)+'px';L.el.style.top=((1-_v.y)/2*innerHeight)+'px';
  }
}

/* floaters: rising orbs/hearts */
const floaters=[];
function floater(pos,opts){
  const o=new THREE.Object3D();o.position.copy(pos);scene.add(o);
  let spr=null;if(opts.glow){spr=glowSprite(opts.glow,opts.size||1.2,1);o.add(spr);}
  let L=null;if(opts.html)L=addLabel(o,opts.html,opts.cls||'emoji',opts.offY||0);
  floaters.push({o,spr,L,vy:opts.vy||1.2,life:opts.life||5,t:0,vx:opts.vx||0});
}
function updateFloaters(dt){
  for(let i=floaters.length-1;i>=0;i--){const f=floaters[i];f.t+=dt;f.o.position.y+=f.vy*dt;f.o.position.x+=Math.sin(f.t*2)*f.vx*dt;
    const k=Math.max(0,1-f.t/f.life);if(f.spr)f.spr.material.opacity=k;if(f.L)f.L.el.style.opacity=k;
    if(f.t>=f.life){scene.remove(f.o);if(f.spr)f.spr.material.dispose();if(f.L)removeLabel(f.L);floaters.splice(i,1);}}
}
function burst(obj){obj.updateWorldMatrix(true,false);const p=new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld);
  for(let i=0;i<6;i++){const q=p.clone().add(new THREE.Vector3(rand(-.3,.3),rand(0,.3),rand(-.3,.3)));floater(q,{glow:0xffd27a,size:rand(.2,.45),vy:rand(.5,1.4),life:rand(1.5,2.6),vx:.3});}}

/* ================= AVATARS ================= */
const SKIN=[0xf6d2b5,0xeec29e,0xd9a57f,0xf3cfae],HAIR=[0x2b1d14,0x4a2f1d,0x161616,0x6b4426,0x3a2a20];
const ROBES=[0x2f4a7a,0x7a2f3a,0x3d6b4f,0x5b3f7a,0x8a6a3a,0x2c2c34,0xb04a5a,0x456b8f,0xd8d2c4,0x9a5b2a];
function makeAvatar(o){
  const g=new THREE.Group();
  const robe=new THREE.MeshStandardMaterial({color:o.robe,roughness:.85});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.24,.4,.78,18),robe);body.position.y=.45;g.add(body);
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.2,.04,6,18),new THREE.MeshStandardMaterial({color:o.collar||0xf3eee4}));collar.rotation.x=Math.PI/2;collar.position.y=.83;g.add(collar);
  const skin=new THREE.MeshStandardMaterial({color:o.skin,roughness:.7});
  const head=new THREE.Group();head.position.y=1.12;g.add(head);
  head.add(new THREE.Mesh(new THREE.SphereGeometry(.36,24,18),skin));
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.385,24,16,0,Math.PI*2,0,Math.PI*.55),new THREE.MeshStandardMaterial({color:o.hair,roughness:.9}));hair.rotation.x=-.4;head.add(hair);
  if(o.bun){const b=new THREE.Mesh(new THREE.SphereGeometry(.14,12,10),hair.material);b.position.set(0,.18,-.33);head.add(b);}
  const eyeM=new THREE.MeshBasicMaterial({color:0x221510});
  for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),eyeM);e.position.set(s*.12,.02,.33);e.scale.y=1.25;head.add(e);
    const bl=new THREE.Mesh(new THREE.CircleGeometry(.05,12),new THREE.MeshBasicMaterial({color:0xff9a9a,transparent:true,opacity:.55}));bl.position.set(s*.2,-.08,.31);bl.rotation.y=s*.5;head.add(bl);}
  const veil=new THREE.Mesh(new THREE.SphereGeometry(.43,22,14,0,Math.PI*2,0,Math.PI*.62),new THREE.MeshStandardMaterial({color:0xfdfaf2,transparent:true,opacity:.6,side:THREE.DoubleSide,roughness:.9}));
  veil.rotation.x=-.55;veil.position.y=.02;veil.visible=!!o.veil;head.add(veil);
  const handL=new THREE.Mesh(new THREE.SphereGeometry(.085,10,8),skin),handR=handL.clone();
  handL.position.set(-.36,.5,.05);handR.position.set(.36,.5,.05);g.add(handL,handR);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.42,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.28,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;g.add(shadow);
  const beads=new THREE.Group();beads.visible=false;beads.position.set(0,.7,.3);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const b=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),new THREE.MeshStandardMaterial({color:0x8a5a2a,emissive:0}));b.position.set(Math.cos(a)*.13,Math.sin(a)*.13-.1,0);beads.add(b);}
  g.add(beads);
  return {g,body,head,handL,handR,veil,shadow,beads};
}
const SPOTS={
  kneel:[-3,-2,-1,1,2,3].map(x=>({x,z:-26.5,h:Math.PI,occ:null})),
  rack:[-11,-10.2,-9.4,-8.6].map(x=>({x,z:-25.4,h:Math.PI,occ:null})),
  tree:[8.4,9.4,10.4,11.4].map(x=>({x,z:-25.4,h:Math.PI,occ:null})),
  booth:[{x:-11.6,z:4,h:-Math.PI/2,occ:null}],
  offer:[{x:3.8,z:-25.2,h:Math.PI,occ:null}]
};
class Person{
  constructor(o){this.av=makeAvatar(o);this.g=this.av.g;scene.add(this.g);this.pos=new THREE.Vector3(o.x,0,o.z);this.heading=o.h??Math.PI;this.targetHeading=this.heading;
    this.path=[];this.speed=o.speed||2.4;this.t=Math.random()*10;this.name=o.name;this.seat=null;this.spot=null;this.pose='stand';this.praying=false;this.holding=false;this.cross=0;this.onArrive=null;this.cool=rand(3,20);this.isPlayer=!!o.player;
    this.nameL=addLabel(this.g,esc(o.name),'name',o.player?1.95:1.85);this.g.position.copy(this.pos);}
  release(){if(this.seat){this.seat.occ=null;this.seat=null;}if(this.spot){this.spot.occ=null;this.spot=null;}this.pose='stand';this.praying=false;this.holding=false;}
  goTo(dest,cb,keepReserve){this.release();if(keepReserve){keepReserve.occ=this;}
    this.path=route({x:this.pos.x,z:this.pos.z},dest);this.onArrive=()=>{if(dest.h!==undefined)this.targetHeading=dest.h;cb&&cb();};}
  sitAt(s){this.seat=s;s.occ=this;this.pose='sit';this.pos.set(s.x,0,s.z+.02);this.targetHeading=Math.PI;}
  update(dt){
    this.t+=dt;let moving=false;
    if(this.path.length){const p=this.path[0];const dx=p.x-this.pos.x,dz=p.z-this.pos.z,d=Math.hypot(dx,dz);
      if(d<.06){this.path.shift();if(!this.path.length){const f=this.onArrive;this.onArrive=null;f&&f();}}
      else{const s=Math.min(d,this.speed*dt);this.pos.x+=dx/d*s;this.pos.z+=dz/d*s;this.targetHeading=Math.atan2(dx,dz);moving=true;}}
    moving=moving||this.keyMove;this.moving=moving;
    let diff=this.targetHeading-this.heading;diff=Math.atan2(Math.sin(diff),Math.cos(diff));this.heading+=diff*Math.min(1,dt*9);
    const av=this.av;let y=0,bs=1;let tl=[-.36,.5,.05],tr=[.36,.5,.05];
    if(moving){y=Math.abs(Math.sin(this.t*11))*.06;const sw=Math.sin(this.t*11)*.13;tl=[-.37,.5,.05+sw];tr=[.37,.5,.05-sw];}
    else if(this.pose==='sit')y=.37;
    else if(this.pose==='kneel'){y=-.2;bs=.85;}
    if(!moving&&this.praying){tl=[-.06,.8,.32];tr=[.06,.8,.32];}
    if(!moving&&this.holding){tl=[-.52,.62,.12];tr=[.52,.62,.12];}
    if(this.cross>0){this.cross-=dt;const k=1-this.cross/2.4;const P=[[.05,1.36,.38],[.05,.72,.36],[-.2,.95,.33],[.22,.95,.33],[.06,.8,.32]];
      const seg=Math.min(3,Math.floor(k*4)),u=k*4-seg;const a=P[seg],b=P[seg+1];tr=[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];tl=[-.1,.75,.3];
      if(this.cross<=0)this.praying=true;}
    const k=Math.min(1,dt*10);
    av.handL.position.set(lerp(av.handL.position.x,tl[0],k),lerp(av.handL.position.y,tl[1],k),lerp(av.handL.position.z,tl[2],k));
    av.handR.position.set(lerp(av.handR.position.x,tr[0],k),lerp(av.handR.position.y,tr[1],k),lerp(av.handR.position.z,tr[2],k));
    av.body.scale.y=lerp(av.body.scale.y,bs,k);
    av.head.rotation.x=lerp(av.head.rotation.x,(this.praying&&!moving)?.28:0,k);
    av.head.rotation.z=musicOn&&!moving&&this.pose==='sit'?Math.sin(this.t*1.3)*.04:0;
    this.g.position.set(this.pos.x,y,this.pos.z);this.g.rotation.y=this.heading;av.shadow.position.y=.015-y;
  }
}

/* ================= NAVIGATION ================= */
const BL={x0:1.3,x1:6.35,z0:-23.0,z1:24.5};
function zone(p){if(p.z<BL.z0)return'F';if(p.z>BL.z1)return'B';const a=Math.abs(p.x);if(a<BL.x0)return'A';if(a>BL.x1)return p.x<0?'SL':'SR';return p.x<0?'KL':'KR';}
const JF=-24.1,JB=25.5;
function legs(P,Z,jz){if(Z==='A')return[{x:P.x,z:jz}];if(Z==='SL'||Z==='SR'){const sx=Math.sign(P.x)*Math.max(Math.abs(P.x),7.9);return[{x:sx,z:P.z},{x:sx,z:jz}];}return[];}
function route(a,b){
  const pts=[];let za=zone(a),zb=zone(b);let A={x:a.x,z:a.z};
  if(za==='KL'||za==='KR'){A={x:za==='KL'?-.5:.5,z:a.z};pts.push(A);za='A';}
  let T={x:b.x,z:b.z},extra=null;
  if(zb==='KL'||zb==='KR'){extra=T;T={x:zb==='KL'?-.5:.5,z:b.z};zb='A';}
  if(za===zb)pts.push(T);
  else if((za==='F'&&zb==='B')||(za==='B'&&zb==='F')){const j1=za==='F'?JF:JB,j2=za==='F'?JB:JF;pts.push({x:0,z:j1},{x:0,z:j2},T);}
  else{const jz=(za==='F'||zb==='F')?JF:(za==='B'||zb==='B')?JB:((A.z+T.z)/2<0?JF:JB);
    pts.push(...legs(A,za,jz));pts.push(...legs(T,zb,jz).reverse());pts.push(T);}
  if(extra)pts.push(extra);return pts;
}
const obstacles=[...columns,{x:TREE.x,z:TREE.z,r:2.5},{x:RACK.x,z:RACK.z-.2,r:1.75},{x:BOOTH.x,z:BOOTH.z,r:1.5},{x:OFFER.x,z:OFFER.z,r:.6}];
function collide(p){
  p.x=Math.max(-13.4,Math.min(13.4,p.x));p.z=Math.max(-26.6,Math.min(37.3,p.z));
  for(const o of obstacles){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz);if(d<o.r&&d>0){p.x=o.x+dx/d*o.r;p.z=o.z+dz/d*o.r;}}
  for(const s of[-1,1]){const x0=s<0?-BL.x1:BL.x0,x1=s<0?-BL.x0:BL.x1;
    if(p.x>x0&&p.x<x1&&p.z>BL.z0&&p.z<BL.z1){const opts=[[p.x-x0,'x',x0],[x1-p.x,'x',x1],[p.z-BL.z0,'z',BL.z0],[BL.z1-p.z,'z',BL.z1]].sort((a,b)=>a[0]-b[0]);
      if(opts[0][1]==='x')p.x=opts[0][2];else p.z=opts[0][2];}}
}

/* ================= PEOPLE ================= */
const NAMES=['Maria Lan','Giuse Minh','Anna Thảo','Phêrô Hùng','Têrêsa Vy','Gioan Bảo','Cecilia Hằng','Phaolô Tuấn','Lucia Mai','Đaminh Khang','Agnes Ngọc','Antôn Phúc','Rosa Linh','Micae Quân','Martha Hương','Phanxicô Nam','Elisabeth Trang','Vinh Sơn Đức','Catarina Yến','Tôma An','Monica Hạnh','Gabriel Long','Clara Nhi','Simon Tâm','Isave Thu','Luca Kiên'];
const people=[];const npcs=[];
const BUBBLES=['Bình an cho bạn ✨','Amen 🙏','Chúc mọi người an lành','Cầu cho bà nội 🕯️','Giáng sinh an lành 🎄','Cảm ơn vì hôm nay','Xin chào mọi người 👋','Bình an trong tâm hồn','Cầu cho gia đình con','Tạ ơn 🌿','Mọi người ngủ ngon nhé 🌙','Hôm nay con thấy nhẹ lòng hơn'];
NAMES.forEach((nm,i)=>{
  const female=i%2===0;
  const p=new Person({name:nm,robe:pick(ROBES),skin:pick(SKIN),hair:pick(HAIR),veil:female&&Math.random()<.45,bun:female&&Math.random()<.5,x:rand(-1,1),z:rand(26,34),speed:rand(1.8,2.6)});
  npcs.push(p);people.push(p);
  if(i<15){const free=seats.filter(s=>!s.occ);const s=pick(free);p.sitAt(s);p.heading=Math.PI;if(Math.random()<.4)p.praying=true;p.cool=rand(8,50);}
  else p.cool=rand(.5,8);
});
// choir
const choir=[];
for(let r=0;r<2;r++)for(let i=0;i<4;i++){const c=new Person({name:'',robe:0xf3eee4,collar:0xa31f2b,skin:pick(SKIN),hair:pick(HAIR),x:5.6+i*.9+r*.4,z:-30.2-r*1.1,h:-Math.PI*.72});
  c.nameL.el.remove();labels.splice(labels.indexOf(c.nameL),1);c.choir=true;c.pos.y=0;choir.push(c);}
function npcThink(n){
  const r=Math.random();
  const freeSpot=k=>{const f=SPOTS[k].filter(s=>!s.occ);return f.length?pick(f):null;};
  if(r<.42){const f=seats.filter(s=>!s.occ);const s=pick(f);n.goTo({x:s.x,z:s.z},()=>{n.sitAt(s);if(Math.random()<.5)n.praying=true;},s);n.cool=rand(25,60);}
  else if(r<.58){const sp=freeSpot('rack');if(!sp)return n.cool=3;n.goTo(sp,()=>{n.spot=sp;n.praying=true;setTimeout(()=>{if(n.spot===sp){lightCandle();n.praying=false;}},2200);},sp);n.cool=rand(8,14);}
  else if(r<.72){const sp=freeSpot('kneel');if(!sp)return n.cool=3;n.goTo(sp,()=>{n.spot=sp;n.pose='kneel';n.praying=true;},sp);n.cool=rand(12,25);}
  else if(r<.84){const sp=freeSpot('tree');if(!sp)return n.cool=3;n.goTo(sp,()=>{n.spot=sp;},sp);n.cool=rand(6,12);}
  else if(r<.9){const sp=freeSpot('booth');if(!sp)return n.cool=3;n.goTo(sp,()=>{n.spot=sp;n.praying=true;setTimeout(()=>{if(n.spot===sp)floater(new THREE.Vector3(BOOTH.x+.9,2.8,BOOTH.z),{glow:0xfff0c0,size:1,vy:1.6,life:6});},2500);},sp);n.cool=rand(8,14);}
  else{const pts=[{x:rand(-.8,.8),z:rand(-20,30)},{x:rand(8.5,13),z:rand(-20,34)},{x:rand(-13,-8.5),z:rand(-20,34)},{x:rand(-6,6),z:rand(26,36)}];n.goTo(pick(pts));n.cool=rand(5,12);}
}

/* ================= PLAYER ================= */
let player=null;let playerName='Khách';let playerRobe=ROBES[0];
const keys={};
addEventListener('keydown',e=>{if(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;keys[e.key.toLowerCase()]=true;});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
/* Joystick cảm ứng: kéo núm theo hướng muốn đi (so với camera), kéo càng xa đi càng nhanh. */
const joy={x:0,y:0,id:null};
(function(){const el=$('#joy'),base=$('#joyBase'),knob=$('#joyKnob');let cx=0,cy=0,R=1;
  if(matchMedia('(pointer:coarse)').matches)$('#helpTip').textContent='Kéo nút tròn hoặc chạm sàn để đi • Kéo màn hình để xoay';
  const set=(x,y)=>{const l=Math.hypot(x,y),k=l>R?R/l:1;x*=k;y*=k;knob.style.transform='translate('+x+'px,'+y+'px)';
    if(l/R<.15){joy.x=joy.y=0;}else{joy.x=x/R;joy.y=y/R;}};
  base.addEventListener('pointerdown',e=>{if(joy.id!==null)return;e.preventDefault();joy.id=e.pointerId;try{base.setPointerCapture(e.pointerId);}catch(_){}
    const r=base.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;R=r.width/2-14;el.classList.add('on');set(e.clientX-cx,e.clientY-cy);});
  base.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)set(e.clientX-cx,e.clientY-cy);});
  const end=e=>{if(e.pointerId!==joy.id)return;joy.id=null;joy.x=joy.y=0;knob.style.transform='';el.classList.remove('on');};
  base.addEventListener('pointerup',end);base.addEventListener('pointercancel',end);base.addEventListener('lostpointercapture',end);
})();
function playerUpdate(dt){
  let fx=0,fz=0,sp=1;
  if(keys['w']||keys['arrowup'])fz-=1;if(keys['s']||keys['arrowdown'])fz+=1;if(keys['a']||keys['arrowleft'])fx-=1;if(keys['d']||keys['arrowright'])fx+=1;
  if(!fx&&!fz&&(joy.x||joy.y)){fx=joy.x;fz=joy.y;sp=Math.max(.4,Math.min(1,Math.hypot(fx,fz)));}
  player.keyMove=false;
  if(fx||fz){
    if(player.pose!=='stand'||player.seat||player.spot)player.release();player.path=[];player.onArrive=null;stopRosary(true);
    const sy=Math.sin(camYaw),cy=Math.cos(camYaw);const dx=fx*cy+fz*sy,dz=-fx*sy+fz*cy;const l=Math.hypot(dx,dz);
    player.pos.x+=dx/l*3*sp*dt;player.pos.z+=dz/l*3*sp*dt;player.targetHeading=Math.atan2(dx,dz);player.keyMove=true;collide(player.pos);
  }
}
function act(dest,cb){player.goTo(dest,cb,dest.occ!==undefined?dest:null);}

/* ================= CAMERA & INPUT ================= */
let camYaw=0,camPitch=.3,camDist=7.5,introT=-1;const camPos=new THREE.Vector3(0,10,37),camLook=new THREE.Vector3(0,6,-30);
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
let down=null;const cv=$('#c');
cv.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,drag:false,id:e.pointerId};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;
  if(!down.drag&&Math.hypot(dx,dy)>6)down.drag=true;
  if(down.drag){camYaw-=(e.movementX||0)*.006;camPitch=Math.max(.05,Math.min(1.2,camPitch+(e.movementY||0)*.004));
    if(!e.movementX&&!e.movementY){camYaw-=(dx-(down.lx||0))*.006;down.lx=dx;}}});
cv.addEventListener('pointerup',e=>{if(down&&!down.drag&&player&&introT>=3.5)tapFloor(e.clientX,e.clientY);down=null;});
cv.addEventListener('wheel',e=>{camDist=Math.max(3,Math.min(16,camDist+e.deltaY*.01));e.preventDefault();},{passive:false});
function tapFloor(x,y){ndc.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(ndc,camera);const p=new THREE.Vector3();
  if(ray.ray.intersectPlane(floorPlane,p)){collide(p);stopRosary(true);player.goTo({x:p.x,z:p.z});
    const m=new THREE.Object3D();m.position.set(p.x,.1,p.z);scene.add(m);floater(m.position,{glow:0xffe7b0,size:.7,vy:.4,life:.9});scene.remove(m);}}
function updateCamera(dt){
  const tx=player?player.pos.x:0,tz=player?player.pos.z:33,ty=1.25+(player&&player.pose==='sit'?.3:0);
  const cp=Math.cos(camPitch);let x=tx+Math.sin(camYaw)*cp*camDist,y=ty+Math.sin(camPitch)*camDist,z=tz+Math.cos(camYaw)*cp*camDist;
  x=Math.max(-13.3,Math.min(13.3,x));z=Math.max(-33,Math.min(37.6,z));y=Math.max(.6,Math.min(Math.abs(x)>6.4?11.4:20,y));
  const want=new THREE.Vector3(x,y,z),look=new THREE.Vector3(tx,ty,tz);
  if(introT>=0&&introT<3.5){const k=introT/3.5,s=k*k*(3-2*k);want.lerpVectors(new THREE.Vector3(0,9.5,37),want,s);look.lerpVectors(new THREE.Vector3(0,6,-30),look,s);}
  if(introT<0){const t=performance.now()/1000;want.set(Math.sin(t*.08)*3,8+Math.sin(t*.1),30);look.set(0,6,-30);}
  const k=1-Math.exp(-dt*6);camPos.lerp(want,k);camLook.lerp(look,k);camera.position.copy(camPos);camera.lookAt(camLook);
}

/* ================= AUDIO ================= */
let AC=null,master,musicGain,sfxGain,musicOn=true,soundOn=true,songNode=null,songTimer=null;
function initAudio(){
  try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  master=AC.createGain();master.gain.value=.85;master.connect(AC.destination);
  const rv=AC.createConvolver();const len=AC.sampleRate*3.8,b=AC.createBuffer(2,len,AC.sampleRate);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
  rv.buffer=b;const wet=AC.createGain();wet.gain.value=.5;rv.connect(wet);wet.connect(master);
  musicGain=AC.createGain();musicGain.gain.value=.3;musicGain.connect(master);musicGain.connect(rv);
  sfxGain=AC.createGain();sfxGain.gain.value=.6;sfxGain.connect(master);sfxGain.connect(rv);
}
const mtof=m=>440*Math.pow(2,(m-69)/12);
function organ(m,t,dur,vol,dest){
  const g=AC.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.07);g.gain.setValueAtTime(vol,t+Math.max(.08,dur-.08));g.gain.linearRampToValueAtTime(0,t+dur+.25);
  const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=2200;f.connect(g);g.connect(dest);
  [[1,.6,'sine'],[2,.3,'sine'],[4,.1,'sine'],[.5,.22,'triangle'],[3,.07,'sine']].forEach(([r,a,ty])=>{const o=AC.createOscillator();o.type=ty;o.frequency.value=mtof(m)*r;const og=AC.createGain();og.gain.value=a;o.connect(og);og.connect(f);o.start(t);o.stop(t+dur+.35);});
}
// Melody: "Silent Night" (Franz Gruber, 1818 – public domain)
const MEL=[[67,1.5],[69,.5],[67,1],[64,3],[67,1.5],[69,.5],[67,1],[64,3],[74,2],[74,1],[71,3],[72,2],[72,1],[67,3],[69,2],[69,1],[72,1.5],[71,.5],[69,1],[67,1.5],[69,.5],[67,1],[64,3],[69,2],[69,1],[72,1.5],[71,.5],[69,1],[67,1.5],[69,.5],[67,1],[64,3],[74,2],[74,1],[77,1.5],[74,.5],[71,1],[72,3],[76,3],[72,1.5],[67,.5],[64,1],[67,1.5],[65,.5],[62,1],[60,3],[0,3]];
const CHORD={C:[36,52,55,60],G:[43,50,55,59],F:[41,53,57,60]};
const PROG='CCCCGGCCFFCCFFCCGGCCCGCC'.split('');
function playSong(){
  if(!AC||!musicOn)return;const sg=AC.createGain();sg.connect(musicGain);songNode=sg;const U=.64;let t=AC.currentTime+.3;const t0=t;
  MEL.forEach(([m,d])=>{if(m)organ(m,t,d*U*.94,.12,sg);t+=d*U;});
  PROG.forEach((c,i)=>CHORD[c].forEach(m=>organ(m,t0+i*3*U,3*U*.98,.04,sg)));
  songTimer=setTimeout(()=>{if(musicOn)playSong();},(t-AC.currentTime+6)*1000);
}
function stopSong(){clearTimeout(songTimer);if(songNode&&AC){const n=songNode;n.gain.setTargetAtTime(0,AC.currentTime,.25);setTimeout(()=>n.disconnect(),2500);songNode=null;}}
function bell(t,base,vol){[.5,1,1.19,1.56,2,2.51,2.66,3.01].forEach((r,i)=>{const o=AC.createOscillator();o.frequency.value=base*r;const g=AC.createGain();const v=vol/(i+1)*1.5;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+4.6-i*.3);o.connect(g);g.connect(sfxGain);o.start(t);o.stop(t+5);});}
function bells(n){if(!AC)return;for(let i=0;i<n;i++)bell(AC.currentTime+.1+i*1.5,i%2?196:262,.16);}
function chime(){if(!AC)return;[1047,1319,1568,2093].forEach((f,i)=>{const t=AC.currentTime+i*.09;const o=AC.createOscillator();o.type='sine';o.frequency.value=f;const g=AC.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.08,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+1.6);o.connect(g);g.connect(sfxGain);o.start(t);o.stop(t+1.7);});}
function coin(){if(!AC)return;[2400,3200].forEach((f,i)=>{const t=AC.currentTime+.35+i*.08;const o=AC.createOscillator();o.type='triangle';o.frequency.value=f;const g=AC.createGain();g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.0001,t+.5);o.connect(g);g.connect(sfxGain);o.start(t);o.stop(t+.55);});}

/* ================= TIME OF DAY ================= */
const TOD=[
  {n:'Ban ngày',i:'☀️',hemi:.42,sun:.85,sunC:0xffe0b0,win:1.1,shaft:.2,ch:.75,big:.22,fog:0x3a2e22,exp:.82,dust:.6},
  {n:'Hoàng hôn',i:'🌅',hemi:.28,sun:.7,sunC:0xff9a55,win:.85,shaft:.16,ch:1.0,big:.32,fog:0x3a2214,exp:.85,dust:.45},
  {n:'Ban đêm',i:'🌙',hemi:.09,sun:0,sunC:0x8899ff,win:.22,shaft:0,ch:1.6,big:.5,fog:0x0b0c14,exp:1.0,dust:.25}
];
let todI=0;const todCur={...TOD[0]};const _c1=new THREE.Color(),_c2=new THREE.Color();
function updateTOD(dt){const T=TOD[todI],k=Math.min(1,dt*1.5);
  ['hemi','sun','win','shaft','ch','big','exp','dust'].forEach(p=>todCur[p]=lerp(todCur[p],T[p],k));
  hemi.intensity=todCur.hemi;sun.intensity=todCur.sun;sun.color.lerp(_c1.setHex(T.sunC),k);
  glassMats.forEach(m=>m.color.setScalar(todCur.win));shaftMat.opacity=todCur.shaft;dustMat.opacity=todCur.dust;
  chLights.forEach(c=>{c.pl.intensity=todCur.ch;c.big.material.opacity=todCur.big;});
  scene.fog.color.lerp(_c2.setHex(T.fog),k);scene.background.copy(scene.fog.color);renderer.toneMappingExposure=todCur.exp;}

/* ================= UI ================= */
const modal=$('#modal'),mCard=$('#mCard');
function openModal(html){mCard.innerHTML='<button class="x" data-close>✕</button>'+html;modal.classList.remove('hidden');}
function closeModal(){modal.classList.add('hidden');}
modal.addEventListener('click',e=>{if(e.target===modal||e.target.hasAttribute('data-close'))closeModal();});
let toastT;function toast(m){const t=$('#toast');t.innerHTML=m;t.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>t.style.opacity=0,3200);}
let verseT;function verse(m,ms){const v=$('#verse');v.textContent=m;v.style.opacity=1;clearTimeout(verseT);verseT=setTimeout(()=>v.style.opacity=0,ms||6000);}
const VERSES=['Xin cho lòng con được bình an, như ngọn nến nhỏ vẫn sáng giữa đêm dài.','Xin chúc lành cho những người con thương, dù gần hay xa.','Cảm ơn vì một ngày mới, vì hơi thở, vì những bàn tay đã nâng đỡ con.','Xin xoa dịu những vết thương không ai nhìn thấy.','Xin dạy con biết tha thứ, và biết tha thứ cho chính mình.','Giữa ồn ào, xin cho con một khoảng lặng để nghe lòng mình.','Xin cho người đã khuất được nghỉ ngơi trong ánh sáng dịu hiền.','Xin cho con đủ can đảm cho ngày mai, và đủ dịu dàng cho hôm nay.'];
const INTENTS=[{k:'love',t:'💗 Cho người con thương',v:'Xin chúc lành và gìn giữ người con thương.'},{k:'heal',t:'🌿 Cầu bình an, sức khoẻ',v:'Xin ban sức khoẻ và bình an cho người đang mệt mỏi.'},{k:'gone',t:'🕊️ Tưởng nhớ người đã khuất',v:'Xin cho người đã khuất được an nghỉ trong ánh sáng.'},{k:'thanks',t:'🌼 Tạ ơn',v:'Cảm ơn vì tất cả những điều tốt đẹp con đã nhận.'}];
const GIFTS=[['🕊️','Một ngày thật bình yên'],['💌','Một lời hỏi thăm từ người bạn cũ'],['🌈','Sau cơn mưa, trời sẽ sáng'],['🍞','Một bữa cơm ấm cùng gia đình'],['⭐','Một điều ước nhỏ sắp thành'],['🌱','Một khởi đầu mới thật nhẹ nhàng'],['😊','Nụ cười của người bạn thương'],['🎶','Một bài hát làm bạn nhớ mãi'],['🧣','Hơi ấm giữa mùa đông'],['💛','Bạn được yêu thương nhiều hơn bạn nghĩ']];

function needPlayer(){return player&&introT>=3.5;}
document.querySelectorAll('.tb').forEach(b=>b.addEventListener('click',()=>{if(!needPlayer())return;const a=b.dataset.a;ACTIONS[a]&&ACTIONS[a](b);}));
const ACTIONS={
  candle(){
    let sel=0;
    openModal(`<h2>Thắp một ngọn nến</h2><p>Bạn thắp nến cho ai, hay vì điều gì?</p>${INTENTS.map((x,i)=>`<button class="opt ${i?'':'on'}" data-i="${i}">${x.t}</button>`).join('')}
      <input id="cName" maxlength="30" placeholder="Tên người bạn muốn gửi gắm (không bắt buộc)" style="margin-top:6px"><button class="btn" id="cGo">Thắp nến 🕯️</button>`);
    mCard.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{mCard.querySelectorAll('.opt').forEach(x=>x.classList.remove('on'));o.classList.add('on');sel=+o.dataset.i;});
    $('#cGo').onclick=()=>{const nm=$('#cName').value.trim();const it=INTENTS[sel];closeModal();
      const sp=SPOTS.rack.find(s=>!s.occ)||SPOTS.rack[0];if(sp.occ&&sp.occ!==player){sp.occ.release();sp.occ.cool=1;}
      toast('Bạn đang đi đến giá nến…');
      act(sp,()=>{player.spot=sp;player.praying=true;setTimeout(()=>{lightCandle(nm?nm:it.t.replace(/^\S+\s/,''),true);chime();HiHi.emit('emote','candle');verse(it.v,5000);toast('Ngọn nến của bạn đã được thắp ✨');chatEvent('candle',{w:nm||'ai đó'});setTimeout(()=>{if(player.spot===sp)player.praying=false;},3000);},1400);});};
  },
  pray(){chatEvent('pray');HiHi.emit('emote','cross');player.path=[];player.cross=2.4;player.praying=false;chime();setTimeout(()=>verse(pick(VERSES),6500),1600);setTimeout(()=>{if(player.pose!=='kneel'&&!rosaryOn)player.praying=false;},9000);},
  rosary(){if(rosaryOn){stopRosary();return;}startRosary();},
  sit(){const free=seats.filter(s=>!s.occ);free.sort((a,b)=>Math.hypot(a.x-player.pos.x,a.z-player.pos.z)-Math.hypot(b.x-player.pos.x,b.z-player.pos.z));
    const s=free[0];if(!s)return toast('Hết chỗ ngồi rồi');s.occ=player;player.goTo({x:s.x,z:s.z},()=>{player.sitAt(s);toast('Bạn đã ngồi xuống. Hãy thư giãn và lắng nghe tiếng organ 🎵');if(Math.random()<.6)chatEvent('sit');},s);},
  kneel(){const sp=SPOTS.kneel.filter(s=>!s.occ).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x))[0];if(!sp)return toast('Bàn thờ đang đông, thử lại sau nhé');
    act(sp,()=>{player.spot=sp;player.pose='kneel';player.praying=true;verse(pick(VERSES),6500);chatEvent('kneel');});},
  together(){
    const cand=npcs.filter(n=>!n.partner&&!n.path.length).sort((a,b)=>a.pos.distanceTo(player.pos)-b.pos.distanceTo(player.pos))[0];
    if(!cand)return toast('Chưa có ai rảnh, thử lại sau nhé');
    if(player.pose!=='stand')player.release();player.path=[];
    const h=player.heading;const right={x:Math.cos(h),z:-Math.sin(h)};
    const dest={x:player.pos.x+right.x*.98,z:player.pos.z+right.z*.98};collide(dest);
    toast(esc(cand.name)+' đang đến cầu nguyện cùng bạn 🤝');addLabel(cand.g,'Mình cùng cầu nguyện nhé 🙏','bubble',2.2,3500);
    cand.partner=true;cand.goTo(dest,()=>{cand.targetHeading=h;player.targetHeading=h;cand.holding=true;player.holding=true;cand.cool=12;chatEvent('together',{n:cand.name,npc:cand});
      const ring=new THREE.Mesh(new THREE.RingGeometry(.9,1.25,40),new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));
      ring.rotation.x=-Math.PI/2;ring.position.set((player.pos.x+cand.pos.x)/2,.03,(player.pos.z+cand.pos.z)/2);scene.add(ring);chime();verse('Ở đâu có hai ba người hợp lòng cầu nguyện, ở đó có bình an.',6000);
      let t=0;const iv=setInterval(()=>{t+=.05;ring.material.opacity=.6*Math.max(0,1-t/8)*(0.7+.3*Math.sin(t*4));ring.scale.setScalar(1+Math.sin(t*2)*.05);
        if(t>8){clearInterval(iv);scene.remove(ring);ring.geometry.dispose();cand.holding=false;player.holding=false;cand.partner=false;addLabel(cand.g,'Bình an cho bạn ✨','bubble',2.2,3000);}},50);
    });
  },
  veil(){player.av.veil.visible=!player.av.veil.visible;HiHi.emit('look');toast(player.av.veil.visible?'Bạn đã đội khăn voan':'Bạn đã bỏ khăn voan');if(Math.random()<.7)chatEvent(player.av.veil.visible?'veil':'veiloff');},
  confide(){
    openModal(`<h2>Góc tâm sự</h2><p>Viết ra điều đang đè nặng trong lòng. Khi bạn gửi đi, nó sẽ hoá thành ánh sáng bay lên và biến mất. Không ai đọc được, không lưu lại ở đâu cả.</p>
      <textarea id="cfTxt" rows="5" maxlength="400" placeholder="Hôm nay mình…"></textarea><button class="btn" id="cfGo">Thả lên trời 🕊️</button>`);
    $('#cfGo').onclick=()=>{const txt=$('#cfTxt').value.trim();closeModal();const sp=SPOTS.booth[0];if(sp.occ&&sp.occ!==player){sp.occ.release();sp.occ.cool=1;}
      act(sp,()=>{player.spot=sp;player.praying=true;setTimeout(()=>{
        floater(new THREE.Vector3(BOOTH.x+1,2.6,BOOTH.z),{glow:0xfff2c8,size:1.6,vy:1.4,life:7,html:txt?esc(txt.slice(0,60))+(txt.length>60?'…':''):'',cls:'glowtxt',offY:.6});
        chatEvent('confide');HiHi.emit('emote','confide');chime();verse('Bạn đã buông xuống được một chút. Hãy nhẹ nhàng với chính mình nhé.',6000);player.praying=false;},2000);});};
  },
  tree(){
    openModal(`<h2>Cây thông Giáng sinh</h2><p>Mở một món quà nhỏ dưới gốc cây, hoặc viết thư gửi ông già Noel.</p>
      <button class="opt" id="tGift">🎁 Mở một món quà</button><button class="opt" id="tLetter">✉️ Viết thư gửi ông già Noel</button>`);
    $('#tGift').onclick=()=>{closeModal();const sp=SPOTS.tree.find(s=>!s.occ)||SPOTS.tree[0];if(sp.occ&&sp.occ!==player){sp.occ.release();sp.occ.cool=1;}
      act(sp,()=>{player.spot=sp;const g=pick(GIFTS);chime();confetti();chatEvent('gift',{g:g[1].toLowerCase()});HiHi.emit('emote','gift');const pr=pick(presents);pr.position.y+=.25;setTimeout(()=>pr.position.y-=.25,600);
        openModal(`<div class="gift">${g[0]}</div><div class="blessing">${g[1]}</div><p style="text-align:center">Món quà hôm nay dành cho bạn 🎄</p><div style="text-align:center"><button class="btn" data-close>Cảm ơn</button></div>`);});};
    $('#tLetter').onclick=()=>{openModal(`<h2>Thư gửi ông già Noel</h2><p>Năm nay bạn mong điều gì?</p><textarea id="lTxt" rows="5" maxlength="300" placeholder="Ông già Noel thân mến…"></textarea><button class="btn" id="lGo">Gửi thư ✉️</button>`);
      $('#lGo').onclick=()=>{closeModal();const sp=SPOTS.tree.find(s=>!s.occ)||SPOTS.tree[0];if(sp.occ&&sp.occ!==player){sp.occ.release();sp.occ.cool=1;}
        act(sp,()=>{player.spot=sp;floater(new THREE.Vector3(TREE.x,8.4,TREE.z),{html:'✉️',vy:1.2,life:5,vx:.6,glow:0xffe08a,size:.8});chime();toast('Lá thư của bạn đã bay đến Bắc Cực 🎅');chatEvent('letter');});};};
  },
  offer(){const sp=SPOTS.offer[0];act(sp,()=>{player.spot=sp;coin();for(let i=0;i<5;i++)setTimeout(()=>floater(new THREE.Vector3(OFFER.x+rand(-.3,.3),1.2,OFFER.z+.2),{html:pick(['💛','✨','🤍']),vy:rand(.8,1.4),life:2.6,vx:.4}),i*160);
    toast('Cảm ơn tấm lòng của bạn 💛');chatEvent('offer');HiHi.emit('emote','offer');setTimeout(()=>{if(player.spot===sp)player.release();},1500);});}
};
function confetti(){for(let i=0;i<28;i++){const s=document.createElement('div');s.className='conf';s.textContent=pick(['✨','⭐','❄️','🎉','💫']);s.style.left=rand(5,95)+'vw';s.style.top=rand(-5,20)+'vh';s.style.animationDelay=rand(0,.6)+'s';document.body.appendChild(s);setTimeout(()=>s.remove(),3200);}}

// rosary
let rosaryOn=false,rosaryN=0;const beadsEl=$('#beads');for(let i=0;i<10;i++)beadsEl.appendChild(document.createElement('i'));
function startRosary(){if(Math.random()<.5)chatEvent('rosary');rosaryOn=true;rosaryN=0;player.path=[];player.praying=true;player.av.beads.visible=true;$('#rosary').classList.remove('hidden');renderBeads();document.querySelector('[data-a=rosary]').classList.add('on');verse('Mỗi hạt chuỗi là một hơi thở chậm. Hãy để lòng lắng lại.',5000);}
function stopRosary(silent){if(!rosaryOn)return;rosaryOn=false;player.av.beads.visible=false;if(player.pose!=='kneel')player.praying=false;$('#rosary').classList.add('hidden');document.querySelector('[data-a=rosary]').classList.remove('on');}
function renderBeads(){[...beadsEl.children].forEach((b,i)=>b.classList.toggle('done',i<rosaryN));$('#rTxt').textContent=rosaryN<10?`Hạt ${rosaryN} / 10`:'Hoàn thành một chục ✨';
  player.av.beads.children.forEach((b,i)=>b.material.emissive.setHex(i<rosaryN?0xffb040:0));}
$('#rNext').onclick=()=>{if(rosaryN>=10){rosaryN=0;}rosaryN++;renderBeads();chime();if(rosaryN===10){verse('Cảm ơn bạn đã dành thời gian cho sự tĩnh lặng.',5000);burst(player.g);}};
$('#rEnd').onclick=()=>stopRosary();

// top bar
$('#bMusic').onclick=()=>{musicOn=!musicOn;$('#bMusic').classList.toggle('off',!musicOn);if(musicOn)playSong();else stopSong();};
$('#bSound').onclick=()=>{soundOn=!soundOn;$('#bSound').textContent=soundOn?'🔊':'🔇';if(master)master.gain.setTargetAtTime(soundOn?.85:0,AC.currentTime,.1);};
$('#bTime').onclick=()=>{todI=(todI+1)%3;$('#bTime').textContent=TOD[todI].i;toast(TOD[todI].n);if(todI===2)bells(2);chatEvent(todI===2?'night':todI===0?'day':'x');};
$('#bShot').onclick=()=>{renderer.render(scene,camera);const url=renderer.domElement.toDataURL('image/png');const a=document.createElement('a');a.href=url;a.download='thanh-duong-hihi.png';a.click();
  const f=$('#flash');f.style.transition='none';f.style.opacity=.8;requestAnimationFrame(()=>{f.style.transition='opacity .6s';f.style.opacity=0;});toast('Đã lưu khoảnh khắc 📷');if(Math.random()<.6)chatEvent('shot');};
$('#bChurch').onclick=()=>{openModal(`<h2>Chọn nhà thờ</h2>${Object.entries(THEMES).map(([k,t])=>`<button class="opt ${k===themeKey?'on':''}" data-k="${k}"><b>${t.name}</b><br><small style="opacity:.7">${t.desc}</small></button>`).join('')}`);
  mCard.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{applyTheme(o.dataset.k);closeModal();toast('Chào mừng đến '+THEMES[o.dataset.k].name);chatEvent('theme');bells(1);});};
$('#bPeople').onclick=()=>{if(HiHi.hooks.people)return HiHi.hooks.people();openModal(`<h2>Trong nhà thờ</h2><p>${people.length} người đang ở đây</p><div class="list"><div>⭐ ${esc(playerName)} (bạn)</div>${npcs.map(n=>`<div>${n.seat?'🪑':n.praying?'🙏':'🚶'} ${esc(n.name)}</div>`).join('')}</div>`);};
$('#bAbout').onclick=()=>{openModal(`<h2>Thánh Đường HiHi Online</h2><p>Một không gian yên tĩnh để thắp nến, cầu nguyện, lắng nghe tiếng organ và gửi đi những điều trong lòng.</p>
  <p>• Trò chuyện cùng mọi người đang online, chơi ⭕ Cờ Caro và ✊ Kéo Búa Bao với người chơi khác, khoe chiến thắng và leo 🏆 bảng xếp hạng ngày, tuần, tháng.</p>
  <p>• Chạm sàn để di chuyển, kéo để xoay góc nhìn, cuộn chuột để zoom.<br>• Toàn bộ kiến trúc, nhân vật và giao diện được dựng bằng code riêng.<br>• Giai điệu "Đêm Thánh Vô Cùng" (Franz Gruber, 1818) thuộc phạm vi công cộng, được tổng hợp lại bằng âm thanh organ của trình duyệt.</p><p style="opacity:.6">Một sản phẩm của GameHiHi</p>`);};

/* ================= INTRO ================= */
const sw=$('#robeSw');ROBES.slice(0,8).forEach((c,i)=>{const s=document.createElement('span');s.style.background='#'+c.toString(16).padStart(6,'0');if(!i)s.classList.add('on');s.onclick=()=>{sw.querySelectorAll('span').forEach(x=>x.classList.remove('on'));s.classList.add('on');playerRobe=c;};sw.appendChild(s);});
$('#enterBtn').onclick=()=>{
  playerName=($('#nameIn').value.trim()||'Khách '+Math.floor(rand(100,999))).slice(0,18);
  player=new Person({name:playerName,robe:playerRobe,skin:SKIN[0],hair:HAIR[0],veil:$('#veilIn').checked,x:0,z:33,player:true,speed:3.2});
  player.nameL.el.innerHTML='⭐ '+esc(playerName);people.push(player);
  HiHi.emit('enter',{name:playerName,robe:ROBES.indexOf(playerRobe),veil:$('#veilIn').checked});
  $('#intro').style.opacity=0;setTimeout(()=>$('#intro').classList.add('hidden'),1000);$('#hud').classList.remove('hidden');
  initAudio();if(AC){bells(3);setTimeout(playSong,2500);}
  introT=0;$('#count').textContent=people.length;setTimeout(()=>chatEvent('enter'),2500);
  setTimeout(()=>{$('#helpTip').style.opacity=0;},12000);
  setTimeout(()=>toast('Chào mừng '+esc(playerName)+' đến Thánh Đường HiHi ✨'),3600);
};
$('#nameIn').addEventListener('keydown',e=>{if(e.key==='Enter')$('#enterBtn').click();});
setInterval(()=>{if(AC&&introT>=0)bells(3);},180000);


/* ================= NPC CHAT ================= */
const CHAT={log:null,open:innerWidth>600,unread:0,typing:new Map(),threadBusy:false};
const styleOf=new Map();
npcs.forEach((n,i)=>styleOf.set(n,i%7===0?'elder':(Math.random()<.4?'genz':'normal')));
const strip=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
function humanize(t,n,light){
  const st=styleOf.get(n)||'normal';
  if(st==='genz'){t=t.toLowerCase();if(!light){t=t.replace(/không/g,()=>pick(['khum','hong','ko','không'])).replace(/\bvậy\b/g,()=>Math.random()<.35?'z':'vậy').replace(/được/g,()=>Math.random()<.35?'đc':'được');}}
  else if(st==='elder'){t=t.charAt(0).toUpperCase()+t.slice(1);if(!light&&/[a-zà-ỹ]$/i.test(t))t+='.';}
  else if(Math.random()<.5)t=t.charAt(0).toLowerCase()+t.slice(1);
  return t;
}
function typo(t){const w=t.split(' ');const cand=w.map((x,i)=>[x,i]).filter(([x])=>/^[a-zà-ỹđ]{4,}$/i.test(x));if(!cand.length)return null;
  const [word,i]=pick(cand);const k=Math.floor(rand(1,word.length-1));const bad=word.slice(0,k-1)+word[k]+word[k-1]+word.slice(k+1);w[i]=bad;return[w.join(' '),'*'+word];}
const chatColors=['#f7b267','#9ad1d4','#f4978e','#b8e0a8','#c3aed6','#f6d186','#8fb8de','#f2a7c3'];
function colorOf(name){let h=0;for(const c of name)h=(h*31+c.charCodeAt(0))>>>0;return chatColors[h%chatColors.length];}
function hhmm(){const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function appendChatEl(d,isMe){
  const log=$('#chatLog');log.appendChild(d);while(log.children.length>80)log.firstChild.remove();log.scrollTop=log.scrollHeight;
  if(!CHAT.open&&!isMe){CHAT.unread++;$('#chatBadge').textContent=CHAT.unread;$('#chatBadge').style.display='inline-block';}
}
function postChat(name,text,isMe,sys){
  const d=document.createElement('div');d.className='msg'+(isMe?' me':'')+(sys?' sys':'');
  d.innerHTML=sys?esc(text):`<span class="t">${hhmm()}</span><b style="color:${isMe?'#f2cf8a':colorOf(name)}">${esc(name)}</b> ${esc(text)}`;
  appendChatEl(d,isMe);
}
function renderTyping(){if(HiHi.online)return;const names=[...CHAT.typing.keys()];const el=$('#typing');
  el.textContent=!names.length?'':names.length===1?names[0]+' đang nhập…':names.length===2?names[0]+' và '+names[1]+' đang nhập…':'Nhiều người đang nhập…';}
// npc says text after delay, with typing time; returns ms when message lands
function say(n,text,delay,opts){
  opts=opts||{};let t=humanize(text,n,opts.light);let fix=null;
  if(!opts.noTypo&&Math.random()<.09){const r=typo(t);if(r){t=r[0];fix=r[1];}}
  const typeMs=900+Math.min(5200,t.length*55)*rand(.7,1.3);
  setTimeout(()=>{CHAT.typing.set(n.name,(CHAT.typing.get(n.name)||0)+1);renderTyping();},delay);
  // Khi đã kết nối máy chủ, Chat Online chỉ dành cho người thật: giáo dân NPC nói bằng bóng thoại 3D.
  setTimeout(()=>{const c=(CHAT.typing.get(n.name)||1)-1;if(c<=0)CHAT.typing.delete(n.name);else CHAT.typing.set(n.name,c);renderTyping();
    if(!HiHi.online)postChat(n.name,t);headBubble(n,t);
    if(fix&&!HiHi.online)setTimeout(()=>postChat(n.name,fix),rand(1200,2600));},delay+typeMs);
  return delay+typeMs+(fix?2600:0);
}
const recentLines=[];function fresh(arr){let x,tries=0;do{x=pick(arr);tries++;}while(recentLines.includes(x)&&tries<12);recentLines.push(x);if(recentLines.length>24)recentLines.shift();return x;}
function headBubble(p,t){if(p.chatL)removeLabel(p.chatL);const txt=t.length>70?t.slice(0,68)+'…':t;p.chatL=addLabel(p.g,esc(txt),'bubble chat',2.25,Math.min(9000,3500+txt.length*80));}
const fill=(s,m)=>s.replace(/\{(\w)\}/g,(_,k)=>m[k]??'');
function pickNpcs(k,exclude){const pool=npcs.filter(n=>!exclude||!exclude.includes(n));const out=[];while(out.length<k&&pool.length)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);return out;}

const THREADS=[
 [['a','có ai thấy chiếc dép tổ ong bên trái của tui đâu không 😭'],['b','dép tổ ong vô nhà thờ luôn hả bà 😂'],['a','thì đi vội mà'],['c','hàng ghế số 3 có 1 chiếc kìa'],['a','ủa sao nó chạy lên tới đó được 🥲']],
 [['a','tiếng organ này ai đánh mà hay dữ vậy'],['b','nghe xong muốn đi lễ mỗi ngày luôn á'],['c','nghe xong buồn ngủ thì có 😪'],['b','@{c} ngồi ngay ngắn coi 😤'],['c','dạ 🫡']],
 [['a','ủa sao tui đi mà nhân vật cứ trượt trượt như đi patin vậy'],['b','mạng lag đó bạn'],['a','xài ké wifi nhà hàng xóm mà 🥲'],['c','thôi trượt tới bàn thờ cũng được, có tâm là được 😆']],
 [['a','thứ 2 mà vô đây thấy nhẹ cả người'],['b','thứ 2 là ngày cần cầu nguyện nhiều nhất tuần 😂'],['a','chuẩn, cầu cho deadline đừng dí nữa'],['c','cho tui xin ké một lời với 🙏']],
 [['a','mấy bạn ơi khăn voan đội sao vậy'],['b','bấm nút 🧕 dưới thanh công cụ á'],['a','thấy rồi, cảm ơn nha'],['a','đội vô nhìn giống cô dâu ghê 😳'],['c','cô dâu đi một mình hả 🤭']],
 [['a','cây thông năm nay ai trang trí mà đẹp vậy'],['b','nghe nói trang trí từ tháng 10 lận'],['c','tháng 10 đã treo đèn Noel, đúng chất người Việt 😂'],['a','năm sau chắc tháng 8 là treo rồi']],
 [['a','tui vừa mở quà được "một bữa cơm ấm cùng gia đình"'],['b','quà xịn đó, tối về ăn cơm với mẹ đi'],['a','mẹ tui nấu canh khổ qua 🥲'],['c','khổ qua = khổ sẽ qua, quá hợp luôn 🤣']],
 [['a','có ai ở Sài Gòn không, mưa quá trời'],['b','Hà Nội đây, lạnh run 🥶'],['c','Đà Nẵng nắng đẹp nha 😎'],['a','ủa một nước mà ba mùa vậy trời']],
 [['a','bà nội tui dặn vô nhà thờ không được nói chuyện'],['b','thì mình đang gõ phím mà, đâu có nói 🤭'],['a','lách luật dữ vậy'],['c','bà nội mà biết là bị nhéo tai đó']],
 [['a','cho hỏi lần chuỗi bấm nút nào ạ'],['b','nút 📿 đó, bấm từng hạt một'],['c','tui bấm nhanh quá xong 10 hạt trong 3 giây 😅'],['b','lần chuỗi chứ có phải bấm combo đâu 🤣']],
 [['a','ai ngồi hàng đầu vậy, che hết bàn thờ của tui rồi'],['b','xin lỗi khăn voan của tui nó phồng 😅'],['a','hihi không sao, để tui dời ghế']],
 [['a','ước gì có người yêu để Noel đi lễ chung'],['b','thắp nến cầu đi bạn'],['a','thắp 3 cây rồi mà chưa thấy ai'],['c','chắc người ta đang kẹt xe 😂'],['b','hoặc đang ngồi chung nhà thờ mà ngại chưa chào 👀']],
 [['a','ở đây mấy giờ có lễ vậy mọi người'],['b','lúc nào cũng mở nha, vô giờ nào cũng được'],['a','tiện ghê, khỏi sợ trễ'],['c','khỏi lo luôn chuyện kiếm chỗ gửi xe 🛵']],
 [['a','cầu nguyện cho ba tui mổ hôm qua thành công rồi 🙏'],['b','mừng quá, chúc bác mau khỏe nha'],['c','tui thắp cho bác một cây nến nè 🕯️'],['a','cảm ơn mọi người nhiều lắm 🥹']],
 [['a','bài organ đang chơi tên gì vậy ta'],['b','Đêm Thánh Vô Cùng đó'],['c','nghe là nhớ hồi nhỏ đi lễ đêm ngủ gục trên vai mẹ 🥹'],['a','ai cũng có tuổi thơ đó hết hả 😂']],
 [['a','tui vô tính ngồi 5 phút mà ngồi luôn 1 tiếng'],['b','y chang tui'],['c','chỗ này có bùa hả 😆'],['a','bùa bình yên chắc']],
 [['a','khuya rồi mà vẫn đông ghê'],['b','hội mất ngủ điểm danh 🙋'],['c','🙋‍♀️ có mặt'],['a','ngủ sớm đi mọi người, bớt lướt điện thoại 😴'],['b','nói xong vẫn lướt tiếp 🤣']],
 [['a','vừa thi xong môn khó nhất kì, vô đây tạ ơn'],['b','làm được bài không'],['a','làm được cái tên 🥲'],['c','vậy càng phải cầu nguyện thêm 😭']],
 [['a','mình mới vào lần đầu, ở đây làm gì vậy mọi người'],['b','thắp nến, nghe nhạc, cầu nguyện, tâm sự gì cũng được'],['c','hoặc ngồi chill như tui 😌'],['a','nghe hay đó, cảm ơn nha']],
 [['a','con mèo nhà tui vừa giẫm lên bàn phím'],['b','nó cũng muốn cầu nguyện á 😂'],['a','nó gõ "jjjjjjjjjj" rồi bỏ đi'],['c','chắc là "Amen" bằng tiếng mèo']],
 [['a','có ai làm ca đêm như tui không'],['b','tui nè, bảo vệ tòa nhà 👋'],['c','y tá trực đây 🙋‍♀️'],['a','chúc mọi người ca trực bình an nha']],
 [['a','hồi nhỏ đi lễ tui toàn ngồi đếm cửa sổ kính màu'],['b','tui đếm số người đội khăn 😂'],['c','tui ngồi chờ lễ xong đi ăn hủ tiếu'],['a','hủ tiếu sau lễ là chân ái']],
 [['a','hôm nay sinh nhật tui nè 🎂'],['b','chúc mừng sinh nhật nha!!'],['c','thắp cây nến coi như thổi bánh kem đi 🎉'],['a','ý hay, đi thắp liền 😆']],
 [['a','ủa quên tắt bếp 😱 đợi tui xíu'],['b','chạy lẹ đi bạn ơi'],['a','về rồi, may chưa cháy nồi cơm 😮‍💨'],['c','ơn trên phù hộ nồi cơm 🙏😂']],
 [['a','sếp tui cũng đang trong nhà thờ này đó'],['b','ủa ai vậy 👀'],['a','không nói đâu, sợ bị đọc được 🤐'],['c','thôi xong, giờ ai cũng nghi ai 😂']],
];
const SOLO=['xin chào cả nhà 👋','nhạc organ nghe nổi da gà luôn','ngồi đây thấy bình yên ghê','amen 🙏','mọi người ăn tối chưa','tui vô đây trốn deadline 15 phút thôi 🤫','hôm nay hơi mệt, ngồi chút cho nhẹ lòng','ai đeo tai nghe thì nghe tiếng chuông đã lắm nha','cầu cho bà ngoại tui mau khỏe 🙏','vừa thắp nến cho đứa bạn thân, mong nó qua được đợt này','tháng sau thi rồi, xin thương con 😭','đẹp quá, chụp làm hình nền luôn','bàn thờ ban đêm lung linh ghê','tui lỡ ngồi ngược ghế 😂','cây thông nhấp nháy y như sàn disco 🕺','nay bị sếp la, vô đây bình tâm lại','tối nào cũng vô đây 10 phút, thành thói quen luôn rồi','tuần trước mọi người cầu cho mẹ tui, giờ mẹ khỏe rồi 🥹 cảm ơn nha','ai vừa thả ánh sáng ở góc tâm sự đó, mong bạn ổn nha','Noel tới rồi, thích ghê 🎄','sao ai ở đây cũng dễ thương vậy ta','mình xin phép về trước nha, bình an mọi người','đi ngang chào mọi người cái 👋','trời lạnh rồi, mọi người nhớ mặc ấm nha','có ai thấy cái đèn chùm đẹp không','ước gì nhà thờ gần nhà tui cũng có cây thông bự vậy','ai cho xin ké chỗ ngồi gần đèn với','hihi','ủa sao tự nhiên tui thấy muốn khóc, chắc tại nhạc 🥲','đang nấu mì mà vô ngồi nghe nhạc quên luôn, mì nở rồi 😭'];
const ELDER=['Các cháu nhớ giữ trật tự nhé 😊','Bác chúc cả nhà một tuần mới bình an.','Lâu lắm rồi bác mới thấy nhà thờ đông vui thế này.','Các cháu trẻ ngủ sớm đi, mai còn đi làm.','Bác cảm ơn cháu nào vừa thắp nến cho người đã khuất nhé.'];
const EVENTS={
 enter:['chào {p} nha 👋','ơ thành viên mới, welcome {p}','{p} vô rồi kìa, ngồi đâu cũng được nha','hi {p}, vô thắp nến chung cho vui','chào {p}, nhớ bật âm thanh nghe organ nha'],
 candle:['ai vừa thắp nến cho {w} kìa, thương ghê 🥹','nến của {p} sáng đẹp quá','tui cầu chung cho {w} nha 🙏','giá nến đông dần lên rồi, ấm cúng ghê'],
 pray:['{p} làm dấu nghiêm túc ghê','cầu nguyện chung với {p} nè 🙏','amen 🙏'],
 sit:['{p} ngồi gần tui nè hihi','ghế đó hơi cứng nha {p}, ráng chịu 😂','ngồi đi {p}, sắp tới đoạn nhạc hay'],
 kneel:['{p} lên tận bàn thờ luôn, có tâm ghê','quỳ lâu nhớ đứng dậy từ từ kẻo tê chân nha {p} 😂'],
 together:['thấy {p} với {n} nắm tay cầu nguyện dễ thương quá','cho tui nắm ké với 🤝','{n} ơi chừa tui một tay nha'],
 veil:['{p} đội khăn vô xinh ghê','khăn voan hợp với {p} đó 😍','tui cũng muốn đội mà sợ nhìn giống ma 😂'],
 veiloff:['ủa sao {p} bỏ khăn rồi 😆'],
 confide:['ai vừa thả một đốm sáng lên kìa ✨','mong người vừa tâm sự sẽ nhẹ lòng hơn 🤍','đốm sáng bay đẹp ghê'],
 gift:['{p} mở được quà gì vậy','quà của {p} là "{g}" kìa, xịn ghê','tui mở 5 lần toàn ra "một ngày bình yên", cũng được 😌'],
 letter:['{p} gửi thư cho ông già Noel hả, xin gì vậy 👀','năm nay ông già Noel chắc đọc thư mỏi mắt','xin giùm tui cái laptop mới với {p} 🥲'],
 offer:['{p} có tâm ghê 💛','tấm lòng vàng đây rồi 💛'],
 rosary:['{p} lần chuỗi chăm ghê','lần chậm thôi {p}, không ai bấm giờ đâu 😆'],
 night:['ủa tối thui rồi','ban đêm nhìn lung linh hơn hẳn','giờ này ai còn thức giơ tay 🙋'],
 day:['sáng rồi nè, nắng chiếu qua kính màu đẹp quá','ai đi làm sớm vậy ta ☀️'],
 theme:['ai đổi nhà thờ vậy, đang ngồi tự nhiên bị dịch chuyển 😂','màu này đẹp nè','ủa sao tường đổi màu 😳'],
 shot:['ai chụp hình đó, chụp góc đẹp cho tui với','pose liền ✌️','khoan, chưa chỉnh khăn 😭']
};
const REPLIES=[
 [/(buon|met|chan qua|stress|ap luc|khoc|co don|that vong)/,['ôm {p} một cái 🫂','mệt thì ngồi đây nghỉ chút nha, không sao đâu','thắp một cây nến đi {p}, tui cầu chung cho','rồi sẽ ổn thôi, từ từ nha 🤍','có gì kể nghe nè {p}, ở đây ai cũng nghe hết']],
 [/(nguoi yeu|crush|that tinh|\bny\b|e a|chia tay|co don)/,['chuyện tình cảm hả, tui cũng ế nên chỉ cầu nguyện được thôi 🥲','thắp nến cầu đi, tui thắp 3 năm rồi vẫn đang chờ 😂','biết đâu người đó đang ngồi trong nhà thờ này 👀']],
 [/(haha|hihi|kkk|=\)\)|:\)\)|lol|hehe|😂|🤣)/,['😂😂','cười gì đó {p} 🤭','hihi','cười theo luôn 🤣']],
 [/(noel|giang sinh|christmas)/,['Noel năm nay {p} có đi lễ đêm không','đếm ngược tới Noel thôi 🎄','tui đặt bánh khúc cây rồi nè 😋']],
 [/(an (com|toi|trua|sang|chua)|doi bung|\bdoi\b|an gi)/,['chưa ăn nè, đói xỉu','ăn rồi, nay ăn bún bò 😋','đừng nhắc đồ ăn, tui đang nhịn 😭']],
 [/(o dau|tinh nao|que|song o)/,['tui ở Sài Gòn','Hà Nội nè','Nam Định, quê nhiều nhà thờ lắm đó 😎','Đồng Nai nha','Huế nè, đang mưa']],
 [/(cam on|thank|tks|thanks)/,['có gì đâu {p} 🤍','không có chi nha','hihi khách sáo quá']],
 [/amen/,['amen 🙏','amen']],
 [/(ngu ngon|di ngu|bye|tam biet|ve day|ve nha)/,['ngủ ngon nha {p} 🌙','bye {p}, bình an nha','mai vô tiếp nha {p}']],
 [/(bao nhieu tuoi|may tuoi)/,['bí mật 🤫','đủ lớn để biết mình chưa có người yêu 🥲']],
 [/(\bbot\b|may ao|robot|nguoi that|\bnpc\b)/,['ủa nói ai là bot vậy 😤','tui gõ bằng hai ngón đó nha, bot gì mà chậm vậy 😂','người thật việc thật nha {p}']],
 [/\b(chao|hello|hi|hey|alo|xin chao)\b/,['chào {p} 👋','hi {p}!!','chào bạn nha, vô ngồi chơi','alo alo nghe rõ 😆']],
 [/\?\s*$/,['để tui nghĩ đã 🤔','câu này khó à nha','hỏi {n} đó, bạn đó rành lắm','tui cũng đang thắc mắc y chang']],
];
const DEFAULT_REPLY=['ừa đúng rồi','hihi','công nhận','ủa thiệt hả 😳','+1','tui cũng nghĩ vậy','nghe {p} nói thấy vui ghê','😆','chuẩn luôn {p}'];

function runThread(){
  if(CHAT.threadBusy||introT<0)return;CHAT.threadBusy=true;
  let th;do{th=pick(THREADS);}while(recentLines.includes(th)&&Math.random()<.95);recentLines.push(th);const [A,B,C]=pickNpcs(3);const role={a:A,b:B,c:C};const names={a:A.name,b:B.name,c:C.name,p:playerName};
  let t=rand(300,1200);
  th.forEach(([r,txt])=>{const landed=say(role[r],fill(txt,names),t,{light:true});t=landed+rand(600,2400);});
  setTimeout(()=>CHAT.threadBusy=false,t+2000);
}
function runSolo(){
  if(introT<0)return;const n=pick(npcs);
  const line=styleOf.get(n)==='elder'&&Math.random()<.6?fresh(ELDER):fresh(SOLO);
  const parts=line.length>40&&Math.random()<.35?splitMsg(line):[line];
  let t=0;parts.forEach(p=>{t=say(n,p,t)+rand(300,900);});
}
function splitMsg(s){const i=s.indexOf(', ');return i>8?[s.slice(0,i),s.slice(i+2)]:[s];}
function chatEvent(type,data){
  if(!EVENTS[type]||introT<0&&type!=='enter')return;
  const k=type==='enter'?2:(Math.random()<.35?2:1);
  const ex=data&&data.npc?[data.npc]:null;
  const who=pickNpcs(k,ex);const used=new Set();
  let t=rand(1500,4000);
  who.forEach(n=>{let line;do{line=fresh(EVENTS[type]);}while(used.has(line)&&used.size<EVENTS[type].length);used.add(line);
    t=say(n,fill(line,{p:playerName,w:(data&&data.w)||'ai đó',g:(data&&data.g)||'',n:(data&&data.n)||pick(npcs).name}),t)+rand(500,2500);});
}
function replyToPlayer(text){
  const s=strip(text);const pools=REPLIES.filter(([re])=>re.test(s)).map(x=>x[1]).slice(0,2);
  if(!pools.length){if(Math.random()<.8)pools.push(DEFAULT_REPLY);else return;}
  const k=pools.length>1?2:(Math.random()<.4?2:1);const who=pickNpcs(k);let t=rand(1200,3500);const used=new Set();
  who.forEach((n,i)=>{const pool=pools[Math.min(i,pools.length-1)];let line;do{line=fresh(pool);}while(used.has(line)&&used.size<pool.length);used.add(line);
    line=fill(line,{p:playerName,n:pick(npcs.filter(x=>x!==n)).name});
    if(i===0&&Math.random()<.25)line='@'+playerName+' '+line;
    t=say(n,line,t)+rand(800,2600);});
}
// chat UI
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();const inp=$('#chatIn');const v=inp.value.trim();if(!v||!player)return;
  // sendChat: true = đã gửi lên máy chủ, 'keep' = đang online nhưng chưa gửi được (giữ chữ trong ô), false = chế độ offline
  const sent=HiHi.hooks.sendChat&&HiHi.hooks.sendChat(v);
  if(sent){if(sent===true){inp.value='';if(Math.random()<.35)replyToPlayer(v);}return;}
  inp.value='';postChat(playerName,v,true);headBubble(player,v);replyToPlayer(v);});
$('#chatIn').addEventListener('keydown',e=>e.stopPropagation());
function setChatOpen(o){CHAT.open=o;$('#chat').classList.toggle('min',!o);$('#chatMin').textContent=o?'–':'+';if(o){CHAT.unread=0;$('#chatBadge').style.display='none';$('#chatLog').scrollTop=1e9;}}
$('#chatHead').addEventListener('click',()=>setChatOpen(!CHAT.open));
setChatOpen(CHAT.open);
postChat('','Phòng trò chuyện của Thánh Đường HiHi. Hãy nói chuyện nhẹ nhàng, tử tế nhé 🤍',false,true);
(function loopSolo(){setTimeout(()=>{runSolo();loopSolo();},rand(9000,18000));})();
(function loopThread(){setTimeout(()=>{runThread();loopThread();},rand(22000,40000));})();

/* ================= ONLINE BRIDGE ================= */
function setPlayerName(n){playerName=n;if(player)player.nameL.el.innerHTML='⭐ '+esc(n);}
HiHi._setGame({THREE,scene,Person,people,npcs,seats,ROBES,SKIN,HAIR,BOOTH,OFFER,TREE,
  get player(){return player;},get playerName(){return playerName;},setPlayerName,needPlayer,
  addLabel,removeLabel,esc,toast,verse,chime,bells,coin,confetti,burst,floater,lightCandle,
  openModal,closeModal,mCard,headBubble,postChat,appendChatEl,setChatOpen,get chatOpen(){return CHAT.open;},chatEvent});

/* ================= LOOP ================= */
applyTheme('gothic');
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
let last=performance.now();
function loop(now){
  requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
  if(introT>=0&&introT<3.5)introT+=dt;
  if(player)playerUpdate(dt);
  for(const n of npcs){if(!n.path.length&&!n.partner){n.cool-=dt;if(n.cool<=0)npcThink(n);}}
  for(const p of people)p.update(dt);
  for(const c of choir){c.update(dt);c.av.head.rotation.z=musicOn?Math.sin(t*1.6+c.pos.x)*.06:0;c.praying=false;c.av.handL.position.set(-.12,.72,.3);c.av.handR.position.set(.12,.72,.3);}
  for(const f of flames){const k=1+Math.sin(t*14+f.ph)*.08+Math.sin(t*23+f.ph*2)*.05;f.f.scale.set(1,k,1);f.gl.material.opacity=.75+Math.sin(t*9+f.ph)*.15;}
  for(const tw of twinkles)tw.s.material.opacity=.4+.6*Math.abs(Math.sin(t*1.8+tw.ph));
  star.rotation.y=t*.6;starGlow.material.opacity=.7+Math.sin(t*2)*.2;
  const dp=dustGeo.attributes.position.array;for(let i=0;i<dustN;i++){dp[i*3+1]+=Math.sin(t*.3+i)*.002+.002;if(dp[i*3+1]>15)dp[i*3+1]=.5;dp[i*3]+=Math.cos(t*.2+i)*.0015;}dustGeo.attributes.position.needsUpdate=true;
  updateTOD(dt);updateFloaters(dt);updateCamera(dt);
  renderer.render(scene,camera);updateLabels(now);
}
requestAnimationFrame(loop);
}
(function(){const srcs=['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js','https://unpkg.com/three@0.128.0/build/three.min.js'];let i=0;
function next(){if(window.THREE){try{__game();}catch(e){document.getElementById('loadMsg').textContent='Lỗi khởi động: '+e.message;}return;}
 if(i>=srcs.length){document.getElementById('loadMsg').textContent='⚠️ Không tải được thư viện 3D. Hãy mở file bằng Chrome khi có mạng rồi tải lại trang.';return;}
 const sc=document.createElement('script');sc.src=srcs[i++];sc.onload=next;sc.onerror=next;document.head.appendChild(sc);}
next();})();
