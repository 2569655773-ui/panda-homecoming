const ui = {
  cover: document.getElementById('cover'),
  ending: document.getElementById('ending'),
  chapter: document.getElementById('chapter'),
  score: document.getElementById('score'),
  task: document.getElementById('task'),
  dialog: document.getElementById('dialog'),
  speaker: document.getElementById('speaker'),
  text: document.getElementById('dialogText'),
  next: document.getElementById('nextBtn'),
  skip: document.getElementById('skipBtn'),
  start: document.getElementById('startBtn'),
  restart: document.getElementById('restartBtn'),
  endingText: document.getElementById('endingText'),
};

const chapters = [
  {
    title: '第一章：雨城出发', place: '雨城', top: 0x0f766e, bottom: 0x082f49, target: 3, itemName: '生态线索',
    items: [{x:260,y:420,label:'雨城水滴'}, {x:540,y:310,label:'巡护脚印'}, {x:860,y:230,label:'路线标记'}],
    hazards: [{x:720,y:508,w:130,h:24,label:'噪声干扰'}],
    lines: [['巡护员','欢迎来到雅安雨城。今天，你要带“小雨团”完成一次归山任务。'], ['小雨团','我需要找到安全路线，也要避开会打扰栖息地的噪声。'], ['巡护员','收集3个绿色生态线索，完成后继续前往森林巡护区。']]
  },
  {
    title: '第二章：森林巡护', place: '森林', top: 0x166534, bottom: 0x052e16, target: 4, itemName: '清理物',
    items: [{x:220,y:470,label:'塑料瓶'}, {x:420,y:350,label:'旧包装'}, {x:720,y:270,label:'干扰牌'}, {x:990,y:400,label:'废纸团'}],
    hazards: [{x:520,y:508,w:110,h:24,label:'施工噪声'}, {x:900,y:508,w:120,h:24,label:'游客越线'}],
    lines: [['巡护员','森林不是背景，它是动物真正的家。'], ['小雨团','我会把干扰物带走，让路线恢复安静。'], ['巡护员','收集4个清理物，生态值会提升。']]
  },
  {
    title: '第三章：茶山同行', place: '茶山', top: 0x84cc16, bottom: 0x365314, target: 4, itemName: '茶山知识',
    items: [{x:180,y:420,label:'蒙顶山茶'}, {x:400,y:310,label:'生态茶园'}, {x:680,y:230,label:'雨雾气候'}, {x:980,y:350,label:'古道记忆'}],
    hazards: [{x:330,y:508,w:120,h:24,label:'农残风险'}, {x:790,y:508,w:120,h:24,label:'水土流失'}],
    lines: [['茶山讲解员','雅安不只有熊猫，也有茶山、雨雾和古道记忆。'], ['小雨团','原来生态保护和地方产业也可以联系在一起。'], ['茶山讲解员','找到4个茶山知识点，前往最后的栖息地。']]
  },
  {
    title: '第四章：熊猫归山', place: '栖息地', top: 0x0f172a, bottom: 0x14532d, target: 5, itemName: '守护标记',
    items: [{x:160,y:450,label:'安静区'}, {x:360,y:330,label:'水源地'}, {x:620,y:240,label:'竹林带'}, {x:860,y:340,label:'巡护点'}, {x:1080,y:430,label:'归山路'}],
    hazards: [{x:470,y:508,w:110,h:24,label:'强光干扰'}, {x:760,y:508,w:130,h:24,label:'投喂风险'}, {x:1030,y:508,w:120,h:24,label:'越界拍摄'}],
    lines: [['巡护员','最后一段路，需要把所有守护标记点亮。'], ['小雨团','好的文旅体验，不是打扰自然，而是理解自然。'], ['巡护员','完成5个守护标记，让小雨团回到山里。']]
  }
];

const state = { started:false, chapterIndex:0, score:0, collected:0, locked:true, dialogueQueue:[], currentLine:0 };
let sceneInstance = null;

function startGame(){
  ui.cover.style.display = 'none';
  state.started = true;
  if (sceneInstance) sceneInstance.playDialogue(chapters[state.chapterIndex].lines);
}

ui.start.addEventListener('click', startGame);
ui.start.addEventListener('touchstart', (event) => { event.preventDefault(); startGame(); }, {passive:false});

class MainScene extends Phaser.Scene {
  constructor(){ super('main'); }

  create(){
    sceneInstance = this;
    this.makeTextures();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('A,D,W,SPACE');
    this.worldGroup = this.add.group();
    this.platforms = this.physics.add.staticGroup();
    this.items = this.physics.add.group({ allowGravity:false, immovable:true });
    this.hazards = this.physics.add.staticGroup();
    this.player = this.physics.add.sprite(120, 420, 'panda');
    this.player.setCollideWorldBounds(true).setBounce(.08);
    this.player.body.setSize(44,52).setOffset(10,8);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.hazards, this.hitHazard, null, this);
    this.loadChapter(0);
    ui.next.addEventListener('click', () => this.advanceDialogue());
    ui.skip.addEventListener('click', () => this.hideDialogue());
    ui.restart.addEventListener('click', () => { ui.ending.style.display='none'; state.score=0; state.chapterIndex=0; state.started=true; this.loadChapter(0); this.playDialogue(chapters[0].lines); });
  }

  makeTextures(){
    const g=this.add.graphics();
    g.fillStyle(0xffffff,1).fillCircle(32,28,22).fillCircle(32,56,24);
    g.fillStyle(0x111827,1).fillCircle(15,18,9).fillCircle(49,18,9).fillEllipse(23,29,12,15).fillEllipse(41,29,12,15);
    g.fillStyle(0xffffff,1).fillCircle(24,28,3).fillCircle(40,28,3);
    g.fillStyle(0x111827,1).fillCircle(32,36,4).fillEllipse(15,55,12,22).fillEllipse(49,55,12,22);
    g.fillStyle(0x86efac,1).fillRoundedRect(23,67,18,8,4);
    g.generateTexture('panda',64,82);

    g.clear().fillStyle(0x86efac,1).fillCircle(16,16,14).lineStyle(3,0xffffff,.8).strokeCircle(16,16,10).fillStyle(0x052e16,1).fillTriangle(16,6,25,23,7,23).generateTexture('eco',32,32);
    g.clear().fillStyle(0xef4444,1).fillRoundedRect(0,0,110,24,8).lineStyle(2,0xffffff,.45).strokeRoundedRect(3,3,104,18,6).generateTexture('hazard',110,24);
    g.clear().fillStyle(0x3f6212,1).fillRoundedRect(0,0,220,22,10).fillStyle(0x84cc16,1).fillRoundedRect(0,0,220,7,4).generateTexture('platform',220,22);
    g.clear().fillStyle(0xffffff,.9).fillCircle(22,20,16).fillCircle(42,16,20).fillCircle(64,21,15).fillRoundedRect(18,22,58,16,8).generateTexture('cloud',90,44);

    g.clear().fillStyle(0x166534,1).fillRoundedRect(12,10,12,90,6).fillStyle(0x4ade80,1);
    g.fillEllipse(10,20,36,12); g.fillEllipse(31,36,36,12); g.fillEllipse(8,54,36,12); g.fillEllipse(32,72,36,12);
    g.generateTexture('bamboo',44,110);

    g.clear().fillStyle(0x65a30d,1).fillEllipse(110,58,240,88).lineStyle(3,0x365314,.45);
    for(let i=0;i<8;i++){ g.beginPath(); g.moveTo(10+i*28,64); g.lineTo(40+i*28,35); g.strokePath(); }
    g.generateTexture('hill',240,90);
    g.destroy();
  }

  clearWorld(){ this.worldGroup.clear(true,true); this.platforms.clear(true,true); this.items.clear(true,true); this.hazards.clear(true,true); }

  paintBackground(ch){
    const g=this.add.graphics(); this.worldGroup.add(g);
    g.fillGradientStyle(ch.top,ch.top,ch.bottom,ch.bottom,1).fillRect(0,0,1280,720);
    g.fillStyle(0x0f172a,.18).fillTriangle(-50,520,220,210,520,520).fillTriangle(320,520,610,170,940,520).fillTriangle(760,520,1050,220,1360,520);
    if(ch.place==='雨城'){
      g.fillStyle(0x67e8f9,.13).fillEllipse(730,610,880,130);
      for(let i=0;i<12;i++) this.worldGroup.add(this.add.image(80+i*110,90+Math.sin(i)*18,'cloud').setAlpha(.34).setScale(1.2));
      g.lineStyle(1,0xbfdbfe,.28); for(let i=0;i<70;i++){ const x=Phaser.Math.Between(0,1280), y=Phaser.Math.Between(0,520); g.beginPath(); g.moveTo(x,y); g.lineTo(x-8,y+22); g.strokePath(); }
    } else if(ch.place==='茶山'){
      for(let i=0;i<7;i++) this.worldGroup.add(this.add.image(120+i*190,545-(i%2)*25,'hill').setAlpha(.65));
    } else {
      for(let i=0;i<16;i++) this.worldGroup.add(this.add.image(40+i*85,500+(i%3)*18,'bamboo').setAlpha(.62).setScale(1.1+(i%2)*.2));
    }
    g.fillStyle(0x2f2316,.78).fillRoundedRect(0,530,1280,120,40).fillStyle(0x1f2937,.22).fillRoundedRect(0,558,1280,24,12);
  }

  loadChapter(index){
    const ch=chapters[index]; state.chapterIndex=index; state.collected=0; state.locked=true; this.clearWorld(); this.paintBackground(ch);
    ui.chapter.textContent=ch.title; ui.score.textContent=`生态值 ${state.score}`; ui.task.textContent=`任务 0 / ${ch.target}`;
    this.platforms.create(640,610,'platform').setScale(6,1).refreshBody();
    this.platforms.create(350,455,'platform'); this.platforms.create(650,365,'platform'); this.platforms.create(955,455,'platform');
    ch.items.forEach((it,idx)=>{ const obj=this.items.create(it.x,it.y,'eco'); obj.setData('label',it.label); obj.setData('index',idx); const label=this.add.text(it.x,it.y-34,it.label,{fontSize:'13px',color:'#ecfccb',backgroundColor:'rgba(20,83,45,.55)',padding:{x:6,y:3}}).setOrigin(.5); obj.setData('labelObj',label); this.worldGroup.add(label); });
    ch.hazards.forEach(h=>{ const hz=this.hazards.create(h.x,h.y,'hazard'); hz.displayWidth=h.w; hz.displayHeight=h.h; hz.refreshBody(); this.worldGroup.add(this.add.text(h.x,h.y-26,h.label,{fontSize:'13px',color:'#fee2e2',backgroundColor:'rgba(127,29,29,.62)',padding:{x:6,y:3}}).setOrigin(.5)); });
    this.player.setPosition(110,460); this.player.setVelocity(0,0); this.cameras.main.flash(360,255,255,255);
  }

  playDialogue(lines){ state.dialogueQueue=lines; state.currentLine=0; state.locked=true; this.showLine(); }
  showLine(){ const line=state.dialogueQueue[state.currentLine]; if(!line){this.hideDialogue();return;} ui.speaker.textContent=line[0]; ui.text.textContent=line[1]; ui.dialog.style.display='block'; ui.next.style.display='inline-block'; ui.skip.style.display='inline-block'; }
  advanceDialogue(){ state.currentLine++; state.currentLine>=state.dialogueQueue.length ? this.hideDialogue() : this.showLine(); }
  hideDialogue(){ ui.dialog.style.display='none'; ui.next.style.display='none'; ui.skip.style.display='none'; state.locked=false; }

  collectItem(player,item){
    const labelObj=item.getData('labelObj'); if(labelObj) labelObj.destroy(); item.disableBody(true,true);
    const ch=chapters[state.chapterIndex]; state.collected++; state.score+=10; ui.score.textContent=`生态值 ${state.score}`; ui.task.textContent=`任务 ${state.collected} / ${ch.target}`;
    const txt=this.add.text(item.x,item.y-42,'+10 生态值',{fontSize:'18px',color:'#bbf7d0',fontStyle:'bold'}).setOrigin(.5);
    this.tweens.add({targets:txt,y:item.y-88,alpha:0,duration:850,onComplete:()=>txt.destroy()});
    if(state.collected>=ch.target) this.finishChapter();
  }

  hitHazard(player){ if(state.locked) return; state.score=Math.max(0,state.score-5); ui.score.textContent=`生态值 ${state.score}`; player.setVelocityX(-260); player.setTint(0xff9f9f); this.time.delayedCall(250,()=>player.clearTint()); }

  finishChapter(){
    state.locked=true; const idx=state.chapterIndex, ch=chapters[idx];
    if(idx<chapters.length-1){
      this.playDialogue([['系统提示',`${ch.title}完成：${ch.itemName}已收集，生态值提升。`],['巡护员','继续前进。真正的保护，是把每一次观看变成理解。']]);
      const wait=setInterval(()=>{ if(!state.locked){ clearInterval(wait); this.loadChapter(idx+1); this.playDialogue(chapters[idx+1].lines); } },200);
    } else { ui.endingText.textContent=`最终生态值：${state.score}。小雨团回到了更安静、更完整的栖息地。你完成了雨城路线识别、森林清理、茶山知识收集与栖息地守护任务。`; ui.ending.style.display='flex'; }
  }

  update(){
    if(!state.started || state.locked){ this.player.setVelocityX(0); return; }
    const left=this.cursors.left.isDown||this.keys.A.isDown, right=this.cursors.right.isDown||this.keys.D.isDown, jump=this.cursors.up.isDown||this.keys.W.isDown||this.keys.SPACE.isDown;
    if(left){ this.player.setVelocityX(-230); this.player.setFlipX(true); } else if(right){ this.player.setVelocityX(230); this.player.setFlipX(false); } else this.player.setVelocityX(0);
    if(jump && this.player.body.touching.down) this.player.setVelocityY(-450);
  }
}

if (!window.Phaser) {
  ui.start.addEventListener('click', () => alert('游戏引擎加载失败，请刷新页面或检查网络。'));
} else {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent:'game',
    width:1280,
    height:720,
    backgroundColor:'#082f49',
    scale:{ mode:Phaser.Scale.FIT, autoCenter:Phaser.Scale.CENTER_BOTH },
    physics:{ default:'arcade', arcade:{ gravity:{y:900}, debug:false } },
    scene: MainScene
  });
}
