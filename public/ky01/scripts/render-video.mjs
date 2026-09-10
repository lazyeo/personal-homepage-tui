// Deterministic offline capture. The recording hook is injected into this browser only.
import { readFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const output=path.resolve(process.env.VIDEO_OUTPUT || path.join(root,'exports/ky01l-orbit-qr-finish.mp4'));
const fps=30, seconds=24, size=1080;
await mkdir(path.dirname(output),{recursive:true});
const browser=await chromium.launch({headless:true});
let ffmpeg;
try {
 const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const app=await readFile(path.join(root,'preview/app.js'),'utf8');
 const hook=`
 const film=document.createElement('canvas');film.width=1080;film.height=1080;
 const filmContext=film.getContext('2d');
 window.captureFrame=async(t)=>{
  spin(false);cancelAnimationFrame(raf);raf=0;
  // Constant angular velocity: no per-keyframe easing or stationary rear view.
  yaw=-.36+4*Math.PI*t/24;
  pitch=-.10+.20*Math.sin(4*Math.PI*t/24);
  zoom=210;
  const shot=t<8?'home':t<16?'board':'cover';
  if(selected!==shot)await selectScreen(shot);
  cancelAnimationFrame(raf);raf=0;render();
  filmContext.fillStyle='#f1f0e9';filmContext.fillRect(0,0,1080,1080);
  filmContext.drawImage(renderer.domElement,0,0,760,1080);
  filmContext.fillStyle='#252d2b';filmContext.font='600 30px Arial';
  filmContext.fillText('KY-01L',790,300);
  const rows=[['HEIGHT / 高','91','mm'],['WIDTH / 宽','55','mm'],['DEPTH / 厚','5.3','mm']];
  rows.forEach(([label,value,unit],i)=>{
   const y=360+i*155;
   filmContext.fillStyle='#57635e';filmContext.font='17px Arial';filmContext.fillText(label,790,y);
   filmContext.fillStyle='#252d2b';filmContext.font='48px Arial';filmContext.fillText(value,790,y+62);
   const width=filmContext.measureText(value).width;
   filmContext.font='21px Arial';filmContext.fillStyle='#57635e';filmContext.fillText(unit,800+width,y+62);
   filmContext.strokeStyle='#c7ccc3';filmContext.lineWidth=1;filmContext.beginPath();filmContext.moveTo(790,y+90);filmContext.lineTo(1010,y+90);filmContext.stroke();
  });
  return film.toDataURL('image/png').split(',')[1];
 };
 `;
 await page.route('**/app.js',route=>route.fulfill({contentType:'text/javascript',body:app.replace("localize();selectScreen(params.get('screen')||'home');",hook+"localize();selectScreen(params.get('screen')||'home');")}));
 await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8765/?embed=1');
 await page.waitForSelector('#stage[data-screen="home"]');
 await page.addStyleTag({content:'.view-controls,#hint{display:none!important}#stage{height:1080px!important;width:760px!important}body{background:#f1f0e9!important}'});
 // Canvas alpha is flattened consistently by ffmpeg's format conversion below.
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const target=output;
 ffmpeg=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(fps),'-i','pipe:0','-f','lavfi','-i',`color=c=0xf1f0e9:s=${size}x${size}:r=${fps}`,'-filter_complex','[1:v][0:v]overlay=shortest=1:format=auto,format=yuv420p[v]','-map','[v]','-an','-c:v','libx264','-preset','medium','-crf','18','-movflags','+faststart',target],{stdio:['pipe','ignore','pipe']});
 let log='';ffmpeg.stderr.on('data',d=>log+=d);
 const complete=once(ffmpeg,'close');
 for(let frame=0;frame<seconds*fps;frame++){
  const png=await page.evaluate(t=>window.captureFrame(t),frame/fps);
  if(!ffmpeg.stdin.write(Buffer.from(png,'base64')))await once(ffmpeg.stdin,'drain');
  if(frame%(fps*6)===0)console.log(`Rendered ${frame/fps}/${seconds}s`);
 }
 ffmpeg.stdin.end();const [code]=await complete;if(code!==0)throw Error(log);
 if(errors.length)throw Error(errors.join('\n'));
 console.log(`DONE ${output}`);
}finally{if(ffmpeg&&ffmpeg.exitCode===null)ffmpeg.kill();await browser.close();}
