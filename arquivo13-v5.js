/* ===== ARQUIVO 13 V5 UX + BALANCE ===== */
const A13_V5_PROFILE=[
 {len:4200,enemy:1,boss:14,speed:.86,tier:1,mechanics:{}},
 {len:4400,enemy:1,boss:17,speed:.88,tier:1,mechanics:{moving:1}},
 {len:4600,enemy:2,boss:20,speed:.90,tier:2,mechanics:{moving:1,fragile:1}},
 {len:4800,enemy:2,boss:23,speed:.93,tier:2,mechanics:{fragile:1,shooters:1}},
 {len:5000,enemy:2,boss:27,speed:.96,tier:2,mechanics:{moving:1,fragile:1,shooters:1}},
 {len:5150,enemy:2,boss:31,speed:.98,tier:3,mechanics:{moving:2,fragile:1,bossMode:'shock'}},
 {len:5250,enemy:3,boss:35,speed:1.00,tier:3,mechanics:{darkness:true,shooters:2,bossMode:'volley'}},
 {len:5350,enemy:3,boss:39,speed:1.02,tier:3,mechanics:{switches:3,gate:true,shooters:2,bossMode:'shock'}},
 {len:5450,enemy:3,boss:43,speed:1.04,tier:4,mechanics:{moving:3,fragile:2,shooters:2,bossMode:'teleport'}},
 {len:5550,enemy:3,boss:47,speed:1.06,tier:4,mechanics:{chase:true,moving:2,fragile:2,shooters:2,bossMode:'volley'}},
 {len:5650,enemy:4,boss:51,speed:1.08,tier:4,mechanics:{switches:3,gate:true,darkness:true,shooters:3,bossMode:'summon'}},
 {len:5800,enemy:4,boss:56,speed:1.10,tier:5,mechanics:{moving:3,fragile:3,switches:3,gate:true,darkness:true,shooters:3,chase:true,bossMode:'mixed'}},
 {len:6000,enemy:4,boss:64,speed:1.12,tier:5,mechanics:{moving:4,fragile:3,switches:4,gate:true,darkness:true,shooters:4,chase:true,bossMode:'final'}}
];
A13_V5_PROFILE.forEach((p,i)=>{if(!CASES[i])return;CASES[i].length=p.len;CASES[i].mechanics={...(CASES[i].mechanics||{}),...p.mechanics}});
const a13V5Subtitle=document.querySelector('.title small');if(a13V5Subtitle)a13V5Subtitle.textContent='V5 • 13 casos • controles refinados • tempo e recordes';

const a13V5Style=document.createElement('style');a13V5Style.id='arquivo13-v5-style';a13V5Style.textContent=`
.hud{grid-template-columns:1.22fr .72fr .72fr .62fr 1.05fr;gap:4px}.hudBox{min-width:0}.hudBox b{white-space:nowrap}.a13-time small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.a13-time b{font-variant-numeric:tabular-nums}.controls{padding-left:max(12px,env(safe-area-inset-left));padding-right:max(12px,env(safe-area-inset-right));padding-bottom:max(10px,env(safe-area-inset-bottom));gap:12px}.pad{gap:10px;padding:0;background:transparent;border:0;box-shadow:none}.pad .ctl{width:92px;height:86px;border-radius:24px;background:#141d30ed;border-width:2px}.acts{gap:12px}.jump,.shoot{width:94px;height:94px}.ctl{box-shadow:inset 0 0 0 4px #090d17,0 10px 26px #0009}.ctl.on,.ctl:active{transform:scale(.94);filter:brightness(1.3);box-shadow:inset 0 0 0 4px #0b111d,0 0 0 4px #ffffff20,0 10px 26px #0009}.pad .ctl::after{transform:translateY(26px);font-size:7px;opacity:.86}.pad .ctl[data-key="left"]::after{content:'ESQ'}.pad .ctl[data-key="right"]::after{content:'DIR'}.jump::after,.shoot::after{font-size:7px;opacity:.9}.a13-control-tip{position:absolute;left:50%;bottom:max(105px,calc(96px + env(safe-area-inset-bottom)));transform:translateX(-50%);z-index:9;padding:5px 9px;border-radius:999px;background:#070a11bd;border:1px solid #33405a;color:#aebbd0;font-size:8px;font-weight:800;pointer-events:none;opacity:0;transition:.25s}.a13-control-tip.on{opacity:1}.a13-record{margin-top:9px;padding:8px 10px;border:1px solid #5f4d25;background:#211a0d;border-radius:10px;color:#ffe0a3;font-size:10px;font-weight:900}.caseBtn em{min-width:54px;text-align:right;font-size:8px}.caseBtn small{line-height:1.35}.a13-tier{color:#cbb3ff;font-weight:900}.a13-progress-mini{display:block;height:3px;margin-top:3px;border-radius:99px;background:#273047;overflow:hidden}.a13-progress-mini i{display:block;height:100%;background:#b88cff}
@media (orientation:landscape){.pad .ctl{width:82px;height:72px;border-radius:20px}.jump,.shoot{width:82px;height:82px}.controls{padding-bottom:max(7px,env(safe-area-inset-bottom))}.a13-control-tip{bottom:max(88px,calc(82px + env(safe-area-inset-bottom)))}}
@media (max-width:420px){.hud{grid-template-columns:1.15fr .68fr .68fr .58fr 1fr}.hudBox{padding:4px}.hudBox small{font-size:6px}.hudBox b{font-size:9px}.pad .ctl{width:78px;height:78px}.jump,.shoot{width:82px;height:82px}.acts{gap:8px}.pad{gap:7px}}
`;
document.head.appendChild(a13V5Style);

function a13Fmt(sec){sec=Math.max(0,Math.round(Number(sec)||0));const m=Math.floor(sec/60),s=sec%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function a13TierText(i){return ['I','I','II','II','II','III','III','III','IV','IV','IV','V','V'][i]||'V'}
let a13RunTime=0,a13TimerPaint=0;
function a13EnsureTimer(){let box=$('a13TimeBox');if(!box){box=document.createElement('div');box.id='a13TimeBox';box.className='hudBox a13-time';box.innerHTML='<small id="a13TimeLabel">TEMPO</small><b id="a13TimeText">00:00</b><span class="a13-progress-mini"><i id="a13ProgressFill"></i></span>';$('hud').appendChild(box)}return box}
function a13PaintTimer(){a13EnsureTimer();const best=save.best?.[caseIndex]?.time,progress=player?Math.max(0,Math.min(100,(player.x/Math.max(1,CASES[caseIndex].length))*100)):0;const label=$('a13TimeLabel'),txt=$('a13TimeText'),fill=$('a13ProgressFill');if(label)label.textContent=(best?'BEST '+a13Fmt(best):'TEMPO')+' • '+Math.round(progress)+'%';if(txt)txt.textContent=a13Fmt(a13RunTime);if(fill)fill.style.width=progress+'%'}
function a13DecorateMenu(){const rows=[...panel.querySelectorAll('.caseBtn')];rows.forEach((row,i)=>{const small=row.querySelector('small'),em=row.querySelector('em'),p=A13_V5_PROFILE[i];if(small&&p){small.innerHTML=(CASES[i].sub||'')+' • <span class="a13-tier">DIF '+a13TierText(i)+'</span>'}const best=save.best?.[i]?.time;if(em)em.textContent=best?'✓ '+a13Fmt(best):(i<save.completed?'✓':'')});}

const a13V5BaseMenu=menu;
menu=function(){a13V5BaseMenu();a13DecorateMenu();a13PaintTimer()};

const a13V5BaseMakeEnemy=makeEnemy;
makeEnemy=function(x0,type,i){const e=a13V5BaseMakeEnemy(x0,type,i),p=A13_V5_PROFILE[caseIndex]||A13_V5_PROFILE.at(-1);let hp=p.enemy+(type==='hound'||type==='cultist'?1:0);if(type==='ghost')e.speed=.55*p.speed;else if(type==='hound')e.speed=1.00*p.speed;else if(type==='cultist')e.speed=.62*p.speed;else e.speed=.70*p.speed;e.hp=e.maxHp=Math.max(1,hp);return e};

const a13V5BaseBuild=buildWorld;
buildWorld=function(){a13V5BaseBuild();const p=A13_V5_PROFILE[caseIndex]||A13_V5_PROFILE.at(-1);if(boss){const bonus=Math.min(8,Math.floor((save.level||1)/4)*2);boss.hp=boss.maxHp=p.boss+bonus}checkpointSnapshot=captureWorldState();a13RunTime=0;a13TimerPaint=0;a13PaintTimer()};

const a13V5BaseBoss=updateBoss;
updateBoss=function(dt){const scale=[1,1,.99,.98,.97,.96,.95,.94,.93,.92,.91,.90,.89][caseIndex]||.89;return a13V5BaseBoss(dt*scale)};

const a13V5BaseUpdate=updateWorld;
updateWorld=function(dt){a13V5BaseUpdate(dt);if(state==='play'){a13RunTime+=dt;a13TimerPaint+=dt;if(a13TimerPaint>=.10){a13TimerPaint=0;a13PaintTimer()}}};

const a13V5BaseStart=startCase;
startCase=function(){a13RunTime=0;a13TimerPaint=0;a13V5BaseStart();a13EnsureTimer();a13PaintTimer();let tip=$('a13ControlTip');if(!tip){tip=document.createElement('div');tip.id='a13ControlTip';tip.className='a13-control-tip';tip.textContent='Segure ←/→ • PULO e RELÍQUIA aceitam multitouch';stage.appendChild(tip)}tip.classList.add('on');setTimeout(()=>tip.classList.remove('on'),2600)};

const a13V5BaseStory=storyEnd;
storyEnd=function(success,stats={}){const finalTime=Math.max(1,Math.round(a13RunTime)),previous=save.best?.[caseIndex]?JSON.parse(JSON.stringify(save.best[caseIndex])):null;if(success)gameTime=a13RunTime;a13V5BaseStory(success,stats);if(success){const isRecord=!previous||finalTime<Number(previous.time||Infinity);const bestTime=isRecord?finalTime:Number(previous.time);const bestEss=Math.max(Number(previous?.ess||0),Number(save.best?.[caseIndex]?.ess||0),Number(stats.ess||0));save.best[caseIndex]={time:bestTime,ess:bestEss};persist();const statsBox=panel.querySelector('.stats');if(statsBox){const rec=document.createElement('div');rec.className='a13-record';rec.textContent=isRecord?'★ NOVO RECORDE • '+a13Fmt(finalTime):'TEMPO '+a13Fmt(finalTime)+' • MELHOR '+a13Fmt(bestTime);statsBox.after(rec)}}};

bindControls=function(){
 const lb=document.querySelector('[data-key="left"]'),rb=document.querySelector('[data-key="right"]'),movePad=$('movePad');let movePointer=null,moveSide=null;
 const haptic=()=>{try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}};
 const paintMove=side=>{moveSide=side;keys.left=side==='left';keys.right=side==='right';lb.classList.toggle('on',keys.left);rb.classList.toggle('on',keys.right)};
 const choose=e=>{const r=movePad.getBoundingClientRect();paintMove(e.clientX<r.left+r.width/2?'left':'right')};
 movePad.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();haptic();movePointer=e.pointerId;try{movePad.setPointerCapture(e.pointerId)}catch(_){}choose(e)},{passive:false});
 movePad.addEventListener('pointermove',e=>{if(e.pointerId===movePointer)choose(e)},{passive:false});
 const stopMove=e=>{if(movePointer!==null&&e.pointerId!==movePointer)return;paintMove(null);try{if(movePad.hasPointerCapture(e.pointerId))movePad.releasePointerCapture(e.pointerId)}catch(_){}movePointer=null};
 movePad.addEventListener('pointerup',stopMove,{passive:false});movePad.addEventListener('pointercancel',stopMove,{passive:false});
 document.querySelectorAll('[data-key="jump"],[data-key="shoot"]').forEach(b=>{const k=b.dataset.key;let pid=null;const down=e=>{e.preventDefault();initAudio();haptic();pid=e.pointerId;try{b.setPointerCapture(pid)}catch(_){}b.classList.add('on');keyDown(k)};const up=e=>{if(pid!==null&&e.pointerId!==pid)return;e.preventDefault();b.classList.remove('on');keyUp(k);try{if(b.hasPointerCapture(e.pointerId))b.releasePointerCapture(e.pointerId)}catch(_){}pid=null};b.addEventListener('pointerdown',down,{passive:false});b.addEventListener('pointerup',up,{passive:false});b.addEventListener('pointercancel',up,{passive:false})});
 window.addEventListener('keydown',e=>{const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',Space:'jump',KeyW:'jump',KeyJ:'shoot',KeyK:'shoot'};if(map[e.code]){e.preventDefault();keyDown(map[e.code])}});window.addEventListener('keyup',e=>{const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',Space:'jump',KeyW:'jump',KeyJ:'shoot',KeyK:'shoot'};if(map[e.code])keyUp(map[e.code])})
};
/* ===== /ARQUIVO 13 V5 UX + BALANCE ===== */
