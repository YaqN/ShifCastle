/******* Confetti, Checklist, Baking, Photo Booth, Message same as before *******/
/******* Only Compliment Jar is changed *******/

(()=>{  // --- Compliment Jar ---
  const drawBtn = document.getElementById('drawFortune');
  const addForm = document.getElementById('addFortuneForm');
  const addInput = document.getElementById('addFortune');
  const out = document.getElementById('fortuneText');
  if(!drawBtn || !addForm || !addInput || !out) return;

  const adjectives = [
    'beautiful','breathtaking','radiant','captivating','lovely','elegant',
    'graceful','gentle','magnetic','kind','sweet','irresistible','precious',
    'gorgeous','delightful','adorable','heart-melting','charming','dreamy',
    'dazzling','mesmerizing','wonderful','pure','brilliant','angelic',
    'enchanting','endearing','amazing','soft-hearted','cute','remarkable',
    'brave','stunning','serene','sparkling','glowing','incredible','warm',
    'intelligent','selfless','special','rare','playful','calm','joyful',
    'tender','soothing','thoughtful','caring','mesmerizing','amazing',
    'radiant','beautiful','glorious','bright','lovable','inspiring','strong',
    'kindhearted','unique','unforgettable','gentle-souled','sweet-spirited'
  ];

  const nouns = [
    'soul','smile','heart','eyes','voice','laugh','mind','energy','spirit',
    'presence','touch','kindness','beauty','warmth','glow','essence',
    'grace','aura','humor','thoughtfulness'
  ];

  const intros = [
    'You have the most','There’s something about your','Every time I see your',
    'You don’t realize how','You truly have the','I could never forget your',
    'No one could match your','People fall for your','I’m lost in your',
    'I adore your'
  ];

  const closers = [
    'that makes everything feel lighter.',
    'that could melt anyone’s heart.',
    'that brightens the darkest day.',
    'that makes silence feel sweet.',
    'that feels like home.',
    'that makes me forget everything else.',
    'that turns ordinary moments into magic.',
    'that makes my heart skip a beat.',
    'that could calm storms.',
    'that makes me smile without reason.'
  ];

  function generateCompliments(n=120){
    const set = new Set();
    while(set.size < n){
      const c = `${intros[Math.floor(Math.random()*intros.length)]} ${adjectives[Math.floor(Math.random()*adjectives.length)]} ${nouns[Math.floor(Math.random()*nouns.length)]} ${closers[Math.floor(Math.random()*closers.length)]}`;
      set.add(c.replace(/\s+/g,' ').trim());
    }
    return Array.from(set);
  }

  let fortunes = JSON.parse(localStorage.getItem('fortunes')||'null');
  if(!fortunes || fortunes.length < 30){
    fortunes = generateCompliments(150);
    localStorage.setItem('fortunes', JSON.stringify(fortunes));
  }

  const save = ()=> localStorage.setItem('fortunes', JSON.stringify(fortunes));

  drawBtn.addEventListener('click', ()=>{
    if(!fortunes.length) fortunes = generateCompliments(150);
    const idx = Math.floor(Math.random()*fortunes.length);
    out.textContent = fortunes.splice(idx,1)[0];
    save();
    window._burst?.(innerWidth*0.6, innerHeight*0.65, 80);
  });

  addForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const v = addInput.value.trim();
    if(!v) return;
    fortunes.push(v);
    save();
    addForm.reset();
  });
})();
