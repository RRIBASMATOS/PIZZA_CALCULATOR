export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const pct=v=>(v*100).toFixed(2)+'%';
export const g=(v,d=0)=>v<5?v.toFixed(2)+' g':v.toFixed(d)+' g';
export const val=id=>{const x=document.getElementById(id).value;return x===''?null:Number(x)};
