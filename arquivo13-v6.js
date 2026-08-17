/* ===== ARQUIVO 13 V6 DEATH + PROGRESSION LOOP ===== */
const a13V6Subtitle=document.querySelector('.title small');
if(a13V6Subtitle)a13V6Subtitle.textContent='V6 • 13 casos • morte com escolha • evolução permanente';

const a13V6Style=document.createElement('style');
a13V6Style.id='arquivo13-v6-style';
a13V6Style.textContent=`
.a13-death-card{margin:11px 0;padding:11px;border:1px solid #7c3d52;border-radius:12px;background:linear-gradient(180deg,#27101a,#130b11);box-shadow:inset 0 0 24px #7d274622}.a13-death-card b{display:block;color:#ff9eb7;font-size:11px;margin-bottom:5px}.a13-death-card small{display:block;color:#c9b5bd;line-height:1.45}.a13-salvage{margin-top:8px;padding:8px;border-radius:9px;background:#161522;border:1px solid #4e4965;color:#dcd5ff;font-size:9px;font-weight:900}.a13-base-hint{margin:10px 0;padding:10px;border-radius:12px;background:linear-gradient(180deg,#171b2c,#0d101a);border:1px solid #51497d}.a13-base-hint b{display:block;color:#dbc7ff;font-size:11px;margin-bottom:4px}.a13-base-hint small{display:block;color:#b8b6c9;line-height:1.45}.a13-build{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.a13-build span{padding:7px;border-radius:8px;background:#0a0d15;border:1px solid #30364a;text-align:center}.a13-build strong{display:block;color:#fff;font-size:12px}.a13-build em{display:block;color:#9ba6bd;font-size:7px;font-style:normal;margin-top:2px}.a13-death-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.a13-death-actions .btn{min-height:52px;line-height:1.15}.a13-death-actions .btn small{display:block;font-size:7px;opacity:.72;margin-top:4px}.a13-base-focus{animation:a13Focus 1.2s ease 2}@keyframes a13Focus{50%{box-shadow:0 0 0 3px #b88cff55,0 0 24px #b88cff44}}
@media(max-width:430px){.a13-death-actions{grid-template-columns:1fr}.a13-death-actions .btn{min-height:47px}}
`;
document.head.appendChild(a13V6Style);

let a13DeathBaseHint='';
let a13DeathShown=false;
let a13V6Elapsed=0;

function a13V6Fmt(sec){
 sec=Math.max(0,Math.round(Number(sec)||0));
 const m=Math.floor(sec/60),s=sec%60;
 return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function a13SalvageAmount(){
 const carried=Math.max(0,Number(player?.ess||0));
 return carried>0?Math.ceil(carried*.5):0;
}

function a13ShowDeathScreen(){
 if(state!=='dead'||a13DeathShown)return;
 a13DeathShown=true;
 overlay.classList.add('on');
 bossBar.classList.remove('on');
 const salvage=a13SalvageAmount();
 const hasCheckpoint=!!(checkpoint&&checkpoint.lit&&checkpointSnapshot);
 const returnText=hasCheckpoint?'ÚLTIMO CHECKPOINT':'INÍCIO DO CASO';
 const currentLife=5+Number(save.lifeUp||0);
 const currentPower=1+Number(save.powerUp||0);
 panel.innerHTML=`
  <div class="kicker">caçador abatido // caso ${String(caseIndex+1).padStart(2,'0')}</div>
  <h1>Você caiu. O que fazer?</h1>
  <p>A morte agora é uma decisão: continue a investigação imediatamente ou recue, fortaleça o caçador e volte mais preparado.</p>
  <div class="stats">
   <div class="stat"><b>${a13V6Fmt(a13V6Elapsed)}</b><small>TEMPO</small></div>
   <div class="stat"><b>${player?.ess||0}</b><small>ESSÊNCIA NA MISSÃO</small></div>
   <div class="stat"><b>${save.ess||0}</b><small>ESSÊNCIA NA BASE</small></div>
  </div>
  <div class="a13-death-card"><b>RECUAR TAMBÉM FAZ PARTE DA CAÇADA</b><small>Se voltar à base, você encerra esta tentativa e resgata metade da essência que estava carregando. Use-a para melhorar Vida ou Poder antes de entrar novamente.</small><div class="a13-salvage">RESGATE AGORA: +${salvage} ESSÊNCIA • VIDA ${currentLife} • RELÍQUIA ${currentPower}</div></div>
  <div class="a13-death-actions">
   <button class="btn" id="a13BaseDeath">VOLTAR À BASE<small>resgatar +${salvage} e melhorar status</small></button>
   <button class="btn primary" id="a13RetryDeath">TENTAR NOVAMENTE<small>retornar ao ${returnText.toLowerCase()}</small></button>
  </div>`;
 const retry=$('a13RetryDeath'),base=$('a13BaseDeath');
 retry.onclick=()=>{
  a13DeathShown=false;
  overlay.classList.remove('on');
  if(!hasCheckpoint)a13V6Elapsed=0;
  state='play';
  respawn();
  objectiveMsg(hasCheckpoint?'Nova tentativa • checkpoint restaurado.':'Nova tentativa • caso reiniciado.',2.2);
 };
 base.onclick=()=>{
  const rescued=a13SalvageAmount();
  if(rescued>0)save.ess+=rescued;
  persist();
  a13DeathBaseHint=rescued>0?`Você resgatou +${rescued} essência da tentativa. Gaste abaixo e volte mais forte.`:'Você voltou sem essência da missão. Use sua reserva abaixo ou tente novamente para juntar recursos.';
  a13DeathShown=false;
  state='menu';
  menu();
 };
}

/* Track elapsed run time independently so checkpoint restores never rewind it. */
const a13V6BaseUpdate=updateWorld;
updateWorld=function(dt){
 if(state==='play')a13V6Elapsed+=dt;
 a13V6BaseUpdate(dt);
};

/* Replace the old automatic 650 ms respawn with an explicit player decision. */
damage=function(n,fromX){
 if(player.inv>0||state!=='play')return;
 player.hp-=n;
 player.inv=1;
 player.vx=fromX<player.x?3.6:-3.6;
 player.vy=-5.2;
 camera.shake=7;
 sfx('hit');
 burst(player.x+10,player.y+16,'#ff6674',9,4);
 updateHud();
 if(player.hp<=0){
  state='dead';
  keys.left=keys.right=keys.jump=keys.shoot=false;
  jumpPressed=shootPressed=false;
  setTimeout(()=>{if(state==='dead')a13ShowDeathScreen()},420);
 }
};

const a13V6BaseMenu=menu;
menu=function(){
 a13V6BaseMenu();
 const ups=panel.querySelector('.upgrades');
 if(!ups)return;
 const lifeBtn=ups.querySelector('[data-up="life"]'),powerBtn=ups.querySelector('[data-up="power"]');
 if(lifeBtn){const s=lifeBtn.querySelector('small');if(s)s.textContent=`VIDA TOTAL: ${5+Number(save.lifeUp||0)} • +1 por melhoria`}
 if(powerBtn){const s=powerBtn.querySelector('small');if(s)s.textContent=`DANO RELÍQUIA: ${1+Number(save.powerUp||0)} • +1 por melhoria`}
 if(a13DeathBaseHint){
  const hint=document.createElement('div');
  hint.className='a13-base-hint';
  hint.innerHTML=`<b>BASE DE CAÇADORES • EVOLUÇÃO PERMANENTE</b><small>${a13DeathBaseHint}</small><div class="a13-build"><span><strong>${5+Number(save.lifeUp||0)} ❤️</strong><em>VIDA TOTAL</em></span><span><strong>${1+Number(save.powerUp||0)} ✦</strong><em>DANO DA RELÍQUIA</em></span></div>`;
  ups.before(hint);
  ups.classList.add('a13-base-focus');
 }
};

const a13V6BaseStart=startCase;
startCase=function(){
 a13DeathBaseHint='';
 a13DeathShown=false;
 a13V6Elapsed=0;
 a13V6BaseStart();
};
/* ===== /ARQUIVO 13 V6 DEATH + PROGRESSION LOOP ===== */
