/* ================= AUDIO ================= */
let AC = null, muted = false;
function ac(){ if(!AC){ AC = new (window.AudioContext||window.webkitAudioContext)(); } if(AC.state==="suspended") AC.resume(); return AC; }
function sfxShot(){
  if(muted) return; try{
    const c=ac(), t=c.currentTime;
    const o=c.createOscillator(), g=c.createGain();
    o.type="square"; o.frequency.setValueAtTime(160,t); o.frequency.exponentialRampToValueAtTime(40,t+.12);
    g.gain.setValueAtTime(.25,t); g.gain.exponentialRampToValueAtTime(.001,t+.15);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t+.16);
  }catch(e){}
}
function sfxPop(){
  if(muted) return; try{
    const c=ac(), t=c.currentTime;
    const o=c.createOscillator(), g=c.createGain();
    o.type="sine"; o.frequency.setValueAtTime(700,t); o.frequency.exponentialRampToValueAtTime(1400,t+.07);
    g.gain.setValueAtTime(.22,t); g.gain.exponentialRampToValueAtTime(.001,t+.1);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t+.11);
  }catch(e){}
}
