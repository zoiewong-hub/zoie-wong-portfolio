/* Original three-second cotton-and-care motion study. No movie footage. */
(() => {
  const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const dust=Array.from({length:90},(_,i)=>({x:(i*137.507)%1280,y:(i*83.93)%720,r:.5+(i%5)*.3}));
  function draw(g,time,locale='zh'){
    const t=Math.max(0,Math.min(3,time)),intro=ease(t/.32),out=ease((t-2.72)/.28);
    g.save();g.fillStyle='#071a26';g.fillRect(0,0,1280,720);
    const light=g.createRadialGradient(455,235,0,520,330,680);light.addColorStop(0,'#426775');light.addColorStop(.48,'#173b49');light.addColorStop(1,'#05131f');g.fillStyle=light;g.fillRect(0,0,1280,720);
    g.globalCompositeOperation='screen';const amber=g.createRadialGradient(1120,80,0,1120,80,760);amber.addColorStop(0,'#cca27766');amber.addColorStop(.42,'#bc977b12');amber.addColorStop(1,'#00000000');g.fillStyle=amber;g.fillRect(0,0,1280,720);g.globalCompositeOperation='source-over';
    // A shallow-focus macro bloom: each filament has a lit rim and soft core.
    g.save();g.translate(475+t*9,355-t*4);g.scale(1.12+t*.025,1.12+t*.025);g.rotate(-.13+t*.018);
    const reveal=ease((t-.08)/1.4);
    g.strokeStyle='#698481';g.lineWidth=7;g.beginPath();g.moveTo(5,38);g.bezierCurveTo(18,145,-20,190,32,350);g.stroke();
    for(let k=0;k<5;k++){
      const a=k*2.39996-.6,cx=Math.cos(a)*58,cy=Math.sin(a)*48-5;
      const halo=g.createRadialGradient(cx-18,cy-25,3,cx,cy,113);halo.addColorStop(0,'#fff9e7');halo.addColorStop(.32,'#e9ecdf');halo.addColorStop(.68,'#c4d7cf');halo.addColorStop(1,'#6f999500');g.fillStyle=halo;g.beginPath();g.ellipse(cx,cy,106,92,a,0,Math.PI*2);g.fill();
      for(let j=0;j<72;j++){
        const q=j*2.39996,r=Math.sqrt((j+.5)/72)*83,px=cx+Math.cos(q)*r,py=cy+Math.sin(q)*r*.83;
        g.strokeStyle=j%3?'#f7f5e2a0':'#8baaa96a';g.lineWidth=j%4===0?1.2:.65;
        const shift=Math.sin(t*.8+j)*2*reveal;g.beginPath();g.moveTo(px,py);g.bezierCurveTo(px-14+shift,py-25,px+28,py-36,px+18+Math.cos(q)*16,py-9);g.stroke();
      }
    }
    g.restore();
    // Long soft threads carry the bloom into a wider field of warm light.
    g.save();g.globalAlpha=ease((t-.45)/1.3)*.42;for(let i=0;i<38;i++){const y=270+i*4.2,dx=Math.sin(i*2.4)*21;const thread=g.createLinearGradient(535,0,950,0);thread.addColorStop(0,i%3?'#d9e9e3':'#d8bd90');thread.addColorStop(.62,'#b9d2ce44');thread.addColorStop(1,'#b9d2ce00');g.strokeStyle=thread;g.lineWidth=.5+(i%3)*.3;g.beginPath();g.moveTo(535+dx,y);g.bezierCurveTo(670,y-30-t*4,860,y+85,1310,y-130+i*2);g.stroke();}g.restore();
    g.globalCompositeOperation='screen';for(const p of dust){const x=(p.x+t*(6+p.r*3))%1280,y=p.y+Math.sin(t+p.x)*3;const gl=g.createRadialGradient(x,y,0,x,y,p.r*4);gl.addColorStop(0,'#ffebbf99');gl.addColorStop(1,'#ffebbf00');g.fillStyle=gl;g.fillRect(x-p.r*4,y-p.r*4,p.r*8,p.r*8);}g.globalCompositeOperation='source-over';
    const text=ease((t-1.15)/.75);g.globalAlpha=text;g.fillStyle='#f4ecdc';g.textAlign='left';g.font='32px "Microsoft YaHei",sans-serif';g.fillText(locale==='zh'?'每一份柔软，都是守护。':'Softness, in the service of care.',770,326,460);g.fillStyle='#b7c7c5';g.font='16px "Microsoft YaHei",sans-serif';g.fillText(locale==='zh'?'《中国医生》联合推广项目':'Chinese Doctors · Brand collaboration',773,371);g.font='11px "Microsoft YaHei",sans-serif';g.fillStyle='#9eafb0';g.fillText(locale==='zh'?'原创视觉短片':'AN ORIGINAL VISUAL STUDY',773,402);
    g.globalAlpha=1;const vignette=g.createRadialGradient(640,350,200,640,350,750);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#000b16bb');g.fillStyle=vignette;g.fillRect(0,0,1280,720);g.fillStyle='#000';g.fillRect(0,0,1280,43);g.fillRect(0,677,1280,43);
    g.globalAlpha=1-intro+out*.85;g.fillRect(0,0,1280,720);g.restore();
  }
  window.ISLAND_CINEMA_FILM={draw,duration:3,original:true};
})();
