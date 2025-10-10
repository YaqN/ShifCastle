// ===== Confetti =====
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');
function resizeCanvas(){ confettiCanvas.width = innerWidth; confettiCanvas.height = innerHeight; }
addEventListener('resize', resizeCanvas); resizeCanvas();
let confettiPieces = [];
function burst(x = innerWidth/2, y = innerHeight/3, count = 120){
  for(let i=0;i<count;i++){
    confettiPieces.push({ x, y, vx:(Math.random()*2-1)*4, vy:Math.random()*-6-4, g:.12+Math.random()*.08, rot:Math.random()*Math.PI, vr:(Math.random()*2-1)*.1, size:6+Math.random()*6, color: Math.random()<.5?'#cc2035':(Math.random()<.7?'#e94a5a':'#c9ad63') });
  }
}
function confettiTick(){
  ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  confettiPieces = confettiPieces.filter(p=> p.y < confettiCanvas.height+20);
  confettiPieces.forEach(p=>{ p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size); ctx.restore();
  });
  requestAnimationFrame(confettiTick);
}
confettiTick();
document.getElementById('confettiBurst').addEventListener('click', ()=> burst());

// ===== Candles & Wishes =====
const flames = [...document.querySelectorAll('.flame')];
function toggleFlame(el){ el.classList.toggle('off'); burst(Math.random()*innerWidth, innerHeight*0.3 + Math.random()*80, 30); }
flames.forEach(f => f.addEventListener('click', ()=> toggleFlame(f)));
addEventListener('keydown', (e)=>{ if(e.key.toLowerCase()==='b'){ flames.forEach(f=>f.classList.add('off')); burst(innerWidth/2, innerHeight*0.25, 200); }});
const wishInput = document.getElementById('wishInput');
document.getElementById('wishBtn').addEventListener('click', ()=>{ const t=wishInput.value.trim(); if(!t) return; floatingWish(t); wishInput.value=''; });
function floatingWish(text){ const el=document.createElement('div'); el.className='floating'; el.textContent=text; Object.assign(el.style,{position:'fixed',left:(innerWidth/2-120 + (Math.random()*240))+'px',top:(innerHeight*0.55)+'px',fontWeight:'700',color:'#cc2035',filter:'drop-shadow(0 6px 12px rgba(0,0,0,.15))'}); document.body.appendChild(el); setTimeout(()=>{ el.style.transition='transform 3.2s ease, opacity 3.2s'; el.style.transform='translateY(-200px)'; el.style.opacity='0';},30); setTimeout(()=> el.remove(), 3400); burst(innerWidth/2, innerHeight*0.55, 80); }

// ===== Organizer (export/import) =====
const todoList=document.getElementById('todoList'), todoForm=document.getElementById('todoForm'), todoInput=document.getElementById('todoInput'), clearDone=document.getElementById('clearDone');
let todos = JSON.parse(localStorage.getItem('todos')||'[]');
function renderTodos(){ todoList.innerHTML=''; todos.forEach((t,i)=>{ const li=document.createElement('li'); li.className='todo-item'+(t.done?' done':''); const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=t.done; const span=document.createElement('span'); span.textContent=t.text; const del=document.createElement('button'); del.textContent='✖'; del.className='btn small outline'; cb.addEventListener('change', ()=>{ t.done=cb.checked; saveTodos(); }); del.addEventListener('click', ()=>{ todos.splice(i,1); saveTodos(); }); li.append(cb,span,del); todoList.appendChild(li); }); }
function saveTodos(){ localStorage.setItem('todos', JSON.stringify(todos)); renderTodos(); }
todoForm.addEventListener('submit', e=>{ e.preventDefault(); const v=todoInput.value.trim(); if(!v) return; todos.push({text:v,done:false}); todoInput.value=''; saveTodos(); }); clearDone.addEventListener('click', ()=>{ todos = todos.filter(t=>!t.done); saveTodos(); }); renderTodos();
document.getElementById('exportList').addEventListener('click', ()=>{ const blob=new Blob([JSON.stringify(todos)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='checklist.json'; a.click(); });
document.getElementById('importList').addEventListener('change', (e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ todos=JSON.parse(r.result); saveTodos(); }catch{} }; r.readAsText(f); });

// ===== Baking Timers =====
let tInt=null, remaining=0;
const timeLeft=document.getElementById('timeLeft');
function fmt(n){ return String(n).padStart(2,'0'); }
function show(){ timeLeft.textContent = fmt(Math.floor(remaining/60))+':'+fmt(remaining%60); }
function chime(){ new Audio('data:audio/wav;base64,UklGRmQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAChAAAAAAA=').play().catch(()=>{}); }
document.querySelectorAll('.recipe').forEach(btn=> btn.addEventListener('click', ()=>{ remaining = parseInt(btn.dataset.min)*60 + parseInt(btn.dataset.sec); if(tInt) clearInterval(tInt); show(); tInt=setInterval(()=>{ remaining--; show(); if(remaining<=0){ clearInterval(tInt); tInt=null; chime(); burst(innerWidth/2, innerHeight*0.2, 160); } },1000); }));
document.getElementById('stopTimer').addEventListener('click', ()=>{ if(tInt) clearInterval(tInt); tInt=null; });

// ===== Photo Booth (drag + filters) =====
const area = document.getElementById('polaroids');
const polaroids=[...document.querySelectorAll('.polaroid')];
polaroids.forEach((p,i)=>{ p.style.left=20+i*220+'px'; p.style.top=20+(i%2)*30+'px'; p.addEventListener('dblclick', ()=> p.classList.toggle('pinned')); p.addEventListener('mousedown', (e)=>{ if(p.classList.contains('pinned')) return; const sx=e.clientX, sy=e.clientY, rect=p.getBoundingClientRect(), ox=sx-rect.left, oy=sy-rect.top; function move(ev){ p.style.left=(ev.clientX-ox-area.getBoundingClientRect().left)+'px'; p.style.top=(ev.clientY-oy-area.getBoundingClientRect().top)+'px'; } function up(){ removeEventListener('mousemove', move); removeEventListener('mouseup', up);} addEventListener('mousemove', move); addEventListener('mouseup', up); }); });
const filterRow = document.querySelector('.filter-row');
filterRow.addEventListener('change', (e)=>{ const v=e.target.value; area.classList.remove('filter-none','filter-vintage','filter-dreamy','filter-bw'); area.classList.add('filter-'+v); });

// ===== Moodboard Theme Picker =====
const accent=document.getElementById('accentPicker'), cream=document.getElementById('creamPicker');
const saved=JSON.parse(localStorage.getItem('theme')||'null'); if(saved){ document.documentElement.style.setProperty('--cherry', saved.accent); document.documentElement.style.setProperty('--cream-2', saved.cream); accent.value=saved.accent; cream.value=saved.cream; }
document.getElementById('saveTheme').addEventListener('click', ()=>{ const t={accent: accent.value, cream: cream.value}; localStorage.setItem('theme', JSON.stringify(t)); document.documentElement.style.setProperty('--cherry', t.accent); document.documentElement.style.setProperty('--cream-2', t.cream); burst(); });
document.getElementById('resetTheme').addEventListener('click', ()=>{ localStorage.removeItem('theme'); location.reload(); });

// ===== Equalizer Animation =====
const eq=document.getElementById('eq').getContext('2d'); let tick=0;
function drawEq(){ const w=420,h=120; eq.clearRect(0,0,w,h); const bars=28; for(let i=0;i<bars;i++){ const x=i*(w/bars)+4, bw= (w/bars)-8; const val = Math.abs(Math.sin((i+tick/10))) * 0.8 + 0.15; const bh = val*h; eq.fillStyle = i%3? '#cc2035':'#e94a5a'; eq.fillRect(x, h-bh, bw, bh); } tick++; requestAnimationFrame(drawEq); } drawEq();

// ===== Cherry Clicker Game =====
const gameArea=document.getElementById('gameArea'), scoreEl=document.getElementById('score'); let gameInt=null, score=0;
document.getElementById('startGame').addEventListener('click', ()=>{ score=0; scoreEl.textContent='Score: 0'; gameArea.innerHTML=''; if(gameInt) clearInterval(gameInt); gameInt=setInterval(spawnCherry, 800); setTimeout(()=>{ clearInterval(gameInt); gameInt=null; burst(); }, 20000); });
function spawnCherry(){ const c=document.createElement('div'); c.className='cherry'; const w=gameArea.clientWidth-26, h=gameArea.clientHeight-26; c.style.left=Math.random()*w+'px'; c.style.top=Math.random()*h+'px'; gameArea.appendChild(c); const kill=setTimeout(()=> c.remove(), 1200); c.addEventListener('click', ()=>{ clearTimeout(kill); c.remove(); score++; scoreEl.textContent='Score: '+score; }); }

// ===== Cassette Player =====
const audio=document.getElementById('player');
document.getElementById('btnPlay').addEventListener('click', ()=> audio.play());
document.getElementById('btnPause').addEventListener('click', ()=> audio.pause());
document.getElementById('btnRew').addEventListener('click', ()=>{ audio.currentTime=0; audio.pause(); });
document.getElementById('playMusic').addEventListener('click', ()=> audio.play());

// ===== Compliment Jar =====
const fortunesDefault = [
  'You make the room feel like warm cake out of the oven.',
  'Your organizing superpowers are genuinely magical.',
  'You’re the cherry on top of every day.',
  'Your 80s vibes? Iconic.',
  'Your kindness is sweeter than frosting.',
  'You notice the little things — and that changes everything.'
];
let fortunes = JSON.parse(localStorage.getItem('fortunes')||'null') || fortunesDefault.slice();
function saveFortunes(){ localStorage.setItem('fortunes', JSON.stringify(fortunes)); }
document.getElementById('drawFortune').addEventListener('click', ()=>{ if(!fortunes.length) fortunes = fortunesDefault.slice(); const idx=Math.floor(Math.random()*fortunes.length); const msg=fortunes.splice(idx,1)[0]; document.getElementById('fortuneText').textContent=msg; saveFortunes(); burst(innerWidth*0.6, innerHeight*0.65, 80); });
document.getElementById('addFortuneForm').addEventListener('submit', (e)=>{ e.preventDefault(); const v=document.getElementById('addFortune').value.trim(); if(!v) return; fortunes.push(v); saveFortunes(); e.target.reset(); });

// ===== Guestbook =====
const gbForm=document.getElementById('gbForm'), gbList=document.getElementById('gbList'); let guestbook=JSON.parse(localStorage.getItem('guestbook')||'[]');
function renderGB(){ gbList.innerHTML=''; guestbook.forEach(g=>{ const li=document.createElement('li'); li.innerHTML=`<strong>${g.name}</strong>: ${g.msg}`; gbList.appendChild(li); }); }
gbForm.addEventListener('submit', e=>{ e.preventDefault(); guestbook.push({name: gbForm.gbName.value.trim()||'Friend', msg: gbForm.gbMsg.value.trim()}); localStorage.setItem('guestbook', JSON.stringify(guestbook)); gbForm.reset(); renderGB(); burst(); }); renderGB();

// Shortcut: C for confetti
addEventListener('keydown', (e)=>{ if(e.key.toLowerCase()==='c') burst(); });


// ===== Message Area =====
const noteEl = document.getElementById('loveNote');
const notePrev = document.getElementById('notePreview');
const savedNote = localStorage.getItem('loveNote') || '';
noteEl.value = savedNote;
notePrev.textContent = savedNote;
noteEl.addEventListener('input', ()=>{
  localStorage.setItem('loveNote', noteEl.value);
  notePrev.textContent = noteEl.value;
});
document.getElementById('copyNote').addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText(noteEl.value); burst(innerWidth*0.7, innerHeight*0.65, 60); }catch(e){}
});
document.getElementById('clearNote').addEventListener('click', ()=>{
  noteEl.value=''; notePrev.textContent=''; localStorage.removeItem('loveNote');
});
