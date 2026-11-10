/* Vanilla adapter for ThreeUI's MIT-licensed Ribbon Field shader.
 * Copyright (c) 2026 Meng To for the upstream shader and rendering pattern.
 * Portfolio adapter: lifecycle cleanup, reduced motion, visibility recovery,
 * resolution/frame-rate cap and accessible story tabs. See licenses/ThreeUI-MIT.txt.
 */
(() => {
  'use strict';
  let cleanup=()=>{}, paused=false;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let refresh=()=>{};
  function activate(button,focus=false){
    const group=button.dataset.storyGroup,index=button.dataset.storyTab;
    document.querySelectorAll('[data-story-group]').forEach(item=>{
      if(item.dataset.storyGroup!==group)return;
      const selected=item===button;
      item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;
    });
    document.querySelectorAll('[data-story-panel]').forEach(panel=>{
      if(panel.dataset.storyPanel===group)panel.hidden=panel.id!==group+'-panel-'+index;
    });
    const explorer=button.closest('.journey-explorer');
    if(explorer){explorer.style.setProperty('--journey-step',index);explorer.dataset.activeStep=index;}
    if(focus)button.focus({preventScroll:true});
  }
  document.addEventListener('click',event=>{const b=event.target.closest('[data-story-tab]');if(b)activate(b);});
  document.addEventListener('keydown',event=>{
    const b=event.target.closest('[data-story-tab]');if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const items=[...b.parentElement.querySelectorAll('[data-story-tab]')],i=items.indexOf(b);
    const next=event.key==='Home'?0:event.key==='End'?items.length-1:(i+(event.key==='ArrowRight'?1:-1)+items.length)%items.length;
    activate(items[next],true);
  });
  function mount(options={}){
    cleanup();paused=!!options.paused;
    const host=document.querySelector('[data-ribbon-scene]');if(!host){cleanup=()=>{};refresh=()=>{};return;}
    const canvas=host.querySelector('canvas'),hero=host.parentElement;
    let gl;
    try{gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:true});}catch{return;}
    if(!gl||!window.THREEUI_RIBBON)return;
    const shaders=[];let program,buffer,frame=0,disposed=false,visible=true,lost=false;
    try{
      const compile=(type,source)=>{const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader compilation');return shader;};
      program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,window.THREEUI_RIBBON.vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,window.THREEUI_RIBBON.fragment));gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader linking');
      gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    }catch{shaders.forEach(x=>gl.deleteShader(x));if(program)gl.deleteProgram(program);if(buffer)gl.deleteBuffer(buffer);return;}
    const resolution=gl.getUniformLocation(program,'resolution'),time=gl.getUniformLocation(program,'time'),pointer=gl.getUniformLocation(program,'pointer');
    let x=.72,y=.42,tx=.72,ty=.42,clock=12,last=0,lastPaint=0;
    const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;};
    const paint=()=>{gl.uniform1f(time,clock);gl.uniform2f(pointer,x,y);gl.drawArrays(gl.TRIANGLES,0,6);};
    const tick=now=>{
      frame=0;if(disposed||lost||paused||media.matches||!visible||document.hidden)return;
      const delta=last?Math.min((now-last)/1000,.07):0;last=now;
      if(now-lastPaint>=33){clock+=delta*.45;x+=(tx-x)*.035;y+=(ty-y)*.035;paint();lastPaint=now;}
      frame=requestAnimationFrame(tick);
    };
    const sync=()=>{if(disposed||lost)return;stop();if(paused||media.matches||!visible||document.hidden){paint();return;}frame=requestAnimationFrame(tick);};
    const resize=()=>{const r=host.getBoundingClientRect(),scale=Math.min(devicePixelRatio||1,1.3,1100/Math.max(1,r.width));canvas.width=Math.max(1,Math.floor(r.width*scale));canvas.height=Math.max(1,Math.floor(r.height*scale));gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(resolution,canvas.width,canvas.height);paint();};
    const move=e=>{if(paused||media.matches)return;const r=hero.getBoundingClientRect();tx=.72+((e.clientX-r.left)/r.width-.72)*.5;ty=.42+(1-(e.clientY-r.top)/r.height-.42)*.5;};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(host);
    const ro=new ResizeObserver(resize);ro.observe(host);
    const lose=e=>{e.preventDefault();lost=true;stop();host.classList.remove('is-ready');};
    const restore=()=>{if(host.isConnected)mount({paused});};
    canvas.addEventListener('webglcontextlost',lose);canvas.addEventListener('webglcontextrestored',restore);
    hero.addEventListener('pointermove',move,{passive:true});document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
    resize();host.classList.add('is-ready');sync();refresh=sync;
    cleanup=()=>{disposed=true;stop();observer.disconnect();ro.disconnect();hero.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync);canvas.removeEventListener('webglcontextlost',lose);canvas.removeEventListener('webglcontextrestored',restore);host.classList.remove('is-ready');if(!lost){gl.deleteBuffer(buffer);shaders.forEach(shader=>gl.deleteShader(shader));gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}refresh=()=>{};};
  }
  window.PORTFOLIO_INTERACTIONS={mount,setPaused(value){paused=!!value;refresh();},dispose(){cleanup();}};
})();
