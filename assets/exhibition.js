(() => {
 'use strict';
 let current=0,chosen=[],startX=null,suppress=false;
 const lang=()=>document.documentElement.lang.startsWith('zh'),L=(zh,en)=>lang()?zh:en;
 const targets={curious:'grasp-challenge',thoughtful:'zerith-site',playful:'waic',precise:'zerith-site',observant:'chinese-doctors',adventurous:'cisce'};
 function show(index,focus=false){
  const buttons=[...document.querySelectorAll('[data-exhibit-select]')];if(!buttons.length)return;
  current=(index+buttons.length)%buttons.length;
  buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===current));b.tabIndex=i===current?0:-1;document.getElementById('exhibit-panel-'+i).hidden=i!==current;});
  const status=document.querySelector('[data-exhibit-status]');status.textContent='0'+(current+1)+' / 03 · '+L('点击项目、使用方向键，或在图像区域左右拖动','Select a project, use arrow keys, or swipe the image');
  if(focus)buttons[current].focus();
 }
 function recommend(){
  document.querySelectorAll('[data-keyword]').forEach(b=>{const active=chosen.includes(b.dataset.keyword);b.setAttribute('aria-pressed',String(active));b.querySelector('b').textContent=active?'✓':'+';});
  const count=document.querySelector('[data-keyword-count]');if(!count)return;
  count.textContent=L('已选择 ','Selected ')+chosen.length+' / 3';
  const result=document.querySelector('[data-keyword-result]');result.replaceChildren();
  if(chosen.length!==3)return;
  const ids=[...new Set(chosen.map(k=>targets[k]))];
  for(const id of ids){const p=window.PORTFOLIO.projects.find(p=>p.id===id),a=document.createElement('a'),title=document.createElement('strong'),body=document.createElement('p'),note=document.createElement('span');a.href='#/'+(lang()?'zh':'en')+'/work/'+id;title.textContent=lang()?p.subtitle.zh:p.subtitle.en;body.textContent=lang()?p.summary.zh:p.summary.en;note.textContent=L('沿着这条线索阅读 ↗','Follow this path ↗');a.append(title,body,note);result.append(a);}
 }
 function choose(key){const i=chosen.indexOf(key);if(i>=0)chosen.splice(i,1);else if(chosen.length<3)chosen.push(key);else {const n=document.querySelector('[data-keyword-count]');n.textContent=L('已选择 3 / 3 · 取消一个词即可替换','Selected 3 / 3 · Deselect a word to replace it');return;}recommend();}
 function balance(value){const stage=document.querySelector('[data-intersection]'),range=document.querySelector('[data-balance]');if(!stage)return;const v=Math.max(25,Math.min(75,value));stage.style.setProperty('--balance',v+'%');range.value=v;}
 document.addEventListener('click',e=>{
  const jump=e.target.closest('[data-section-jump]');if(jump){e.preventDefault();const el=document.querySelector(jump.getAttribute('href'));if(el){if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('motion-off')?'instant':'smooth'});}return;}
  const step=e.target.closest('[data-exhibit-step]');if(step)show(current+Number(step.dataset.exhibitStep));
  const select=e.target.closest('[data-exhibit-select]');if(select)show(Number(select.dataset.exhibitSelect));
  const key=e.target.closest('[data-keyword]');if(key)choose(key.dataset.keyword);
  if(e.target.closest('[data-keyword-reset]')){chosen=[];recommend();}
  const flip=e.target.closest('[data-collectible-flip]');if(flip){const open=flip.getAttribute('aria-expanded')!=='true';flip.setAttribute('aria-expanded',String(open));flip.closest('.collectible').classList.toggle('is-open',open);document.getElementById(flip.getAttribute('aria-controls')).hidden=!open;}
  const view=e.target.closest('[data-work-view]');if(view){document.querySelector('[data-work-grid]').classList.toggle('is-editorial',view.dataset.workView==='editorial');document.querySelectorAll('[data-work-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===view)));}
  const filter=e.target.closest('[data-archive-filter]');if(filter){document.querySelectorAll('[data-archive-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));document.querySelectorAll('[data-collectible-type]').forEach(c=>c.hidden=filter.dataset.archiveFilter!=='all'&&c.dataset.collectibleType!==filter.dataset.archiveFilter);}
  const av=e.target.closest('[data-archive-view]');if(av){const list=document.querySelector('[data-collectibles]').classList.toggle('is-list');av.setAttribute('aria-pressed',String(list));av.textContent=list?L('切换收藏视图','Switch to collection view'):L('切换列表视图','Switch to list view');}
 });
 document.addEventListener('click',e=>{if(suppress&&e.target.closest('.exhibit-image')){e.preventDefault();e.stopImmediatePropagation();suppress=false;}},true);
 document.addEventListener('keydown',e=>{const b=e.target.closest('[data-exhibit-select]');if(!b)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();show(e.key==='Home'?0:e.key==='End'?2:current+(e.key==='ArrowRight'?1:-1),true);}});
 document.addEventListener('input',e=>{if(e.target.matches('[data-balance]'))balance(Number(e.target.value));});
 document.addEventListener('pointermove',e=>{const stage=e.target.closest('[data-intersection]');if(!stage||e.pointerType==='touch'&&e.buttons===0)return;const r=stage.getBoundingClientRect();balance((e.clientX-r.left)/r.width*100);});
 document.addEventListener('pointerdown',e=>{if(e.target.closest('.exhibit-image')){startX=e.clientX;suppress=false;}});
 document.addEventListener('pointerup',e=>{if(startX===null)return;const delta=e.clientX-startX;startX=null;if(Math.abs(delta)>45){show(current+(delta<0?1:-1));suppress=true;setTimeout(()=>suppress=false,80);}});
 document.addEventListener('pointercancel',()=>{startX=null;suppress=false;});
 document.addEventListener('dragstart',e=>{const k=e.target.closest('[data-keyword]');if(k)e.dataTransfer.setData('text/plain',k.dataset.keyword);if(e.target.closest('.exhibit-image'))e.preventDefault();});
 document.addEventListener('dragover',e=>{const drop=e.target.closest('[data-keyword-drop]');if(drop){e.preventDefault();drop.classList.add('is-over');}});
 document.addEventListener('dragleave',e=>e.target.closest('[data-keyword-drop]')?.classList.remove('is-over'));
 document.addEventListener('drop',e=>{const drop=e.target.closest('[data-keyword-drop]');if(drop){e.preventDefault();drop.classList.remove('is-over');const key=e.dataTransfer.getData('text/plain');if(Object.hasOwn(targets,key)&&!chosen.includes(key))choose(key);}});
 window.EXHIBITION={mount(){current=0;chosen=[];startX=null;show(0);recommend();}};
})();
