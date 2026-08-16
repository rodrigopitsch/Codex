(()=>{
  const trail=/Trilha Oculta/i.test(document.title);
  if(!trail&&!/Oculto: Caçada/i.test(document.title)) return;
  const $=s=>document.querySelector(s);
  const byId=id=>document.getElementById(id);
  const snap=()=>{
    try{
      if(!b)return null;
      return trail?{enemy:b.e?.hp??0,player:b.hp??0,shield:b.shield??0,energy:b.energy??0,combo:b.combo??0,phase:b.phase??1}:{enemy:b.hp??0,player:b.php??0,shield:b.shield??0,energy:b.en??0,combo:b.combo??0,phase:b.phase??1};
    }catch(e){return null}
  };
  const enemyEl=()=>trail?byId('eico'):byId('ei');
  const playerEl=()=>trail?$('.playerbox'):$('.player');
  function impact(el,text,kind='red',big=false){if(!el)return;const r=el.getBoundingClientRect(),x=document.createElement('div');x.className=`v4-impact ${kind}${big?' big':''}`;x.textContent=text;x.style.left=(r.left+r.width/2)+'px';x.style.top=(r.top+r.height/2)+'px';document.body.appendChild(x);setTimeout(()=>x.remove(),800)}
  function bump(el,cls){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),720)}
  function haptic(ms=18){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}
  function attackNowV4(){try{return trail?enemyAttack():attackNow()}catch(e){return 0}}
  function stateV4(){try{return trail?{hp:b.hp,shield:b.shield}:{hp:b.php,shield:b.shield}}catch(e){return {hp:0,shield:0}}}
  function decorate(){
    try{
      if(!b)return;
      const atk=attackNowV4(),st=stateV4(),lethal=atk>=(st.hp+st.shield),end=$('.end');
      if(end){end.textContent=(lethal?'⚠️ ':'')+(trail?'MESA':'INIMIGO')+' ATACA: '+atk+' →';end.classList.toggle('v4-danger',lethal);end.classList.toggle('v4-safe',!lethal)}
      let threat=byId('v4-threat');
      if(!threat){threat=document.createElement('div');threat.id='v4-threat';threat.className='v4-threat';const controls=$('.controls');if(controls)controls.prepend(threat)}
      if(threat){threat.classList.toggle('danger',lethal);threat.innerHTML=`<span>${lethal?'⚠️ GOLPE PODE SER FATAL':'PRÓXIMO ATAQUE'}</span><b>${atk} dano • ${st.shield} proteção</b>`}
      const combo=trail?(b.combo||0):(b.finisher?'FIN':(b.combo||0));
      const hudCombo=byId('combo')?.parentElement;if(hudCombo)hudCombo.classList.toggle('v4-hot',Boolean(combo));
      const log=byId('log');if(log)log.classList.toggle('v4-special',/FINALIZAÇÃO|ROYAL FLUSH|FASE 2|CHEFE/i.test(log.textContent||''));
    }catch(e){}
  }
  function afterAction(before){
    setTimeout(()=>{
      const after=snap();if(!before||!after){decorate();return}
      const dealt=Math.max(0,before.enemy-after.enemy),healed=Math.max(0,after.player-before.player),shieldGain=Math.max(0,after.shield-before.shield),log=(byId('log')?.textContent||'');
      const special=/FINALIZAÇÃO/i.test(log),royal=/ROYAL FLUSH/i.test(log);
      if(dealt){bump(enemyEl(),'v4-hit');impact(enemyEl(),(special?'FINALIZAÇÃO • ':royal?'♛ ROYAL • ':'')+'-'+dealt,(special||royal)?'gold':/FRAQUEZA/i.test(log)?'gold':'red',special||royal);haptic(special||royal?38:18)}
      if(healed){bump(playerEl(),'v4-buff');impact(playerEl(),'❤️ +'+healed,'green')}
      if(shieldGain){bump(playerEl(),'v4-buff');impact(playerEl(),'🛡 +'+shieldGain,'blue')}
      if(after.phase>before.phase){const arena=trail?$('.felt'):$('.arena');bump(arena,'v4-phase');impact(enemyEl(),'FASE 2','gold',true);haptic(45)}
      if(!trail&&special&&typeof energy==='function'&&b&&b.hp>0){const cap=energy();if(b.en<cap){b.en=Math.min(cap,b.en+1);const l=byId('log');if(l&&!/\+1 energia/.test(l.textContent))l.innerHTML+=' • <b>+1 energia</b>';try{render()}catch(e){}}}
      decorate();
    },25)
  }
  try{
    if(typeof play==='function'){const original=play;play=function(i){const before=snap();const out=original(i);afterAction(before);return out}}
    if(typeof endTurn==='function'){const originalEnd=endTurn;endTurn=function(){const before=snap(),atk=attackNowV4();const out=originalEnd();setTimeout(()=>{const after=snap();if(before&&after){const hit=Math.max(0,before.player-after.player),blocked=Math.max(0,before.shield-after.shield);if(hit){bump(playerEl(),'v4-player-hit');impact(playerEl(),'-'+hit+' HP','red',hit>=12);document.body.classList.add('v4-danger-flash');setTimeout(()=>document.body.classList.remove('v4-danger-flash'),160);haptic(hit>=12?35:22)}else if(blocked){impact(playerEl(),'🛡 BLOQUEADO','blue')}}decorate()},30);return out}}
    if(trail&&typeof renderBattle==='function'){const r=renderBattle;renderBattle=function(){const out=r();setTimeout(decorate,0);return out}}
    if(!trail&&typeof render==='function'){const r=render;render=function(){const out=r();setTimeout(decorate,0);return out}}
  }catch(e){}
  setTimeout(decorate,80);
})();
