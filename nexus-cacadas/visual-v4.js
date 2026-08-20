/* NEXUS visual pass 4 — apresentação expandida, mecânicas preservadas */
setTimeout(function nxVisualPass4(){try{
  const host=document.querySelector('.stage');if(!host)return;
  document.querySelectorAll('body *').forEach(function(el){
    if(el.children.length)return;
    if(el.textContent.includes('V7 • 13 casos'))el.textContent='V9 • 13 casos • arte redesenhada • evolução progressiva';
    if(el.textContent.includes('use a ataque'))el.textContent=el.textContent.replace('use a ataque','use o ataque');
  });
  let atmosphere=document.getElementById('nxAtmosphere');
  if(!atmosphere){
    atmosphere=document.createElement('div');atmosphere.id='nxAtmosphere';atmosphere.className='nxAtmosphere';
    atmosphere.innerHTML='<i class="nxGrain"></i>'+Array.from({length:22},(_,i)=>'<b class="nxMote" style="--x:'+((i*47)%101)+'%;--s:'+(1+i%4)+'px;--d:'+(7+i%8)+'s;--delay:-'+((i*1.37)%12).toFixed(1)+'s;--drift:'+(-34+(i*29)%70)+'px"></b>').join('');
    host.appendChild(atmosphere);
  }
  let vignette=document.getElementById('nxVignette');
  if(!vignette){vignette=document.createElement('div');vignette.id='nxVignette';vignette.className='nxVignette';host.appendChild(vignette)}
  let status=document.getElementById('nxStatus');
  if(!status){status=document.createElement('div');status.id='nxStatus';status.className='nxStatus';status.innerHTML='<i></i><span>Portal estabilizado</span>';host.appendChild(status)}
  let impact=document.getElementById('nxImpactLine');
  if(!impact){impact=document.createElement('div');impact.id='nxImpactLine';impact.className='nxImpactLine';host.appendChild(impact)}

  const labels={supernatural:'sinal paranormal ativo',titan:'expedição em curso',jujutsu:'energia amaldiçoada detectada',slayer:'respiração concentrada'};
  function syncAtmosphere(){document.body.dataset.v='9';const s=status.querySelector('span');if(s)s.textContent=labels[nxSeries]||'portal estabilizado'}
  const idV4=nId;nId=function(){idV4();syncAtmosphere()};syncAtmosphere();

  function flash(type){vignette.classList.remove('hit','fire');impact.classList.remove('on');void vignette.offsetWidth;vignette.classList.add(type);impact.classList.add('on')}
  const shootControl=document.querySelector('.shoot');
  if(shootControl)shootControl.addEventListener('pointerdown',()=>flash('fire'),{passive:true});

  let previousInv=0;
  function feedbackLoop(){
    try{if(typeof player!=='undefined'&&player){const inv=Number(player.inv)||0;if(inv>previousInv+.04)flash('hit');previousInv=inv}}catch(_){}
    requestAnimationFrame(feedbackLoop);
  }
  requestAnimationFrame(feedbackLoop);

  const playerV4=drawPlayer;
  drawPlayer=function(p,t){
    ctx.save();ctx.globalAlpha=.34;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h+3,p.w*.7,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
    playerV4(p,t);
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.12+.05*Math.sin(gameTime*4);ctx.strokeStyle=t.accent;ctx.lineWidth=1;ctx.strokeRect(p.x-2,p.y-2,p.w+4,p.h+4);ctx.restore();
  };
  const enemyV4=drawEnemy;
  drawEnemy=function(e,t){
    ctx.save();ctx.globalAlpha=.3;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(e.x+e.w/2,e.y+e.h+2,e.w*.72,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
    enemyV4(e,t);
    if(e.hit>0){ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.6,e.hit*2);ctx.fillStyle=t.accent;ctx.fillRect(e.x-2,e.y-2,e.w+4,e.h+4);ctx.restore()}
  };
  const bossV4=drawBoss;
  drawBoss=function(b,t){
    ctx.save();const aura=ctx.createRadialGradient(b.x+b.w/2,b.y+b.h/2,8,b.x+b.w/2,b.y+b.h/2,72);aura.addColorStop(0,t.accent+'25');aura.addColorStop(1,'#0000');ctx.fillStyle=aura;ctx.fillRect(b.x-45,b.y-45,b.w+90,b.h+90);ctx.restore();
    bossV4(b,t);
  };
  const shotV4=drawShot;
  drawShot=function(s,t){
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.18;ctx.fillStyle=t.accent;ctx.beginPath();ctx.arc(s.x+4,s.y+4,14+Math.sin(gameTime*8)*2,0,Math.PI*2);ctx.fill();ctx.restore();
    shotV4(s,t);
  };

  /* Cartões ilustrados: cenas originais feitas com camadas CSS. */
  const chooseV5=nxChoose;
  nxChoose=function(){
    chooseV5();
    panel.querySelectorAll('.universeBtn').forEach(function(card){
      const scene=document.createElement('span');scene.className='nxCardScene';scene.innerHTML='<i class="moon"></i><i class="ground"></i><i class="hero"></i>';
      const badge=document.createElement('span');badge.className='nxIllustrationBadge';badge.textContent='ARTE V9';
      card.append(scene,badge);
    });
  };

  /* Biblioteca vetorial compacta para sprites com contorno, volume e expressão. */
  function rounded(x,y,w,h,r,fill,stroke='#05070b',line=2){
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.lineWidth=line;ctx.strokeStyle=stroke;ctx.stroke()}
  }
  function limb(x1,y1,x2,y2,color,width=4){
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineCap='round';ctx.lineWidth=width+3;ctx.strokeStyle='#05070b';ctx.stroke();
    ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();
  }
  function eye(x,y,color='#fff',r=2){
    ctx.beginPath();ctx.arc(x,y,r+1.2,0,Math.PI*2);ctx.fillStyle='#05070b';ctx.fill();
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  }
  const palettes={
    supernatural:{coat:'#40362d',coat2:'#181a1f',skin:'#d8a879',trim:'#e4b96e',weapon:'#d6b474'},
    titan:{coat:'#52604d',coat2:'#252c28',skin:'#d9a681',trim:'#d8ca9f',weapon:'#e8edf0'},
    jujutsu:{coat:'#202943',coat2:'#0d1120',skin:'#d5aa8e',trim:'#b180ff',weapon:'#d9c8ff'},
    slayer:{coat:'#153c38',coat2:'#0a1e1d',skin:'#ddb08e',trim:'#6ad8c7',weapon:'#effffc'}
  };

  drawPlayer=function(p,t){
    if(p.inv>0&&Math.floor(p.inv*18)%2===0)return;
    const q=palettes[nxSeries]||palettes.supernatural,x=Math.round(p.x),y=Math.round(p.y),cx=x+p.w/2,d=p.dir||1,bob=Math.sin(p.anim||0)*1.1;
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    ctx.globalAlpha=.38;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(cx,y+p.h+3,p.w*.72,4,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    const speed=Math.abs(p.vx||0);if(speed>.8){ctx.globalAlpha=Math.min(.25,speed*.035);ctx.strokeStyle=q.trim;ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-d*(8+i*6),y+17+i*5);ctx.lineTo(x-d*(22+i*8),y+17+i*5);ctx.stroke()}ctx.globalAlpha=1}
    limb(cx-5,y+29,cx-7-bob,y+37,q.coat2,4);limb(cx+5,y+29,cx+7+bob,y+37,q.coat2,4);
    let body=ctx.createLinearGradient(x,y+11,x+p.w,y+31);body.addColorStop(0,q.coat2);body.addColorStop(.52,q.coat);body.addColorStop(1,'#0a0c10');
    rounded(x+3,y+11,p.w-6,21,6,body,'#05070b',2.4);
    ctx.fillStyle=q.trim;ctx.fillRect(cx-1.5,y+13,3,16);
    ctx.beginPath();ctx.arc(cx,y+8+bob*.15,8,0,Math.PI*2);ctx.fillStyle=q.skin;ctx.fill();ctx.lineWidth=2.4;ctx.strokeStyle='#05070b';ctx.stroke();
    ctx.fillStyle=q.coat2;ctx.beginPath();ctx.arc(cx,y+6,8.5,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(cx-9,y+5,18,3);
    eye(cx+d*3,y+8,'#f7f2df',1.2);ctx.strokeStyle='#44291e';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx+d*1,y+12);ctx.lineTo(cx+d*4,y+11);ctx.stroke();
    limb(cx+d*5,y+17,cx+d*12,y+22,q.coat,4);
    ctx.strokeStyle='#05070b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx+d*10,y+22);ctx.lineTo(cx+d*25,y+20);ctx.stroke();
    ctx.strokeStyle=q.weapon;ctx.lineWidth=2.8;ctx.stroke();
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=.3;ctx.strokeStyle=q.trim;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+5,y+14);ctx.lineTo(cx,y+12);ctx.stroke();ctx.restore();
  };

  drawEnemy=function(e,t){
    if(e.hit>0&&Math.floor(e.hit*50)%2===0)return;
    const x=e.x,y=e.y,w=e.w,h=e.h,cx=x+w/2,cy=y+h/2,q=palettes[nxSeries]||palettes.supernatural,pulse=Math.sin(gameTime*4+e.x*.05);
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    ctx.globalAlpha=.34;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(cx,y+h+3,w*.68,4,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    const aura=ctx.createRadialGradient(cx,cy,3,cx,cy,w*.9);aura.addColorStop(0,t.accent+'38');aura.addColorStop(1,'#0000');ctx.fillStyle=aura;ctx.fillRect(x-w*.4,y-w*.4,w*1.8,h+w*.8);
    if(nxSeries==='titan'){
      limb(cx-7,y+h*.58,cx-12,y+h+3,'#a96154',5);limb(cx+7,y+h*.58,cx+12,y+h+3,'#a96154',5);
      rounded(x+3,y+11,w-6,h-11,Math.min(12,w*.35),ctx.createLinearGradient(x,y,x+w,y+h),'#05070b',2.5);
      ctx.fillStyle='#b96858';ctx.fill();ctx.stroke();
      ctx.fillStyle='#e7a388';for(let i=0;i<4;i++)ctx.fillRect(x+6+i*(w-12)/4,y+14,2,h-19);
      ctx.beginPath();ctx.arc(cx,y+10,9,0,Math.PI*2);ctx.fillStyle='#d99579';ctx.fill();ctx.strokeStyle='#05070b';ctx.lineWidth=2.5;ctx.stroke();
      eye(cx-3,y+9,'#fff',1.5);eye(cx+3,y+9,'#fff',1.5);
      ctx.beginPath();ctx.arc(cx,y+15,5,.15,Math.PI-.15);ctx.strokeStyle='#4f1e22';ctx.lineWidth=2;ctx.stroke();
    }else{
      const body=ctx.createLinearGradient(x,y,x+w,y+h);body.addColorStop(0,nxSeries==='jujutsu'?'#8b54ad':nxSeries==='slayer'?'#804456':'#4d4959');body.addColorStop(1,q.coat2);
      ctx.beginPath();ctx.moveTo(cx,y+3);ctx.bezierCurveTo(x-3,y+7,x,y+h*.72,x+4,y+h);ctx.quadraticCurveTo(cx,y+h-5,x+w-4,y+h);ctx.bezierCurveTo(x+w,y+h*.68,x+w+3,y+8,cx,y+3);ctx.closePath();ctx.fillStyle=body;ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle='#05070b';ctx.stroke();
      if(nxSeries==='supernatural'){ctx.beginPath();ctx.moveTo(cx-7,y+7);ctx.lineTo(cx-12,y-3);ctx.lineTo(cx-2,y+4);ctx.moveTo(cx+7,y+7);ctx.lineTo(cx+12,y-3);ctx.lineTo(cx+2,y+4);ctx.strokeStyle=q.trim;ctx.lineWidth=3;ctx.stroke()}
      if(nxSeries==='slayer'){ctx.beginPath();ctx.moveTo(cx-6,y+7);ctx.lineTo(cx-9,y);ctx.moveTo(cx+6,y+7);ctx.lineTo(cx+9,y);ctx.strokeStyle='#e6d1ae';ctx.lineWidth=3;ctx.stroke()}
      eye(cx-5,y+13,t.accent,2);eye(cx+5,y+13,t.accent,2);
      ctx.strokeStyle='#05070b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,y+21+pulse,6,.25,Math.PI-.25);ctx.stroke();
      limb(x+4,y+h*.55,x-5-pulse*2,y+h*.7,q.coat,4);limb(x+w-4,y+h*.55,x+w+5+pulse*2,y+h*.7,q.coat,4);
    }
    if(e.hit>0){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.55;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,Math.max(w,h)*.55,0,Math.PI*2);ctx.fill()}
    ctx.restore();
  };

  drawBoss=function(b,t){
    const x=b.x,y=b.y,w=b.w,h=b.h,cx=x+w/2,cy=y+h/2,pulse=Math.sin(gameTime*3)*3,q=palettes[nxSeries]||palettes.supernatural;
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    const aura=ctx.createRadialGradient(cx,cy,12,cx,cy,78+pulse);aura.addColorStop(0,t.accent+'4f');aura.addColorStop(.55,t.accent+'18');aura.addColorStop(1,'#0000');ctx.fillStyle=aura;ctx.fillRect(x-60,y-60,w+120,h+120);
    ctx.globalAlpha=.42;ctx.strokeStyle=t.accent;ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(cx,cy,45+i*9+pulse,gameTime*.3+i,gameTime*.3+i+4.5);ctx.stroke()}ctx.globalAlpha=1;
    limb(cx-w*.24,y+h*.62,cx-w*.42,y+h+7,q.coat2,8);limb(cx+w*.24,y+h*.62,cx+w*.42,y+h+7,q.coat2,8);
    const mass=ctx.createLinearGradient(x,y,x+w,y+h);mass.addColorStop(0,nxSeries==='jujutsu'?'#7a3c9c':nxSeries==='slayer'?'#823c55':'#70463f');mass.addColorStop(.48,q.coat);mass.addColorStop(1,'#11131a');
    rounded(x+6,y+10,w-12,h-10,18,mass,'#05070b',4);
    ctx.beginPath();ctx.arc(cx,y+18,15,0,Math.PI*2);ctx.fillStyle=q.skin;ctx.fill();ctx.lineWidth=3.5;ctx.strokeStyle='#05070b';ctx.stroke();
    eye(cx-6,y+17,'#fff',2.5);eye(cx+6,y+17,'#fff',2.5);
    ctx.beginPath();ctx.arc(cx,y+28,8,.15,Math.PI-.15);ctx.strokeStyle='#3d171b';ctx.lineWidth=3;ctx.stroke();
    limb(x+9,y+34,x-10,y+57,q.coat,8);limb(x+w-9,y+34,x+w+10,y+57,q.coat,8);
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=.22;ctx.fillStyle=t.accent;ctx.beginPath();ctx.ellipse(cx,cy,w*.43,h*.39,0,0,Math.PI*2);ctx.fill();ctx.restore();
  };

  drawClue=function(q,t){
    const y=q.y+Math.sin(gameTime*3+q.t)*3,cx=q.x+q.w/2,cy=y+q.h/2,r=11+Math.sin(gameTime*4)*1.5;
    ctx.save();ctx.globalCompositeOperation='screen';const glow=ctx.createRadialGradient(cx,cy,1,cx,cy,25);glow.addColorStop(0,t.accent+'b8');glow.addColorStop(1,'#0000');ctx.fillStyle=glow;ctx.fillRect(cx-27,cy-27,54,54);ctx.globalCompositeOperation='source-over';
    ctx.translate(cx,cy);ctx.rotate(gameTime*.35);ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r:r*.48;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();
    const gem=ctx.createLinearGradient(-r,-r,r,r);gem.addColorStop(0,'#fff');gem.addColorStop(.28,t.accent);gem.addColorStop(1,'#17223a');ctx.fillStyle=gem;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#05070b';ctx.stroke();ctx.restore();
  };

  drawShot=function(s,t){
    const d=s.vx<0?-1:1,cx=s.x+4,cy=s.y+4;
    ctx.save();ctx.lineCap='round';ctx.globalCompositeOperation='screen';
    const trail=ctx.createLinearGradient(cx-d*26,cy,cx+d*5,cy);trail.addColorStop(0,'#0000');trail.addColorStop(.72,t.accent+'80');trail.addColorStop(1,'#fff');
    ctx.strokeStyle=trail;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(cx-d*25,cy);ctx.lineTo(cx+d*5,cy);ctx.stroke();
    ctx.fillStyle='#fff';ctx.shadowColor=t.accent;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(cx,cy,4.5,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.45;ctx.strokeStyle=t.accent;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,9+Math.sin(gameTime*10)*2,0,Math.PI*2);ctx.stroke();ctx.restore();
  };

  const worldV5=drawWorld;
  drawWorld=function(t,g){
    worldV5(t,g);
    const w=ctx.canvas.width,h=ctx.canvas.height,base=h*.84,shift=((camera&&camera.x)||0)*.22;
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.34;
    if(nxSeries==='supernatural'){
      ctx.fillStyle='#090d0d';for(let x=-80-(shift%110);x<w+100;x+=110){ctx.fillRect(x,base-45,5,80);ctx.fillRect(x-14,base-39,34,4)}
    }else if(nxSeries==='titan'){
      ctx.fillStyle='#292a23';for(let x=-100-(shift%150);x<w+150;x+=150){ctx.beginPath();ctx.moveTo(x,base+20);ctx.lineTo(x+62,base-80);ctx.lineTo(x+132,base+20);ctx.fill()}
    }else if(nxSeries==='jujutsu'){
      ctx.strokeStyle=t.accent;ctx.lineWidth=1;for(let x=-40-(shift%90);x<w+90;x+=90){ctx.strokeRect(x,base-38,18,31);ctx.beginPath();ctx.moveTo(x+9,base-36);ctx.lineTo(x+9,base-10);ctx.stroke()}
    }else{
      ctx.fillStyle='#061515';for(let x=-30-(shift%65);x<w+70;x+=65){ctx.fillRect(x,base-96,8,120);ctx.fillRect(x+11,base-70,6,94)}
    }
    const shade=ctx.createLinearGradient(0,h*.72,0,h);shade.addColorStop(0,'#0000');shade.addColorStop(1,'#020305c7');ctx.globalAlpha=1;ctx.fillStyle=shade;ctx.fillRect(0,h*.7,w,h*.3);ctx.restore();
  };
}catch(e){console.warn('NEXUS visual pass 4',e)}},0);
const NXART={supernatural:{icon:'✦',tag:'CASE FILE',sub:'Estradas, rituais e criaturas no escuro',phase:'CAÇADA NOTURNA'},titan:{icon:'⚔',tag:'EXPEDITION',sub:'Muralhas, telhados e gigantes à frente',phase:'OPERAÇÃO EXTERNA'},jujutsu:{icon:'◉',tag:'CURSED FILE',sub:'Maldições, domínios e energia instável',phase:'EXORCISMO'},slayer:{icon:'☾',tag:'NIGHT HUNT',sub:'Lâminas, luas e criaturas da noite',phase:'CAÇADA À LUA'}};
function nxDecor(){const a=NXART[nxSeries]||NXART.supernatural;let r=document.getElementById('nxPhaseRibbon');if(!r){r=document.createElement('div');r.id='nxPhaseRibbon';r.className='nxPhaseRibbon';stage.appendChild(r)}r.textContent=a.phase+' // FASE '+String(caseIndex+1).padStart(2,'0');if(!document.getElementById('nxCornerA')){let x=document.createElement('i');x.id='nxCornerA';x.className='nxCorner a';stage.appendChild(x);x=document.createElement('i');x.id='nxCornerB';x.className='nxCorner b';stage.appendChild(x)}}
const nxOldId=nId;nId=function(){nxOldId();nxDecor()};nxDecor();
nxChoose=function(){state='menu';overlay.classList.add('on');bossBar.classList.remove('on');panel.className='card nxUniverseCard';panel.innerHTML='<div class="kicker">nexus // selecione o universo</div><h1>Qual mundo você vai atravessar?</h1><p class="nxUniverseLead">A mecânica continua a mesma, mas cenário, inimigos, chefe, interface e atmosfera mudam com a campanha.</p><div class="universeGrid">'+Object.keys(NX).map(function(k,i){var a=NXART[k];return '<button class="universeBtn" data-nx="'+k+'"><span class="nxPosterIcon">'+a.icon+'</span><span class="nxPosterNo">0'+(i+1)+' // '+a.tag+'</span><b>'+NX[k].name+'</b><small>'+a.sub+'<br>'+NX[k].phase[caseIndex][0]+'</small><i class="nxTone"></i></button>'}).join('')+'</div><div class="nxUniverseHint">— O universo escolhido segue com você pelas próximas fases.</div><div class="btns"><button class="btn" id="nxBack">VOLTAR</button><button class="btn primary" id="nxRand">SURPREENDER</button></div>';panel.querySelectorAll('[data-nx]').forEach(function(b){b.onclick=function(){nxSeries=b.dataset.nx;nxCampaign=true;nxLaunch=true;nxApply();nId();startCase()}});$('nxBack').onclick=function(){panel.className='card';menu()};$('nxRand').onclick=function(){var k=Object.keys(NX);nxSeries=k[Math.floor(Math.random()*k.length)];nxCampaign=true;nxLaunch=true;nxApply();nId();startCase()}};
const nxOldMenu=menu;menu=function(){panel.className='card';return nxOldMenu()};
function nxSkyFx(t,w,h){ctx.save();var tm=gameTime||0;if(nxSeries==='supernatural'){var rg=ctx.createRadialGradient(w*.12,h*.68,0,w*.12,h*.68,w*.52);rg.addColorStop(0,'#d6ae6230');rg.addColorStop(.18,'#9e743014');rg.addColorStop(1,'#0000');ctx.fillStyle=rg;ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d6b56b22';ctx.lineWidth=1;for(var i=0;i<7;i++){var y=h*.25+i*17+Math.sin(tm*.35+i)*2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+9);ctx.stroke()}}else if(nxSeries==='titan'){ctx.fillStyle='#d9bd7c14';for(var i=0;i<26;i++){var x=(i*83+tm*13)%(w+80)-40,y=(i*47+tm*7)%(h*.76);ctx.fillRect(x,y,1+(i%2),1+(i%3===0))}ctx.strokeStyle='#f0dab51c';ctx.lineWidth=2;for(var i=0;i<4;i++){var xx=(i*117+tm*25)%(w+130)-65;ctx.beginPath();ctx.moveTo(xx,h*.12);ctx.lineTo(xx+70,h*.72);ctx.stroke()}}else if(nxSeries==='jujutsu'){for(var i=0;i<13;i++){var a=tm*.24+i*1.7,rx=w*(.15+(i%5)*.18),ry=h*(.18+(i%4)*.13);ctx.strokeStyle=i%3?'#9b71ff18':'#e7ddff16';ctx.lineWidth=1;ctx.beginPath();ctx.arc(rx+Math.sin(a)*12,ry+Math.cos(a*.7)*8,6+(i%4)*4,a,a+Math.PI*1.25);ctx.stroke()}var g=ctx.createRadialGradient(w*.72,h*.28,2,w*.72,h*.28,w*.33);g.addColorStop(0,'#8355e51b');g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}else{ctx.fillStyle='#ffe8d51b';for(var i=0;i<18;i++){var x=(i*71+Math.sin(tm*.4+i)*24+w)%w,y=(i*37+tm*9)%(h*.72);ctx.save();ctx.translate(x,y);ctx.rotate(tm*.7+i);ctx.fillRect(-2,-1,4,2);ctx.restore()}}ctx.restore()}
const nxSkyBase=drawSky;drawSky=function(t,w,h){nxSkyBase(t,w,h);nxSkyFx(t,w,h)};
function nxPlayerDetail(p,t){if(p.inv>0&&Math.floor(p.inv*18)%2===0)return;var x=Math.round(p.x),y=Math.round(p.y),d=p.dir||1,cx=x+p.w/2;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';if(nxSeries==='supernatural'){ctx.fillStyle='#1b1511';ctx.fillRect(cx-7,y+4,14,3);ctx.strokeStyle='#d0a66c';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx-6,y+16);ctx.lineTo(cx+6,y+16);ctx.stroke();ctx.strokeStyle='#c9b080';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+(d>0?p.w-1:1),y+21);ctx.lineTo(x+(d>0?p.w+12:-12),y+20);ctx.stroke()}else if(nxSeries==='titan'){ctx.strokeStyle='#c7d0cc';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+2,y+23);ctx.lineTo(cx,y+15);ctx.lineTo(x+p.w-2,y+23);ctx.stroke();ctx.fillStyle='#d7d2c4';ctx.fillRect(x-2,y+21,4,7);ctx.fillRect(x+p.w-2,y+21,4,7)}else if(nxSeries==='jujutsu'){ctx.fillStyle='#090b15';ctx.fillRect(cx-7,y+10,14,4);ctx.strokeStyle=t.accent;ctx.globalAlpha=.65;ctx.lineWidth=1.5;for(var i=0;i<3;i++){ctx.beginPath();ctx.arc(x+(d>0?p.w+4:-4),y+21,5+i*3,gameTime*.9+i,gameTime*.9+i+1.2);ctx.stroke()}}else{ctx.strokeStyle='#6fe0cd';ctx.lineWidth=1;for(var i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+5,y+15+i*5);ctx.lineTo(x+p.w-5,y+15+i*5);ctx.stroke()}ctx.strokeStyle='#eef6ef';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x+(d>0?p.w-2:2),y+18);ctx.lineTo(x+(d>0?p.w+14:-14),y+7);ctx.stroke()}ctx.restore()}
const nxPlayerBase=drawPlayer;drawPlayer=function(p,t){nxPlayerBase(p,t);nxPlayerDetail(p,t)};
function nxEnemyDetail(e,t){var cx=e.x+e.w/2,cy=e.y+e.h/2;ctx.save();if(nxSeries==='titan'){ctx.strokeStyle='#6b3730';ctx.globalAlpha=.62;ctx.lineWidth=1;for(var i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(cx+i*4,e.y+15);ctx.lineTo(cx+i*5,e.y+e.h-4);ctx.stroke()}ctx.fillStyle='#fff';for(var i=0;i<4;i++)ctx.fillRect(cx-7+i*4,e.y+15,2,2)}else if(nxSeries==='jujutsu'){ctx.strokeStyle=t.accent;ctx.globalAlpha=.28;for(var i=0;i<3;i++){ctx.beginPath();ctx.arc(cx,cy,11+i*4,gameTime*.5+i,gameTime*.5+i+1.4);ctx.stroke()}}else if(nxSeries==='supernatural'){ctx.strokeStyle=t.accent;ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(cx,cy,Math.max(e.w,e.h)*.56+Math.sin(gameTime*3+e.x)*2,0,Math.PI*2);ctx.stroke()}else{ctx.strokeStyle='#f0d2bd';ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(cx-7,e.y+12);ctx.lineTo(cx+7,e.y+18);ctx.moveTo(cx+6,e.y+10);ctx.lineTo(cx-6,e.y+19);ctx.stroke()}ctx.restore()}
const nxEnemyBase=drawEnemy;drawEnemy=function(e,t){nxEnemyBase(e,t);nxEnemyDetail(e,t)};
const nxBossBase=drawBoss;drawBoss=function(b,t){nxBossBase(b,t);var cx=b.x+b.w/2,cy=b.y+b.h/2,pulse=3+Math.sin(gameTime*4)*2;ctx.save();ctx.globalAlpha=.45;ctx.strokeStyle=t.accent;ctx.lineWidth=1.3;for(var i=0;i<3;i++){ctx.beginPath();ctx.arc(cx,cy,42+i*7+pulse,gameTime*.25+i*.7,gameTime*.25+i*.7+Math.PI*1.25);ctx.stroke()}ctx.globalAlpha=.12;ctx.fillStyle=t.accent;ctx.beginPath();ctx.arc(cx,cy,50+pulse,0,Math.PI*2);ctx.fill();ctx.restore()};
const nxShotBase=drawShot;drawShot=function(s,t){nxShotBase(s,t);ctx.save();if(nxSeries==='jujutsu'){ctx.globalAlpha=.3;ctx.strokeStyle=t.accent;ctx.beginPath();ctx.arc(s.x+4,s.y+4,11+Math.sin(gameTime*9)*2,0,Math.PI*2);ctx.stroke()}if(nxSeries==='slayer'){ctx.globalAlpha=.26;ctx.strokeStyle='#dffff7';ctx.beginPath();ctx.arc(s.x+4,s.y+5,14,-1.05,.45);ctx.stroke()}if(nxSeries==='titan'){ctx.globalAlpha=.28;ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(s.x-12,s.y+8);ctx.lineTo(s.x+5,s.y+3);ctx.stroke()}ctx.restore()};

