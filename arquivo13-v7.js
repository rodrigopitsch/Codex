/* ===== ARQUIVO 13 V7 PROGRESSIVE UPGRADE ECONOMY ===== */
const a13V7Subtitle=document.querySelector('.title small');
if(a13V7Subtitle)a13V7Subtitle.textContent='V7 • 13 casos • evolução com custos progressivos';

const a13V7Style=document.createElement('style');
a13V7Style.id='arquivo13-v7-style';
a13V7Style.textContent=`
.a13-economy{margin:9px 0;padding:9px 10px;border-radius:11px;border:1px solid #4c426a;background:#12101d;color:#b9b2ce;font-size:8px;line-height:1.45}.a13-economy b{display:block;color:#dfd1ff;font-size:9px;margin-bottom:3px}.upgrade.a13-can-buy{border-color:#766037;box-shadow:inset 0 0 18px #7d5c1820}.upgrade.a13-cant-buy{opacity:.58;filter:saturate(.72)}.upgrade .a13-next{color:#f0d89d;font-weight:900}
`;
document.head.appendChild(a13V7Style);

function a13UpgradeCost(type){
 const n=Math.max(0,Number(type==='life'?save.lifeUp:save.powerUp)||0);
 const base=type==='life'?35:45;
 const growth=type==='life'?1.34:1.42;
 return Math.ceil((base*Math.pow(growth,n))/5)*5;
}

buyUpgrade=function(type){
 if(type!=='life'&&type!=='power')return;
 const cost=a13UpgradeCost(type);
 if(Number(save.ess||0)<cost){
  toast(`Faltam ${cost-Number(save.ess||0)} de essência`);
  return;
 }
 save.ess-=cost;
 if(type==='life')save.lifeUp=Number(save.lifeUp||0)+1;
 else save.powerUp=Number(save.powerUp||0)+1;
 persist();
 const next=a13UpgradeCost(type);
 toast(`${type==='life'?'Vida':'Relíquia'} melhorada • próxima: ${next}`);
 menu();
};

const a13V7BaseMenu=menu;
menu=function(){
 a13V7BaseMenu();
 const ups=panel.querySelector('.upgrades');
 if(!ups)return;
 const lifeBtn=ups.querySelector('[data-up="life"]');
 const powerBtn=ups.querySelector('[data-up="power"]');
 const lifeCost=a13UpgradeCost('life');
 const powerCost=a13UpgradeCost('power');
 const essence=Number(save.ess||0);
 if(lifeBtn){
  const b=lifeBtn.querySelector('b'),s=lifeBtn.querySelector('small');
  if(b)b.innerHTML=`+1 ❤️ VIDA • <span class="a13-next">${lifeCost} ESS</span>`;
  if(s)s.textContent=`Vida total ${5+Number(save.lifeUp||0)} → ${6+Number(save.lifeUp||0)} • melhoria ${Number(save.lifeUp||0)+1}`;
  lifeBtn.classList.toggle('a13-can-buy',essence>=lifeCost);
  lifeBtn.classList.toggle('a13-cant-buy',essence<lifeCost);
 }
 if(powerBtn){
  const b=powerBtn.querySelector('b'),s=powerBtn.querySelector('small');
  if(b)b.innerHTML=`+1 ✦ PODER • <span class="a13-next">${powerCost} ESS</span>`;
  if(s)s.textContent=`Dano ${1+Number(save.powerUp||0)} → ${2+Number(save.powerUp||0)} • melhoria ${Number(save.powerUp||0)+1}`;
  powerBtn.classList.toggle('a13-can-buy',essence>=powerCost);
  powerBtn.classList.toggle('a13-cant-buy',essence<powerCost);
 }
 const note=document.createElement('div');
 note.className='a13-economy';
 note.innerHTML='<b>EVOLUÇÃO PROGRESSIVA</b>Cada melhoria custa mais que a anterior. Vida sobe de preço de forma moderada; Poder sobe mais rápido porque aumenta diretamente o dano contra criaturas e chefes.';
 ups.after(note);
};
/* ===== /ARQUIVO 13 V7 PROGRESSIVE UPGRADE ECONOMY ===== */
