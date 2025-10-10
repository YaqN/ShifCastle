/******* Confetti *******/
const confettiCanvas = document.getElementById('confetti');
let maxConfetti = 120;
if (confettiCanvas) {
  const ctx = confettiCanvas.getContext('2d', { alpha: true });
  function resizeCanvas(){
    confettiCanvas.width = innerWidth;
    confettiCanvas.height = innerHeight;
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
  function tick(){
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    confettiPieces = confettiPieces.filter(p=> p.y < confettiCanvas.height+20);
    confettiPieces.forEach(p=>{
      p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.color;
      ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
      ctx.restore();
    });
    requestAnimationFrame(tick);
  }
  tick();

  const confettiBtn = document.getElementById('confettiBurst');
  confettiBtn?.addEventListener('click', ()=> burst());
  // Expose for other sections
  window._burst = burst;
}

/******* Checklist (Organizer) *******/
(()=>{
  const listEl = document.getElementById('todoList');
  const form = document.getElementById('todoForm');
  const input = document.getElementById('todoInput');
  const clearBtn = document.getElementById('clearDone');
  if(!listEl || !form || !input || !clearBtn) return;

  let todos = JSON.parse(localStorage.getItem('todos')||'[]');

  function render(){
    listEl.innerHTML='';
    todos.forEach((t,i)=>{
      const li=document.createElement('li');
      li.className='todo-item'+(t.done?' done':'');
      const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=t.done;
      const span=document.createElement('span'); span.textContent=t.text;
      const del=document.createElement('button'); del.textContent='✖'; del.className='btn small outline';
      cb.addEventListener('change', ()=>{ t.done=cb.checked; save(); });
      del.addEventListener('click', ()=>{ todos.splice(i,1); save(); });
      li.append(cb,span,del); listEl.appendChild(li);
    });
  }
  function save(){ localStorage.setItem('todos', JSON.stringify(todos)); render(); }

  form.addEventListener('submit', e=>{
    e.preventDefault(); const v=input.value.trim(); if(!v) return;
    todos.push({text:v,done:false}); input.value=''; save();
  });
  clearBtn.addEventListener('click', ()=>{ todos = todos.filter(t=>!t.done); save(); });

  document.getElementById('exportList')?.addEventListener('click', ()=>{
    const blob=new Blob([JSON.stringify(todos)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='checklist.json'; a.click();
  });
  document.getElementById('importList')?.addEventListener('change', (e)=>{
    const f=e.target.files?.[0]; if(!f) return; const r=new FileReader();
    r.onload=()=>{ try{ todos=JSON.parse(r.result); save(); }catch{} };
    r.readAsText(f);
  });

  render();
})();

/******* Baking Timers *******/
(()=>{
  const timeLeft=document.getElementById('timeLeft');
  const stopBtn=document.getElementById('stopTimer');
  const recipeBtns = document.querySelectorAll('.recipe');
  if(!timeLeft || !stopBtn || !recipeBtns.length) return;

  let tInt=null, remaining=0;
  const fmt=n=>String(n).padStart(2,'0');
  const show=()=> timeLeft.textContent = fmt(Math.floor(remaining/60))+':'+fmt(remaining%60);
  const chime=()=> new Audio('data:audio/wav;base64,UklGRmQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAChAAAAAAA=').play().catch(()=>{});

  recipeBtns.forEach(btn=> btn.addEventListener('click', ()=>{
    remaining = (+btn.dataset.min||0)*60 + (+btn.dataset.sec||0);
    if(tInt) clearInterval(tInt); show();
    tInt=setInterval(()=>{
      remaining--; show();
      if(remaining<=0){ clearInterval(tInt); tInt=null; chime(); window._burst?.(innerWidth/2, innerHeight*0.2, Math.round(maxConfetti*1.2)||120); }
    },1000);
  }));
  stopBtn.addEventListener('click', ()=>{ if(tInt) clearInterval(tInt); tInt=null; });
})();

/******* Photo Booth (drag + filters; mouse + touch) *******/
(()=>{
  const area = document.getElementById('polaroids');
  if(!area) return;
  const polaroids = [...area.querySelectorAll('.polaroid')];

  // Initial placement that adapts to container width
  function place(){
    const base = 16;
    const w = area.clientWidth || 900;
    const step = Math.min(240, Math.max(150, (w - base*2) / Math.max(3, polaroids.length)));
    polaroids.forEach((p,i)=>{
      p.style.position='absolute';
      p.style.left = (base + i*step) + 'px';
      p.style.top  = (20 + (i%2)*30) + 'px';
    });
  }
  // Run once images load and when container resizes
  const ro = new ResizeObserver(()=> place());
  ro.observe(area);
  // If images are still loading, place after load
  if (document.readyState === 'complete') place(); else addEventListener('load', place);

  // Drag helpers
  function startDrag(p, sx, sy){
    if(p.classList.contains('pinned')) return;
    const rect=p.getBoundingClientRect(), ar=area.getBoundingClientRect();
    const ox=sx-rect.left, oy=sy-rect.top;

    function clamp(val, min, max){ return Math.max(min, Math.min(max, val)); }

    const onMove = (ev)=>{
      const x = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const left = clamp(x - ox - ar.left, -10, ar.width - p.offsetWidth + 10);
      const top  = clamp(y - oy - ar.top , -10, ar.height - p.offsetHeight + 10);
      p.style.left = left + 'px';
      p.style.top  = top + 'px';
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
  }

  // Attach per card
  polaroids.forEach((p)=>{
    // Pin toggle on double click/tap
    p.addEventListener('dblclick', ()=> p.classList.toggle('pinned'));
    let tapTimer=null;
    p.addEventListener('touchend', ()=>{
      if(tapTimer){ clearTimeout(tapTimer); tapTimer=null; p.classList.toggle('pinned'); }
      else tapTimer=setTimeout(()=> tapTimer=null, 250);
    });

    // Start drag (mouse + touch)
    p.addEventListener('mousedown', e=> startDrag(p, e.clientX, e.clientY));
    p.addEventListener('touchstart', e=>{
      const t=e.touches[0]; startDrag(p, t.clientX, t.clientY);
    }, {passive:true});
  });

  // Filters
  const filterRow = document.querySelector('.filter-row');
  filterRow?.addEventListener('change', (e)=>{
    const v=e.target?.value;
    if(!v) return;
    area.classList.remove('filter-none','filter-vintage','filter-dreamy','filter-bw');
    area.classList.add('filter-'+v);
  });
})();

/******* Compliment Jar — auto-generate 100+ compliments *******/
(()=>{
  const drawBtn = document.getElementById('drawFortune');
  const addForm = document.getElementById('addFortuneForm');
  const addInput = document.getElementById('addFortune');
  const out = document.getElementById('fortuneText');
  if(!drawBtn || !addForm || !addInput || !out) return;

  // Seed a few handcrafted lines (nice variety to start)
  const seeds = [
    'You make every moment brighter.',
    'Your smile could light up the 80s disco floor!',
    'You’re the cherry on top of life’s sundae.',
    'Your kindness is sweeter than frosting.',
    'Your vibes? Totally radical 💿🎧',
    'You make nostalgia feel brand new.',
    'You’re the cozy glow after the credits roll.',
    'You make ordinary days feel cinematic.',
    'Your laugh sounds like confetti feels.',
    'You’re the perfect plot twist.'
  ];

  // Random helper
  const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Template parts for auto-generation
  const openers = [
    'you have', 'you radiate', 'you bring', 'you spark', 'you embody',
    'you shine with', 'you overflow with', 'you glow with'
  ];
  const adjectives = [
    'radiant', 'brilliant', 'magnetic', 'effortless', 'genuine', 'fearless',
    'gentle', 'wholesome', 'stellar', 'legendary', 'sparkling', 'golden',
    'iconic', 'charming', 'remarkable', 'quietly powerful', 'unshakable',
    'playful', 'graceful', 'serene', 'invincible', 'electric', 'glowing'
  ];
  const traits = [
    'kindness', 'confidence', 'curiosity', 'creativity', 'warmth', 'patience',
    'grit', 'clarity', 'style', 'humor', 'focus', 'honesty', 'vision',
    'empathy', 'energy', 'calm', 'heart', 'brilliance'
  ];
  const effects = [
    'brighter', 'easier', 'softer', 'happier', 'warmer', 'calmer',
    'more magical', 'more hopeful', 'more fun', 'like home'
  ];
  const closers = [
    'and it shows.', 'and it’s unforgettable.', 'and it lifts everyone.',
    'and the world notices.', 'and it changes the room.',
    'and it makes a difference.', 'every single day.'
  ];
  const metaphors = [
    'a neon skyline at midnight', 'a perfect chorus', 'sunlight on fresh snow',
    'the first sip of morning coffee', 'a vinyl crackle before the hit drops',
    'the last page of a great book', 'a warm bakery at dawn',
    'a lucky song on repeat', 'a cozy cinema on a rainy day',
    'cherries on a cake', 'a sunset that lingers'
  ];

  function generateCompliments(target = 100) {
    const set = new Set(seeds);

    // a couple formats so lines feel different
    const formatters = [
      () => `${cap(r(openers))} ${r(adjectives)} ${r(traits)} — ${r(closers)}`,
      () => `You make everything feel ${r(effects)}.`,
      () => `You’re ${r(adjectives)} and ${r(adjectives)} — like ${r(metaphors)}.`,
      () => `Your ${r(traits)} is downright ${r(adjectives)}.`,
      () => `People feel ${r(effects)} around you.`
    ];

    // try to produce unique lines
    let guard = 0;
    while (set.size < seeds.length + target && guard < 5000) {
      guard++;
      const line = formatters[Math.floor(Math.random() * formatters.length)]()
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^you /i, 'You ');
      set.add(line);
    }
    return Array.from(set);
  }

  // Build 100+ and persist
  let fortunes = JSON.parse(localStorage.getItem('fortunes') || 'null');
  if (!fortunes || fortunes.length < 20) {
    fortunes = generateCompliments(120); // generate a little extra
    localStorage.setItem('fortunes', JSON.stringify(fortunes));
  }

  const save = () => localStorage.setItem('fortunes', JSON.stringify(fortunes));

  // Draw a random compliment (without replacement until pool resets)
  drawBtn.addEventListener('click', () => {
    if (!fortunes.length) {
      fortunes = generateCompliments(120);
    }
    const idx = Math.floor(Math.random() * fortunes.length);
    out.textContent = fortunes.splice(idx, 1)[0];
    save();
    window._burst?.(innerWidth * 0.6, innerHeight * 0.65, Math.round((window.maxConfetti || 120) * 0.6));
  });

  // Allow adding custom compliments
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = addInput.value.trim();
    if (!v) return;
    fortunes.push(v);
    save();
    addForm.reset();
  });
})();


  addForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const v = addInput.value.trim();
    if(!v) return;
    fortunes.push(v); save(); addForm.reset();
  });
})();

/******* Message Area *******/
(()=>{
  const note = document.getElementById('loveNote');
  const prev = document.getElementById('notePreview');
  if(!note || !prev) return;
  const saved = localStorage.getItem('loveNote') || '';
  note.value = saved; prev.textContent = saved;
  note.addEventListener('input', ()=>{
    localStorage.setItem('loveNote', note.value);
    prev.textContent = note.value;
  });
  document.getElementById('copyNote')?.addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(note.value); window._burst?.(innerWidth*0.7, innerHeight*0.65, Math.round(maxConfetti*0.5)||50); }catch(_){}
  });
  document.getElementById('clearNote')?.addEventListener('click', ()=>{
    note.value=''; prev.textContent=''; localStorage.removeItem('loveNote');
  });
})();

/******* Music: make sure autoplay kicks in after first tap *******/
(()=>{
  const audio = document.getElementById('player');
  if(!audio) return;
  document.addEventListener('click', ()=>{
    if(audio.paused) audio.play().catch(()=>{});
  }, { once:true });
})();

/******* Keyboard shortcut for confetti *******/
addEventListener('keydown', (e)=>{ if(e.key.toLowerCase()==='c') window._burst?.(); });
