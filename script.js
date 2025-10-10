/* simplified non-confetti core omitted for brevity */

/******* Compliment Jar — supportive, non-flirty *******/
(()=>{
  const drawBtn=document.getElementById('drawFortune');
  const addForm=document.getElementById('addFortuneForm');
  const addInput=document.getElementById('addFortune');
  const out=document.getElementById('fortuneText');
  if(!drawBtn||!addForm||!addInput||!out)return;

  const qualities=[
    'kindness','patience','clarity','calm','empathy','integrity','focus','reliability',
    'thoughtfulness','fairness','dedication','discipline','humility','consistency',
    'respectfulness','balance','care for others','responsibility','positivity'
  ];
  const strengths=[
    'make challenges manageable','bring steadiness to busy days','notice details that matter',
    'find solutions with care','help people feel heard','build trust quietly',
    'stay calm under pressure','keep goals realistic','follow through on promises',
    'lead by example','approach problems thoughtfully','make teamwork smoother'
  ];
  const closers=[
    'That really matters.','It makes a difference.','It helps everyone.',
    'It stands out.','That brings calm to others.','It’s something to be proud of.',
    'People notice and appreciate it.','It has real impact.'
  ];
  const starters=[
    'You have a way of','You consistently','You’re great at','You naturally',
    'You always','You bring','You show','You remind others to'
  ];
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  function generate(n=150){
    const set=new Set();
    const base=[
      'You treat people with respect and patience.',
      'You make the environment calmer and more focused.',
      'You approach problems with quiet confidence.',
      'You care about doing things properly.',
      'You bring out the best in others.',
      'You help keep things on track.',
      'You stay kind, even on hard days.',
      'You follow through without needing reminders.',
      'You give thoughtful feedback.',
      'You make teamwork smoother.'
    ];
    base.forEach(b=>set.add(b));
    let guard=0;
    while(set.size<n&&guard<5000){
      guard++;
      const type=Math.floor(Math.random()*3);
      let line='';
      if(type===0){
        line=`${starters[Math.floor(Math.random()*starters.length)]} ${strengths[Math.floor(Math.random()*strengths.length)]}. ${closers[Math.floor(Math.random()*closers.length)]}`;
      }else if(type===1){
        line=`Your ${qualities[Math.floor(Math.random()*qualities.length)]} really shows. ${closers[Math.floor(Math.random()*closers.length)]}`;
      }else{
        line=`It’s clear you ${strengths[Math.floor(Math.random()*strengths.length)]}. ${closers[Math.floor(Math.random()*closers.length)]}`;
      }
      set.add(cap(line.trim()));
    }
    return Array.from(set);
  }

  let fortunes=JSON.parse(localStorage.getItem('fortunes')||'null');
  if(!fortunes||fortunes.length<30){
    fortunes=generate(160);
    localStorage.setItem('fortunes',JSON.stringify(fortunes));
  }
  const save=()=>localStorage.setItem('fortunes',JSON.stringify(fortunes));
  drawBtn.addEventListener('click',()=>{
    if(!fortunes.length)fortunes=generate(160);
    const idx=Math.floor(Math.random()*fortunes.length);
    out.textContent=fortunes.splice(idx,1)[0];
    save();
    window._burst?.(innerWidth*0.6,innerHeight*0.65,60);
  });
  addForm.addEventListener('submit',e=>{
    e.preventDefault();
    const v=addInput.value.trim();
    if(!v)return;
    fortunes.push(v);save();addForm.reset();
  });
})();
