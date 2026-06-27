import {clamp} from '../utils/math.js';
export function estimateW(protein){return clamp(60*protein-480,140,420)}
export function flourHydAdj(f){return (0.005*(f.abs-58))+(0.012*((f.w-280)/50))-(0.007*((f.pl-.6)/.1))+(0.01*((f.ash-.55)/.1))}

// Horas equivalentes revisadas: geladeira a 4–5°C tem atividade muito menor que bancada.
export function equivalentHours(rh,rt,ch,ct){
  const roomFactor=Math.pow(2,(rt-24)/10);
  const coldFactor=0.15*Math.pow(2,((ct??4)-4)/10);
  return rh*roomFactor+ch*coldFactor;
}

const YEAST_PRESETS={
  nap:{classic:{base:.0003,min:.0001,max:.0006,refEq:18,refTemp:24,hydRef:60,saltRef:2.9,label:'Napolitana clássica AVPN'}},
  nap_prod:{sameDay:{base:.0012,min:.0008,max:.0030,refEq:14,refTemp:24,hydRef:65,saltRef:3.0,label:'Napolitana produzível'},domestic:{base:.0012,min:.0008,max:.0030,refEq:14,refTemp:24,hydRef:67,saltRef:3.0,label:'Napolitana produzível forno doméstico'},p300:{base:.0010,min:.0006,max:.0022,refEq:14,refTemp:24,hydRef:64,saltRef:3.0,label:'Napolitana produzível P300'}},
  neo:{standard:{base:.0008,min:.0005,max:.0018,refEq:24,refTemp:24,hydRef:65,saltRef:2.8,label:'Neo-napolitana'},sameDay:{base:.0014,min:.0008,max:.0028,refEq:8,refTemp:24,hydRef:64,saltRef:2.8,label:'Neo-napolitana same day'}},
  romana:{tonda:{base:.0010,min:.0006,max:.0020,refEq:24,refTemp:24,hydRef:55,saltRef:3.2,label:'Romana tonda'},teglia:{base:.0006,min:.0003,max:.0012,refEq:36,refTemp:24,hydRef:76,saltRef:3.2,label:'Romana in teglia'},pala:{base:.0007,min:.0003,max:.0014,refEq:36,refTemp:24,hydRef:79,saltRef:3.2,label:'Romana in pala'}},
  detroit:{artisan:{base:.0050,min:.0050,max:.0050,refEq:10,refTemp:24,hydRef:75,saltRef:2.0,label:'Detroit Artisan Charlie exato',fixed:true},artisanPro:{base:.0025,min:.0018,max:.0030,refEq:12,refTemp:24,hydRef:75,saltRef:2.0,label:'Detroit Artisan Pro 48–72h'},traditional:{base:.0050,min:.0035,max:.0060,refEq:4,refTemp:24,hydRef:65,saltRef:2.0,label:"Detroit Traditional / Buddy's-style"}},
  american:{ny:{base:.0020,min:.0015,max:.0035,refEq:18,refTemp:24,hydRef:64,saltRef:2.5,label:'Americana New York'},pan:{base:.0022,min:.0018,max:.0035,refEq:18,refTemp:24,hydRef:67,saltRef:2.5,label:'Americana pan'}},
  br:{thin:{base:.0028,min:.0020,max:.0045,refEq:10,refTemp:24,hydRef:61,saltRef:2.4,label:'Brasileira fina/média'},stuffed:{base:.0030,min:.0025,max:.0050,refEq:10,refTemp:24,hydRef:62,saltRef:2.4,label:'Brasileira borda recheada'}}
};
export function yeastPreset(styleKey,substyleKey){return YEAST_PRESETS[styleKey]?.[substyleKey]||YEAST_PRESETS[styleKey]?.default||{base:.0016,min:.0005,max:.006,refEq:12,refTemp:24,hydRef:65,saltRef:2.5,label:'Padrão'};}
export function adjustedIDYPct({styleKey,substyleKey,eqHours,roomTempC,hydrationPct,saltPct,sugarPct=0,fatPct=0,prefermentedFlourPct=0}){
  const p=yeastPreset(styleKey,substyleKey);
  if(p.fixed)return p.base;
  const timeFactor=Math.pow(p.refEq/Math.max(eqHours,1),0.90);
  const tempFactor=Math.pow(2,(p.refTemp-(roomTempC||24))/8);
  const hydFactor=clamp(1-0.012*((hydrationPct??p.hydRef)-p.hydRef),0.75,1.20);
  const saltFactor=clamp(1+0.12*((saltPct??p.saltRef)-p.saltRef),0.85,1.25);
  const sugarFactor=clamp(1+0.05*Math.min(sugarPct,4)+0.10*Math.max(sugarPct-4,0),1.00,1.60);
  const fatFactor=clamp(1+0.03*fatPct,1.00,1.25);
  const prefFactor=clamp(1-0.015*prefermentedFlourPct,0.55,1.00);
  return clamp(p.base*timeFactor*tempFactor*hydFactor*saltFactor*sugarFactor*fatFactor*prefFactor,p.min,p.max);
}

// Mantida para compatibilidade; o app novo usa adjustedIDYPct.
export function yeastInstant(eq,styleC,w,fn,sugar,honey,oil){const Y0=.0016,ref=12; const cw=clamp(1-.0015*(w-280),.85,1.20); const cfn=clamp(1+0.002*Math.max(0,300-fn),.70,1.10); const sw=sugar*100+0.8*honey*100; let cs= sw<=2?1-.04*sw: sw<=5?1:1+.05*(sw-5); const co=1+.015*Math.max(0,oil*100-2); return clamp(Y0*styleC*(ref/Math.max(eq,1))*cw*cfn*cs*co,.00005,.02)}
export function convertYeast(idy,type){if(type==='fresh')return idy*3;if(type==='activeDry')return idy*1.25;return idy}
export function levainFlourPct(eq,acid,styleKey='',substyleKey=''){
  const ca={low:.85,medium:1,high:1.15}[acid]||1;
  let base=.18;
  if(styleKey==='nap')base=.15;
  else if(styleKey==='romana'&&(substyleKey==='teglia'||substyleKey==='pala'))base=.22;
  else if(styleKey==='detroit')base=.20;
  else if(styleKey==='br')base=.18;
  const timeAdj=Math.pow(18/Math.max(eq+6,8),0.45);
  return clamp(base*timeAdj*ca,.10,.30);
}
export function targetHyd(profile,flour,surfaceAdj,oven){let mid=(profile.hyd[0]+profile.hyd[1])/2; let ovenAdj=oven>=430?-.015:oven>=350?-.005:oven>=280?.01:.025; return clamp(mid+flourHydAdj(flour)+surfaceAdj.hyd+ovenAdj,profile.hyd[0],profile.hyd[1])}
export function massTarget(shape,qty,diam,l,w,profile,override){if(override)return override*qty; if(shape==='round')return qty*diam*diam*profile.k; return qty*l*w*profile.g}
export function thermal(surface,preheat){const phi=Math.min(1,preheat/surface.preheat);return surface.fs*phi}

export function bakeEstimate(profile,oven,fs,shape,styleKey='',substyleKey='',surfaceKey=''){
  const pan = shape==='pan' || styleKey==='detroit' || substyleKey==='teglia' || substyleKey==='pan' || surfaceKey==='detroitPan';
  let baseMin;
  if(styleKey==='nap' && oven>=380) baseMin = 1.3;
  else if((styleKey==='nap_prod'||styleKey==='neo') && oven>=380) baseMin = 2.0;
  else if(styleKey==='romana' && substyleKey==='tonda' && oven>=320) baseMin = 2.4;
  else if(styleKey==='romana' && (substyleKey==='teglia'||substyleKey==='pala') && oven>=300) baseMin = substyleKey==='teglia'?9:6;
  else if(styleKey==='detroit') baseMin = 13;
  else if(styleKey==='american' && substyleKey==='ny') baseMin = oven>=300?6:8;
  else if(styleKey==='american' || styleKey==='br') baseMin = pan?12:8;
  else baseMin = pan?12:7;

  const styleRef = (profile.oven[0]+profile.oven[1])/2;
  const tempFactor = Math.pow(styleRef/Math.max(oven,180), pan?0.95:1.20);
  const surfaceFactor = Math.pow(Math.max(fs,0.65), pan?-0.35:-0.65);
  const est = baseMin * tempFactor * surfaceFactor;
  const lo = Math.max(0.8, est*0.75);
  const hi = est*1.25;
  if(hi < 3) return `${Math.round(lo*60)}–${Math.round(hi*60)} s`;
  return `${lo.toFixed(1)}–${hi.toFixed(1)} min`;
}

export function napolitanaProduzivelAdditives(eqHours, ovenTemp){
  let honey=0, oil=0, sugar=0;
  if(eqHours < 2){honey=.03; oil=.02;}
  else if(eqHours < 4){honey=.025; oil=.02;}
  else if(eqHours < 6){honey=.02; oil=.015;}
  else if(eqHours < 8){honey=.015; oil=.01;}
  else if(eqHours < 12){honey=.01; oil=.01;}
  else if(eqHours < 24){honey=.005; oil=.005;}
  else {honey=0; oil=0;}
  if(ovenTemp < 300){sugar = eqHours < 12 ? .005 : (eqHours < 24 ? .003 : 0); oil += eqHours < 24 ? .005 : 0;}
  else if(ovenTemp < 380){sugar = eqHours < 8 ? .0025 : 0; oil += eqHours < 12 ? .0025 : 0;}
  else if(ovenTemp >= 400){sugar = 0; oil = Math.max(0, oil-.0025);}
  return {honey:clamp(honey,0,.035), oil:clamp(oil,0,.025), sugar:clamp(sugar,0,.008)};
}
