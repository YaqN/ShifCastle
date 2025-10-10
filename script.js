// Confetti animation (vanilla)
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');
function resizeCanvas(){ confettiCanvas.width = innerWidth; confettiCanvas.height = innerHeight; }
addEventListener('resize', resizeCanvas); resizeCanvas();

let confettiPieces = [];
function burst(x = innerWidth/2, y = innerHeight/3, count = 120){
  for(let i=0;i<count;i++){
    confettiPieces.push({
      x, y,
      vx: (Math.random()*2-1)*4,
      vy: Math.random()*-6 - 4,
      g: 0.12 + Math.random()*0.08,
      rot: Math.random()*Math.PI,
      vr: (Math.random()*2-1)*0.1,
      size: 6 + Math.random()*6,
      color: Math.random() < .5 ? '#cc2035' : (Math.random() < .7 ? '#e94a5a' : '#c9ad63')
    });
  }
}
function confettiTick(){
  ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height+20);
  confettiPieces.forEach(p => {
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
    ctx.restore();
  });
  requestAnimationFrame(confettiTick);
}
confettiTick();
document.getElementById('confettiBurst').addEventListener('click', () => burst());

// Candles: blow out with key 'B' or click
const flames = [...document.querySelectorAll('.flame')];
function toggleFlame(el){ el.classList.toggle('off'); burst(Math.random()*innerWidth, innerHeight*0.3 + Math.random()*80, 30); }
flames.forEach(f => f.addEventListener('click', () => toggleFlame(f)));
addEventListener('keydown', (e)=>{ if(e.key.toLowerCase()==='b'){ flames.forEach(f => f.classList.add('off')); burst(innerWidth/2, innerHeight*0.25, 200); }});

// Wish typing -> floating text
const wishInput = document.getElementById('wishInput');
document.getElementById('wishBtn').addEventListener('click', () => {
  const t = wishInput.value.trim();
  if(!t) return;
  floatingWish(t);
  wishInput.value='';
});
function floatingWish(text){
  const el = document.createElement('div');
  el.className='floating';
  el.textContent = text;
  Object.assign(el.style, {
    position:'fixed', left: (innerWidth/2-120 + (Math.random()*240))+'px',
    top: (innerHeight*0.55)+'px', fontWeight:'700', color:'#cc2035',
    filter:'drop-shadow(0 6px 12px rgba(0,0,0,.15))'
  });
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.transition='transform 3.2s ease, opacity 3.2s'; el.style.transform='translateY(-200px)'; el.style.opacity='0'; }, 30);
  setTimeout(()=> el.remove(), 3400);
  burst(innerWidth/2, innerHeight*0.55, 80);
}

// Todo organizer with localStorage
const todoList = document.getElementById('todoList');
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const clearDoneBtn = document.getElementById('clearDone');

let todos = JSON.parse(localStorage.getItem('todos')||'[]');
function renderTodos(){
  todoList.innerHTML='';
  todos.forEach((t,i)=>{
    const li = document.createElement('li'); li.className='todo-item' + (t.done?' done':'');
    const cb = document.createElement('input'); cb.type='checkbox'; cb.checked=t.done;
    const span = document.createElement('span'); span.textContent = t.text;
    const del = document.createElement('button'); del.textContent='✖'; del.className='btn small outline';
    cb.addEventListener('change', ()=>{ t.done=cb.checked; saveTodos(); });
    del.addEventListener('click', ()=>{ todos.splice(i,1); saveTodos(); });
    li.append(cb, span, del); todoList.appendChild(li);
  });
}
function saveTodos(){ localStorage.setItem('todos', JSON.stringify(todos)); renderTodos(); }
todoForm.addEventListener('submit', e=>{ e.preventDefault(); const v=todoInput.value.trim(); if(!v) return; todos.push({text:v, done:false}); todoInput.value=''; saveTodos(); });
clearDoneBtn.addEventListener('click', ()=>{ todos = todos.filter(t=>!t.done); saveTodos(); });
renderTodos();

// Baking timer
const minEl = document.getElementById('min'), secEl = document.getElementById('sec'), timeLeft = document.getElementById('timeLeft');
let tInt=null, remaining=0;
function fmt(n){ return String(n).padStart(2,'0'); }
function updateDisplay(){ timeLeft.textContent = fmt(Math.floor(remaining/60))+':'+fmt(remaining%60); }
document.getElementById('startTimer').addEventListener('click', ()=>{
  remaining = Math.max(0, parseInt(minEl.value||0)*60 + parseInt(secEl.value||0));
  if(tInt) clearInterval(tInt);
  updateDisplay();
  tInt = setInterval(()=>{
    remaining--; updateDisplay();
    if(remaining<=0){ clearInterval(tInt); tInt=null; chime(); burst(innerWidth/2, innerHeight*0.2, 160); }
  }, 1000);
});
document.getElementById('stopTimer').addEventListener('click', ()=>{ if(tInt) clearInterval(tInt); tInt=null; });
function chime(){ const a = new Audio('data:audio/wav;base64,UklGRmQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAChAAAAAAA...'); a.play(); }

// Simple draggable polaroids + pinning
const area = document.getElementById('polaroids');
const polaroids = [...document.querySelectorAll('.polaroid')];
polaroids.forEach((p,i)=>{
  p.style.position='absolute';
  p.style.left = 20 + i*220 + 'px';
  p.style.top = 20 + (i%2)*30 + 'px';
  p.addEventListener('dblclick', ()=> p.classList.toggle('pinned'));
  p.addEventListener('mousedown', (e)=> {
    if(p.classList.contains('pinned')) return;
    const sx=e.clientX, sy=e.clientY;
    const rect = p.getBoundingClientRect();
    const ox = sx-rect.left, oy=sy-rect.top;
    function move(ev){ p.style.left = (ev.clientX-ox-area.getBoundingClientRect().left)+'px'; p.style.top = (ev.clientY-oy-area.getBoundingClientRect().top)+'px';}
    function up(){ removeEventListener('mousemove', move); removeEventListener('mouseup', up); }
    addEventListener('mousemove', move);
    addEventListener('mouseup', up);
  });
});

// Cassette fake player visuals + optional track
const audio = document.getElementById('player');
fetch('assets/track.mp3').then(r=> { if(r.ok){ audio.src='assets/track.mp3'; } });
document.getElementById('btnPlay').addEventListener('click', ()=> audio.play());
document.getElementById('btnPause').addEventListener('click', ()=> audio.pause());
document.getElementById('btnRew').addEventListener('click', ()=> { audio.currentTime = 0; audio.pause(); });
document.getElementById('playMusic').addEventListener('click', ()=> audio.play());

// Guestbook (localStorage)
const gbForm = document.getElementById('gbForm');
const gbList = document.getElementById('gbList');
let guestbook = JSON.parse(localStorage.getItem('guestbook')||'[]');
function renderGB(){
  gbList.innerHTML='';
  guestbook.forEach((g,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${g.name}</strong>: ${g.msg}`;
    gbList.appendChild(li);
  });
}
gbForm.addEventListener('submit', e=>{
  e.preventDefault();
  guestbook.push({name: gbForm.gbName.value.trim()||'Friend', msg: gbForm.gbMsg.value.trim()});
  localStorage.setItem('guestbook', JSON.stringify(guestbook));
  gbForm.reset(); renderGB(); burst();
});
renderGB();

// Shortcut: C for confetti
addEventListener('keydown', (e)=>{ if(e.key.toLowerCase()==='c') burst(); });
