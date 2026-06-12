const STYLES = {
  nap_avpn: { name:'Napolitana clássica AVPN', hydration:.61, salt:.029, oil:0, sugar:0, honey:0, k:.285, g:.48, yeastCoef:.40, minH:.58, maxH:.64, avpn:true },
  nap_prod: { name:'Napolitana produzível', hydration:.64, salt:.028, oil:0, sugar:0, honey:0, k:.30, g:.50, yeastCoef:.58, minH:.60, maxH:.70, producible:true },
  neo: { name:'Neo-napolitana', hydration:.66, salt:.027, oil:.012, sugar:0, honey:.004, k:.305, g:.52, yeastCoef:.65, minH:.62, maxH:.72 },
  romana: { name:'Romana', hydration:.75, salt:.032, oil:.02, sugar:0, honey:0, k:.265, g:.50, yeastCoef:.70, minH:.68, maxH:.85 },
  detroit: { name:'Detroit', hydration:.74, salt:.025, oil:.04, sugar:.015, honey:0, k:.34, g:.60, yeastCoef:1.20, minH:.68, maxH:.80 },
  americana: { name:'Americana', hydration:.63, salt:.025, oil:.035, sugar:.02, honey:0, k:.31, g:.55, yeastCoef:.85, minH:.58, maxH:.72 },
  brasileira: { name:'Brasileira', hydration:.61, salt:.024, oil:.04, sugar:.025, honey:0, k:.33, g:.52, yeastCoef:1.05, minH:.55, maxH:.70 }
};
const FLOURS = {
  purissima: {name:'Puríssima (estimada)', protein:12, w:300, pl:.60, absorption:58, fn:300, note:'Perfil estimado: ajuste se tiver ficha técnica.'},
  generic_medium: {name:'Farinha média', protein:11, w:250, pl:.65, absorption:56, fn:300},
  generic_strong: {name:'Farinha forte', protein:13, w:330, pl:.60, absorption:61, fn:300},
  custom: {name:'Personalizada', protein:12, w:300, pl:.60, absorption:58, fn:300}
};
const SURFACES = {
  none:{name:'Sem pedra/chapa', hyd:-.015, fs:.85, preheat:15},
  tray:{name:'Assadeira comum', hyd:0, fs:.95, preheat:20},
  stone:{name:'Pedra refratária', hyd:.015, fs:1.10, preheat:60},
  steel:{name:'Chapa de aço', hyd:.025, fs:1.35, preheat:60},
  pan:{name:'Forma Detroit/pan', hyd:.015, fs:1.05, preheat:20}
};
const PRESETS = {
  manual:{name:'Manual', roomHours:null, roomTemp:null, coldHours:null, coldTemp:null},
  same4:{name:'Mesmo dia curto — 4h', roomHours:4, roomTemp:24, coldHours:0, coldTemp:5},
  same6:{name:'Mesmo dia — 6h', roomHours:6, roomTemp:24, coldHours:0, coldTemp:5},
  same8:{name:'Mesmo dia — 8h', roomHours:8, roomTemp:24, coldHours:0, coldTemp:5},
  twelve:{name:'Meio dia — 12h', roomHours:12, roomTemp:22, coldHours:0, coldTemp:5},
  twenty4:{name:'24h mista — 5h ambiente + 19h geladeira', roomHours:5, roomTemp:24, coldHours:19, coldTemp:5},
  forty8:{name:'48h longa — 4h ambiente + 44h geladeira', roomHours:4, roomTemp:22, coldHours:44, coldTemp:5},
  seventy2:{name:'72h premium — 4h ambiente + 68h geladeira', roomHours:4, roomTemp:22, coldHours:68, coldTemp:5}
};
function $(id){return document.getElementById(id)}
function val(id){const v=$(id).value;return v===''?null:Number(v)}
function pct(v){return (v*100).toFixed(2)+'%'}
function g(v){return v<5?v.toFixed(2)+' g':v.toFixed(0)+' g'}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function init(){
  $('style').innerHTML = Object.entries(STYLES).map(([k,s])=>`<option value="${k}">${s.name}</option>`).join('');
  $('style').value='nap_prod';
  $('flourPreset').innerHTML = Object.entries(FLOURS).map(([k,f])=>`<option value="${k}">${f.name}</option>`).join('');
  $('fermentationPreset').innerHTML = Object.entries(PRESETS).map(([k,p])=>`<option value="${k}">${p.name}</option>`).join('');
  $('fermentationPreset').value='twenty4';
  $('flourPreset').addEventListener('change',applyFlour);
  $('fermentationPreset').addEventListener('change',applyPreset);
  $('calculateBtn').addEventListener('click',calculate);
  document.querySelectorAll('input,select').forEach(el=>el.addEventListener('change',()=>{ if(el.id!=='flourPreset'&&el.id!=='fermentationPreset') calculate(); }));
  applyFlour(); applyPreset(); calculate();
}
function applyFlour(){const f=FLOURS[$('flourPreset').value]; if($('flourPreset').value!=='custom'){ $('protein').value=f.protein; $('flourW').value=f.w; $('pl').value=f.pl; $('absorption').value=f.absorption; $('fallingNumber').value=f.fn; } calculate();}
function applyPreset(){
  const p=PRESETS[$('fermentationPreset').value];
  if(!p || p.roomHours===null) return;
  $('roomHours').value=p.roomHours; $('roomTemp').value=p.roomTemp; $('coldHours').value=p.coldHours; $('coldTemp').value=p.coldTemp;
  calculate();
}
function tempFactor(t){ return Math.pow(2,(t-24)/10); }
function coldFactor(t){ return .60*Math.pow(2,(t-24)/10); }
function eqHours(roomH,roomT,coldH,coldT){ return roomH*tempFactor(roomT)+coldH*coldFactor(coldT); }
function ovenHydAdj(oven, styleKey){
  if(styleKey==='nap_avpn'){ if(oven>=430) return -.01; if(oven>=380) return 0; if(oven>=300) return .02; return .04; }
  if(oven>=430) return -.02; if(oven>=350) return -.005; if(oven>=280) return .01; return .025;
}
function flourHydAdj(w,pl,abs,fn){
  let adj=0;
  adj += (w-280)/50*.012;
  adj += (abs-58)*.005;
  adj -= (pl-.60)/.10*.004;
  if(fn<250) adj -= .005;
  return adj;
}
function productiveNapAdj(he, oven){
  let honey=0, oil=0, sugar=0;
  if(he<=4){ honey=.025; oil=.020; }
  else if(he<=6){ honey=.020; oil=.015; }
  else if(he<=8){ honey=.015; oil=.010; }
  else if(he<=12){ honey=.010; oil=.010; }
  else if(he<=24){ honey=.005; oil=.005; }
  if(oven<300 && he<=12) sugar=.005;
  if(oven<260 && he<=12) sugar=.010;
  return {honey,oil,sugar};
}
function yeastBase(he, coef){
  const y0=.0016, ref=12;
  return clamp(y0*coef*ref/Math.max(he,2), .00005, .012);
}
function yeastMultiplier(type){return type==='fresh'?3:type==='activeDry'?1.25:1}
function sweetAdj(sugar,honey){ const sw=sugar*100 + honey*100*.8; if(sw<=2)return 1-.04*sw; if(sw<=5)return 1; return 1+.05*(sw-5); }
function flourYeastAdj(w,fn){ let c=1-.0015*(w-280); c=clamp(c,.85,1.20); if(fn<260)c*=1+.001*(260-fn); return c; }
function levainPct(he, acidity, hyd){ const c={low:.85,medium:1,high:1.15}[acidity]||1; const lf=clamp(28*12/(he+6)*c,8,30)/100; return lf*(1+hyd/100); }
function bakeProfile(styleKey, oven, surfaceKey){
  const s=SURFACES[surfaceKey];
  let stoneMin, stoneMax, preheatSet=oven, launchSet=oven, bakeSet=oven, finishSet=oven, timeMin, timeMax;
  const high=oven>=380, medium=oven>=300, low=oven<300;
  if(surfaceKey==='stone'||surfaceKey==='steel'){
    if(high){ stoneMin=styleKey==='nap_avpn'?370:340; stoneMax=Math.min(oven, styleKey==='nap_avpn'?420:390); }
    else if(medium){ stoneMin=Math.max(280, oven-35); stoneMax=Math.max(295, oven-15); }
    else { stoneMin=Math.max(220, oven-30); stoneMax=Math.max(235, oven-10); }
  } else if(surfaceKey==='pan'||surfaceKey==='tray'){
    stoneMin=Math.max(190, oven-35); stoneMax=Math.max(210, oven-10);
  } else { stoneMin=null; stoneMax=null; }
  const fs=s.fs;
  let refT=styleKey==='nap_avpn'?430: styleKey==='detroit'?285: styleKey==='romana'?320:300;
  let refTime=styleKey==='nap_avpn'?1.5: styleKey==='detroit'?12: styleKey==='romana'?7:8;
  let est=refTime*Math.pow(refT/Math.max(oven,180),1.45)*Math.pow(fs,-.8);
  if(styleKey==='nap_avpn'&&oven<380) est=6*Math.pow(300/Math.max(oven,220),1.1)*Math.pow(fs,-.6);
  if(surfaceKey==='none') est*=1.25;
  timeMin=Math.max(.8,est*.82); timeMax=est*1.20;
  if(styleKey==='nap_avpn'&&oven>=380){timeMin=1; timeMax=2.2}
  if(styleKey==='detroit'){timeMin=Math.max(8,timeMin); timeMax=Math.max(12,timeMax)}
  return {preheatMin:s.preheat, preheatSet, launchSet, bakeSet, finishSet, stoneMin, stoneMax, timeMin, timeMax};
}
function geometry(style, shape, qty, diameter, L, W, margin){
  let each, total;
  if(shape==='round'){ each=diameter*diameter*style.k; total=each*qty; }
  else { each=L*W*style.g; total=each*qty; }
  total*=1+margin/100; each*=1+margin/100;
  return {each,total};
}
function calculate(){
  const styleKey=$('style').value, style=STYLES[styleKey], surfaceKey=$('surface').value, surface=SURFACES[surfaceKey];
  const oven=val('ovenTemp'), roomH=val('roomHours'), roomT=val('roomTemp'), coldH=val('coldHours'), coldT=val('coldTemp');
  const he=eqHours(roomH,roomT,coldH,coldT);
  const w=val('flourW'), pl=val('pl'), abs=val('absorption'), fn=val('fallingNumber');
  const geo=geometry(style,$('shape').value,val('quantity'),val('diameter'),val('panLength'),val('panWidth'),val('doughMargin'));
  let hyd=style.hydration + flourHydAdj(w,pl,abs,fn) + ovenHydAdj(oven,styleKey) + surface.hyd;
  hyd=clamp(hyd,style.minH,style.maxH);
  let salt=style.salt, oil=style.oil, sugar=style.sugar, honey=style.honey;
  if(style.producible){ const a=productiveNapAdj(he,oven); oil=a.oil; sugar=a.sugar; honey=a.honey; }
  if(style.avpn){ oil=0; sugar=0; honey=0; }
  const ids=[['hydrationOverride','hyd'],['saltOverride','salt'],['oilOverride','oil'],['sugarOverride','sugar'],['honeyOverride','honey']];
  ids.forEach(([id,name])=>{const v=val(id); if(v!==null){ if(name==='hyd')hyd=v/100; if(name==='salt')salt=v/100; if(name==='oil')oil=v/100; if(name==='sugar')sugar=v/100; if(name==='honey')honey=v/100; }});
  let yeast=yeastBase(he,style.yeastCoef)*flourYeastAdj(w,fn)*sweetAdj(sugar,honey)*yeastMultiplier($('yeastType').value);
  const yo=val('yeastOverride'); if(yo!==null) yeast=yo/100;
  let levain=0, levainFlour=0, levainWater=0;
  if($('yeastType').value==='levain'){
    yeast=0;
    levain=levainPct(he,$('levainAcidity').value,val('levainHydration'));
  }
  const formulaTotal=1+hyd+salt+yeast+oil+sugar+honey+levain;
  const flour=geo.total/formulaTotal;
  if(levain>0){ const lh=val('levainHydration')/100; levainFlour=(flour*levain)/(1+lh); levainWater=levainFlour*lh; }
  const water=Math.max(0,flour*hyd - levainWater - flour*honey*.17);
  const res={styleKey,style, surfaceKey, surface, oven, he, geo, hyd,salt,oil,sugar,honey,yeast,levain,flour,water,levainFlour,levainWater, fn,w, pl, abs, roomH, coldH, roomT, coldT, humidity:val('humidity'), bake:bakeProfile(styleKey,oven,surfaceKey)};
  render(res);
}
function render(r){
 const yeastLabel=$('yeastType').value==='levain'?'Fermento comercial':'Fermento';
 const warnings=[];
 if(r.style.avpn && r.oven<380) warnings.push('Napolitana clássica AVPN exige forno alto. Com essa temperatura, o resultado será uma adaptação de baixa temperatura.');
 if(r.style.avpn && (r.oil||r.sugar||r.honey)) warnings.push('A categoria AVPN não deve usar azeite, açúcar ou mel.');
 if(r.surfaceKey==='none' && r.oven<300) warnings.push('Forno abaixo de 300°C sem pedra/chapa aumenta risco de base pálida e assamento longo.');
 if(r.fn<250) warnings.push('Falling Number baixo: maior risco de massa pegajosa em fermentações longas.');
 if($('flourPreset').value==='purissima') warnings.push('Puríssima está cadastrada como perfil estimado. Ajuste W/P/L se tiver ficha técnica real.');
 const levainMass=r.flour*r.levain;
 $('result').innerHTML=`
 <div class="cards">
  <div class="box"><h3>Receita</h3><table class="kv">
    <tr><td>Farinha total</td><td>${g(r.flour)}</td></tr><tr><td>Água a adicionar</td><td>${g(r.water)}</td></tr><tr><td>Sal</td><td>${g(r.flour*r.salt)}</td></tr>
    <tr><td>${yeastLabel}</td><td>${g(r.flour*r.yeast)}</td></tr><tr><td>Levain</td><td>${g(levainMass)}</td></tr><tr><td>Azeite/óleo</td><td>${g(r.flour*r.oil)}</td></tr><tr><td>Açúcar</td><td>${g(r.flour*r.sugar)}</td></tr><tr><td>Mel</td><td>${g(r.flour*r.honey)}</td></tr>
  </table></div>
  <div class="box"><h3>Percentuais</h3><table class="kv">
    <tr><td>Hidratação efetiva</td><td>${pct(r.hyd)}</td></tr><tr><td>Sal</td><td>${pct(r.salt)}</td></tr><tr><td>Fermento</td><td>${pct(r.yeast)}</td></tr><tr><td>Levain</td><td>${pct(r.levain)}</td></tr><tr><td>Azeite/óleo</td><td>${pct(r.oil)}</td></tr><tr><td>Açúcar</td><td>${pct(r.sugar)}</td></tr><tr><td>Mel</td><td>${pct(r.honey)}</td></tr>
  </table></div>
  <div class="box"><h3>Massa e forno</h3><table class="kv">
    <tr><td>Estilo</td><td>${r.style.name}</td></tr><tr><td>Peso por pizza/forma</td><td>${g(r.geo.each)}</td></tr><tr><td>Massa total</td><td>${g(r.geo.total)}</td></tr><tr><td>Superfície</td><td>${r.surface.name}</td></tr><tr><td>Temperatura máxima</td><td>${r.oven}°C</td></tr><tr><td>Assamento estimado</td><td>${formatTime(r.bake.timeMin)}–${formatTime(r.bake.timeMax)}</td></tr>
  </table></div>
  <div class="box"><h3>Fermentação</h3><table class="kv">
    <tr><td>Horas equivalentes</td><td>${r.he.toFixed(1)} h</td></tr><tr><td>Ambiente</td><td>${r.roomH}h a ${r.roomT}°C</td></tr><tr><td>Geladeira</td><td>${r.coldH}h a ${r.coldT}°C</td></tr><tr><td>W / P-L</td><td>${r.w} / ${r.pl}</td></tr>
  </table></div>
  <div class="box full"><h3>Modo de preparo recomendado</h3>${prepSteps(r)}</div>
  <div class="box full"><h3>Justificativa técnica</h3>${tech(r)}</div>
  <div class="box full"><h3>Cronograma operacional sugerido</h3>${schedule(r)}</div>
  ${warnings.length?`<div class="box full"><h3>Alertas</h3>${warnings.map(w=>`<div class="warning">${w}</div>`).join('')}</div>`:''}
 </div>`;
}
function formatTime(min){ if(min<3) return Math.round(min*60)+' s'; return min.toFixed(0)+' min'; }
function targetSurfaceText(r){ if(r.bake.stoneMin===null) return 'não aplicável'; return `${Math.round(r.bake.stoneMin)}–${Math.round(r.bake.stoneMax)}°C`; }
function prepSteps(r){
 const surfaceTemp=targetSurfaceText(r), grill=r.oven<=300?' Se houver grill/broiler, usar nos últimos 1–2 minutos.':'';
 let steps=[];
 if(r.styleKey==='detroit') steps=[`Untar a forma com óleo e distribuir a massa sem forçar.` ,`Pré-aquecer o forno configurado em ${r.bake.preheatSet}°C por ${r.bake.preheatMin} minutos. Temperatura-alvo da forma: ${surfaceTemp}.`,`Assar com forno configurado em ${r.bake.bakeSet}°C por ${formatTime(r.bake.timeMin)}–${formatTime(r.bake.timeMax)}, até bordas caramelizadas.`];
 else steps=[`Pré-aquecer o forno configurado em ${r.bake.preheatSet}°C por ${r.bake.preheatMin} minutos. Temperatura-alvo da superfície: ${surfaceTemp}.`,`Abrir a massa no tamanho previsto, preservando gás na borda quando o estilo pedir cornicione.`,`Inserir a pizza com o forno configurado em ${r.bake.launchSet}°C e superfície na faixa ${surfaceTemp}.`,`Assar com forno configurado em ${r.bake.bakeSet}°C por ${formatTime(r.bake.timeMin)}–${formatTime(r.bake.timeMax)}.${grill}`,`Retirar quando a base estiver firme e a borda/cobertura atingirem coloração compatível com o estilo.`];
 return '<ol class="steps">'+steps.map(s=>`<li>${s}</li>`).join('')+'</ol>';
}
function tech(r){
 const notes=[];
 notes.push(`A hidratação de ${pct(r.hyd)} foi definida pelo estilo, força da farinha, temperatura máxima do forno e superfície selecionada.`);
 notes.push(`O assamento estimado usa ${r.oven}°C como limite máximo informado e fator térmico da superfície ${r.surface.name}.`);
 if(r.style.producible) notes.push(`Na Napolitana produzível, mel (${pct(r.honey)}), açúcar (${pct(r.sugar)}) e azeite (${pct(r.oil)}) variam conforme as ${r.he.toFixed(1)} horas equivalentes e a temperatura do forno.`);
 if(r.style.avpn) notes.push('Na Napolitana clássica AVPN, azeite, açúcar e mel permanecem zerados por aderência ao estilo clássico.');
 if(r.surfaceKey==='steel') notes.push('A chapa de aço aumenta a condução para a base; por isso o tempo estimado tende a cair.');
 if(r.surfaceKey==='stone') notes.push('A pedra refratária estabiliza o piso e exige pré-aquecimento prolongado para atingir a faixa térmica indicada.');
 return notes.map(n=>`<div class="good">${n}</div>`).join('');
}
function schedule(r){
 return `<ol class="steps"><li>Mistura e sova: 15–25 min, buscando massa lisa.</li><li>Descanso em bloco: 30–60 min em temperatura ambiente.</li><li>Divisão e boleamento conforme peso calculado: ${g(r.geo.each)}.</li><li>Fermentação: ${r.roomH}h em ambiente e ${r.coldH}h em geladeira, conforme campos informados.</li><li>Retirar da geladeira 2–5h antes do assamento, ajustando conforme atividade da massa.</li><li>Pré-aquecer e assar seguindo o modo de preparo recomendado.</li></ol>`;
}
init();
