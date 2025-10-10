"use strict";

/* Helper so one error can’t break everything */
const safe = (label, fn) => { try { fn(); } catch (e) { console.error(label, e); } };

/* ========== Confetti ========== */
safe('confetti', () => {
  const canvas = document.getElementById('confetti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const state = { pieces: [], max: 120 };

  const resize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    state.max = innerWidth < 600 ? 60 : 120;
  };
  addEventListener('resize', resize); resize();

  const burst = (x = innerWidth / 2, y = innerHeight / 3, count = state.max) => {
    for (let i = 0; i < count; i++) {
      state.pieces.push({
        x, y,
        vx: (Math.random() * 2 - 1) * 4,
        vy: Math.random() * -6 - 4,
        g: .12 + Math.random() * .08,
        rot: Math.random() * Math.PI,
        vr: (Math.random() * 2 - 1) * .1,
        size: 6 + Math.random() * 6,
        color: Math.random() < .5 ? '#cc2035' : (Math.random() < .7 ? '#e94a5a' : '#c9ad63')
      });
    }
  };

  (function tick(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.pieces = state.pieces.filter(p => p.y < canvas.height + 20);
    for (const p of state.pieces) {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      ctx.restore();
    }
    requestAnimationFrame(tick);
  })();

  document.getElementById('confettiBurst')?.addEventListener('click', () => burst());
  window._burst = burst;
});

/* ========== Checklist ========== */
safe('checklist', () => {
  const listEl = document.getElementById('todoList');
  const form = document.getElementById('todoForm');
  const input = document.getElementById('todoInput');
  const clearBtn = document.getElementById('clearDone');
  if (!listEl || !form || !input || !clearBtn) return;

  let todos = JSON.parse(localStorage.getItem('todos') || '[]');
  const save = () => { localStorage.setItem('todos', JSON.stringify(todos)); render(); };

  function render() {
    listEl.innerHTML = '';
    todos.forEach((t, i) => {
      const li = document.createElement('li'); li.className = 'todo-item' + (t.done ? ' done' : '');
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = t.done;
      const span = document.createElement('span'); span.textContent = t.text;
      const del = document.createElement('button'); del.textContent = '✖'; del.className = 'btn small outline';
      cb.addEventListener('change', () => { t.done = cb.checked; save(); });
      del.addEventListener('click', () => { todos.splice(i, 1); save(); });
      li.append(cb, span, del); listEl.appendChild(li);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim(); if (!v) return;
    todos.push({ text: v, done: false }); input.value = ''; save();
  });
  clearBtn.addEventListener('click', () => { todos = todos.filter(t => !t.done); save(); });

  document.getElementById('exportList')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(todos)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'checklist.json'; a.click();
  });
  document.getElementById('importList')?.addEventListener('change', (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { try { todos = JSON.parse(r.result); save(); } catch {} };
    r.readAsText(f);
  });

  render();
});

/* ========== Baking Timers ========== */
safe('timers', () => {
  const timeLeft = document.getElementById('timeLeft');
  const stopBtn = document.getElementById('stopTimer');
  const btns = [...document.querySelectorAll('.recipe')];
  if (!timeLeft || !stopBtn || !btns.length) return;

  let tInt = null, remaining = 0;
  const fmt = n => String(n).padStart(2, '0');
  const show = () => timeLeft.textContent = `${fmt(Math.floor(remaining/60))}:${fmt(remaining%60)}`;
  const chime = () => new Audio('data:audio/wav;base64,UklGRmQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAChAAAAAAA=').play().catch(()=>{});

  btns.forEach(b => b.addEventListener('click', () => {
    remaining = (+b.dataset.min || 0) * 60 + (+b.dataset.sec || 0);
    if (tInt) clearInterval(tInt);
    show();
    tInt = setInterval(() => {
      remaining--; show();
      if (remaining <= 0) {
        clearInterval(tInt); tInt = null; chime(); window._burst?.(innerWidth/2, innerHeight*0.2, 140);
      }
    }, 1000);
  }));
  stopBtn.addEventListener('click', () => { if (tInt) clearInterval(tInt); tInt = null; });
});

/* ========== Photo Booth (pointer events drag) ========== */
safe('photobooth', () => {
  const area = document.getElementById('polaroids');
  if (!area) return;
  const cards = [...area.querySelectorAll('.polaroid')];

  const place = () => {
    const pad = 16, w = area.clientWidth || 900;
    const step = Math.min(240, Math.max(150, (w - pad*2) / Math.max(3, cards.length)));
    cards.forEach((p, i) => {
      p.style.position = 'absolute';
      p.style.left = `${pad + i*step}px`;
      p.style.top  = `${20 + (i%2)*30}px`;
    });
  };
  (window.ResizeObserver ? new ResizeObserver(place) : window).addEventListener?.('resize', place);
  if (document.readyState === 'complete') place(); else addEventListener('load', place);

  cards.forEach(p => p.addEventListener('dragstart', e => e.preventDefault()));

  let z = 1;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  cards.forEach(p => {
    p.style.touchAction = 'none';
    p.addEventListener('dblclick', () => p.classList.toggle('pinned'));
    let tapTimer = null;
    p.addEventListener('touchend', () => {
      if (tapTimer) { clearTimeout(tapTimer); tapTimer = null; p.classList.toggle('pinned'); }
      else tapTimer = setTimeout(() => tapTimer = null, 250);
    });

    p.addEventListener('pointerdown', (ev) => {
      if (p.classList.contains('pinned')) return;
      p.setPointerCapture?.(ev.pointerId);
      p.style.zIndex = ++z;

      const ar = area.getBoundingClientRect();
      const r = p.getBoundingClientRect();
      const ox = ev.clientX - r.left, oy = ev.clientY - r.top;

      const move = (e) => {
        const left = clamp(e.clientX - ox - ar.left, -10, ar.width - p.offsetWidth + 10);
        const top  = clamp(e.clientY - oy - ar.top , -10, ar.height - p.offsetHeight + 10);
        p.style.left = `${left}px`; p.style.top = `${top}px`;
      };
      const up = () => {
        p.releasePointerCapture?.(ev.pointerId);
        p.removeEventListener('pointermove', move);
        p.removeEventListener('pointerup', up);
        p.removeEventListener('pointercancel', up);
      };
      p.addEventListener('pointermove', move);
      p.addEventListener('pointerup', up);
      p.addEventListener('pointercancel', up);
    });
  });

  document.querySelector('.filter-row')?.addEventListener('change', (e) => {
    const v = e.target?.value; if (!v) return;
    area.classList.remove('filter-none','filter-vintage','filter-dreamy','filter-bw');
    area.classList.add('filter-' + v);
  });
});

/* ========== Compliment Jar — warm, personal, appreciative (not flirty) ========== */
safe('compliments', () => {
  const drawBtn = document.getElementById('drawFortune');
  const addForm = document.getElementById('addFortuneForm');
  const addInput = document.getElementById('addFortune');
  const out = document.getElementById('fortuneText');
  if(!drawBtn || !addForm || !addInput || !out) return;

  const qualities = [
    'patience','integrity','dependability','empathy','focus',
    'sense of balance','steady energy','encouragement','honesty',
    'good judgment','fairness','follow-through','curiosity',
    'calm presence','attention to detail','thoughtfulness','kindness'
  ];

  const strengths = [
    'make people feel comfortable being themselves',
    'keep things calm when they could get stressful',
    'bring out the best in others by how you listen',
    'notice what needs to be done before anyone asks',
    'stay kind even when things get complicated',
    'find words that make people feel understood',
    'make teamwork feel natural and easy',
    'help everyone feel included and valued',
    'turn plans into steady progress',
    'handle challenges without losing patience',
    'see both details and the bigger picture clearly'
  ];

  const closers = [
    'That really stands out about you.',
    'It makes a real difference every time.',
    'It’s something people remember about you.',
    'It quietly lifts the mood around you.',
    'That quality shows genuine character.',
    'People notice that more than you think.',
    'It makes working with you a lot easier.'
  ];

  const starters = [
    'You have a way of','You consistently','You’re really good at','You naturally',
    'You always seem to','You bring','You remind people to','You make it easier to',
    'You help others','You tend to'
  ];

  const softPraises = [
    'You make ordinary moments feel steady and real.',
    'You add a quiet kind of encouragement that matters.',
    'You show care in the small things most people overlook.',
    'You make spaces feel a bit more grounded and calm.',
    'You balance patience with getting things done.',
    'You help people feel safe to be themselves.'
  ];

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  function generateWarm(n = 160){
    const set = new Set(softPraises);
    let guard = 0;
    while (set.size < n && guard < 5000){
      guard++;
      const type = Math.floor(Math.random() * 3);
      let line = '';
      if (type === 0){
        line = `${starters[Math.floor(Math.random()*starters.length)]} ${strengths[Math.floor(Math.random()*strengths.length)]}. ${closers[Math.floor(Math.random()*closers.length)]}`;
      } else if (type === 1){
        line = `Your ${qualities[Math.floor(Math.random()*qualities.length)]} really makes a difference. ${closers[Math.floor(Math.random()*closers.length)]}`;
      } else {
        line = `It’s clear you ${strengths[Math.floor(Math.random()*strengths.length)]}. ${closers[Math.floor(Math.random()*closers.length)]}`;
      }
      set.add(cap(line.replace(/\s+/g,' ').trim()));
    }
    return Array.from(set);
  }

  let fortunes = JSON.parse(localStorage.getItem('fortunes') || 'null');
  if(!fortunes || fortunes.length < 30){
    fortunes = generateWarm(160);
    localStorage.setItem('fortunes', JSON.stringify(fortunes));
  }
  const save = () => localStorage.setItem('fortunes', JSON.stringify(fortunes));

  drawBtn.addEventListener('click', ()=>{
    if(!fortunes.length) fortunes = generateWarm(160);
    const idx = Math.floor(Math.random()*fortunes.length);
    out.style.opacity = 0;
    setTimeout(() => {
      out.textContent = fortunes.splice(idx, 1)[0];
      out.style.opacity = 1;
      save();
      window._burst?.(innerWidth*0.6, innerHeight*0.65, 60);
    }, 120);
  });

  addForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const v = addInput.value.trim();
    if(!v) return;
    fortunes.push(v); save(); addForm.reset();
  });
});

/* ========== Message ========== */
safe('message', () => {
  const note = document.getElementById('loveNote');
  const prev = document.getElementById('notePreview');
  if (!note || !prev) return;
  const saved = localStorage.getItem('loveNote') || '';
  note.value = saved; prev.textContent = saved;
  note.addEventListener('input', () => { localStorage.setItem('loveNote', note.value); prev.textContent = note.value; });
  document.getElementById('copyNote')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(note.value); window._burst?.(innerWidth*0.7, innerHeight*0.65, 50); } catch {}
  });
  document.getElementById('clearNote')?.addEventListener('click', () => {
    note.value = ''; prev.textContent = ''; localStorage.removeItem('loveNote');
  });
});

/* ========== Music: autoplay + loop (mobile-safe) ========== */
safe('music', () => {
  const audio = document.getElementById('player');
  if (!audio) return;
  const tryPlay = () => audio.play().catch(() => {});
  addEventListener('load', () => { audio.volume = 0.9; tryPlay(); });
  const nudge = () => { tryPlay(); };
  addEventListener('pointerdown', nudge, { once: true, capture: true });
});

/* ========== Shortcut ========== */
addEventListener('keydown', e => { if (e.key.toLowerCase() === 'c') window._burst?.(); });