(() => {
  const wrap = document.getElementById('wrap');
  const game = document.getElementById('game');
  const dialog = document.getElementById('dialog');
  const nextBtn = document.getElementById('nextBtn');
  const skipBtn = document.getElementById('skipBtn');
  const chapterEl = document.getElementById('chapter');
  const taskEl = document.getElementById('task');
  const tips = document.querySelector('.tips');
  if (!wrap || !game) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'atmoCanvas';
  canvas.width = 1280;
  canvas.height = 720;
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const progress = document.createElement('div');
  progress.className = 'story-progress';
  progress.innerHTML = '<span></span>';
  wrap.appendChild(progress);

  const toast = document.createElement('div');
  toast.className = 'story-toast';
  wrap.appendChild(toast);

  const chapterCard = document.createElement('div');
  chapterCard.className = 'chapter-card';
  chapterCard.innerHTML = '<div class="eyebrow">PANDA HOMECOMING</div><h2></h2><p></p>';
  wrap.appendChild(chapterCard);

  const choices = document.createElement('div');
  choices.className = 'director-choices';
  wrap.appendChild(choices);

  const tools = document.createElement('div');
  tools.className = 'director-tools';
  tools.innerHTML = '<button id="directorAuto">自动 ON</button><button id="directorMood">电影感</button>';
  wrap.appendChild(tools);

  const autoBtn = document.getElementById('directorAuto');
  const moodBtn = document.getElementById('directorMood');
  let autoMode = true;
  let cinematic = true;
  let lastAdvance = 0;
  let lastChapter = '';
  let tick = 0;
  let branchShownFor = '';
  let particles = Array.from({ length: 56 }, (_, i) => ({
    x: (i * 97) % 1280,
    y: (i * 53) % 720,
    r: 1 + Math.random() * 2.4,
    s: .18 + Math.random() * .72,
    a: .16 + Math.random() * .34
  }));

  const chapterCopy = {
    '第一章：雨城出发': '雨声把山林的距离拉近。玩家学习低打扰通行，理解“观看”与“打扰”的边界。',
    '第二章：森林巡护': '森林不是背景板，而是动物真正的生活空间。清理干扰物，修复一条安静的归山线。',
    '第三章：茶山同行': '蒙顶山茶、雨雾与古道记忆交织在一起。生态保护不是隔离人，而是学习更好的相处。',
    '第四章：熊猫归山': '最后一段路不再是收集，而是判断。好的文旅体验不是靠近自然，而是理解自然。',
    'Chapter 1: Rain City': 'Rain makes every sound closer. Learn low-disturbance movement and the boundary between viewing and interruption.',
    'Chapter 2: Forest Patrol': 'The forest is not a backdrop. Remove disturbances and rebuild a quiet route home.',
    'Chapter 3: Tea Mountain': 'Tea, mist and ancient roads meet here. Protection means learning better coexistence.',
    'Chapter 4: Homecoming': 'The final path is about judgement. Good tourism does not approach nature; it understands nature.'
  };

  const branchCopy = {
    '第一章：雨城出发': [
      ['静默观察', '放慢脚步，生态值更高。'],
      ['记录雨声', '收集一段雨城记忆。'],
      ['绕开人群', '减少干扰，路线更安全。']
    ],
    '第二章：森林巡护': [
      ['沿线清理', '清理外来干扰物。'],
      ['追踪脚印', '发现隐藏生态线索。'],
      ['提醒游客', '把观看变成理解。']
    ],
    '第三章：茶山同行': [
      ['听茶农讲述', '理解茶山与生计。'],
      ['走古道支线', '打开文化记忆。'],
      ['观察雨雾', '理解雅安气候。']
    ],
    '第四章：熊猫归山': [
      ['保持距离', '让归山保持安静。'],
      ['关闭强光', '降低栖息地压力。'],
      ['引导后退', '守住人与自然边界。']
    ]
  };

  function visible(el) {
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
  }

  function toastMsg(text) {
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1600);
  }

  function softAdvance(reason = 'tap') {
    const now = Date.now();
    if (now - lastAdvance < 900) return;
    if (visible(dialog) && visible(nextBtn)) {
      lastAdvance = now;
      nextBtn.click();
      if (reason === 'hover') toastMsg('轻触继续 · Story advanced');
    }
  }

  dialog?.addEventListener('pointerenter', () => setTimeout(() => softAdvance('hover'), 320));
  dialog?.addEventListener('click', () => softAdvance('click'));
  wrap.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.tagName === 'BUTTON') return;
    if (visible(dialog)) softAdvance('screen');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') softAdvance('enter');
  });

  function autoAdvance() {
    if (!autoMode) return;
    if (visible(dialog) && visible(nextBtn)) {
      const text = document.getElementById('dialogText')?.textContent || '';
      const wait = Math.max(3200, Math.min(6800, text.length * 95));
      const now = Date.now();
      if (now - lastAdvance > wait) softAdvance('auto');
    }
  }

  autoBtn.onclick = () => {
    autoMode = !autoMode;
    autoBtn.textContent = autoMode ? '自动 ON' : '自动 OFF';
    toastMsg(autoMode ? '自动推进已开启' : '自动推进已关闭');
  };

  moodBtn.onclick = () => {
    cinematic = !cinematic;
    moodBtn.textContent = cinematic ? '电影感' : '清晰模式';
    wrap.style.filter = cinematic ? '' : 'saturate(.95) contrast(1.04) brightness(1.04)';
    toastMsg(cinematic ? '电影级氛围已开启' : '已切换清晰模式');
  };

  function syncChapter() {
    const title = chapterEl?.textContent?.trim() || '';
    if (!title || title === lastChapter) return;
    lastChapter = title;
    branchShownFor = '';
    const h2 = chapterCard.querySelector('h2');
    const p = chapterCard.querySelector('p');
    h2.textContent = title;
    p.textContent = chapterCopy[title] || '一段新的归山记忆被打开。';
    chapterCard.classList.add('show');
    setTimeout(() => chapterCard.classList.remove('show'), 2600);
  }

  function syncProgress() {
    const t = taskEl?.textContent || '';
    const nums = t.match(/(\d+)\s*\/\s*(\d+)/);
    let pct = 0;
    if (nums) pct = Math.min(100, (Number(nums[1]) / Math.max(1, Number(nums[2]))) * 100);
    progress.querySelector('span').style.width = `${pct}%`;
  }

  function maybeShowBranch() {
    const title = chapterEl?.textContent?.trim() || '';
    if (!title || branchShownFor === title) return;
    if (visible(dialog)) return;
    const set = branchCopy[title];
    if (!set) return;
    branchShownFor = title;
    choices.innerHTML = set.map((c, i) => `<button class="choice-card"><strong>${c[0]}</strong><span>${c[1]}</span></button>`).join('');
    choices.style.display = 'grid';
    choices.querySelectorAll('button').forEach((btn, i) => {
      btn.onclick = () => {
        choices.style.display = 'none';
        toastMsg(['选择已记录：生态观察更完整', '记忆线索已解锁', '低打扰路线已优化'][i] || '选择已记录');
      };
    });
    setTimeout(() => {
      if (choices.style.display !== 'none') choices.style.display = 'none';
    }, 8000);
  }

  function enhanceTips() {
    if (!tips || tips.dataset.directorDone) return;
    tips.dataset.directorDone = '1';
    tips.innerHTML = '<strong>沉浸式操作</strong><br>← → / A D：移动<br>↑ / W / 空格：跳跃<br>对白自动推进；也可轻触、点击画面或按 Enter 继续。';
  }

  function drawAtmosphere() {
    tick += 1;
    ctx.clearRect(0, 0, 1280, 720);
    if (cinematic) {
      const glow = ctx.createRadialGradient(900, 170, 10, 900, 170, 520);
      glow.addColorStop(0, 'rgba(216,181,109,.15)');
      glow.addColorStop(.45, 'rgba(103,232,249,.055)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1280, 720);
    }
    for (const p of particles) {
      p.y -= p.s;
      p.x += Math.sin((tick + p.y) * .01) * .26;
      if (p.y < -20) { p.y = 740; p.x = Math.random() * 1280; }
      ctx.globalAlpha = p.a;
      ctx.fillStyle = '#d9f99d';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,.035)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse((tick * .22 + i * 310) % 1500 - 100, 130 + i * 82, 230, 32, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(drawAtmosphere);
  }

  function loop() {
    syncChapter();
    syncProgress();
    enhanceTips();
    autoAdvance();
    maybeShowBranch();
    requestAnimationFrame(loop);
  }

  drawAtmosphere();
  loop();
  setTimeout(() => toastMsg('新交互：轻触对白即可继续'), 1200);
})();
