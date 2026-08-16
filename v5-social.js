(()=>{
'use strict';
const title=document.title||'';
const safeGet=(k,d=null)=>{try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}};
const safeSet=(k,v)=>{try{localStorage.setItem(k,String(v))}catch(e){}};
function tools(html,after){const d=document.createElement('div');d.className='v5-tools';d.innerHTML=html;(after||document.querySelector('.cfg,.top'))?.after(d);return d}

if(/Ludo/i.test(title)&&typeof reset==='function'&&typeof render==='function'){
 let mode=safeGet('sala-ludo-mode','cpu');
 const host=tools(`<div class="v5-row"><button id="v5cpu" class="v5-btn">🤖 Contra CPU</button><button id="v5local" class="v5-btn green">👥 Mesmo iPhone</button></div><span class="v5-note">No modo local, 2–4 pessoas passam o iPhone a cada turno. O dado continua o mesmo para todos.</span>`,document.querySelector('.cfg'));
 function apply(){if(!Array.isArray(P))return;P.forEach((pl,i)=>{pl.human=mode==='local'||i===0;pl.label=i===0?(mode==='local'?'Vermelho':'Você'):seed[i][1]});const sel=document.getElementById('diff');if(sel)sel.disabled=mode==='local';const red=document.querySelector('.base.red span');if(red)red.textContent=mode==='local'?'VERMELHO':'VOCÊ';document.getElementById('v5cpu')?.classList.toggle('on',mode==='cpu');document.getElementById('v5local')?.classList.toggle('on',mode==='local')}
 const baseRender=render;render=function(){apply();const out=baseRender();apply();if(mode==='local'&&!winner&&P[cur]){g('who').textContent='JOGADA: '+P[cur].label.toUpperCase();if(roll===null)g('msg').textContent='Role o dado'}return out};
 const baseReset=reset;reset=function(l){const out=baseReset(l);apply();return out};
 document.getElementById('v5cpu').onclick=()=>{mode='cpu';safeSet('sala-ludo-mode',mode);reset(level)};
 document.getElementById('v5local').onclick=()=>{mode='local';safeSet('sala-ludo-mode',mode);reset(level)};
 apply();render();
 return;
}

if(/Paciência Trilha/i.test(title)&&typeof start==='function'&&typeof render==='function'){
 let duel=null,handled=false;
 const host=tools(`<div class="v5-row"><button id="v5solo" class="v5-btn on">🃏 Solo</button><button id="v5duel" class="v5-btn green">👥 Duelo local</button></div><span id="v5status" class="v5-note">No duelo, os dois jogam o mesmo nível. Maior pontuação vence.</span>`,document.querySelector('.top'));
 const baseStart=start,baseRender=render;
 start=function(n){handled=false;return baseStart(n)};
 function restoreProgress(){if(!duel)return;try{saved=JSON.parse(duel.snapshot)}catch(e){}}
 function finishDuel(){if(!duel||handled||phase==='playing')return;handled=true;const sc=Number(score)||0;duel.scores[duel.player-1]=sc;const r=g('result');if(duel.player===1){r.innerHTML=`<div class="result"><h2>Jogador 1: ${sc} pts</h2><p>Passe o iPhone para o Jogador 2.</p><button id="v5next">JOGADOR 2 →</button></div>`;document.getElementById('v5next').onclick=()=>{restoreProgress();duel.player=2;document.getElementById('v5status').textContent='Duelo • Jogador 2';baseStart(duel.level);handled=false}}else{const a=duel.scores[0],b=duel.scores[1],w=a===b?'Empate':a>b?'Jogador 1':'Jogador 2';restoreProgress();r.innerHTML=`<div class="result"><h2>${w}</h2><div class="v5-duel-score"><span>J1<br><b>${a}</b></span><span>J2<br><b>${b}</b></span></div><button id="v5again">NOVO DUELO</button></div>`;document.getElementById('v5again').onclick=()=>beginDuel();document.getElementById('v5status').textContent=`Último duelo: ${w} • ${a} × ${b}`}}
 render=function(){const out=baseRender();finishDuel();return out};
 function solo(){duel=null;document.getElementById('v5solo').classList.add('on');document.getElementById('v5duel').classList.remove('on');document.getElementById('v5status').textContent='Modo solo • progresso normal';start(level)}
 function beginDuel(){duel={player:1,level,scores:[],snapshot:JSON.stringify(saved)};document.getElementById('v5solo').classList.remove('on');document.getElementById('v5duel').classList.add('on');document.getElementById('v5status').textContent='Duelo • Jogador 1';start(level)}
 document.getElementById('v5solo').onclick=solo;document.getElementById('v5duel').onclick=beginDuel;
 return;
}
})();