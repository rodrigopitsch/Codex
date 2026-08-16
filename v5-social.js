(()=>{
const V5_KEY='sala-jogos-history-v5';
const title=document.title||'';
const game=/Jogo da Velha/i.test(title)?'velha':/Ludo/i.test(title)?'ludo':/Paciência Trilha/i.test(title)?'paciencia':/Trilha Oculta/i.test(title)?'trilha':/Oculto: Caçada/i.test(title)?'oculto':/Sala de Jogos/i.test(title)?'sala':'';
if(!game)return;
const names={velha:'Jogo da Velha',ludo:'Ludo',paciencia:'Paciência Trilha',oculto:'Oculto: Caçada',trilha:'Trilha Oculta'};
const read=()=>{try{return JSON.parse(localStorage.getItem(V5_KEY))||[]}catch(e){return[]}};
const write=a=>{try{localStorage.setItem(V5_KEY,JSON.stringify(a.slice(-120)))}catch(e){}};
function record(e){const a=read();a.push(Object.assign({ts:Date.now(),game:names[game]||game,mode:'Solo',player:'Jogador',score:0,result:'',detail:''},e));write(a);refreshMini()}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function overlay(title,body,buttons=[['Fechar',()=>closeOverlay()]]){closeOverlay();const o=document.createElement('div');o.className='v5-overlay';o.id='v5-overlay';o.innerHTML=`<div class="v5-sheet"><h2>${title}</h2><div>${body}</div><div class="v5-actions" id="v5-acts"></div></div>`;document.body.appendChild(o);const a=o.querySelector('#v5-acts');buttons.forEach(([label,fn,cls])=>{const b=document.createElement('button');b.className='v5-btn '+(cls||'');b.textContent=label;b.onclick=fn;a.appendChild(b)})}
function closeOverlay(){document.getElementById('v5-overlay')?.remove()}
function history(all=game==='sala'){
 const a=read().filter(x=>all||x.game===names[game]).slice().reverse();
 const top=[...a].sort((x,y)=>(y.score||0)-(x.score||0)).slice(0,5);
 let body=`<p>${a.length} resultado${a.length===1?'':'s'} salvo${a.length===1?'':'s'} neste aparelho. Funciona offline.</p>`;
 if(top.length){body+='<b>🏆 Melhores pontuações</b><div class="v5-history">'+top.map((x,i)=>`<div class="v5-rank"><i>${['🥇','🥈','🥉','4','5'][i]}</i><span><b>${esc(x.game)} • ${esc(x.player)}</b><br>${esc(x.mode)} ${x.detail?'• '+esc(x.detail):''}</span><strong>${x.score||0}</strong></div>`).join('')+'</div><div class="v5-divider"></div>'}
 body+='<b>🕘 Histórico recente</b><div class="v5-history">'+(a.slice(0,12).map(x=>`<div class="v5-entry"><span><b>${esc(x.game)} • ${esc(x.player)}</b><br>${esc(x.result)} ${x.detail?'• '+esc(x.detail):''}</span><strong>${x.score||0}</strong></div>`).join('')||'<p>Nenhuma partida registrada ainda.</p>')+'</div>';
 overlay('Histórico & recordes',body,[['Fechar',closeOverlay],['Limpar histórico',()=>{if(confirm('Apagar todo o histórico de pontuação?')){localStorage.removeItem(V5_KEY);closeOverlay();refreshMini()}},'red']]);
}
window.V5History=history;
function tools(html,where){const d=document.createElement('div');d.className='v5-tools';d.innerHTML=html;(where||document.querySelector('.panel,.app,main'))?.appendChild(d);return d}
function refreshMini(){document.querySelectorAll('[data-v5-count]').forEach(x=>x.textContent=read().filter(e=>e.game===names[game]).length)}
function addHistoryButton(where){const d=tools(`<div class="v5-row"><button class="v5-btn" onclick="V5History()">🏆 Histórico</button><span class="v5-note"><b data-v5-count>0</b> resultados salvos</span></div>`,where);refreshMini();return d}
function difficultyMult(k){return({story:.8,rookie:.8,hunter:1,veteran:1.25,nightmare:1.55}[k]||1)}

if(game==='sala'){
 const host=document.querySelector('.app');const d=document.createElement('div');d.className='v5-room-card';d.innerHTML='<h3>🏆 Pontuação & Multiplayer</h3><p>Recordes dos cinco jogos e duelos locais ficam salvos neste iPhone.</p><button class="v5-btn" onclick="V5History()">ABRIR HISTÓRICO GERAL</button>';const offline=document.getElementById('offline');offline?.after(d);return;
}

if(game==='velha'){
 const seg=document.querySelector('.seg');if(seg){document.getElementById('duo').textContent='2 jogadores';document.getElementById('cpu').textContent='Contra iPhone';const t=tools(`<div class="v5-scorestrip"><div class="v5-scorebox"><b id="v5-x">0</b><small>VITÓRIAS X</small></div><div class="v5-scorebox"><b id="v5-o">0</b><small>VITÓRIAS O</small></div><div class="v5-scorebox"><b id="v5-draw">0</b><small>EMPATES</small></div></div><div class="v5-row"><button class="v5-btn" onclick="V5History()">🏆 Histórico</button><span class="v5-note">Multiplayer local já funciona no modo 2 jogadores.</span></div>`);seg.after(t)}
 let last='';const oldResetV5=reset;reset=function(){last='';return oldResetV5()};const oldRender=render;render=function(){const out=oldRender();const o=outcome(b),sig=m+'|'+b.join('');if(o&&sig!==last){last=sig;if(o.w==='draw')record({mode:m==='duo'?'Multiplayer local':'Contra iPhone',player:'Empate',score:25,result:'Empate'});else record({mode:m==='duo'?'Multiplayer local':'Contra iPhone',player:o.w==='X'?'Jogador X':(m==='duo'?'Jogador O':'iPhone'),score:100,result:'Vitória'});update()}return out};
 function update(){const a=read().filter(x=>x.game===names.velha);let X=0,O=0,D=0;a.forEach(x=>{if(x.result==='Empate')D++;else if(x.player==='Jogador X')X++;else O++});document.getElementById('v5-x').textContent=X;document.getElementById('v5-o').textContent=O;document.getElementById('v5-draw').textContent=D;refreshMini()}update();return;
}

if(game==='ludo'){
 let mode=localStorage.getItem('v5-ludo-mode')||'cpu',recorded=false;
 const cfg=document.querySelector('.cfg');const d=tools(`<div class="v5-row"><button id="v5-lcpu" class="v5-btn" onclick="V5LudoMode('cpu')">🤖 Contra CPU</button><button id="v5-llocal" class="v5-btn green" onclick="V5LudoMode('local')">👥 Multiplayer local</button><button class="v5-btn" onclick="V5History()">🏆 Histórico</button></div><div class="v5-note">No multiplayer, 2–4 pessoas jogam no mesmo iPhone e passam o aparelho a cada turno.</div>`);cfg?.after(d);
 function apply(){if(!P?.length)return;P.forEach((pl,i)=>{pl.human=mode==='local'||i===0;pl.label=i===0?(mode==='local'?'Vermelho':'Você'):seed[i][1]});const bs=[...document.querySelectorAll('#levels button')];bs.forEach((x,i)=>x.textContent=i+2);const lab=document.querySelector('.cfg label');if(lab&&lab.firstChild)lab.firstChild.textContent='JOGADORES';document.getElementById('diff').disabled=mode==='local';document.getElementById('v5-lcpu').classList.toggle('on',mode==='cpu');document.getElementById('v5-llocal').classList.toggle('on',mode==='local');const red=document.querySelector('.base.red span');if(red)red.textContent=mode==='local'?'VERMELHO':'VOCÊ'}
 window.V5LudoMode=x=>{mode=x;localStorage.setItem('v5-ludo-mode',x);recorded=false;reset(level)};
 const oldRender=render;render=function(){const out=oldRender();apply();if(mode==='local'&&!winner&&P[cur]){g('who').textContent='JOGADA: '+P[cur].label.toUpperCase();g('msg').textContent=roll===null?'Role o dado':'Escolha uma peça'}if(winner&&!recorded){recorded=true;const who=P[cur]?.label||'Jogador';record({mode:mode==='local'?'Multiplayer local':'Contra CPU',player:who,score:1000,result:'Vitória',detail:(level+1)+' jogadores'})}return out};
 const oldReset=reset;reset=function(l){recorded=false;const out=oldReset(l);apply();render();return out};apply();render();return;
}

if(game==='paciencia'){
 let duel=null,finished=false;const top=document.querySelector('.top');const d=tools(`<div class="v5-row"><button id="v5-psolo" class="v5-btn on" onclick="V5PatienceSolo()">🃏 Solo</button><button id="v5-pduel" class="v5-btn green" onclick="V5PatienceDuel()">👥 Duelo local</button><button class="v5-btn" onclick="V5History()">🏆 Histórico</button></div><div id="v5-pstatus" class="v5-note">No duelo, cada jogador faz uma rodada no mesmo nível. Maior pontuação vence.</div>`);top?.after(d);
 const oldStart=start;start=function(n){finished=false;return oldStart(n)};
 const oldRender=render;render=function(){const out=oldRender();if(phase!=='playing'&&!finished){finished=true;handleFinish()}return out};
 function restore(){if(!duel)return;try{saved=JSON.parse(duel.snapshot);localStorage.setItem('sala-jogos-trilha-progress',duel.snapshot)}catch(e){}}
 function handleFinish(){const res=phase==='won'?'Vitória':'Derrota',sc=Number(score)||0;if(!duel){record({mode:'Solo',player:'Jogador',score:sc,result:res,detail:'Nível '+level});return}const who='Jogador '+duel.player;duel.scores[duel.player-1]=sc;record({mode:'Duelo local',player:who,score:sc,result:res,detail:'Nível '+duel.level});restore();const r=g('result');if(duel.player===1){r.innerHTML=`<div class="result"><h2>Jogador 1: ${sc} pts</h2><p>Passe o iPhone para o Jogador 2.</p><button onclick="V5PatienceNext()">JOGADOR 2 →</button></div>`}else{const a=duel.scores[0],b2=duel.scores[1],w=a===b2?'Empate':a>b2?'Jogador 1':'Jogador 2';record({mode:'Duelo local',player:w,score:Math.max(a,b2),result:a===b2?'Empate':'Vencedor do duelo',detail:`${a} × ${b2}`});r.innerHTML=`<div class="result"><h2>${w}</h2><p>${a} × ${b2} pontos</p><button onclick="V5PatienceDuel()">NOVO DUELO</button></div>`;document.getElementById('v5-pstatus').textContent=`Último duelo: ${w} • ${a} × ${b2}`}}
 window.V5PatienceSolo=()=>{duel=null;document.getElementById('v5-psolo').classList.add('on');document.getElementById('v5-pduel').classList.remove('on');start(level)};
 window.V5PatienceDuel=()=>{duel={player:1,level,scores:[],snapshot:JSON.stringify(saved)};document.getElementById('v5-psolo').classList.remove('on');document.getElementById('v5-pduel').classList.add('on');document.getElementById('v5-pstatus').textContent='Duelo • Jogador 1';start(duel.level)};
 window.V5PatienceNext=()=>{restore();duel.player=2;document.getElementById('v5-pstatus').textContent='Duelo • Jogador 2';start(duel.level)};return;
}

function installHunt(isTrail){
 const battleKey=isTrail?'trilha-oculta-battle':'oculto5_battle',backupKey=isTrail?'v5-trilha-duel-backup':'v5-oculto-duel-backup';try{if(localStorage.getItem(backupKey)!==null){const old=localStorage.getItem(backupKey);if(old)localStorage.setItem(battleKey,old);else localStorage.removeItem(battleKey);localStorage.removeItem(backupKey)}}catch(e){}
 const homePanel=document.querySelector('#home .panel');const bar=document.createElement('div');bar.className='v5-tools';bar.innerHTML=`<div class="v5-row"><button class="v5-btn" onclick="${isTrail?'V5TrailDuel':'V5OccultDuel'}()">👥 DUELO LOCAL</button><button class="v5-btn" onclick="V5History()">🏆 HISTÓRICO</button></div><div class="v5-note">Dois jogadores enfrentam o mesmo caso e dificuldade. O duelo não altera a campanha.</div>`;homePanel?.insertBefore(bar,homePanel.querySelector('.diff'));
 let duel=null;
 function calc(winFlag){try{const mult=difficultyMult(isTrail?difficulty:p.diff);if(isTrail){const dealt=Math.max(0,b.e.max-b.e.hp);return Math.round((winFlag?1000+b.hp*12+Math.max(0,14-b.turn)*30+(b.boss?400:0):dealt*9+b.turn*15)*mult)}const dealt=Math.max(0,b.max-b.hp);return Math.round((winFlag?1000+b.php*12+Math.max(0,14-b.turn)*30+(b.boss?400:0):dealt*9+b.turn*15)*mult)}catch(e){return 0}}
 function detail(){try{return (isTrail?DIFF[difficulty].name:D[p.diff].n)+' • Caso '+((b.casePos%25)+1)+'/25'}catch(e){return''}}
 function restoreProfile(){if(!duel)return;try{p=JSON.parse(duel.snapshot);if(isTrail){difficulty=duel.diff;localStorage.setItem('trilha-oculta-profile',duel.snapshot);localStorage.removeItem('trilha-oculta-battle')}else{localStorage.oculto5=duel.snapshot;localStorage.removeItem('oculto5-battle')}}catch(e){}}
 function restoreOriginalBattle(){if(!duel)return;const key=isTrail?'trilha-oculta-battle':'oculto5_battle',bak=isTrail?'v5-trilha-duel-backup':'v5-oculto-duel-backup';try{if(duel.origBattle)localStorage.setItem(key,duel.origBattle);else localStorage.removeItem(key);localStorage.removeItem(bak)}catch(e){}}
 function finish(winFlag){const sc=calc(winFlag),who='Jogador '+duel.player;duel.scores[duel.player-1]=sc;record({mode:'Duelo local',player:who,score:sc,result:winFlag?'Vitória':'Derrota',detail:detail()});if(isTrail)localStorage.removeItem('trilha-oculta-battle');else localStorage.removeItem('oculto5_battle');if(duel.player===1){overlay('Duelo • Jogador 1',`<p><b>${sc} pontos</b></p><p>Passe o iPhone para o Jogador 2. Ele enfrentará o mesmo caso na mesma dificuldade.</p>`,[['JOGADOR 2 →',()=>{closeOverlay();restoreProfile();duel.player=2;b=null;if(isTrail)startBattle();else start()}]])}else{const a=duel.scores[0],c=duel.scores[1],w=a===c?'Empate':a>c?'Jogador 1':'Jogador 2';record({mode:'Duelo local',player:w,score:Math.max(a,c),result:a===c?'Empate':'Vencedor do duelo',detail:`${a} × ${c}`});restoreProfile();restoreOriginalBattle();b=null;if(isTrail){screen('home');renderHome()}else{screen('home');home()}overlay('Resultado do duelo',`<div class="v5-winner">${w}</div><p style="text-align:center"><b>${a} × ${c} pontos</b></p>`,[['Fechar',()=>{closeOverlay();duel=null}],['Novo duelo',()=>{closeOverlay();startDuel()}]])}}
 function startDuel(){const key=isTrail?'trilha-oculta-battle':'oculto5_battle',bak=isTrail?'v5-trilha-duel-backup':'v5-oculto-duel-backup',origBattle=localStorage.getItem(key)||'';try{localStorage.setItem(bak,origBattle)}catch(e){}if(isTrail){duel={player:1,scores:[],snapshot:JSON.stringify(p),diff:difficulty,origBattle};startBattle()}else{duel={player:1,scores:[],snapshot:JSON.stringify(p),diff:p.diff,origBattle};start()}}
 if(isTrail)window.V5TrailDuel=startDuel;else window.V5OccultDuel=startDuel;
 const oldWin=win,oldLose=lose;
 win=function(){if(duel)return finish(true);const sc=calc(true),det=detail();record({mode:'Campanha',player:'Jogador',score:sc,result:'Vitória',detail:det});return oldWin()};
 lose=function(){if(duel)return finish(false);const sc=calc(false),det=detail();record({mode:'Campanha',player:'Jogador',score:sc,result:'Derrota',detail:det});return oldLose()};
}
if(game==='oculto'){installHunt(false);return}
if(game==='trilha'){installHunt(true);return}
})();
