import {clamp} from '../utils/math.js';
export function estimateW(protein){return clamp(60*protein-480,140,420)}
export function flourHydAdj(f){return (0.005*(f.abs-58))+(0.012*((f.w-280)/50))-(0.007*((f.pl-.6)/.1))+(0.01*((f.ash-.55)/.1))}
export function equivalentHours(rh,rt,ch,ct){return rh*Math.pow(2,(rt-24)/10)+ch*(0.60*Math.pow(2,(ct-24)/10))}
export function yeastInstant(eq,styleC,w,fn,sugar,honey,oil){const Y0=.0016,ref=12; const cw=clamp(1-.0015*(w-280),.85,1.20); const cfn=clamp(1+0.002*Math.max(0,300-fn),.70,1.10); const sw=sugar*100+0.8*honey*100; let cs= sw<=2?1-.04*sw: sw<=5?1:1+.05*(sw-5); const co=1+.015*Math.max(0,oil*100-2); return clamp(Y0*styleC*(ref/Math.max(eq,1))*cw*cfn*cs*co,.00005,.02)}
export function convertYeast(idy,type){if(type==='fresh')return idy*3;if(type==='activeDry')return idy*1.25;return idy}
export function levainFlourPct(eq,acid){const ca={low:.85,medium:1,high:1.15}[acid]||1;return clamp(0.28*(12/(eq+6))*ca,.08,.30)}
export function targetHyd(profile,flour,surfaceAdj,oven){let mid=(profile.hyd[0]+profile.hyd[1])/2; let ovenAdj=oven>=430?-.015:oven>=350?-.005:oven>=280?.01:.025; return clamp(mid+flourHydAdj(flour)+surfaceAdj.hyd+ovenAdj,profile.hyd[0],profile.hyd[1])}
export function massTarget(shape,qty,diam,l,w,profile,override){if(override)return override*qty; if(shape==='round')return qty*diam*diam*profile.k; return qty*l*w*profile.g}
export function thermal(surface,preheat){const phi=Math.min(1,preheat/surface.preheat);return surface.fs*phi}
export function bakeEstimate(profile,oven,fs,shape){const tref=(profile.oven[0]+profile.oven[1])/2; const base=shape==='round'?5:12; const min=base*Math.pow(tref/oven,1.45)*Math.pow(fs,-.8); return `${Math.max(.8,min*.8).toFixed(1)}–${(min*1.25).toFixed(1)} min`}


export function napolitanaProduzivelAdditives(eqHours, ovenTemp){
  // Engine tecnológico para Napolitana Produzível: mel/açúcar/azeite variam com tempo efetivo e forno.
  // Percentuais retornados em decimal sobre farinha total.
  let honey=0, oil=0, sugar=0;
  if(eqHours < 2){honey=.03; oil=.02;}
  else if(eqHours < 4){honey=.025; oil=.02;}
  else if(eqHours < 6){honey=.02; oil=.015;}
  else if(eqHours < 8){honey=.015; oil=.01;}
  else if(eqHours < 12){honey=.01; oil=.01;}
  else if(eqHours < 24){honey=.005; oil=.005;}
  else {honey=0; oil=0;}

  // Forno baixo precisa de ajuda de browning e proteção contra ressecamento.
  if(ovenTemp < 300){
    sugar = eqHours < 12 ? .005 : (eqHours < 24 ? .003 : 0);
    oil += eqHours < 24 ? .005 : 0;
  } else if(ovenTemp < 380){
    sugar = eqHours < 8 ? .0025 : 0;
    oil += eqHours < 12 ? .0025 : 0;
  } else if(ovenTemp >= 400){
    // Forno alto queima açúcares com facilidade; reduz gordura para manter perfil mais napolitano.
    sugar = 0;
    oil = Math.max(0, oil-.0025);
  }
  return {honey:clamp(honey,0,.035), oil:clamp(oil,0,.025), sugar:clamp(sugar,0,.008)};
}
