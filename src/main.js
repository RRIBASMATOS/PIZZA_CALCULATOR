import {STYLES} from './data/styles.js';import {FLOURS} from './data/flours.js';import {SURFACES} from './data/surfaces.js';import {TOPPINGS} from './data/toppings.js';import {PREP_GUIDES,resolveGuide} from './data/prepGuides.js';import {clamp,pct,g,val} from './utils/math.js';import {equivalentHours,adjustedIDYPct,yeastPreset,convertYeast,levainFlourPct,targetHyd,massTarget,thermal,bakeEstimate,napolitanaProduzivelAdditives} from './engines/core.js';import {warnings} from './engines/warnings.js';
const $=id=>document.getElementById(id);
const FERMENTATION_PRESETS={
  nap:{classic:[
    {id:'avpn12',name:'AVPN 12h ambiente controlado',rh:12,rt:21,ch:0,ct:5,hint:'Napolitana clássica AVPN: 12h totais, sem óleo, açúcar ou mel.'},
    {id:'avpn24',name:'AVPN 24h ambiente fresco',rh:24,rt:18,ch:0,ct:5,hint:'Napolitana clássica AVPN: 24h em ambiente fresco/controlado, massa lean.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente. AVPN continua sem óleo, açúcar ou mel.'}
  ]},
  nap_prod:{sameDay:[
    {id:'2_4',name:'Mesmo dia 2–4h / emergência',rh:3,rt:24,ch:0,ct:5,hint:'Ativa mel e azeite no máximo para compensar falta de maturação.'},
    {id:'4_6',name:'Mesmo dia 4–6h',rh:5,rt:24,ch:0,ct:5,hint:'Perfil rápido: mel alto, azeite moderado e fermento mais alto.'},
    {id:'6_8',name:'Mesmo dia 6–8h',rh:7,rt:24,ch:0,ct:5,hint:'Bom compromisso para massa feita de manhã e assada à noite.'},
    {id:'8_12',name:'Mesmo dia 8–12h',rh:10,rt:24,ch:0,ct:5,hint:'Mel e azeite moderados; melhor sabor que massas de 2–6h.'},
    {id:'12_24',name:'Acelerada 12–24h',rh:5,rt:24,ch:19,ct:5,hint:'Perfil híbrido: pequena compensação com mel/azeite.'},
    {id:'24plus',name:'24h+ sem compensadores',rh:4,rt:24,ch:24,ct:5,hint:'Ao passar de 24h equivalentes, mel e azeite tendem a zero.'},
    {id:'manual',name:'Manual',manual:true,hint:'Ajuste manual: a calculadora ainda aplica a tabela dinâmica pelos HE calculados.'}
  ],domestic:'sameDay',p300:'sameDay'},
  neo:{standard:[
    {id:'6_8',name:'Neo rápida 6–8h',rh:7,rt:24,ch:0,ct:5,hint:'Neo-napolitana rápida: óleo/mel ajudam textura e cor.'},
    {id:'12_24',name:'Neo 12–24h',rh:4,rt:24,ch:20,ct:5,hint:'Perfil equilibrado para forno doméstico forte ou P300.'},
    {id:'48h',name:'Neo premium 48h',rh:4,rt:24,ch:44,ct:5,hint:'Fermentação longa: menos necessidade de mel, mais sabor.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente.'}
  ],sameDay:'standard'},
  romana:{tonda:[
    {id:'24h',name:'Romana tonda 24h',rh:3,rt:24,ch:21,ct:5,hint:'Tonda crocante com maturação fria.'},
    {id:'48h',name:'Romana tonda 48h',rh:4,rt:24,ch:44,ct:5,hint:'Mais sabor e melhor extensibilidade.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente.'}
  ],teglia:[
    {id:'24h3h',name:'Teglia 24h frio + 3h ambiente',rh:3,rt:24,ch:24,ct:5,hint:'Base clássica de teglia: frio longo e relaxamento antes da abertura.'},
    {id:'48h',name:'Teglia 48h premium',rh:4,rt:24,ch:44,ct:5,hint:'Alta hidratação com melhor maturação.'},
    {id:'72h',name:'Teglia 72h premium',rh:4,rt:24,ch:68,ct:5,hint:'Exige farinha forte e controle de fermentação.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente.'}
  ],pala:[
    {id:'24h',name:'Pala 24h',rh:3,rt:24,ch:21,ct:5,hint:'Boa para forno médio/alto e massa bem hidratada.'},
    {id:'48h',name:'Pala 48h',rh:4,rt:24,ch:44,ct:5,hint:'Mais leveza e aroma.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente.'}
  ]},
  detroit:{artisan:[
    {id:'charlie48',name:'Charlie exato 48h + pan proof',rh:6,rt:24,ch:48,ct:4,hint:'Modo Charlie exato: mantém 0,50% IDY e usa frio longo + prova final em forma.'},
    {id:'8h',name:'Detroit Artisan 8h same-day',rh:8,rt:24,ch:0,ct:5,hint:'Base Charlie Anderson Ultimate: 75% hidratação, 95% farinha branca, 5% integral, 1% malte diastático e forma bem untada.'},
    {id:'24h',name:'Detroit Artisan 24h',rh:4,rt:24,ch:20,ct:5,hint:'Mantém a fórmula Ultimate, mas usa maturação fria para mais sabor e extensibilidade.'},
    {id:'48h',name:'Detroit Artisan 48h premium',rh:4,rt:24,ch:44,ct:5,hint:'Versão longa: miolo mais aromático e melhor estrutura; controle bem o fermento.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente. A fórmula de farinha/malte continua baseada no perfil Detroit escolhido.'}
  ],artisanPro:[
    {id:'48h',name:'Detroit Artisan Pro 48h otimizado',rh:5,rt:24,ch:48,ct:4,hint:'Modo Pro: reduz fermento para 48h em frio controlado e prova final em forma.'},
    {id:'72h',name:'Detroit Artisan Pro 72h otimizado',rh:5,rt:24,ch:72,ct:4,hint:'Modo Pro longo: usa menos fermento para maturação fria e melhor digestibilidade.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente.'}
  ],traditional:[
    {id:'8h',name:"Detroit Traditional 8h / Buddy's-style",rh:8,rt:24,ch:0,ct:5,hint:'Base tradicional inspirada no Buddy’s: 65% hidratação, massa um pouco mais firme e forma bem untada.'},
    {id:'24h',name:"Detroit Traditional 24h",rh:4,rt:24,ch:20,ct:5,hint:'Tradicional com maturação fria: mais sabor mantendo estrutura firme.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente.'}
  ]},
  american:{ny:[
    {id:'8h',name:'NY 8h mesmo dia',rh:8,rt:24,ch:0,ct:5,hint:'Rápida, com açúcar/óleo ajudando cor e maciez.'},
    {id:'24h',name:'NY 24h',rh:4,rt:24,ch:20,ct:5,hint:'Padrão equilibrado para forno doméstico com aço/pedra.'},
    {id:'72h',name:'NY 72h premium',rh:4,rt:24,ch:68,ct:5,hint:'Perfil clássico de maturação longa para NY.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente.'}
  ],pan:[
    {id:'8h',name:'Pan 8h mesmo dia',rh:8,rt:24,ch:0,ct:5,hint:'Boa para massa fofa em forma.'},
    {id:'24h',name:'Pan 24h',rh:4,rt:24,ch:20,ct:5,hint:'Mais sabor, ainda simples de executar.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente.'}
  ]},
  br:{thin:[
    {id:'4h',name:'Brasileira rápida 4h',rh:4,rt:24,ch:0,ct:5,hint:'Perfil prático para uso no mesmo dia.'},
    {id:'8h',name:'Brasileira 8h',rh:8,rt:24,ch:0,ct:5,hint:'Mais sabor e controle sem precisar geladeira.'},
    {id:'24h',name:'Brasileira 24h',rh:4,rt:24,ch:20,ct:5,hint:'Massa mais estável para coberturas pesadas.'},
    {id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente.'}
  ],stuffed:'thin'}
};
function presetList(styleKey,subKey){let x=FERMENTATION_PRESETS[styleKey]?.[subKey]; if(typeof x==='string') x=FERMENTATION_PRESETS[styleKey][x]; return x||[{id:'manual',name:'Manual',manual:true,hint:'Preencha manualmente.'}]}
function updateFermPresets(){const list=presetList($('style').value,$('substyle').value);$('fermPreset').innerHTML='';for(const p of list)$('fermPreset').add(new Option(p.name,p.id));applyFermPreset()}
function applyFermPreset(){const list=presetList($('style').value,$('substyle').value);const p=list.find(x=>x.id===$('fermPreset').value)||list[0];$('fermHint').textContent=p.hint||'';if(p.manual)return; $('roomHours').value=p.rh;$('roomTemp').value=p.rt;$('coldHours').value=p.ch;$('coldTemp').value=p.ct;}
function fill(){for(const [k,v] of Object.entries(STYLES))$('style').add(new Option(v.name,k));for(const [k,v] of Object.entries(FLOURS))$('flourPreset').add(new Option(v.name,k));updateSubs();applyFlour()}function updateSubs(){const s=STYLES[$('style').value];$('substyle').innerHTML='';for(const [k,v] of Object.entries(s.sub))$('substyle').add(new Option(v.name,k));if($('style').value==='detroit'){if($('shape'))$('shape').value='pan';if($('surface'))$('surface').value='detroitPan';if($('oven')&&Number($('oven').value)>320)$('oven').value=290;}updateFermPresets()}function applyFlour(){const f=FLOURS[$('flourPreset').value];['protein','w','pl','abs','ash','fn'].forEach(id=>$(id).value=f[{protein:'protein',w:'w',pl:'pl',abs:'abs',ash:'ash',fn:'fn'}[id]])}
$('style').onchange=()=>{updateSubs();calc()};$('substyle').onchange=()=>{updateFermPresets();calc()};$('fermPreset').onchange=()=>{applyFermPreset();calc()};$('flourPreset').onchange=()=>{applyFlour();calc()};['detroitCheese','detroitSauce'].forEach(id=>{if($(id))$(id).onchange=calc});$('calc').onclick=calc;initMenu();initToppings();initPrepGuide();fill();calc();calcTopping();renderPrepGuide();

function initMenu(){document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.module').forEach(m=>m.classList.remove('active'));btn.classList.add('active');document.getElementById(btn.dataset.module).classList.add('active');}));}

function initPrepGuide(){
  if(!$('guideStyle')||!$('guideSubstyle'))return;
  $('guideStyle').innerHTML='';
  Object.entries(PREP_GUIDES).forEach(([k,v])=>$('guideStyle').add(new Option(v.name,k)));
  $('guideStyle').onchange=()=>{updateGuideSubs();renderPrepGuide()};
  $('guideSubstyle').onchange=renderPrepGuide;
  updateGuideSubs();
}
function updateGuideSubs(){
  if(!$('guideStyle')||!$('guideSubstyle'))return;
  const style=PREP_GUIDES[$('guideStyle').value];
  $('guideSubstyle').innerHTML='';
  Object.entries(style.sub).forEach(([k,v])=>{
    const target=v.alias?style.sub[v.alias]:v;
    $('guideSubstyle').add(new Option(target.name,k));
  });
  $('guideSubstyle').value=style.defaultSub;
}
function listHtml(items){return `<ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul>`}
function stepsHtml(steps){return `<ol>${steps.map(s=>`<li><b>${s.title}:</b> ${s.detail}</li>`).join('')}</ol>`}
function renderPrepGuide(){
  if(!$('guideStyle')||!$('guideSubstyle')||!$('guideResult'))return;
  const {style,guide}=resolveGuide($('guideStyle').value,$('guideSubstyle').value);
  $('guideResult').innerHTML=`<div class="result-grid"><div class="box"><h3>${style.name} — ${guide.name}</h3><p>${guide.summary}</p></div><div class="box"><h3>Fórmula-base orientativa</h3>${listHtml(guide.formula)}</div><div class="box wide"><h3>Ponto técnico esperado</h3><p>${guide.target}</p></div><div class="box wide"><h3>Passo a passo operacional</h3>${stepsHtml(guide.steps)}</div><div class="box wide"><h3>Erros comuns e como evitar</h3>${listHtml(guide.mistakes)}</div><div class="warn"><b>Uso do guia:</b> combine estas instruções com a Calculadora profissional. A calculadora define os gramas e o cronograma; este guia explica como a massa deve se comportar em cada etapa.</div></div>`;
}
function toppingArea(shape,diam,len,wid){if(shape==='rect')return Math.max(1,len*wid);return Math.PI*Math.pow(diam/2,2)}
function toppingFactor(shape,diam,len,wid,flavor){const refArea=flavor.refArea||(flavor.base==='rect'?25*20:Math.PI*Math.pow(29/2,2));return toppingArea(shape,diam,len,wid)/refArea}
function initToppings(){const st=$('topStyle');Object.entries(TOPPINGS).forEach(([k,v])=>st.add(new Option(v.name,k)));st.onchange=()=>{updateToppingFlavors();calcTopping()};$('topFlavor').onchange=calcTopping;$('topShape').onchange=calcTopping;['topQty','topDiameter','topLength','topWidth'].forEach(id=>$(id).addEventListener('input',calcTopping));$('calcTopping').onclick=calcTopping;updateToppingFlavors()}
function updateToppingFlavors(){const style=TOPPINGS[$('topStyle').value];$('topFlavor').innerHTML='';Object.entries(style.flavors).forEach(([k,v])=>$('topFlavor').add(new Option(v.name,k)));$('topShape').value=style.shapeDefault==='rect'?'rect':'round'}
function formatIngredientAmount(qty){if(qty<3)return qty.toFixed(1)+' g';return Math.round(qty)+' g'}
function calcTopping(){if(!$('topStyle')||!$('topFlavor'))return;const style=TOPPINGS[$('topStyle').value];const flavor=style.flavors[$('topFlavor').value];if(!flavor)return;const shape=$('topShape').value,qty=Number($('topQty').value||1),diam=Number($('topDiameter').value||29),len=Number($('topLength').value||25),wid=Number($('topWidth').value||20);const factor=toppingFactor(shape,diam,len,wid,flavor)*qty;const area=toppingArea(shape,diam,len,wid);const rows=flavor.ingredients.map(([name,grams])=>`<tr><td>${name}</td><td>${formatIngredientAmount(grams*factor)}</td></tr>`).join('');$('toppingResult').innerHTML=`<div class="result-grid"><div class="box"><h3>${flavor.name}</h3><table><tr><td>Estilo</td><td>${style.name}</td></tr><tr><td>Formato</td><td>${shape==='rect'?'Retangular':'Redonda'}</td></tr><tr><td>Área por pizza</td><td>${Math.round(area)} cm²</td></tr><tr><td>Quantidade</td><td>${qty}</td></tr><tr><td>Fator de escala</td><td>${factor.toFixed(2)}x</td></tr></table></div><div class="box"><h3>Ingredientes recomendados</h3><table>${rows}</table></div></div><div class="box wide"><h3>Passo a passo do recheio</h3><ol>${flavor.steps.map(x=>`<li>${x}</li>`).join('')}</ol></div><div class="box wide"><h3>Justificativa técnica</h3><p>${flavor.tech}</p></div><div class="box wide"><h3>História / origem do sabor</h3><p>${flavor.history}</p></div><div class="box wide"><h3>Dica de harmonização</h3><p>${flavor.pairing}</p></div><div class="warn"><b>Nota:</b> as quantidades são ponto de partida para uma pizza equilibrada. Para fornos mais fracos ou recheios muito úmidos, reduza 10–15% dos itens com água livre, como vegetais, molhos e frutas.</div>`}

function detroitAreaCm2(d){return d.shape==='round'?Math.PI*Math.pow(d.diam/2,2):d.len*d.wid}
function detroitPrefs(){return {cheese:$('detroitCheese')?.value||'medium',sauce:$('detroitSauce')?.value||'medium'}}
function prefCoeff(kind,value){const maps={cheese:{low:.935,medium:1.135,high:1.335,takeItCheesy:1.535},sauce:{low:.69,medium:.89,high:1.09,danger:1.29}};return maps[kind][value]??maps[kind].medium}
function buildDetroitData(d){
  if(d.styleKey!=='detroit')return null;
  const areaCm2=detroitAreaCm2(d), areaIn2=areaCm2/6.4516, prefs=detroitPrefs();
  const cheeseCoeff=prefCoeff('cheese',prefs.cheese), sauceCoeff=prefCoeff('sauce',prefs.sauce);
  const per=d.per;
  const cheeseG=per*(cheeseCoeff/d.formulaDenom), sauceG=per*(sauceCoeff/d.formulaDenom);
  const pepperoniG=areaIn2*.3, parmesanG=areaIn2*.0375, panOilG=Math.max(10,areaCm2*.015);
  const rawTomatoG=sauceG/.75, rawTomatoOz=rawTomatoG/28.35, spiceScale=rawTomatoOz/28;
  return {areaCm2,areaIn2,prefs,cheeseCoeff,sauceCoeff,cheeseG,sauceG,pepperoniG,parmesanG,panOilG,rawTomatoG,rawTomatoOz,spiceScale,
    sauceSaltG:3*spiceScale,sauceOreganoTsp:1*spiceScale,sauceThymeTsp:.5*spiceScale,sauceGarlicTsp:.25*spiceScale,saucePepperTsp:.25*spiceScale};
}
function calc(){
  const styleKey=$('style').value;const st=STYLES[styleKey];const substyleKey=$('substyle').value;const profile=st.sub[substyleKey];
  const flour={protein:val('protein'),w:val('w'),pl:val('pl'),abs:val('abs'),ash:val('ash'),fn:val('fn'),confidence:FLOURS[$('flourPreset').value].confidence};
  const surfaceKey=$('surface').value;const surface=SURFACES[surfaceKey];const shape=$('shape').value;
  const qty=val('qty'),diam=val('diameter'),len=val('length'),wid=val('width'),oven=val('oven'),preheat=val('preheat');
  const eq=equivalentHours(val('roomHours'),val('roomTemp'),val('coldHours'),val('coldTemp'));
  let hyd=targetHyd(profile,flour,surface,oven);let salt=profile.salt,oil=profile.oil,sugar=profile.sugar,honey=profile.honey;
  const malt=profile.malt||0, wholeWheat=profile.wholeWheat||0, breadFlour=profile.breadFlour??(1-wholeWheat);
  if(styleKey==='nap_prod'||profile.dynamicAdditives){const dyn=napolitanaProduzivelAdditives(eq,oven);oil=dyn.oil;sugar=dyn.sugar;honey=dyn.honey;}
  if(val('hydOverride')!==null)hyd=val('hydOverride')/100;if(val('saltOverride')!==null)salt=val('saltOverride')/100;if(val('oilOverride')!==null)oil=val('oilOverride')/100;if(val('sugarOverride')!==null)sugar=val('sugarOverride')/100;if(val('honeyOverride')!==null)honey=val('honeyOverride')/100;
  const yType=$('yeastType').value;
  const yeastPctIDY=adjustedIDYPct({styleKey,substyleKey,eqHours:eq,roomTempC:val('roomTemp'),hydrationPct:hyd*100,saltPct:salt*100,sugarPct:(sugar*100+honey*80),fatPct:oil*100,prefermentedFlourPct:0});
  let y=yeastPctIDY,levainPct=0,lf=0,levainHyd=val('levainHyd')/100;
  if(yType==='levain'){lf=levainFlourPct(eq,$('acid').value,styleKey,substyleKey);levainPct=lf*(1+levainHyd);y=0}else{y=convertYeast(yeastPctIDY,yType)}
  if(val('yeastOverride')!==null&&yType!=='levain')y=val('yeastOverride')/100;
  const totalMass=massTarget(shape,qty,diam,len,wid,profile,val('massOverride'));
  const formulaDenom=1+hyd+salt+y+oil+sugar+honey+malt;
  let flourG=totalMass/formulaDenom;let levainG=0,levainFlour=0,levainWater=0;if(yType==='levain'){levainFlour=flourG*lf;levainWater=levainFlour*levainHyd;levainG=levainFlour+levainWater}
  let waterG=flourG*hyd - levainWater - flourG*honey*0.17;const saltG=flourG*salt,oilG=flourG*oil,sugarG=flourG*sugar,honeyG=flourG*honey,yeastG=flourG*y,maltG=flourG*malt,breadFlourG=flourG*breadFlour,wholeWheatG=flourG*wholeWheat;
  const idyEquivalentG=flourG*yeastPctIDY;
  const fs=thermal(surface,preheat),bake=bakeEstimate(profile,oven,fs,shape,styleKey,substyleKey,surfaceKey);const warn=warnings({styleKey,profile,oven,surfaceKey,flour,yeastType:yType,oil,sugar,honey,eq,lf});
  const data={styleKey,substyleKey,shape,surfaceKey,preheat,roomHours:val('roomHours'),roomTemp:val('roomTemp'),coldHours:val('coldHours'),coldTemp:val('coldTemp'),st,profile,totalMass,per:totalMass/qty,hyd,salt,oil,sugar,honey,y,malt,wholeWheat,breadFlour,formulaDenom,flourG,breadFlourG,wholeWheatG,maltG,waterG,saltG,oilG,sugarG,honeyG,yeastG,levainG,levainFlour,levainWater,eq,fs,bake,warn,flour,yType,surface,oven,qty,diam,len,wid,yeastPctIDY,idyEquivalentG,yeastPreset:yeastPreset(styleKey,substyleKey)};
  data.detroit=buildDetroitData(data);
  render(data)
}
function detroitRenderBlock(d){
  if(!d.detroit)return '';
  const x=d.detroit;
  const flourRows=`<tr><td>Farinha de pão / branca forte</td><td>${g(d.breadFlourG)}</td></tr><tr><td>Farinha integral</td><td>${g(d.wholeWheatG)}</td></tr><tr><td>Malte diastático</td><td>${g(d.maltG,1)}</td></tr><tr><td>Óleo para untar a forma</td><td>${g(x.panOilG)}</td></tr>`;
  const toppingRows=`<tr><td>Queijo Wisconsin brick / mozzarella baixa umidade</td><td>${g(x.cheeseG)}</td></tr><tr><td>Molho final em faixas</td><td>${g(x.sauceG)}</td></tr><tr><td>Pepperoni</td><td>${g(x.pepperoniG)}</td></tr><tr><td>Parmigiano Reggiano</td><td>${g(x.parmesanG,1)}</td></tr>`;
  const sauceRows=`<tr><td>Tomate triturado para reduzir</td><td>${g(x.rawTomatoG)} (${x.rawTomatoOz.toFixed(1)} oz)</td></tr><tr><td>Sal no molho</td><td>${g(x.sauceSaltG,1)}</td></tr><tr><td>Orégano</td><td>${x.sauceOreganoTsp.toFixed(2)} colher(es) de chá</td></tr><tr><td>Tomilho</td><td>${x.sauceThymeTsp.toFixed(2)} colher(es) de chá</td></tr><tr><td>Alho em pó</td><td>${x.sauceGarlicTsp.toFixed(2)} colher(es) de chá</td></tr><tr><td>Pimenta calabresa</td><td>${x.saucePepperTsp.toFixed(2)} colher(es) de chá</td></tr>`;
  return `<div class="result-grid"><div class="box"><h3>Detroit — fórmula Charlie Anderson</h3><table><tr><td>Perfil</td><td>${d.profile.name}</td></tr><tr><td>Densidade de massa</td><td>${d.profile.charlieDensityOzIn2} oz/in²</td></tr><tr><td>Área por forma</td><td>${Math.round(x.areaCm2)} cm² (${x.areaIn2.toFixed(1)} in²)</td></tr>${flourRows}</table></div><div class="box"><h3>Detroit — cobertura calculada</h3><table><tr><td>Preferência queijo</td><td>${x.prefs.cheese}</td></tr><tr><td>Preferência molho</td><td>${x.prefs.sauce}</td></tr>${toppingRows}</table></div></div><div class="box wide"><h3>Molho Detroit escalado</h3><table>${sauceRows}</table><p>Reduza em panela por cerca de 20 min, mexendo com frequência, até perder aproximadamente 25% do volume: o objetivo é molho espesso, mas não pastoso.</p></div>`
}
function render(d){
  const prep=recommendedPreparation(d);const tech=technicalJustification(d);const schedule=productionSchedule(d);const detroitBlock=detroitRenderBlock(d);
  $('result').innerHTML=`<div class="result-grid"><div class="box"><h3>Receita</h3><table><tr><td>Farinha total</td><td>${g(d.flourG)}</td></tr><tr><td>Água adicionada</td><td>${g(Math.max(0,d.waterG))}</td></tr><tr><td>Sal</td><td>${g(d.saltG)}</td></tr><tr><td>Fermento comercial</td><td>${d.yType==='levain'?'—':g(d.yeastG,2)}</td></tr><tr><td>Equivalente em IDY</td><td>${d.yType==='levain'?'—':g(d.idyEquivalentG,2)}</td></tr><tr><td>Levain total</td><td>${d.yType==='levain'?g(d.levainG):'—'}</td></tr><tr><td>Óleo/azeite na massa</td><td>${g(d.oilG)}</td></tr><tr><td>Açúcar</td><td>${g(d.sugarG)}</td></tr><tr><td>Mel</td><td>${g(d.honeyG)}</td></tr>${d.styleKey==='detroit'?`<tr><td>Malte diastático</td><td>${g(d.maltG,1)}</td></tr>`:''}</table></div><div class="box"><h3>Percentuais</h3><table><tr><td>Hidratação efetiva</td><td>${pct(d.hyd)}</td></tr><tr><td>Sal</td><td>${pct(d.salt)}</td></tr><tr><td>Fermento selecionado</td><td>${d.yType==='levain'?'levain':pct(d.y)}</td></tr><tr><td>Fermento IDY base</td><td>${d.yType==='levain'?'—':pct(d.yeastPctIDY)}</td></tr><tr><td>Levain</td><td>${d.yType==='levain'?pct(d.levainG/d.flourG):'—'}</td></tr><tr><td>Óleo na massa</td><td>${pct(d.oil)}</td></tr><tr><td>Açúcar</td><td>${pct(d.sugar)}</td></tr><tr><td>Mel</td><td>${pct(d.honey)}</td></tr>${d.styleKey==='detroit'?`<tr><td>Malte diastático</td><td>${pct(d.malt)}</td></tr><tr><td>Farinha integral</td><td>${pct(d.wholeWheat)}</td></tr>`:''}</table></div><div class="box"><h3>Processo</h3><table><tr><td>Massa total</td><td>${g(d.totalMass)}</td></tr><tr><td>Massa por unidade</td><td>${g(d.per)}</td></tr><tr><td>Modelo de fermento</td><td>${d.yeastPreset.label}</td></tr><tr><td>Horas equivalentes</td><td>${d.eq.toFixed(1)} h</td></tr><tr><td>Fator térmico superfície</td><td>${d.fs.toFixed(2)}</td></tr><tr><td>Assamento estimado</td><td>${d.bake}</td></tr><tr><td>Alvo da superfície</td><td>${rangeText(surfaceTargetRange(d)[0],surfaceTargetRange(d)[1])}</td></tr><tr><td>Config. forno/preparo</td><td>${ovenCapForStyle(d)}°C</td></tr></table></div><div class="box"><h3>Farinha e cocção</h3><table><tr><td>W / P-L</td><td>${d.flour.w} / ${d.flour.pl}</td></tr><tr><td>Abs / FN</td><td>${d.flour.abs}% / ${d.flour.fn}</td></tr><tr><td>Superfície</td><td>${d.surface.name}</td></tr><tr><td>Temperatura máxima do forno</td><td>${d.oven}°C</td></tr></table></div></div>${detroitBlock}<div class="box wide"><h3>Cronograma operacional sugerido</h3><ol>${schedule.map(x=>`<li>${x}</li>`).join('')}</ol></div><div class="box wide"><h3>Modo de preparo recomendado</h3><ol>${prep.map(x=>`<li>${x}</li>`).join('')}</ol></div><div class="box wide"><h3>Justificativa técnica</h3><ul>${tech.map(x=>`<li>${x}</li>`).join('')}</ul></div>${d.warn.length?d.warn.map(x=>`<div class="warn">${x}</div>`).join(''):'<div class="ok">Configuração coerente com o envelope técnico selecionado.</div>'}${(d.yType!=='levain'&&d.idyEquivalentG<0.10)?'<div class="warn"><b>Atenção ao fermento:</b> a dose equivalente em IDY ficou abaixo de 0,10 g. Para reduzir erro de balança, prefira fermento fresco, solução de fermento diluído em água ou aumente o lote.</div>':''}<div class="warn"><b>Nota:</b> modelos de fermentação e cocção são heurísticos e calibráveis. A parte Detroit agora combina nossa metodologia com os coeficientes da planilha Charlie Anderson.</div>`
}


function rangeText(a,b){return `${Math.round(a)}–${Math.round(b)}°C`}
function surfaceLabel(d){if(d.surfaceKey==='steel')return 'chapa de aço';if(d.surfaceKey==='stone')return 'pedra';if(d.surfaceKey==='detroitPan')return 'forma';if(d.surfaceKey==='tray')return 'assadeira';return 'base do forno/assadeira'}
function ovenCapForStyle(d){
  if(d.styleKey==='detroit')return Math.min(d.oven,320);
  if(d.styleKey==='romana'&&d.substyleKey==='teglia')return Math.min(d.oven,340);
  if(d.styleKey==='romana'&&d.substyleKey==='pala')return Math.min(d.oven,370);
  if(d.styleKey==='american'||d.styleKey==='br')return Math.min(d.oven,300);
  return d.oven;
}
function surfaceTargetRange(d){
  const oven=d.oven, surf=d.surfaceKey, style=d.styleKey, sub=d.substyleKey;
  let lo,hi;
  if(style==='nap'){
    if(oven>=430){lo=380;hi=430;} else if(oven>=380){lo=oven-40;hi=oven-10;} else {lo=oven-25;hi=oven;}
  } else if(style==='nap_prod'||style==='neo'){
    if(oven>=380){lo=oven-45;hi=oven-15;} else if(oven>=300){lo=280;hi=Math.min(330,oven);} else {lo=oven-20;hi=oven;}
  } else if(style==='romana'){
    if(sub==='tonda'){lo=oven>=320?300:oven-20;hi=oven>=320?Math.min(340,oven):oven;}
    else if(sub==='teglia'){lo=oven>=300?270:oven-20;hi=oven>=300?Math.min(330,oven):oven;}
    else {lo=oven>=320?300:oven-20;hi=oven>=320?Math.min(370,oven):oven;}
  } else if(style==='detroit') {lo=Math.min(240,oven-20);hi=Math.min(290,oven);} 
  else {lo=oven>=300?260:oven-20;hi=oven>=300?Math.min(300,oven):oven;}
  if(surf==='none'){lo=Math.max(180,lo-20);hi=Math.max(lo+10,hi-15)}
  if(surf==='tray'){lo=Math.max(180,lo-10);hi=Math.max(lo+10,hi-5)}
  lo=clamp(lo,180,oven);hi=clamp(hi,lo+5,oven);
  return [lo,hi];
}
function bakeStages(d){
  const [lo,hi]=surfaceTargetRange(d); const surf=surfaceLabel(d); const set=ovenCapForStyle(d); const preheat=d.preheat||60;
  const stages=[];
  stages.push(`Pré-aquecimento: configure o forno em ${set}°C por ${preheat} min; alvo de temperatura da ${surf}: ${rangeText(lo,hi)}.`);
  if(d.styleKey==='detroit'){
    stages.push(`Entrada da pizza: mantenha o forno em ${set}°C; a forma deve estar untada e a massa já relaxada na forma.`);
    stages.push(`Assamento principal: ${d.bake}; mantenha ${set}°C. Se a borda caramelizar antes do centro, reduza para ${Math.max(230,set-20)}°C nos minutos finais.`);
    stages.push(`Finalização: se o topo estiver pálido, suba a forma para a parte superior por 1–3 min mantendo ${set}°C.`);
  } else if(d.oven>=380 && (d.styleKey==='nap'||d.styleKey==='nap_prod'||d.styleKey==='neo')){
    stages.push(`Entrada da pizza: configure o forno em ${set}°C; lance a pizza quando a ${surf} estiver em ${rangeText(lo,hi)}.`);
    stages.push(`Assamento: ${d.bake}; mantenha o forno entre ${Math.max(350,set-30)} e ${set}°C e gire a pizza a cada 20–40 s conforme a coloração.`);
    stages.push(`Recuperação entre pizzas: aguarde a ${surf} retornar para ${rangeText(lo,hi)} antes da próxima pizza.`);
  } else {
    stages.push(`Entrada da pizza: mantenha o forno na temperatura máxima disponível (${d.oven}°C); lance quando a ${surf} estiver em ${rangeText(lo,hi)}.`);
    if(d.surfaceKey==='steel')stages.push(`Primeira fase: asse sobre a chapa de aço por cerca de 70–80% do tempo estimado (${d.bake}) com o forno em ${d.oven}°C.`);
    else if(d.surfaceKey==='stone')stages.push(`Primeira fase: asse sobre a pedra por cerca de 70–80% do tempo estimado (${d.bake}) com o forno em ${d.oven}°C.`);
    else stages.push(`Primeira fase: asse em assadeira/grelha por cerca de 70–80% do tempo estimado (${d.bake}) com o forno em ${d.oven}°C.`);
    stages.push(`Finalização: se houver grill/broiler, acione por 1–2 min mantendo a pizza na parte superior; se não houver, mantenha ${d.oven}°C até a base ficar firme e o topo dourar.`);
  }
  return stages;
}
function recommendedPreparation(d){const steps=[];const style=d.styleKey;const surf=d.surfaceKey;const steel=surf==='steel',stone=surf==='stone';const stages=bakeStages(d);
if(style==='detroit'){
 steps.push(`Unte a forma com aproximadamente ${d.detroit?g(d.detroit.panOilG):'12–15 g'} de óleo, formando uma película contínua no fundo e nas laterais.`);
 steps.push('Coloque a massa na forma sem forçar a abertura completa; faça 1 a 2 descansos de 20–30 min e espalhe até ocupar os cantos.');
 steps.push('Finalize a fermentação na forma, coberta, até a massa ficar aerada e relaxada.');
 steps.push('Distribua o queijo até encostar nas bordas para formar a crosta caramelizada típica; aplique o molho depois em faixas para preservar a crocância.');
 return steps.concat(stages);
}
if(style==='romana'){
 steps.push('Manuseie a massa com delicadeza para preservar os alvéolos formados na fermentação.');
 steps.push('Use semolina/farinha apenas o suficiente para abrir, evitando incorporar excesso de farinha seca.');
 steps.push('Abra no formato do subestilo escolhido sem comprimir totalmente a estrutura interna.');
 return steps.concat(stages).concat(['Após assar, descanse 1–2 min em grade antes do corte para preservar crocância.']);
}
if(style==='nap'||style==='nap_prod'||style==='neo'){
 steps.push(style==='nap'?'Abra a massa apenas com as mãos, preservando o cornicione e sem usar rolo.':'Abra a massa com as mãos, preservando a borda e buscando uma base mais estável que a AVPN.');
 steps.push('Monte a pizza rapidamente e use cobertura moderada para evitar encharcar o centro.');
 return steps.concat(stages);
}
if(style==='american'){
 steps.push('Abra a massa em disco fino a médio, com borda moderada e centro capaz de sustentar a cobertura.');
 steps.push('Use molho e queijo de baixa umidade para evitar amolecer a base.');
 return steps.concat(stages);
}
if(style==='br'){
 steps.push('Abra a massa em espessura compatível com a carga de cobertura escolhida.');
 steps.push('Para coberturas muito úmidas ou pesadas, faça pré-assamento do disco por 2–4 min em '+d.oven+'°C antes da cobertura completa.');
 return steps.concat(stages);
}
return stages}
function technicalJustification(d){const notes=[];if(d.oven<300)notes.push('A temperatura máxima informada caracteriza forno doméstico/baixa temperatura; por isso a superfície de cocção e a hidratação têm peso maior no resultado.');else if(d.oven>=380)notes.push('A temperatura máxima informada permite cocção rápida, maior oven spring e menor necessidade de açúcar/mel para coloração.');if(d.surfaceKey==='steel')notes.push('A chapa de aço aumenta a transferência de calor por condução, melhorando base e crocância em fornos domésticos.');if(d.surfaceKey==='stone')notes.push('A pedra refratária estabiliza a base e reduz perda térmica ao receber a pizza, embora seja menos agressiva que o aço.');if(d.surfaceKey==='none')notes.push('Sem pedra/chapa, a transferência de calor para a base é limitada; por isso o algoritmo tende a recomendar cuidado com cobertura e assamento mais longo.');if(d.styleKey==='nap_prod')notes.push('Na Napolitana produzível, mel, açúcar e azeite são compensadores tecnológicos: aumentam cor, extensibilidade e tolerância quando há pouco tempo de fermentação ou forno mais baixo.');if(d.styleKey==='nap')notes.push('Na Napolitana clássica AVPN, óleo, açúcar e mel permanecem zerados para manter aderência ao estilo tradicional.');if(d.styleKey==='detroit')notes.push('No modo Detroit, o algoritmo agora incorpora a lógica da planilha Charlie Anderson: densidade por área da forma, 95% farinha branca/5% integral, 1% de malte diastático, queijo calculado por preferência e molho em faixas após a cocção.');if(d.yType==='levain')notes.push('Com fermento natural, a calculadora desconta a água do levain da água adicionada e calcula a inoculação pela farinha prefermentada.');if(d.hyd>=0.72)notes.push('A hidratação alta exige manuseio mais delicado, maior desenvolvimento de glúten e boa gestão de farinha de bancada.');else if(d.hyd<=0.62)notes.push('A hidratação mais baixa favorece controle e abertura, mas pode secar mais em forno doméstico se a cocção for longa.');if(d.eq<8)notes.push('O tempo efetivo curto exige mais fermento e/ou compensadores; o sabor será menos complexo que em fermentações longas.');if(d.eq>=24)notes.push('O tempo efetivo mais longo aumenta maturação, aroma e extensibilidade, permitindo reduzir compensadores e fermento.');notes.push(`O novo motor usa IDY como base interna, aplica faixas profissionais por estilo e converte depois para fresco ou seco ativo; neste cálculo, o modelo selecionado foi ${d.yeastPreset.label}.`);if(d.styleKey==='detroit'&&d.substyleKey==='artisan')notes.push('No Detroit Artisan Charlie exato, o fermento fica fixo em 0,50% IDY para reproduzir a lógica original do Charlie Anderson. Use o subestilo Pro otimizado para 48–72h com menos fermento.');return notes}
function finalRestTarget(d){
  if(d.coldHours<=0)return 0;
  if(d.styleKey==='detroit')return d.substyleKey==='traditional'?2:4;
  if(d.styleKey==='romana')return d.substyleKey==='tonda'?2:3;
  if(d.styleKey==='american')return d.substyleKey==='ny'?1.5:2;
  if(d.styleKey==='br')return 2;
  if(d.styleKey==='nap')return 2;
  return 2.5;
}
function fermentationSplit(d){
  const totalRoom=Math.max(0,d.roomHours||0), cold=Math.max(0,d.coldHours||0), total=totalRoom+cold;
  if(cold<=0)return {total,initial:totalRoom,cold:0,final:0};
  const final=Math.min(totalRoom,finalRestTarget(d));
  const initial=Math.max(0,totalRoom-final);
  return {total,initial,cold,final};
}
function productionSchedule(d){
  const out=[];
  const split=fermentationSplit(d);
  out.push('Misture farinha, água e fermento/levain; adicione o sal após a hidratação inicial da farinha.');
  if(d.oil>0||d.honey>0||d.sugar>0)out.push('Adicione mel/açúcar dissolvidos na água e incorpore o óleo/azeite após a massa começar a ganhar estrutura.');
  out.push('Busque temperatura final de massa entre 22°C e 24°C, ajustando a temperatura da água se necessário.');
  out.push(`Distribuição recomendada do tempo total informado (${split.total.toFixed(1)}h = ${d.roomHours}h ambiente + ${d.coldHours}h geladeira): deixe ${split.initial.toFixed(1)}h em temperatura ambiente antes de ir para a geladeira; mantenha ${split.cold.toFixed(1)}h em geladeira a ${d.coldTemp}°C; depois deixe ${split.final.toFixed(1)}h fora da geladeira antes de abrir/assar.`);
  out.push(`Controle operacional: ambiente a ${d.roomTemp}°C e geladeira a ${d.coldTemp}°C geram aproximadamente ${d.eq.toFixed(1)}h equivalentes de fermentação pelo novo engine.`);
  if(d.shape==='round')out.push(`Divida em unidades de aproximadamente ${g(d.per)} e boleie com tensão moderada.`);else out.push(`Divida/acomode em forma com aproximadamente ${g(d.per)} por unidade.`);
  if(d.styleKey==='detroit')out.push('Para Detroit, a etapa final fora da geladeira deve acontecer já na forma untada, para completar o pan proof antes da cobertura.');
  if(d.coldHours>0)out.push('Retire da geladeira quando a massa ainda estiver fria, mas flexível; a massa deve relaxar antes da abertura e não deve colapsar por excesso de fermentação.');
  out.push('Pré-aqueça o forno e a superfície conforme o modo de preparo recomendado antes de abrir a primeira pizza.');
  return out}
