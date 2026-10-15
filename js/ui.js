document.getElementById("muteBtn").addEventListener("click", function(){
  muted=!muted; this.textContent = muted?"🔇":"🔊";
});
document.querySelectorAll(".card").forEach(c=>{
  c.addEventListener("click", ()=>startGame(c.dataset.mode));
});
document.getElementById("againBtn").addEventListener("click", ()=>startGame(mode));
document.getElementById("changeBtn").addEventListener("click", ()=>{
  state="menu";
  document.getElementById("over").style.display="none";
  document.getElementById("menu").style.display="flex";
});
// premium menu init
(function(){
  const tickItems=["CERTIFIED ANDHNAMAZI","EVM RONA CHAMPION","CERTIFIED ANDOLANJEEVI","TOOLKIT GANG","CHAMCHA SUPREMO","TUKDE-TUKDE TRAINEE","DHARNA PROFESSIONAL","CANDLE MARCH INTERN"];
  const half=tickItems.map(t=>"<span>✦ "+t+"</span>").join("");
  document.getElementById("tickerIn").innerHTML=half+half;
  const tw=document.getElementById("titleWords");
  tw.innerHTML=tw.innerHTML.split(/<br\s*\/?>/i).map((p,i)=>p.trim().split(/\s+/).map((w,j)=>'<span class="w" style="animation-delay:'+((i*2+j)*0.09).toFixed(2)+'s, 0s">'+w+'</span>').join(" ")).join("<br>");
  const menu=document.getElementById("menu");
  const cols=["#ff4d6d","#4da6ff","#4dd27a","#b366ff","#ff9f2e","#ff6ee7","#3ee6d2","#ffe14d"];
  for(let i=0;i<9;i++){
    const d=document.createElement("div"); d.className="fbal";
    d.style.left=(Math.random()*92)+"%";
    d.style.setProperty("--c",cols[i%cols.length]);
    const sz=20+Math.random()*26;
    d.style.width=sz+"px"; d.style.height=(sz*1.28)+"px";
    const dur=9+Math.random()*10;
    d.style.animationDuration=dur+"s"; d.style.animationDelay=(-Math.random()*dur).toFixed(1)+"s";
    menu.appendChild(d);
  }
  document.querySelectorAll(".card").forEach(c=>{
    c.addEventListener("pointermove",e=>{
      const r=c.getBoundingClientRect();
      const rx=((e.clientY-r.top)/r.height-.5)*-12, ry=((e.clientX-r.left)/r.width-.5)*12;
      c.style.transform="perspective(700px) rotateX("+rx.toFixed(1)+"deg) rotateY("+ry.toFixed(1)+"deg) translateY(-4px)";
    });
    c.addEventListener("pointerleave",()=>{ c.style.transform=""; });
  });
  if(document.fonts && document.fonts.load){ document.fonts.load('20px "Press Start 2P"'); document.fonts.load("19px 'VT323'"); }
})();
drawBG(); // menu backdrop
