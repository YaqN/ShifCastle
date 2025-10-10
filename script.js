// ===== Confetti =====
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d', { alpha: true });
let maxConfetti = 120;

function resizeCanvas(){
  confettiCanvas.width  = innerWidth;
  confettiCanvas.height = innerHeight;
  // Lighter effects on small screens
  maxConfetti = innerWidth < 600 ? 60 : 120;
}
addEventListener('resize', resizeCanvas);
resizeCanvas();

let confettiPieces = [];
function burst(x = innerWidth/2, y = innerHeight/3, count = maxConfetti){
  for(let i=0;i<count;i++){
    confettiPieces.push({
      x, y,
      vx:(Math.random()*2-1)*4,
      vy:Math.random()*-6-4,
      g:.12+Math.random()*.08,
      rot:Math.random()*Math.PI,
      vr:(Math.random()*2-1)*.1,
      size:6+Math.random()*6,
      color: Math.random()<.5?'#cc2035':(Math.random()<.7?'#e94a5a':'#c9ad63')
    });
  }
}
function confettiTick(){
  ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  confettiPieces = confettiPieces.filter(p=> p.y < confettiCanvas.height+20);
  confettiPieces.forEach(p=>{
    p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.color;
    ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
    ctx.restore();
  });
  requestAnimationFrame(confettiTick);
}
confettiTick();
document.getElementById('confettiBurst').addEventListener('click', ()=> burst());

// ===== Candles & Wishes =====
const flames = [...document.querySelectorAll('.flame')];
function toggleFlame(el){ el.classList.toggle('off'); burst(Math.random()*innerWidth, innerHeight*0.3 + Math.random()*80, Math.round(maxConfetti/4)); }
flames.forEach(f => f.addEventListener('click', ()=> toggleFlame(f)));
addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase()==='b'){
    flames.forEach(f=>f.classList.add('off'));
    burst(innerWidth/2, innerHeight*0.25, maxConfetti*1.7);
  }
});
const wishInput = document.getElementById('wishInput');
document.getElementById('wishBtn').addEventListener('click', ()=>{
  const t=wishInput.value.trim(); if(!t) return;
  floatingWish(t); wishInput.value='';
});
function floatingWish(text){
  const el=document.createElement('div');
  el.className='floating';
  el.textContent=text;
  Object.assign(el.style,{
    position:'fixed',left:(innerWidth/2-120 + (Math.random()*240))+'px',
    top:(innerHeight*0.55)+'px',fontWeight:'700',color:'#cc2035',
    filter:'drop-shadow(0 6px 12px rgba(0,0,0,.15))',fontSize:'clamp(16px,4vw,24px)'
  });
  document.body.appendChild(el);
  setTimeout(()=>{
    el.style.transition='transform 3.2s ease, opacity 3.2s';
    el.style.transform='translateY(-200px)';
    el.style.opacity='0';
  },30);
  setTimeout(()=> el.remove(), 3400);
  burst(innerWidth/2, innerHeight*0.55, Math.round(maxConfetti*0.7));
}

// ===== Organizer (export/import) =====
const todoList=document.getElementById('todoList'),
      todoForm=document.getElementById('todoForm'),
      todoInput=document.getElementById('todoInput'),
      clearDone=document.getElementById('clearDone');
let todos = JSON.parse(localStorage.getItem('todos')||'[]');

function renderTodos(){
  todoList.innerHTML='';
  todos.forEach((t,i)=>{
    const li=document.createElement('li');
    li.className='todo-item'+(t.done?' done':'');
    const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=t.done;
    const span=document.createElement('span'); span.textContent=t.text;
    const del=document.createElement('button'); del.textContent='✖'; del.className='btn small outline';
    cb.addEventListener('change', ()=>{ t.done=cb.checked; saveTodos(); });
    del.addEventListener('click', ()=>{ todos.splice(i,1); saveTodos(); });
    li.append(cb,span,del); todoList.appendChild(li);
  });
}
function saveTodos(){ localStorage.setItem('todos', JSON.stringify(todos)); renderTodos(); }
todoForm.addEventListener('submit', e=>{
  e.preventDefault();
  const v=todoInput.value.trim(); if(!v) return;
  todos.push({text:v,done:false}); todoInput.value=''; saveTodos();
});
clearDone.addEventListener('click', ()=>{ todos = todos.filter(t=>!t.done); saveTodos(); });
renderTodos();
document.getElementById('exportList').addEventListener('click', ()=>{
  const blob=new Blob([JSON.stringify(todos)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='checklist.json'; a.click();
});
document.getElementById('importList').addEventListener('change', (e)=>{
  const f=e.target.files[0]; if(!f) return; const r=new FileReader();
  r.onload=()=>{ try{ todos=JSON.parse(r.result); saveTodos(); }catch{} };
  r.readAsText(f);
});

// ===== Baking Timers =====
let tInt=null, remaining=0;
const timeLeft=document.getElementById('timeLeft');
function fmt(n){ return String(n).padStart(2,'0'); }
function show(){ timeLeft.textContent = fmt(Math.floor(remaining/60))+':'+fmt(remaining%60); }
function chime(){ new Audio('data:audio/wav;base64,UklGRmQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAChAAAAAAA=').play().catch(()=>{}); }
document.querySelectorAll('.recipe').forEach(btn=> btn.addEventListener('click', ()=>{
  remaining = parseInt(btn.dataset.min)*60 + parseInt(btn.dataset.sec);
  if(tInt) clearInterval(tInt); show();
  tInt=setInterval(()=>{
    remaining--; show();
    if(remaining<=0){ clearInterval(tInt); tInt=null; chime(); burst(innerWidth/2, innerHeight*0.2, maxConfetti*1.3); }
  },1000);
}));
document.getElementById('stopTimer').addEventListener('click', ()=>{ if(tInt) clearInterval(tInt); tInt=null; });

// ===== Photo Booth (drag + filters; adds touch support) =====
const area = document.getElementById('polaroids');
const polaroids=[...document.querySelectorAll('.polaroid')];
// Initial placement that adapts to container width
function placePolaroids(){
  const baseLeft = 16;
  const step = Math.min(200, Math.max(140, (area.clientWidth- baseLeft*2)/3));
  polaroids.forEach((p,i)=>{
    p.style.left = (baseLeft + i*step) + 'px';
    p.style.top  = (20 + (i%2)*30) + 'px';
  });
}
new ResizeObserver(placePolaroids).observe(area);

polaroids.forEach((p)=>{
  // Pin on double click or double tap
  p.addEventListener('dblclick', ()=> p.classList.toggle('pinned'));
  p.addEventListener('touchend', (e)=>{
    if(e.detail===2) p.classList.toggle('pinned');
  });

  const startDrag = (sx, sy) => {
    if(p.classList.contains('pinned')) return;
    const rect=p.getBoundingClientRect(),
          ar=area.getBoundingClientRect(),
          ox=sx-rect.left, oy=sy-rect.top;
    const move = (x,y)=>{
      p.style.left=(x-ox-ar.left)+'px';
      p.style.top =(y-oy-ar.top )+'px';
    };
    const onMove = (ev)=>{
      if(ev.touches){ move(ev.touches[0].clientX, ev.touches[0].clientY); }
      else{ move(ev.clientX, ev.clientY); }
    };
    const onUp = ()=>{
      removeEventListener('mousemove', onMove);
      removeEventListener('mouseup', onUp);
      removeEventListener('touchmove', onMove);
      removeEventListener('touchend', onUp);
    };
    addEventListener('mousemove', onMove);
    addEventListener('mouseup', onUp);
    addEventListener('touchmove', onMove, {passive:false});
    addEventListener('touchend', onUp);
  };

  p.addEventListener('mousedown', (e)=> startDrag(e.clientX, e.clientY));
  p.addEventListener('touchstart', (e)=> { const t=e.touches[0]; startDrag(t.clientX, t.clientY); }, {passive:true});
});

const filterRow = document.querySelector('.filter-row');
filterRow.addEventListener('change', (e)=>{
  const v=e.target.value;
  area.classList.remove('filter-none','filter-vintage','filter-dreamy','filter-bw');
  area.classList.add('filter-'+v);
});

// ===== Moodboard Theme Picker =====
const accent=document.getElementById('accentPicker'),
      cream=document.getElementById('creamPicker');
const saved=JSON.parse(localStorage.getItem('theme')||'null');
if(saved){
  document.documentElement.style.setProperty('--cherry', saved.accent);
  document.documentElement.style.setProperty('--cream-2', saved.cream);
  accent.value=saved.accent; cream.value=saved.cream;
}
document.getElementById('saveTheme').addEventListener('click', ()=>{
  const t={accent: accent.value, cream: cream.value};
  localStorage.setItem('theme', JSON.stringify(t));
  document.documentElement.style.setProperty('--cherry', t.accent);
  document.documentElement.style.setProperty('--cream-2', t.cream);
  burst();
});
document.getElementBy
