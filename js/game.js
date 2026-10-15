/* ================= CANVAS ================= */
const cv = document.getElementById("game"), ctx = cv.getContext("2d");
let W=0, H=0; const PX=1; // full-res canvas: keeps text sharp (pixel look lives in UI chrome + CRT overlay)
function resize(){
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.max(2, Math.round(W/PX)); cv.height = Math.max(2, Math.round(H/PX));
  ctx.setTransform(1/PX,0,0,1/PX,0,0);
}
window.addEventListener("resize", resize); resize();

/* ================= STATE ================= */
let state="menu", mode="cjp", M=MODES.cjp;
let balloons=[], parts=[], floaters=[];
let score=0, combo=0, bestCombo=0, timeLeft=60, elapsed=0, lastT=0;
let aim={x:innerWidth/2,y:innerHeight*0.4,tx:innerWidth/2,ty:innerHeight*0.4};
let muzzle=0, shake=0, spawnT=0, factQueue=[], factTimer=0;
let lineIdx=0;
let freeze=0, flash=0, scopeKick=0, GDT=0.016;
function easeOutBack(t){ const c=1.70158; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2); }
let dust=[]; for(let di=0;di<36;di++) dust.push({x:Math.random(),y:Math.random(),s:1+Math.random()*2.5,v:4+Math.random()*10,tw:Math.random()*6.28});

let liveIdx=new Set(); // texts currently on screen — never duplicated live

/* ================= BALLOONS ================= */
function nextLine(){
  // pick a text not currently on screen; a text re-enters the pool
  // only after its balloon is popped or floats away
  const n = mode==="bjp" ? M.taunts.length : M.lines.length;
  const avail=[];
  for(let k=0;k<n;k++) if(!liveIdx.has(k)) avail.push(k);
  const pool = avail.length ? avail : Array.from({length:n},(_,k)=>k);
  const pick = pool[(Math.random()*pool.length)|0];
  liveIdx.add(pick);
  return pick;
}
function spawnBalloon(){
  const i = nextLine();
  const text = mode==="bjp" ? M.taunts[i][0] : M.lines[i];
  const fact = mode==="bjp" ? M.taunts[i][1] : null;
  ctx.font = "19px 'VT323', monospace";
  const tw = Math.min(150, ctx.measureText(text).width);
  const w = Math.max(96, Math.min(tw + 30, W*0.44));
  const h = w*1.22;
  balloons.push({
    x: w/2+10+Math.random()*Math.max(1,(W-w-20)), y: H+70,
    vy: 30+Math.random()*24+elapsed*0.45,
    w, h, text, fact, idx:i,
    face:(Math.random()*4)|0, pat:(Math.random()*3)|0,
    color: BALLOON_COLORS[(Math.random()*BALLOON_COLORS.length)|0],
    ph: Math.random()*6.28, r: Math.max(w,h)*0.46, born:elapsed
  });
}
function wrapLines(text, maxW){
  ctx.font = "19px 'VT323', monospace";
  const words = text.split(" "), lines=[]; let cur="";
  for(const wd of words){
    const t = cur?cur+" "+wd:wd;
    if(ctx.measureText(t).width>maxW && cur){ lines.push(cur); cur=wd; } else cur=t;
    if(lines.length===2) break;
  }
  lines.push(cur);
  return lines.slice(0,3);
}

/* ================= INPUT ================= */
function setAim(cx,cy){ aim.tx=Math.max(0,Math.min(W,cx)); aim.ty=Math.max(0,Math.min(H,cy)); }
cv.addEventListener("pointermove", e=>{ if(state==="play") setAim(e.clientX,e.clientY); });
cv.addEventListener("pointerdown", e=>{
  ac(); // unlock audio
  if(state!=="play") return;
  setAim(e.clientX,e.clientY); aim.x=aim.tx; aim.y=aim.ty; // snap on tap
  fire();
});
document.addEventListener("contextmenu", e=>e.preventDefault());
/* ================= SHOOT ================= */
function fire(){
  sfxShot(); muzzle=1; shake=6; scopeKick=1;
  // hit test: topmost balloon under crosshair
  let hit=null;
  for(let i=balloons.length-1;i>=0;i--){
    const b=balloons[i], dx=aim.x-b.x, dy=aim.y-b.y;
    if(dx*dx+dy*dy < b.r*b.r){ hit={b, i}; break; }
  }
  if(hit){
    const {b,i}=hit; balloons.splice(i,1); liveIdx.delete(b.idx);
    sfxPop();
    combo++; bestCombo=Math.max(bestCombo,combo);
    const pts = 100 + (combo>1? (combo-1)*25 : 0);
    score += pts;
    // confetti
    for(let k=0;k<14;k++){
      const a=Math.random()*6.28, sp=60+Math.random()*160;
      parts.push({x:b.x,y:b.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-40,life:.7,c:b.color});
    }
    // letter shatter — the troll text explodes into flying letters
    Array.from(b.text).forEach(ch=>{
      if(ch===" ") return;
      const a=Math.random()*6.28, sp=90+Math.random()*230;
      parts.push({x:b.x+(Math.random()-.5)*b.w*.6, y:b.y+(Math.random()-.5)*b.h*.5,
        vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-70, life:.8+Math.random()*.5,
        ch, rot:(Math.random()-.5)*.8, vr:(Math.random()-.5)*12});
    });
    freeze=0.05; flash=0.22;
    parts.push({x:b.x, y:b.y, ring:true, rl:12, life:.45});
    // comic burst badge + score
    floaters.push({x:b.x, y:b.y, kind:"burst", age:0});
    floaters.push({x:b.x,y:b.y-10,txt:"+"+pts,life:1,c:"#ffd34d"});
    if(combo>=2){ announce(combo===2?"DOUBLE POP!":combo===3?"TRIPLE POP!":combo===4?"RAMPAGE!":"UNSTOPPABLE!"); }
    if(mode==="bjp" && b.fact){ factQueue.push(b.fact); }
  } else { combo=0; }
  const scEl=document.getElementById("score"); scEl.textContent=score;
  const pill=scEl.parentElement; pill.classList.remove("pop"); void pill.offsetWidth; pill.classList.add("pop");
}
function announce(t){
  const a=document.getElementById("announce");
  a.textContent=t; a.classList.remove("show"); void a.offsetWidth; a.classList.add("show");
}
function showFact(txt){
  document.getElementById("factText").textContent=txt;
  const f=document.getElementById("fact"); f.classList.add("show");
  clearTimeout(factTimer); factTimer=setTimeout(()=>f.classList.remove("show"),2300);
}

/* ================= DRAW ================= */
function drawBG(){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#0b1020"); g.addColorStop(.6,"#0a0f1c"); g.addColorStop(1,"#131a2e");
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  // distant carnival lights
  ctx.save(); ctx.globalAlpha=.5;
  for(let i=0;i<14;i++){
    const x=(i*197.3)%W, y=40+((i*89.7)%(H*0.25));
    ctx.fillStyle=["#ff4d6d","#4da6ff","#ffe14d","#4dd27a"][i%4];
    ctx.beginPath(); ctx.arc(x,y,3,0,6.29); ctx.fill();
  }
  ctx.restore();
  dust.forEach(d=>{ ctx.globalAlpha=.10+.09*Math.sin(d.tw); ctx.fillStyle="#cfe3ff"; ctx.fillRect(d.x*W,d.y*H,d.s,d.s); });
  ctx.globalAlpha=1;
  // ground strip
  ctx.fillStyle="#0e1424"; ctx.fillRect(0,H-46,W,46);
  ctx.fillStyle="#1a2340"; ctx.fillRect(0,H-46,W,3);
}
function drawBalloon(b){
  const wob = Math.sin(elapsed*2+b.ph)*10;
  const x=b.x+wob, y=b.y;
  ctx.save();
  const bage=elapsed-b.born, bsc=bage<0.4?easeOutBack(Math.max(0.01,bage/0.4)):1;
  ctx.translate(x,y); ctx.scale(bsc,bsc); ctx.translate(-x,-y);
  // string
  ctx.strokeStyle="rgba(255,255,255,.35)"; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(x,y+b.h/2); ctx.quadraticCurveTo(x+wob*.5,y+b.h/2+26,x,y+b.h/2+44); ctx.stroke();
  // body
  const g=ctx.createRadialGradient(x-b.w*.25,y-b.h*.3,6,x,y, b.w*.7);
  g.addColorStop(0,"#ffffff"); g.addColorStop(.25,b.color); g.addColorStop(1,shade(b.color,-45));
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.ellipse(x,y,b.w/2,b.h/2,0,0,6.29); ctx.fill();
  // pattern (clipped inside the balloon)
  if(b.pat>0){
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x,y,b.w/2,b.h/2,0,0,6.29); ctx.clip();
    if(b.pat===1){
      ctx.fillStyle="rgba(255,255,255,.20)";
      let row=0;
      for(let py=-b.h/2+12; py<b.h/2; py+=26, row++)
        for(let px=-b.w/2+12; px<b.w/2; px+=26){
          ctx.beginPath(); ctx.arc(x+px+(row%2?13:0), y+py, 4.5, 0, 6.29); ctx.fill();
        }
    } else {
      ctx.strokeStyle="rgba(255,255,255,.16)"; ctx.lineWidth=9;
      for(let s2=-b.h; s2<b.h; s2+=26){
        ctx.beginPath(); ctx.moveTo(x-b.w/2, y+s2); ctx.lineTo(x+b.w/2, y+s2+b.w/3); ctx.stroke();
      }
    }
    ctx.restore();
    const g2=ctx.createLinearGradient(0,y-b.h/2,0,y+b.h/2);
    g2.addColorStop(.55,"rgba(0,0,0,0)"); g2.addColorStop(1,"rgba(0,0,0,.28)");
    ctx.fillStyle=g2;
    ctx.beginPath(); ctx.ellipse(x,y,b.w/2,b.h/2,0,0,6.29); ctx.fill();
  }
  // knot
  ctx.fillStyle=shade(b.color,-45);
  ctx.beginPath(); ctx.moveTo(x-6,y+b.h/2); ctx.lineTo(x+6,y+b.h/2); ctx.lineTo(x,y+b.h/2+9); ctx.closePath(); ctx.fill();
  // shine
  ctx.fillStyle="rgba(255,255,255,.5)";
  ctx.beginPath(); ctx.ellipse(x-b.w*.22,y-b.h*.24,b.w*.09,b.h*.14,-.5,0,6.29); ctx.fill();
  // troll face — the eyes follow your scope!
  drawFace(b,x,y);
  // text (lower half, under the face)
  ctx.fillStyle="#fff"; ctx.strokeStyle="rgba(0,0,0,.65)"; ctx.lineWidth=3;
  ctx.font="19px 'VT323', monospace"; ctx.textAlign="center"; ctx.textBaseline="middle";
  const lines=wrapLines(b.text, b.w-24);
  const lh=18, y0=y+b.h*0.16-(lines.length-1)*lh/2;
  lines.forEach((ln,i)=>{ ctx.strokeText(ln,x,y0+i*lh); ctx.fillText(ln,x,y0+i*lh); });
  ctx.restore();
  b._dx=x; b._dy=y;
}
function drawFace(b,x,y){
  const fy=y-b.h*0.30, ex=b.w*0.16, er=Math.max(9,b.w*0.085);
  const pdx=Math.max(-er*.42,Math.min(er*.42,(aim.x-x)*0.045));
  const pdy=Math.max(-er*.42,Math.min(er*.42,(aim.y-fy)*0.045));
  for(const s of [-1,1]){
    const cx=x+s*ex;
    ctx.fillStyle="#fff";
    ctx.beginPath(); ctx.ellipse(cx,fy,er,er*1.15,0,0,6.29); ctx.fill();
    ctx.fillStyle="#141821";
    ctx.beginPath(); ctx.arc(cx+pdx,fy+pdy,er*0.48,0,6.29); ctx.fill();
    ctx.fillStyle="#fff";
    ctx.beginPath(); ctx.arc(cx+pdx-er*0.15,fy+pdy-er*0.15,er*0.16,0,6.29); ctx.fill();
  }
  const my=fy+er*1.9;
  ctx.lineCap="round";
  if(b.face===0){ // smirk
    ctx.strokeStyle="#141821"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(x+er*0.4,my-er*0.5,er*0.9,0.35,2.4); ctx.stroke();
  } else if(b.face===1){ // shocked O
    ctx.fillStyle="#141821";
    ctx.beginPath(); ctx.ellipse(x,my,er*0.5,er*0.7,0,0,6.29); ctx.fill();
  } else if(b.face===2){ // toothy grin
    ctx.fillStyle="#141821";
    ctx.beginPath();
    ctx.moveTo(x-er,my-er*0.4); ctx.quadraticCurveTo(x,my+er*1.1,x+er,my-er*0.4);
    ctx.quadraticCurveTo(x,my-er*0.1,x-er,my-er*0.4); ctx.fill();
    ctx.strokeStyle="#fff"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x-er*0.33,my+er*0.02); ctx.lineTo(x-er*0.33,my+er*0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+er*0.33,my+er*0.02); ctx.lineTo(x+er*0.33,my+er*0.5); ctx.stroke();
  } else { // tongue out
    ctx.strokeStyle="#141821"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(x,my-er*0.4,er*0.85,0.25,Math.PI-0.25); ctx.stroke();
    ctx.fillStyle="#ff6b81";
    ctx.beginPath(); ctx.ellipse(x+er*0.2,my+er*0.75,er*0.32,er*0.5,0.15,0,6.29); ctx.fill();
  }
}
function shade(hex,amt){
  const n=parseInt(hex.slice(1),16);
  let r=(n>>16)+amt, g=((n>>8)&255)+amt, b=(n&255)+amt;
  r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b));
  return "#"+((r<<16)|(g<<8)|b).toString(16).padStart(6,"0");
}
function drawGun(){
  const gx=W/2, gy=H-24;
  const ang=Math.atan2(aim.y-gy, aim.x-gx);
  const rec = muzzle*16;
  ctx.save();
  ctx.translate(gx,gy); ctx.rotate(ang); ctx.translate(-rec,0);
  const S=Math.min(W,H)/380; ctx.scale(S,S);
  // wooden stock (bottom, half off-screen = "half gun" look)
  let g=ctx.createLinearGradient(0,-22,0,22);
  g.addColorStop(0,"#9a6535"); g.addColorStop(.5,"#6b421f"); g.addColorStop(1,"#40260f");
  ctx.fillStyle=g; roundRect(-64,-22,76,44,12); ctx.fill();
  ctx.strokeStyle="rgba(0,0,0,.4)"; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(-58,-10); ctx.lineTo(4,-10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-58,10); ctx.lineTo(4,10); ctx.stroke();
  // receiver body
  g=ctx.createLinearGradient(0,-20,0,20);
  g.addColorStop(0,"#5b6579"); g.addColorStop(.45,"#2b3242"); g.addColorStop(1,"#12161f");
  ctx.fillStyle=g; roundRect(0,-20,92,40,9); ctx.fill();
  // barrel
  g=ctx.createLinearGradient(0,-10,0,10);
  g.addColorStop(0,"#6a7488"); g.addColorStop(.5,"#333b4d"); g.addColorStop(1,"#161b26");
  ctx.fillStyle=g; roundRect(82,-10,128,20,8); ctx.fill();
  ctx.fillStyle="rgba(0,0,0,.3)";
  for(let i=0;i<4;i++) ctx.fillRect(100+i*26,-10,5,20);
  // muzzle ring
  ctx.fillStyle="#0b0e16"; roundRect(202,-13,12,26,4); ctx.fill();
  // scope tube on top + mounts
  g=ctx.createLinearGradient(0,-40,0,-26);
  g.addColorStop(0,"#78839a"); g.addColorStop(.5,"#333b4d"); g.addColorStop(1,"#161b26");
  ctx.fillStyle=g; roundRect(18,-40,92,14,7); ctx.fill();
  ctx.fillStyle="#0a0e18"; ctx.beginPath(); ctx.arc(18,-33,9,0,6.29); ctx.fill();
  ctx.fillStyle="rgba(150,210,255,.8)"; ctx.beginPath(); ctx.arc(18,-33,5.5,0,6.29); ctx.fill();
  ctx.fillStyle="#1c2230"; ctx.fillRect(34,-26,8,8); ctx.fillRect(86,-26,8,8);
  // grip + magazine below
  g=ctx.createLinearGradient(0,18,0,60);
  g.addColorStop(0,"#3a2c18"); g.addColorStop(1,"#1d1408");
  ctx.fillStyle=g;
  ctx.save(); ctx.translate(38,18); ctx.rotate(.28); roundRect(-11,0,22,44,8); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(72,18); ctx.rotate(-.12); roundRect(-10,0,20,52,6); ctx.fill(); ctx.restore();
  // trigger guard
  ctx.strokeStyle="#0b0e16"; ctx.lineWidth=5;
  ctx.beginPath(); ctx.arc(22,26,13,.2,2.9); ctx.stroke();
  // muzzle flash
  if(muzzle>0){
    ctx.save(); ctx.globalCompositeOperation="lighter";
    ctx.translate(224,0); ctx.rotate(Math.random()*6.28);
    const R=(30+muzzle*36);
    ctx.fillStyle="rgba(255,200,80,"+(0.9*muzzle)+")"; star(0,0,R,R*0.45,8); ctx.fill();
    ctx.fillStyle="rgba(255,242,190,"+(0.9*muzzle)+")"; star(0,0,R*0.55,R*0.25,8); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function star(x,y,R,r,n){
  ctx.beginPath();
  for(let i=0;i<n*2;i++){
    const a=i*Math.PI/n, rad=i%2?r:R;
    ctx[i?"lineTo":"moveTo"](x+Math.cos(a)*rad, y+Math.sin(a)*rad);
  }
  ctx.closePath();
}
function drawScope(){
  const x=aim.x, y=aim.y, R=(Math.min(W,H)*0.16+34)*(1+scopeKick*0.22);
  scopeKick=Math.max(0,scopeKick-GDT*5);
  ctx.save();
  if(shake>0){ ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake); }
  // dark surround
  ctx.fillStyle="rgba(2,4,8,.55)";
  ctx.beginPath(); ctx.rect(0,0,W,H); ctx.arc(x,y,R,0,6.29,true); ctx.fill("evenodd");
  // ring
  const g=ctx.createRadialGradient(x,y,R*.82,x,y,R);
  g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(.85,"rgba(0,0,0,.25)"); g.addColorStop(1,"rgba(8,10,16,.95)");
  ctx.strokeStyle="#0d1119"; ctx.lineWidth=R*0.16;
  ctx.beginPath(); ctx.arc(x,y,R,0,6.29); ctx.stroke();
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,R,0,6.29); ctx.fill();
  // glass tint
  const gg=ctx.createRadialGradient(x-R*.3,y-R*.3,4,x,y,R);
  gg.addColorStop(0,"rgba(160,210,255,.10)"); gg.addColorStop(1,"rgba(160,210,255,0)");
  ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(x,y,R*.92,0,6.29); ctx.fill();
  // crosshair
  ctx.strokeStyle="rgba(20,26,38,.9)"; ctx.lineWidth=2;
  ctx.beginPath();
  const gap=14+scopeKick*30;
  ctx.moveTo(x-R,y); ctx.lineTo(x-gap,y); ctx.moveTo(x+gap,y); ctx.lineTo(x+R,y);
  ctx.moveTo(x,y-R); ctx.lineTo(x,y-gap); ctx.moveTo(x,y+gap); ctx.lineTo(x,y+R);
  ctx.stroke();
  // mil dots
  ctx.fillStyle="rgba(20,26,38,.9)";
  [[-R*.5,0],[R*.5,0],[0,-R*.5],[0,R*.5]].forEach(p=>{ctx.beginPath();ctx.arc(x+p[0],y+p[1],3,0,6.29);ctx.fill();});
  // center dot
  ctx.fillStyle="#ff3b3b"; ctx.beginPath(); ctx.arc(x,y,4,0,6.29); ctx.fill();
  ctx.strokeStyle="rgba(255,255,255,.85)"; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(x,y,4,0,6.29); ctx.stroke();
  ctx.restore();
}
function drawParts(dt){
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i]; p.life-=dt;
    if(p.ring){ p.rl+=420*dt; }
    else { p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=300*dt; if(p.rot!==undefined) p.rot+=p.vr*dt; }
    if(p.life<=0){ parts.splice(i,1); continue; }
    ctx.globalAlpha=Math.min(1,p.life*1.6);
    if(p.ring){
      ctx.strokeStyle="rgba(255,220,130,"+Math.min(1,p.life*2.5)+")"; ctx.lineWidth=5;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.rl,0,6.29); ctx.stroke();
      ctx.strokeStyle="rgba(255,255,255,"+Math.min(1,p.life*2)+")"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.rl*0.7,0,6.29); ctx.stroke();
    } else if(p.ch){
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot||0);
      ctx.font="20px 'VT323', monospace"; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.lineWidth=3; ctx.strokeStyle="rgba(0,0,0,.6)";
      ctx.strokeText(p.ch,0,0); ctx.fillStyle="#fff"; ctx.fillText(p.ch,0,0);
      ctx.restore();
    } else {
      ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,4,0,6.29); ctx.fill();
    }
  }
  ctx.globalAlpha=1;
  ctx.textAlign="center"; ctx.textBaseline="middle";
  for(let i=floaters.length-1;i>=0;i--){
    const f=floaters[i]; f.age=(f.age||0)+dt;
    if(f.kind==="burst"){
      if(f.age>0.7){ floaters.splice(i,1); continue; }
      const sc = f.age<0.16 ? 0.3+(f.age/0.16)*1.3 : 1.6-(f.age-0.16)*1.1;
      ctx.globalAlpha=Math.max(0,1-f.age/0.7);
      ctx.font=Math.max(10,58*sc)+"px sans-serif";
      ctx.fillText("\uD83D\uDCA5",f.x,f.y-f.age*36);
      continue;
    }
    f.life-=dt*0.9; f.y-=40*dt;
    if(f.life<=0){ floaters.splice(i,1); continue; }
    ctx.globalAlpha=Math.min(1,f.life*1.4);
    ctx.font='20px "Press Start 2P", monospace'; ctx.strokeStyle="rgba(0,0,0,.7)"; ctx.lineWidth=5;
    ctx.strokeText(f.txt,f.x,f.y); ctx.fillStyle=f.c; ctx.fillText(f.txt,f.x,f.y);
  }
  ctx.globalAlpha=1;
}

/* ================= LOOP ================= */
let loopRunning=false;
function loop(t){
  if(state!=="play"){ loopRunning=false; return; }
  requestAnimationFrame(loop);
  let dt=Math.min(.05,(t-lastT)/1000||0.016); lastT=t; GDT=dt;
  if(freeze>0){ freeze-=dt; dt*=0.06; }
  elapsed+=dt; timeLeft-=dt;
  dust.forEach(d=>{ d.y-=d.v*dt/H; d.tw+=dt*2; if(d.y<-0.05){ d.y=1.05; d.x=Math.random(); } });
  if(timeLeft<=0){ endGame(); return; }
  const te=document.getElementById("timer");
  te.textContent=Math.ceil(timeLeft); te.classList.toggle("warn", timeLeft<10);

  // aim easing
  aim.x += (aim.tx-aim.x)*Math.min(1,dt*14);
  aim.y += (aim.ty-aim.y)*Math.min(1,dt*14);
  muzzle=Math.max(0,muzzle-dt*6); shake=Math.max(0,shake-dt*40);

  // spawn
  spawnT-=dt;
  if(spawnT<=0 && balloons.length<4){ spawnBalloon(); spawnT=Math.max(1.1,1.9-elapsed*.008); }

  // move balloons
  for(let i=balloons.length-1;i>=0;i--){
    const b=balloons[i]; b.y-=b.vy*dt;
    if(b.y<-90){ liveIdx.delete(balloons[i].idx); balloons.splice(i,1); }
  }
  // fact queue
  if(factQueue.length && !document.getElementById("fact").classList.contains("show")){
    showFact(factQueue.shift());
  }

  drawBG();
  balloons.forEach(drawBalloon);
  drawParts(dt);
  drawGun();
  drawScope();
  if(flash>0){ ctx.fillStyle="rgba(255,214,120,"+(flash*0.9)+")"; ctx.fillRect(0,0,W,H); flash-=GDT*2.4; }
}

/* ================= FLOW ================= */
function startGame(m){
  mode=m; M=MODES[m]; liveIdx.clear();
  balloons=[]; parts=[]; floaters=[]; factQueue=[];
  score=0; combo=0; bestCombo=0; timeLeft=60; elapsed=0; spawnT=0;
  document.getElementById("score").textContent="0";
  document.getElementById("modeName").textContent=M.name;
  document.getElementById("menu").style.display="none";
  document.getElementById("over").style.display="none";
  document.getElementById("hud").style.display="flex";
  document.getElementById("muteBtn").style.display="block";
  state="play"; lastT=performance.now();
  // pre-spawn a few
  for(let i=0;i<2;i++){ spawnBalloon(); balloons[i].y = H*0.5+Math.random()*H*0.4; }
  if(!loopRunning){ loopRunning=true; requestAnimationFrame(loop); }
}
function endGame(){
  state="over";
  document.getElementById("hud").style.display="none";
  document.getElementById("muteBtn").style.display="none";
  document.getElementById("fact").classList.remove("show");
  const earned = M.ranks.find(x=>score>=x[0]);
  const rl = document.getElementById("rankLine");
  rl.innerHTML="";
  const big=document.createElement("div");
  big.className="trollTitle"; big.textContent=earned[1];
  rl.appendChild(big);
  const lad=document.createElement("div");
  lad.className="ladder";
  M.ranks.forEach(t=>{
    const row=document.createElement("div");
    row.className="trow"+(t===earned?" hit":"");
    const nm=document.createElement("span"); nm.textContent=t[1];
    const pt=document.createElement("span"); pt.className="pts"; pt.textContent=t[0]+"+ pts";
    row.appendChild(nm); row.appendChild(pt); lad.appendChild(row);
  });
  rl.appendChild(lad);
  document.getElementById("finalScore").textContent =
    "Score: "+score+" • Best combo: x"+Math.max(1,bestCombo)+" • "+M.tag;
  document.getElementById("over").style.display="flex";
}
