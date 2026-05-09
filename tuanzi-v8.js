(() => {
  const $ = (s) => document.querySelector(s);
  const wrap = $('#wrap');
  if (!wrap) return;

  const style = document.createElement('style');
  style.textContent = `
    .game-tools{top:292px!important;right:22px!important;width:330px!important;display:flex!important;flex-wrap:wrap!important;justify-content:flex-end!important;gap:8px!important;z-index:30!important;pointer-events:auto!important}
    .director-tools{top:348px!important;right:22px!important;z-index:31!important}
    .version-badge{position:absolute;right:22px;bottom:18px;z-index:40;padding:7px 12px;border-radius:999px;background:rgba(7,17,31,.76);border:1px solid rgba(216,181,109,.52);color:#fef3c7;font-size:12px;font-weight:900;backdrop-filter:blur(18px);box-shadow:0 12px 34px rgba(0,0,0,.28)}
    .v8-modal{position:absolute;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(2,6,23,.62);backdrop-filter:blur(12px)}
    .v8-card{width:min(860px,90%);max-height:78%;overflow:auto;border-radius:30px;padding:28px 32px;background:linear-gradient(135deg,rgba(7,17,31,.96),rgba(16,78,68,.86));border:1px solid rgba(255,255,255,.2);box-shadow:0 38px 120px rgba(0,0,0,.58);color:#eef8f4}.v8-card h2{margin:0 0 14px;color:#d9f99d}.v8-card p{line-height:1.8;color:#dbeafe}.v8-card button{display:inline-flex!important;margin:6px;background:rgba(255,255,255,.13);color:#fff;border:1px solid rgba(255,255,255,.2)}
  `;
  document.head.appendChild(style);

  const badge = document.createElement('div');
  badge.className = 'version-badge';
  badge.textContent = 'Visual Director v8 · 团子版';
  wrap.appendChild(badge);

  const modal = document.createElement('div');
  modal.className = 'v8-modal';
  modal.innerHTML = '<div class="v8-card"><button id="v8Close" style="float:right">关闭</button><div id="v8Body"></div></div>';
  wrap.appendChild(modal);
  const body = modal.querySelector('#v8Body');
  modal.querySelector('#v8Close').onclick = () => modal.style.display = 'none';

  function openModal(title, html) {
    body.innerHTML = `<h2>${title}</h2>${html}`;
    modal.style.display = 'flex';
  }

  function addTool(text, fn) {
    let bar = document.querySelector('.game-tools');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'game-tools';
      wrap.appendChild(bar);
    }
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = 'display:inline-flex!important;align-items:center;justify-content:center;min-width:74px;padding:9px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(7,17,31,.78);color:#fff;font-size:13px;font-weight:900;cursor:pointer;backdrop-filter:blur(16px);box-shadow:0 12px 32px rgba(0,0,0,.26)';
    btn.onclick = fn;
    bar.appendChild(btn);
  }

  addTool('图鉴', () => openModal('生态图鉴', '<p><strong>雨城水滴：</strong>代表雅安雨雾气候与低打扰通行。</p><p><strong>碧峰峡巡护：</strong>代表游客边界、巡护路线与干扰物清理。</p><p><strong>蒙顶山茶：</strong>代表茶山、古道、村庄与生态产业共生。</p><p><strong>竹林归山：</strong>代表保持距离、关闭强光、拒绝投喂。</p>'));
  addTool('关卡', () => {
    const names = ['雨城出发', '碧峰峡巡护', '茶山同行', '竹林归山'];
    openModal('关卡选择', names.map((n,i)=>`<button onclick="window.__tuanziGo(${i})">${n}</button>`).join(''));
  });
  addTool('成就', () => openModal('成就系统', '<p>已内置：开始归山、收集生态记忆、完成一次判断、归山完成。</p><p>答辩扩展方向：低打扰游客、雨城记录者、茶山守护者、边界引导员。</p>'));

  window.__tuanziGo = (i) => {
    modal.style.display = 'none';
    try {
      loadChapter(i);
      showDialogue(chapters[i].lines[state.lang]);
    } catch(e) {}
  };

  function renameStory() {
    try {
      TXT.zh.final = '我叫团子。我回到了更安静、更完整的栖息地，也明白了：好的文旅体验不是靠近自然，而是理解自然。';
      chapters.forEach((c, idx) => {
        if (c.lines && c.lines.zh) {
          c.lines.zh = c.lines.zh.map(([s,t]) => [s.replace('小雨团','团子'), t.replaceAll('小雨团','团子')]);
          c.lines.en = c.lines.en.map(([s,t]) => [s === 'Rain Cub' ? 'Tuanzi' : s, t.replaceAll('Rain Cub','Tuanzi')]);
        }
      });
      if (chapters[0]) chapters[0].lines.zh[0] = ['团子','我叫团子，是一只装着“归山记忆芯片”的熊猫智能玩偶。今天，我要从雅安雨城出发，找回通往山里的安静路线。'];
      if (chapters[1]) { chapters[1].t.zh='第二章：碧峰峡巡护'; chapters[1].p='gorge'; chapters[1].lines.zh[0]=['团子','我走进碧峰峡，峡谷里的水声像一层透明的屏幕，把森林和游客隔开。']; }
      if (chapters[3]) { chapters[3].t.zh='第四章：竹林归山'; chapters[3].lines.zh[0]=['团子','最后一段路，我不再只是收集东西。我需要判断：什么动作会让山更安静？']; }
      sync && sync();
    } catch(e) {}
  }

  function patchPanda() {
    try {
      panda = function(){
        const bob=Math.sin(state.time*.14)*2,x=player.x+player.w/2,y=player.y+32+bob;
        ellipse(x,player.y+player.h+10,44,12,'rgba(0,0,0,.32)');
        ctx.save();ctx.translate(x,y);ctx.scale(player.face,1);ctx.rotate(Math.sin(state.time*.045)*.025);
        let body=ctx.createRadialGradient(-12,2,8,0,38,72);body.addColorStop(0,'#ffffff');body.addColorStop(.58,'#f5f7ef');body.addColorStop(1,'#cbd5c0');
        ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,38,34,45,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#07111f';ctx.beginPath();ctx.ellipse(-29,36,11,30,-.15,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(29,36,11,30,.15,0,Math.PI*2);ctx.fill();
        let head=ctx.createRadialGradient(-10,-14,5,0,-4,38);head.addColorStop(0,'#fff');head.addColorStop(.68,'#f7f8f2');head.addColorStop(1,'#c8d0c5');ctx.fillStyle=head;ctx.beginPath();ctx.ellipse(0,-8,30,29,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#07111f';ctx.beginPath();ctx.arc(-21,-30,12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(21,-30,12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(-10,-7,9,13,-.35,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(10,-7,9,13,.35,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-9,-9,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(9,-9,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(0,5,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#111827';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,10,8,.2,Math.PI-.2);ctx.stroke();
        ctx.fillStyle='rgba(248,113,113,.28)';ctx.beginPath();ctx.ellipse(-18,7,7,3,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(18,7,7,3,0,0,Math.PI*2);ctx.fill();
        let light=ctx.createRadialGradient(0,50,2,0,50,25);light.addColorStop(0,'#e0ffe5');light.addColorStop(.6,'#86efac');light.addColorStop(1,'#16a34a');ctx.fillStyle=light;rr(-18,46,36,14,7);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.55)';ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.30)';ctx.beginPath();ctx.ellipse(-11,-20,10,4,-.35,0,Math.PI*2);ctx.fill();ctx.restore();
      }
    } catch(e) {}
  }

  function patchAudio() {
    try {
      const oldSfx = sfx;
      sfx = function(type){
        oldSfx(type);
        if (!state.sound) return;
        initAudio(); if (!state.audio) return;
        const a=state.audio, now=a.currentTime;
        const notes=type==='collect'?[784,1046,1568]:type==='hit'?[110,82]:type==='jump'?[392,523]:[440,659];
        notes.forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.type=type==='hit'?'sawtooth':'sine';o.frequency.value=f;g.gain.value=.0001;o.connect(g);g.connect(a.destination);g.gain.exponentialRampToValueAtTime(type==='hit'?.035:.018,now+.02+i*.045);g.gain.exponentialRampToValueAtTime(.0001,now+.38+i*.045);o.start(now+i*.045);o.stop(now+.45+i*.045);});
      }
    } catch(e) {}
  }

  renameStory();
  patchPanda();
  patchAudio();
})();
