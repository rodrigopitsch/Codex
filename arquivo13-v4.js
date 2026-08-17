/* ===== ARQUIVO 13 V4 EXPANSION ===== */
const EXTRA_CASES=[
 {title:'Terminal 67',sub:'Pátio de manutenção do Arquivo',story:'O antigo terminal operacional 67 voltou a transmitir depois de vinte anos. Trilhos e passarelas se movem sem energia.',boss:'Maquinista de Ferro',bossType:'warden',theme:1,length:5400,goal:'Atravesse as passarelas móveis e encontre as 3 pistas.',mechanics:{moving:4,fragile:3,bossMode:'shock'}},
 {title:'A Ala Sem Luz',sub:'Hospital Santa Brígida',story:'Uma ala inteira ficou escura às 03:13. As câmeras mostram pessoas andando lá dentro, mas o prédio está vazio.',boss:'Médico da Sombra',bossType:'witch',theme:3,length:5450,goal:'Sobreviva à escuridão e catalogue o que ainda se move.',mechanics:{darkness:true,shooters:4,bossMode:'volley'}},
 {title:'Os Três Selos',sub:'Túnel de contenção norte',story:'Três selos do antigo Protocolo Véu foram reativados. O problema é que todos estão do lado errado da porta.',boss:'Guardião do Selo',bossType:'warden',theme:4,length:5550,goal:'Ative os 3 selos, abra o portão e chegue ao núcleo.',mechanics:{switches:3,gate:true,shooters:3,bossMode:'shock'}},
 {title:'A Torre de Cinza',sub:'Observatório desativado',story:'A torre cresceu dois andares durante a noite. Plataformas desaparecem depois de tocadas e algo observa do topo.',boss:'Astrônomo Cego',bossType:'reaper',theme:0,length:5600,goal:'Suba pelas estruturas instáveis antes que elas cedam.',mechanics:{moving:5,fragile:5,shooters:2,bossMode:'teleport'}},
 {title:'Linha 66',sub:'Rodovia interditada',story:'A estrada termina no quilômetro 66 para quem viaja depois da meia-noite. Ninguém consegue voltar pelo mesmo caminho.',boss:'O Passageiro',bossType:'beast',theme:2,length:5650,goal:'Não deixe a ruptura alcançar você. Continue avançando.',mechanics:{chase:true,moving:3,fragile:4,shooters:3,bossMode:'volley'}},
 {title:'A Casa que Esquece',sub:'Distrito residencial abandonado',story:'Toda porta leva a um cômodo diferente. Os nomes dos moradores somem das paredes quando você olha para trás.',boss:'A Testemunha',bossType:'witch',theme:3,length:5700,goal:'Ative os selos antes que a casa apague o caminho.',mechanics:{switches:3,gate:true,darkness:true,shooters:5,bossMode:'summon'}},
 {title:'Protocolo Véu',sub:'Instalação subterrânea 13',story:'Os documentos encontrados nos outros casos apontam para uma instalação que oficialmente nunca existiu.',boss:'Helena Vazia',bossType:'warden',theme:4,length:5900,goal:'Rompa a contenção externa e alcance a câmara do Véu.',mechanics:{moving:4,fragile:4,switches:3,gate:true,darkness:true,shooters:5,chase:true,bossMode:'mixed'}},
 {title:'A Décima Terceira Marca',sub:'Além do Véu',story:'Doze marcas foram catalogadas. A décima terceira não estava em nenhum documento — estava esperando por você.',boss:'O Sem Nome',bossType:'reaper',theme:4,length:6100,goal:'Ative as marcas, atravesse o Véu e encerre o primeiro ciclo do Arquivo 13.',mechanics:{moving:5,fragile:5,switches:4,gate:true,darkness:true,shooters:6,chase:true,bossMode:'final'}}
];
CASES.push(...EXTRA_CASES);
if(save.completed>=5&&save.unlocked<6){save.unlocked=6;persist()}
const a13Subtitle=document.querySelector('.title small');if(a13Subtitle)a13Subtitle.textContent='V4 • 13 casos • complexidade progressiva • trilha original';

let a13Switches=[],a13Gates=[],a13Bolts=[],a13Chase=null,a13Dark=null,a13BossClock=0,a13BossSummoned=false,a13MusicTimer=null,a13MusicStep=0,a13MusicGain=null;
const a13Cfg=()=>CASES[caseIndex]?.mechanics||{};

function a13SpawnBolt(x,y,vx,vy,power=1,color='#ff7ca8'){a13Bolts.push({x,y,w:8,h:5,vx,vy,life:4,power,color})}
function a13SetupMechanics(){
 const m=a13Cfg(),gy=groundY(),L=CASES[caseIndex].length;a13Switches=[];a13Gates=[];a13Bolts=[];a13Chase=null;a13Dark=null;a13BossClock=1.3;a13BossSummoned=false;
 const stones=platforms.filter(q=>q.type==='stone');
 for(let i=0;i<(m.moving||0)&&i<stones.length;i++){const q=stones[(i*2+1)%stones.length];q.dynamic=true;q.baseX=q.x;q.baseY=q.y;q.axis=i%3===2?'y':'x';q.amp=q.axis==='y'?24:42+(i%2)*16;q.speed=.7+i*.13;q.phase=i*1.7}
 for(let i=0;i<(m.fragile||0)&&i<stones.length;i++){const q=stones[(i*3+2)%stones.length];q.fragile=true;q.fragileT=0;q.broken=false}
 if(m.shooters){for(let i=0;i<m.shooters;i++){const x=Math.round(L*(.20+i*(.56/Math.max(1,m.shooters-1))));const e=makeEnemy(x,'cultist',i+30);e.type='cultist';e.hp+=1;e.shotCd=.6+(i%3)*.45;enemies.push(e)}}
 if(m.switches){for(let i=0;i<m.switches;i++)a13Switches.push({x:Math.round(L*(.18+i*(.34/Math.max(1,m.switches-1)))),y:gy-25,w:18,h:25,on:false})}
 if(m.gate)a13Gates.push({x:Math.round(L*.58),y:gy-96,w:18,h:96,open:false});
 if(m.darkness)a13Dark={x1:Math.round(L*.26),x2:Math.round(L*.72),strength:.82};
 if(m.chase)a13Chase={x:-180,speed:54+Math.max(0,caseIndex-8)*5,active:false};
 checkpointSnapshot=captureWorldState();
}

const a13BaseCapture=captureWorldState;
captureWorldState=function(){const s=a13BaseCapture();s.a13={switches:JSON.parse(JSON.stringify(a13Switches)),gates:JSON.parse(JSON.stringify(a13Gates)),bolts:[],chase:a13Chase?{...a13Chase}:null,dark:a13Dark?{...a13Dark}:null,platforms:JSON.parse(JSON.stringify(platforms)),bossClock:a13BossClock,bossSummoned:a13BossSummoned};return s};
const a13BaseRestore=restoreWorldState;
restoreWorldState=function(s){a13BaseRestore(s);if(s.a13){a13Switches=JSON.parse(JSON.stringify(s.a13.switches||[]));a13Gates=JSON.parse(JSON.stringify(s.a13.gates||[]));a13Bolts=[];a13Chase=s.a13.chase?{...s.a13.chase}:null;a13Dark=s.a13.dark?{...s.a13.dark}:null;if(s.a13.platforms)platforms=JSON.parse(JSON.stringify(s.a13.platforms));a13BossClock=s.a13.bossClock||1;a13BossSummoned=!!s.a13.bossSummoned}}

const a13BaseBuild=buildWorld;
buildWorld=function(){a13BaseBuild();a13SetupMechanics()};

function a13BeforePhysics(dt){
 for(const q of platforms){if(!q.dynamic||q.broken)continue;const oldX=q.x,oldY=q.y,ph=gameTime*q.speed+q.phase;if(q.axis==='x')q.x=q.baseX+Math.sin(ph)*q.amp;else q.y=q.baseY+Math.sin(ph)*q.amp;const onTop=Math.abs((player.y+player.h)-oldY)<5&&player.x+player.w>oldX&&player.x<oldX+q.w;if(onTop){player.x+=q.x-oldX;player.y+=q.y-oldY}}
 for(const q of platforms){if(!q.fragile||q.broken)continue;const onTop=Math.abs((player.y+player.h)-q.y)<5&&player.x+player.w>q.x&&player.x<q.x+q.w;if(onTop){q.fragileT=(q.fragileT||0)+dt;if(q.fragileT>.46){q.broken=true;burst(q.x+q.w/2,q.y,'#b7a889',14,5);tone(95,.14,'square',.025)}}else q.fragileT=Math.max(0,(q.fragileT||0)-dt*.6)}
 platforms=platforms.filter(q=>!q.broken);
}
function a13GateCollision(){for(const g of a13Gates){if(g.open)continue;if(player.x+player.w>g.x&&player.x<g.x+g.w&&player.y+player.h>g.y){if(player.vx>=0)player.x=g.x-player.w-1;else player.x=g.x+g.w+1;player.vx=0}}}
const a13BasePhysics=physics;
physics=function(dt){a13BeforePhysics(dt);a13BasePhysics(dt);a13GateCollision()};

function a13UpdateSwitches(){if(!a13Switches.length)return;for(const s of a13Switches){if(s.on)continue;if(rects(player,{x:s.x-10,y:s.y-10,w:s.w+20,h:s.h+20})){s.on=true;sfx('clue');burst(s.x+9,s.y+10,'#b88cff',12,4);toast('Selo ativado '+a13Switches.filter(x=>x.on).length+'/'+a13Switches.length)}}const all=a13Switches.every(s=>s.on);if(all&&a13Gates.some(g=>!g.open)){a13Gates.forEach(g=>g.open=true);objectiveMsg('SELOS completos • portão liberado.',2.5);[330,440,660].forEach((f,i)=>setTimeout(()=>tone(f,.08,'triangle',.018),i*70))}}
function a13UpdateShooters(dt){for(const e of enemies){if(!e.on||e.type!=='cultist')continue;e.shotCd=(e.shotCd||1)-dt;if(e.shotCd<=0&&Math.abs(player.x-e.x)<330){e.shotCd=1.5+Math.random()*.7;const dx=(player.x+10)-(e.x+e.w/2),dy=(player.y+16)-(e.y+e.h/2),d=Math.max(1,Math.hypot(dx,dy));a13SpawnBolt(e.x+e.w/2,e.y+12,dx/d*3.2,dy/d*3.2,1,'#d9a9ff')}}}
function a13UpdateBolts(dt){for(const b of a13Bolts){b.x+=b.vx*60*dt;b.y+=b.vy*60*dt;b.life-=dt;if(b.life>0&&rects(player,b)){b.life=0;damage(b.power,b.x)}}a13Bolts=a13Bolts.filter(b=>b.life>0&&b.x>camera.x-150&&b.x<camera.x+view.w+180)}
function a13UpdateChase(dt){if(!a13Chase)return;if(player.x>320)a13Chase.active=true;if(!a13Chase.active)return;const target=player.x-150;a13Chase.x+=Math.min(a13Chase.speed*dt,target-a13Chase.x);if(player.x<a13Chase.x+72){damage(99,a13Chase.x);a13Chase.x=player.x-220;toast('A ruptura alcançou você')}}
function a13BossExtras(dt){if(!boss||!boss.on||!boss.awake||caseIndex<5)return;const mode=a13Cfg().bossMode||'';a13BossClock-=dt;if(mode==='teleport'&&a13BossClock<=0){a13BossClock=2.2;const dir=Math.random()<.5?-1:1;boss.x=Math.max(player.x+70,Math.min(CASES[caseIndex].length-250,player.x+dir*(130+Math.random()*90)));burst(boss.x+25,boss.y+25,'#d4a6ff',18,6);toast('O chefe mudou de posição')}
 else if(a13BossClock<=0){const fast=mode==='final'&&boss.hp<boss.maxHp*.25;a13BossClock=fast?.55:(mode==='mixed'?1.05:1.35);const bx=boss.x+boss.w/2,by=boss.y+25,dx=(player.x+10)-bx,dy=(player.y+15)-by,d=Math.max(1,Math.hypot(dx,dy));if(mode==='shock'){for(const v of [-1,1])a13SpawnBolt(bx,groundY()-10,v*4.2,0,1,'#ffcc77')}else if(mode==='volley'||mode==='mixed'||mode==='final'){for(const off of [-.32,0,.32]){const ang=Math.atan2(dy,dx)+off;a13SpawnBolt(bx,by,Math.cos(ang)*(fast?4.7:3.5),Math.sin(ang)*(fast?4.7:3.5),1,'#ff7ca8')}}}
 if((mode==='summon'||mode==='mixed'||mode==='final')&&!a13BossSummoned&&boss.hp<boss.maxHp*.52){a13BossSummoned=true;for(let i=0;i<2+(mode==='final'?1:0);i++)enemies.push(makeEnemy(boss.x-150+i*95,i%2?'hound':'cultist',80+i));toast('O chefe chamou reforços')}
 if(mode==='final'&&boss.hp<boss.maxHp*.25){boss.phase=3;$('bossPhase').textContent='FASE 3';boss.dir=player.x>boss.x?1:-1}}
const a13BaseUpdate=updateWorld;
updateWorld=function(dt){a13BaseUpdate(dt);if(state!=='play')return;a13UpdateSwitches();a13UpdateShooters(dt);a13UpdateBolts(dt);a13UpdateChase(dt);a13BossExtras(dt)};

function a13DrawExtras(){
 const t=THEMES[CASES[caseIndex].theme],gy=groundY();ctx.save();ctx.translate(-Math.floor(camera.x),0);
 for(const q of platforms){if(q.fragile){ctx.fillStyle='#8c7358';ctx.fillRect(q.x,q.y,q.w,3);if((q.fragileT||0)>.15){ctx.fillStyle='#d6b98f';for(let x=q.x+8;x<q.x+q.w;x+=22)ctx.fillRect(x,q.y+4,9,2)}}}
 for(const s of a13Switches){ctx.globalAlpha=s.on?.35:.18;ctx.fillStyle=s.on?'#b88cff':'#6d577b';ctx.beginPath();ctx.arc(s.x+9,s.y+12,15,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=s.on?'#efd9ff':'#8a7699';ctx.lineWidth=2;ctx.strokeRect(s.x+2,s.y+4,14,17);ctx.fillStyle=s.on?'#ffe8ff':'#716579';ctx.fillRect(s.x+7,s.y+8,4,9)}
 for(const g of a13Gates){if(g.open)continue;ctx.fillStyle='#29243a';ctx.fillRect(g.x,g.y,g.w,g.h);ctx.fillStyle=t.accent;for(let y=g.y+7;y<g.y+g.h;y+=18)ctx.fillRect(g.x+4,y,g.w-8,3)}
 for(const b of a13Bolts){ctx.globalAlpha=.25;ctx.fillStyle=b.color;ctx.fillRect(b.x-5,b.y-5,b.w+10,b.h+10);ctx.globalAlpha=1;ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.w,b.h)}
 if(a13Chase&&a13Chase.active){ctx.globalAlpha=.28;ctx.fillStyle='#b03564';ctx.fillRect(a13Chase.x-80,0,150,gy+80);ctx.globalAlpha=.75;ctx.fillStyle='#ff5e88';ctx.fillRect(a13Chase.x+55,0,5,gy+80);ctx.globalAlpha=1}
 ctx.restore();
 if(a13Dark&&player.x>a13Dark.x1&&player.x<a13Dark.x2){const sx=(player.x-camera.x+player.w/2),sy=player.y+player.h/2,g=ctx.createRadialGradient(sx,sy,42,sx,sy,145);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.45,'rgba(0,0,0,.18)');g.addColorStop(1,'rgba(0,0,0,'+a13Dark.strength+')');ctx.fillStyle=g;ctx.fillRect(0,0,view.w,view.h)}
}
const a13BaseDraw=draw;
draw=function(){a13BaseDraw();a13DrawExtras()};

const A13_ENDINGS=[
 'O Terminal 67 para de transmitir. No painel aparece uma rota que só existe nos arquivos antigos do Véu.',
 'As luzes do hospital voltam uma a uma. Uma ficha de internação traz a assinatura de alguém oficialmente morto.',
 'O terceiro selo se fecha. Atrás do portão há um mapa marcado com treze pontos.',
 'A torre perde os andares que não deveriam existir. No telescópio, a Lua está riscada por uma décima segunda marca.',
 'Você atravessa o quilômetro 66 antes da ruptura. A estrada termina diante de uma casa sem endereço.',
 'A casa para de trocar os cômodos. Um nome permanece na parede: HELENA VOSS.',
 'A instalação confirma o que o Arquivo escondia: o Véu não é uma parede. É uma máquina incompleta.',
 'A Décima Terceira Marca se fecha. O Sem Nome desaparece, mas o Arquivo registra uma nova pasta: CICLO II.'
];
const a13BaseStoryEnd=storyEnd;
storyEnd=function(success,stats={}){a13StopMusic();a13BaseStoryEnd(success,stats);if(success&&caseIndex>=5){const p=panel.querySelector('p');if(p)p.textContent=A13_ENDINGS[caseIndex-5]||p.textContent}}

function a13MusicVoice(freq,time,dur=.13,gain=.012,type='sawtooth',detune=0){if(!audio||!sound)return;const o=audio.createOscillator(),g=audio.createGain(),f=audio.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(freq,time);o.detune.value=detune;f.type='lowpass';f.frequency.value=1100;g.gain.setValueAtTime(.0001,time);g.gain.linearRampToValueAtTime(gain,time+.012);g.gain.exponentialRampToValueAtTime(.0001,time+dur);o.connect(f);f.connect(g);g.connect(a13MusicGain||audio.destination);o.start(time);o.stop(time+dur+.03)}
function a13Kick(time){if(!audio||!sound)return;const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(95,time);o.frequency.exponentialRampToValueAtTime(46,time+.09);g.gain.setValueAtTime(.045,time);g.gain.exponentialRampToValueAtTime(.0001,time+.11);o.connect(g);g.connect(a13MusicGain||audio.destination);o.start(time);o.stop(time+.12)}
function a13StartMusic(){if(!sound)return;initAudio();if(!audio)return;try{audio.resume&&audio.resume()}catch(e){}if(a13MusicTimer)return;if(!a13MusicGain){a13MusicGain=audio.createGain();a13MusicGain.gain.value=.62;a13MusicGain.connect(audio.destination)}a13MusicStep=0;const riff=[82.41,123.47,146.83,110,164.81,146.83,98,123.47,82.41,146.83,123.47,185,164.81,123.47,110,98];const bass=[82.41,82.41,73.42,65.41];a13MusicTimer=setInterval(()=>{if(!audio||state!=='play'||!sound)return;const t=audio.currentTime+.035,i=a13MusicStep++%16,n=riff[i];a13MusicVoice(n,t,.115,.0105,'sawtooth',-6);a13MusicVoice(n*2,t,.085,.005,'square',5);if(i%4===0){a13MusicVoice(bass[(i/4)%4],t,.32,.014,'triangle');a13Kick(t)}if(i%4===2)a13Kick(t);if(i===7||i===15)a13MusicVoice(n*1.5,t,.2,.007,'sawtooth',3)},145)}
function a13StopMusic(){if(a13MusicTimer){clearInterval(a13MusicTimer);a13MusicTimer=null}}
const a13BaseStart=startCase;
startCase=function(){a13BaseStart();a13StartMusic()};
const a13BasePause=pause;
pause=function(){a13BasePause();a13StopMusic();const r=$('resumeBtn');if(r)r.onclick=()=>{state='play';overlay.classList.remove('on');a13StartMusic()}};
const a13BaseMenu=menu;
menu=function(){a13StopMusic();a13BaseMenu()};
const a13OldSound=$('soundBtn').onclick;
$('soundBtn').onclick=()=>{a13OldSound();if(sound&&state==='play')a13StartMusic();else a13StopMusic()};
/* ===== /ARQUIVO 13 V4 EXPANSION ===== */
