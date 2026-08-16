(()=>{
  const title=document.title||'';
  const game=/Jogo da Velha/i.test(title)?'velha':/Ludo/i.test(title)?'ludo':/Paciência Trilha/i.test(title)?'paciencia':/Trilha Oculta/i.test(title)?'trilha':/Oculto: Caçada/i.test(title)?'hunt':/Sala de Jogos/i.test(title)?'sala':'';
  if(!game)return;
  document.body.classList.add('v7-'+game);
  const hintKey='sala-jogos-hints-v7-'+game;
  let hints=localStorage.getItem(hintKey)!=='off';
  const haptic=(pattern=10)=>{try{navigator.vibrate&&navigator.vibrate(pattern)}catch(e){}};
  const pulse=(el,cls='v7-pulse')=>{if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),600)};
  let toastTimer=null;
  function toast(text,kind=''){
    let t=document.getElementById('v7-toast');if(!t){t=document.createElement('div');t.id='v7-toast';document.body.appendChild(t)}
    t.className='v7-toast '+kind;t.textContent=text;requestAnimationFrame(()=>t.classList.add('on'));clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('on'),1800);
  }
  window.V7Toast=toast;
  function applyHints(){document.body.classList.toggle('v7-no-hints',!hints);document.querySelectorAll('.v7-hints').forEach(b=>{b.classList.toggle('off',!hints);b.textContent=hints?'💡 DICAS: LIGADAS':'◌ DICAS: DESLIGADAS';b.setAttribute('aria-pressed',String(hints))});localStorage.setItem(hintKey,hints?'on':'off')}
  function addHintToggle(){if(game==='sala'||document.querySelector('.v7-hints'))return;const host=document.querySelector('#home .panel,.app,main');if(!host)return;const bar=document.createElement('div');bar.className='v7-uxbar';bar.innerHTML='<span><span class="v7-feedback-dot"></span>Assistência visual persistente neste jogo</span><button class="v7-hints" type="button"></button>';bar.querySelector('button').onclick=()=>{hints=!hints;applyHints();haptic(12);toast(hints?'Dicas ligadas. Realces e orientações voltaram.':'Dicas desligadas. Agora só ficam as regras essenciais.',hints?'':'gold')};const anchor=host.querySelector('.diff,.cfg,.seg,.levels,.top');anchor?anchor.parentNode.insertBefore(bar,anchor):host.appendChild(bar);applyHints()}
  document.addEventListener('pointerdown',e=>{const b=e.target.closest('button,.tile');if(!b)return;if(b.matches('button:disabled')){pulse(b,'v7-shake');return}b.classList.add('v7-pressed');haptic(6)},{passive:true});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>document.addEventListener(ev,e=>{const b=e.target.closest?.('button,.tile');b?.classList.remove('v7-pressed')},{passive:true}));
  document.addEventListener('click',e=>{const b=e.target.closest('button,.tile');if(!b||b.disabled)return;b.classList.remove('v7-clicked');void b.offsetWidth;b.classList.add('v7-clicked');setTimeout(()=>b.classList.remove('v7-clicked'),300)},true);

  function decorateHuntShop(){
    if(game!=='hunt'||typeof p==='undefined')return;const evo=document.querySelector('.evo'),shop=evo?.querySelector('.shop');if(!evo||!shop)return;
    let info=evo.querySelector('.v7-evo-info');if(!info){info=document.createElement('div');info.className='v7-evo-info';shop.before(info)}
    const ess=Number(p.ess)||0,lifeNow=typeof life==='function'?life():0,dmgNow=typeof dmg==='function'?dmg():0;
    info.innerHTML=`<div class="v7-balance"><b>ESSÊNCIA DISPONÍVEL</b><strong>${ess}</strong></div><div>❤️ Vida: <b>${lifeNow} → ${lifeNow+5}</b> por 25 essência. Vale para todos os próximos casos.</div><div>⚔️ Dano: <b>+${dmgNow} → +${dmgNow+1}</b> por 25 essência. Soma em toda carta de dano.</div>`;
    const bs=[...shop.querySelectorAll('button')];bs.forEach((b,i)=>{const ok=ess>=25;b.classList.toggle('v7-afford',ok);b.classList.toggle('v7-locked',!ok);b.innerHTML=i===0?`❤️ +5 VIDA<span class="v7-shopmeta">25 essência • ${ok?'comprar agora':'faltam '+(25-ess)}</span>`:`⚔️ +1 DANO<span class="v7-shopmeta">25 essência • ${ok?'comprar agora':'faltam '+(25-ess)}</span>`});
  }
  if(game==='hunt'&&typeof buy==='function'){
    const originalBuy=buy;window.buy=function(kind){const before=Number(p.ess)||0;if(before<25){toast(`Essência insuficiente: você tem ${before}. Faltam ${25-before}.`,'bad');pulse(document.getElementById('ess')?.closest('.stat')||document.querySelector('.evo'),'v7-shake');haptic([18,35,18]);decorateHuntShop();return}const oldLife=typeof life==='function'?life():0,oldDmg=typeof dmg==='function'?dmg():0;const out=originalBuy(kind);setTimeout(()=>{decorateHuntShop();const target=kind==='life'?document.getElementById('lifeB'):document.getElementById('dmgB');pulse(target?.closest('.ebox')||target);const result=kind==='life'?`Vida permanente ${oldLife} → ${typeof life==='function'?life():oldLife+5}`:`Dano permanente +${oldDmg} → +${typeof dmg==='function'?dmg():oldDmg+1}`;toast(`✓ ${result} • essência ${before} → ${p.ess}`,'gold');haptic([12,28,12])},0);return out};
    const oldHome=typeof home==='function'?home:null;if(oldHome){window.home=function(){const out=oldHome();setTimeout(decorateHuntShop,0);return out}}
    setTimeout(decorateHuntShop,30);
  }
  if(game==='hunt')document.addEventListener('click',e=>{const c=e.target.closest('.card.off');if(c){toast('Energia insuficiente para essa carta.','bad');pulse(c,'v7-shake')}},true);

  function decorateTrailShop(){
    if(game!=='trilha'||typeof p==='undefined')return;document.querySelectorAll('#shop button,.shop button').forEach(btn=>{const m=(btn.getAttribute('onclick')||'').match(/upgrade\('[^']+',\s*(\d+)\)/);if(!m)return;const cost=Number(m[1]),ok=(Number(p.ess)||0)>=cost;btn.classList.toggle('v7-afford',ok);btn.classList.toggle('v7-locked',!ok);if(!btn.querySelector('.v7-shopmeta'))btn.insertAdjacentHTML('beforeend',`<span class="v7-shopmeta">${ok?'Disponível':'Faltam '+(cost-(Number(p.ess)||0))+' essência'}</span>`);else btn.querySelector('.v7-shopmeta').textContent=ok?'Disponível':'Faltam '+(cost-(Number(p.ess)||0))+' essência'});
  }
  if(game==='trilha'&&typeof upgrade==='function'){
    const originalUpgrade=upgrade;window.upgrade=function(id,cost){const before=Number(p.ess)||0;if(before<cost){toast(`Essência insuficiente: faltam ${cost-before}.`,'bad');haptic([18,35,18]);decorateTrailShop();return}const name=(typeof getCard==='function'?getCard(id)?.name:null)||'Carta';const out=originalUpgrade(id,cost);setTimeout(()=>{decorateTrailShop();toast(`✓ ${name} aprimorada • essência ${before} → ${p.ess}`,'gold');pulse(document.getElementById('hess')?.closest('.stat')||document.getElementById('essence')?.parentElement);haptic([12,28,12])},0);return out};
    const oldRenderShop=typeof renderShop==='function'?renderShop:null;if(oldRenderShop){window.renderShop=function(){const out=oldRenderShop();setTimeout(decorateTrailShop,0);return out}}
    setTimeout(decorateTrailShop,80);
  }

  if(game==='paciencia'){
    if(typeof shuffle==='function'){const os=shuffle;window.shuffle=function(){if(phase!=='playing'){toast('Inicie uma rodada para trocar a mão.','bad');return}if(shuffles<=0){toast('Sem trocas de mão restantes.','bad');pulse(document.getElementById('shuf')?.closest('button'),'v7-shake');haptic([18,35,18]);return}return os()}}
    if(typeof play==='function'){const op=play;window.play=function(cid){if(phase==='playing'){const c=hand.find(x=>x.id===cid);if(c&&!neighbor(c.rank,f.rank))toast('Carta incompatível: você perdeu 1 vida.','bad')}return op(cid)}}
  }
  if(game==='velha'&&typeof play==='function'){
    const op=play;window.play=function(i){if(done){toast('A partida terminou. Toque em “Jogar novamente”.','bad');return}if(b[i]){toast('Essa casa já está ocupada.','bad');pulse(document.querySelectorAll('.cell')[i],'v7-shake');return}return op(i)}
  }
  if(game==='ludo'){
    const help=()=>{if(!hints)return;try{const who=P?.[cur];if(!who||winner)return;const msg=document.getElementById('msg');if(msg&&roll!==null&&legal?.length>1)msg.textContent+=' • peças possíveis piscam no tabuleiro'}catch(e){}};
    if(typeof render==='function'){const or=render;window.render=function(){const out=or();setTimeout(help,0);return out}}
  }

  addHintToggle();applyHints();
})();