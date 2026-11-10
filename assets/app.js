(() => {
  'use strict';
  const data = window.PORTFOLIO;
  const app = document.querySelector('#app');
  const dialog = document.querySelector('#preview');
  const routes = ['home', 'work', 'archive', 'about'];
  let lang = 'zh', page = 'home', filter = 'all', frame = 0, workView='gallery', toastTimer;
  const saved = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* file mode/private storage */ } };
  let still = false; // System reduced-motion is still respected; no visible motion switch.
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const t = value => typeof value === 'object' && value !== null ? (value[lang] ?? value.zh ?? '') : value;
  const txt = value => escape(t(value));
  const L = (zh, en) => lang === 'zh' ? zh : en;
  const url = route => `#/${lang}/${route}`;
  const arrow = '<span aria-hidden="true">↗</span>';
  const label = (n, text) => `<p class="eyebrow"><span>${n}</span> / ${text}</p>`;
  const link = (route, text, cls='button button--text') => `<a class="${cls}" href="${url(route)}">${text} ${arrow}</a>`;
  const image = (src, alt, cls='', eager=false) => `<img src="${escape(src)}" alt="${escape(alt)}" class="${cls}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
  const projectCard = (project, featured=false) => `<a class="project-card ${featured?'project-card--featured':''}" href="${url(`work/${project.id}`)}">
    <div class="project-media">${image(project.image,t(project.subtitle))}<span class="project-open" aria-hidden="true">↗</span>${project.category==='concept'?`<span class="pill project-status">${L('计划中','Planned')}</span>`:''}</div>
    <div class="project-meta"><span>${escape(project.client)}</span><span>${escape(project.year)}</span></div><h3 class="project-title">${txt(project.subtitle)}</h3><p class="project-subtitle">${txt(project.discipline)}</p><p class="project-summary">${txt(project.summary)}</p><p class="project-credit">${L("本人职责：","My role: ")}${txt(project.role)}</p></a>`;
  const sectionHeader = (n,title,route,cta) => `<div class="section-header"><div>${label(n,L('继续探索','EXPLORE'))}<h2 class="section-title">${title}</h2></div>${route?link(route,cta):''}</div>`;
  function chrome() {
    const navLabels = {home:['首页','Home'],work:['作品','Work'],experience:['经历','Experience'],about:['关于','About'],archive:['成就','Collection'],contact:['联系','Contact']};
    const nav = routes.map(r=>`<a class="nav-link ${page.split('/')[0]===r?'is-active':''}" ${page.split('/')[0]===r?'aria-current="page"':''} href="${url(r)}"><span>${L(...navLabels[r])}</span></a>`).join('');
    document.querySelector('#header').innerHTML = `<a class="brand" href="${url('home')}" aria-label="${L('王楚筠，首页','Zoie Wong, home')}"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 44 44" fill="none" focusable="false"><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-32 22 22)"><path d="M24 15h4a7 7 0 0 1 0 14h-4M20 15h-4a7 7 0 0 0 0 14h4M17 22h10"/></g></svg></span><span class="brand-wordmark">zoie wong<small>Creative Strategist</small></span></a><nav class="desktop-nav" aria-label="${L('主导航','Main navigation')}">${nav}</nav><div class="nav-tools"><button class="lang-toggle" data-language aria-label="${L('切换为英文','Switch to Chinese')}"><span ${lang==='zh'?'class="active"':''}>中</span><i>/</i><span ${lang==='en'?'class="active"':''}>EN</span></button><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="${L('打开导航','Open navigation')}"><span></span><span></span></button></div><nav class="mobile-nav" id="mobile-nav" aria-label="${L('移动导航','Mobile navigation')}" hidden>${nav}</nav>`;
    document.querySelector('#footer').innerHTML = `<div class="quiet-footer"><span>© ${new Date().getFullYear()} ${txt(data.profile.name)} <span class="muted">· Ideas, Made Real.</span></span><span class="footer-links">${link('contact',L('联系','Contact'))}${link('archive',L('成长档案','Archive'))}</span></div><p class="footer-review">${L('策略与创意兼具的品牌实践 · 项目资料及口径见各案例。','Brand practice across strategy and creativity · Sources and metrics are documented in each case.')}</p>`;
    document.body.classList.toggle('motion-off',still);
    document.body.classList.remove('atmosphere-home');
  }
  function tabs(group, items, cls='') {
    return '<div class="story-tabs '+cls+'" role="tablist">'+items.map((item,i)=>'<button type="button" id="'+group+'-tab-'+i+'" role="tab" data-story-group="'+group+'" data-story-tab="'+i+'" aria-controls="'+group+'-panel-'+i+'" aria-selected="'+(i===0)+'" tabindex="'+(i===0?'0':'-1')+'">'+txt(item.label)+'</button>').join('')+'</div>';
  }
  function panels(group, items, renderer) {
    return items.map((item,i)=>'<div id="'+group+'-panel-'+i+'" role="tabpanel" aria-labelledby="'+group+'-tab-'+i+'" data-story-panel="'+group+'" '+(i?'hidden':'')+'>'+renderer(item,i)+'</div>').join('');
  }
  function journey(project, group='waic-journey') {
    return '<div class="journey-explorer">'+tabs(group,project.journey,'journey-tabs')+'<div class="journey-content"><div class="journey-orbit" aria-hidden="true"><span>PHYSICAL<br>GRASPING<br>API</span><i></i><i></i><i></i></div><div class="journey-reading">'+panels(group,project.journey,(item,i)=>'<p class="eyebrow">0'+(i+1)+' / EXPERIENCE MAP</p><h3>'+txt(item.title)+'</h3><p>'+txt(item.body)+'</p>')+'</div></div><p class="journey-caption">'+L('依据参展复盘整理的策略示意 · 非现场实拍','Strategic diagram based on the event retrospective · Not event photography')+'</p></div>';
  }
  function touchpoints(project, group='film-touchpoints') {
    return '<div class="touchpoint-explorer">'+tabs(group,project.touchpoints)+'<div class="touchpoint-content">'+panels(group,project.touchpoints,item=>'<div class="touchpoint-number"><strong>'+escape(item.value)+'</strong><span>'+txt(item.unit)+'</span></div><p>'+txt(item.body)+'</p>')+'</div><p class="small muted">'+L('项目团队成果 · 渠道数据分别呈现，不累加','Project team results · Channel metrics are presented separately')+'</p></div>';
  }
  function lenses(group='brand-lenses') {
    return '<section class="lens-section container"><div class="lens-heading"><p class="eyebrow">A POINT OF VIEW</p><h2>'+L('我如何看待一个项目。','How I look at a project.')+'</h2><p>'+L('选择一个视角，展开背后的判断。','Choose a perspective to explore the thinking behind the work.')+'</p></div><div class="lens-body">'+tabs(group,data.lenses)+panels(group,data.lenses,item=>'<h3>'+txt(item.title)+'</h3><p>'+txt(item.body)+'</p><div class="lens-project-links">'+item.projects.map(id=>{const p=data.projects.find(p=>p.id===id);return link('work/'+id,txt(p.subtitle));}).join('')+'</div>')+'</div></section>';
  }
  function home(){ return window.SPATIAL.renderHome({data,txt,L,url,image,escape,link,tabs,panels}); }
  function experience(){
    const associated=[['zerith-site','waic','grasp-challenge'],[],['chinese-doctors','cisce']];
    return '<div class="container"><header class="page-header">'+label('02','THE JOURNEY')+'<h1 class="page-title">'+L('每段经历，都留下些什么。','Every experience leaves something behind.')+'</h1><p class="lede">'+txt(data.profile.biography)+'</p></header><div class="career-layout"><nav class="career-index" aria-label="'+L('职业时间轴','Career timeline')+'">'+data.experience.map((e,i)=>'<a href="#career-'+i+'" data-section-jump><small>'+e.date+'</small><span>'+txt(e.company)+'</span></a>').join('')+'</nav><div>'+data.experience.map((e,i)=>'<details class="career-record" id="career-'+i+'" '+(i===0?'open':'')+'><summary><span>'+e.date+'</span><h2>'+txt(e.company)+'</h2><p>'+txt(e.role)+'</p><b aria-hidden="true">+</b></summary><div class="career-detail"><p>'+txt(e.description)+'</p><h3>'+L('相关作品与成果','Related work and outcomes')+'</h3>'+(associated[i].length?associated[i].map(id=>{const p=data.projects.find(p=>p.id===id);return '<a class="career-project" href="'+url('work/'+id)+'"><strong>'+txt(p.subtitle)+'</strong><span>'+p.facts.slice(0,2).map(f=>escape(f.value)+' '+txt(f.label)).join(' / ')+'</span><i>↗</i></a>';}).join(''):'<p class="muted">'+L('该阶段具体项目与成果资料待补充。','Specific projects and evidence for this period are pending.')+'</p>')+'</div></details>').join('')+'</div></div><section class="capability-index"><p class="eyebrow">THE EVIDENCE INDEX</p><h2>'+L('从一个视角，进入真实案例。','Follow a perspective into real work.')+'</h2><div>'+[['strategy','品牌与策略','Brand & strategy'],['content','创意与传播','Creative campaigns'],['experience','体验与现场','Experience & events'],['concept','未来的想法','Ideas taking shape']].map(([id,zh,en])=>'<a href="'+url('work')+'" data-capability="'+id+'">'+L(zh,en)+' ↗</a>').join('')+'</div></section><p class="status-note">'+L('公开版中英文简历及任职日期核对仍待完成，暂不提供含私人信息的原始简历。','Public bilingual résumés and employment-date verification remain pending. Original files containing private details are not offered for download.')+'</p></div>';
  }
  function aboutPersonal(){return '<section class="personal-prompts container"><p class="eyebrow">THE CURIOUS / THE PERSONAL</p><h2>'+L('职业之外，留一个真实的位置。','A real place beyond the profession.')+'</h2><p>'+L('生活照片与个人故事尚未补齐。以下为内容提问，等待真实回答，不作为已确认的个人兴趣。','Personal photographs and stories are pending. These are editorial prompts awaiting real answers, not confirmed personal interests.')+'</p>'+[L('最近改变我看法的一件事','Something that recently changed my mind'),L('一个我反复回看的作品','A work I keep returning to'),L('一个日常里值得记下的发现','An everyday discovery worth keeping')].map(q=>'<details><summary>'+q+'</summary><p>'+L('待本人填写真实故事。','Awaiting a real personal story.')+'</p></details>').join('')+'</section>';}
  function archive(noteId){ return noteId?previousArchive(noteId):window.SPATIAL.renderArchive({data,txt,L,url,image,escape,link,tabs,panels}); }
  function work(){ return window.SPATIAL.renderWork({data,txt,L,url,image,escape,link,tabs,panels},filter); }
  function casePage(project) { return window.CURATED.renderCase(project,{data,txt,L,url,image,escape,link,tabs,panels}); }
  function about(){ return window.SPATIAL.renderAbout({data,txt,L,url,image,escape,link,tabs,panels}); }
  function previousArchive(noteId) {
    const note=data.notes.find(n=>n.id===noteId);
    if(noteId&&!note) return notFound();
    if(note) return `<article class="container note-page"><header class="page-header">${link('archive',L('返回档案','Back to archive'))}${label('NOTE',txt(note.tag))}<h1 class="page-title">${txt(note.title)}</h1></header><div class="prose note-body"><p>${txt(note.body)}</p><p class="status-note">${L('本篇为官网编辑草稿，用于展示观点栏目形式；待本人确认后发布。','This is an editorial draft demonstrating the notes format. It awaits personal approval before publication.')}</p></div></article>`;
    return `<div class="container"><header class="page-header">${label('04','THE OPEN ARCHIVE')}<h1 class="page-title">${L('观察与笔记','Notes & observations')}</h1><p class="lede">${L('观察、片段与正在形成的观点。让作品之外，也有思考的空间。','Observations, fragments and ideas taking shape. A space for thinking beyond finished work.')}</p></header><div class="archive-grid">${data.notes.map((n,i)=>`<a class="archive-item note-card" href="${url(`archive/${n.id}`)}"><div class="note-art note-art-${i}" aria-hidden="true"><span>${['?','↗','◌'][i]}</span><small>FIELD NOTE / 0${i+1}</small></div><p class="eyebrow">${txt(n.tag)}</p><h2>${txt(n.title)}</h2><span class="button--text">${L('阅读片段','Read the note')} ↗</span></a>`).join('')}</div><section class="archive-reference"><div>${label('VISUAL',L('材料观察','MATERIAL STUDY'))}<h2>${L('日常，就是体验发生的地方。','The everyday is where experience happens.')}</h2><p>${L('本机项目资料中的机器人小店图片。此处为材料参考，拍摄者与本人参与边界尚待确认。','A robot-store image found in local project materials. Shown as a material reference; photography credit and my involvement remain to be confirmed.')}</p></div><figure>${image('assets/robot-store.jpeg',L('上海宝山海上世界机器人小店，来自本机项目资料','Robot store in Shanghai Baoshan, from local project materials'))}<figcaption>${L('材料参考 · 非本人摄影声明','Material reference · No personal photography credit claimed')}</figcaption></figure></section></div>`;
  }
  function contact() {
    return `<div class="container"><header class="page-header contact-header"><h1 class="page-title">${L('联系与合作','Contact & collaboration')}</h1><p class="lede">${L('品牌策划、整合营销，或一个需要推进的项目。','Brand planning, an integrated campaign, or a project to move forward.')}</p></header><div class="split-layout contact-layout"><section class="contact-block"><h2>${L('直接发邮件给我','Email me directly')}</h2><a class="contact-email" href="mailto:${escape(data.profile.email)}">${escape(data.profile.email)} ↗</a><button class="button button--text" data-copy-email>${L('复制邮箱','Copy email')}</button><div class="contact-links"><span>${L('品牌与内容策划','Brand & content planning')}</span><span>${L('整合营销与线下体验','Integrated campaigns & on-site experiences')}</span><span>${L('项目统筹与团队协作','Project coordination & collaboration')}</span></div></section><section class="contact-message"><h2>${L('从具体的问题开始聊。','Start with a specific question.')}</h2><p>${L('如果是职位交流，可以附上岗位介绍与团队背景；如果是项目合作，可以告诉我目标、时间与需要解决的问题。','For a role, include the job description and team context. For a project, share the goal, timing and problem you want to solve.')}</p><p>${L('我会通过邮件与你继续沟通。','We can continue the conversation by email.')}</p></section></div></div>`;
  }
  function notFound() { return `<div class="container"><header class="page-header">${label('404','A DIFFERENT DIRECTION')}<h1 class="page-title">${L('这条路，<br>还没有作品。','Nothing here.<br>Let’s try another way.')}</h1>${link('work',L('返回作品','Back to work'),'button button--primary')}</header></div>`; }
  function route() {
    const parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
    if(!['zh','en'].includes(parts[0])) {
      const preferred=saved('portfolio-language')==='en'?'en':'zh';
      history.replaceState(null,'',`#/${preferred}/home`);
      parts.splice(0,parts.length,preferred,'home');
    }
    lang=parts.shift(); page=parts.join('/')||'home'; save('portfolio-language',lang);
    const [root,id]=page.split('/');
    window.SPATIAL?.dispose();document.body.dataset.view=root;document.documentElement.lang=lang==='zh'?'zh-CN':'en';
    if(dialog.open) dialog.close();
    chrome();
    let html;
    if(page==='home') html=home();
    else if(page==='work') html=work();
    else if(root==='work'&&id&&page.split('/').length===2) {const p=data.projects.find(p=>p.id===id); html=p?casePage(p):notFound();}
    else if(page==='experience') html=experience();
    else if(page==='about') html=about();
    else if(root==='archive'&&page.split('/').length<=2) html=archive(id);
    else if(page==='contact') html=contact();
    else html=notFound();
    app.innerHTML=html;
    frame=0;
    window.PORTFOLIO_INTERACTIONS?.mount({paused:still});window.EXHIBITION?.mount();
    window.CURATED.mount();window.SPATIAL.mount({paused:still});
    const title=app.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim()||'Ideas, Made Real.';
    document.title=`${title} — ${t(data.profile.name)} · Creative Strategist`;
    document.querySelector('meta[name="description"]').content=t(data.profile.intro);
    document.querySelector('.skip-link').textContent=L('跳至主要内容','Skip to main content');
    window.scrollTo({top:0,behavior:'instant'});
    document.querySelector('#main').focus({preventScroll:true});
  }
  function toast(message) { const el=document.querySelector('#toast'); el.textContent=message; clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.textContent='',3500); }
  function openImage(id) {
    const p=data.projects.find(p=>p.id===id); if(!p)return;
    dialog.querySelector('.modal-body').innerHTML=`${image(p.image,t(p.mediaCaption),'',true)}<p>${txt(p.mediaCaption)}</p>`;
    dialog.querySelector('.modal-close').setAttribute('aria-label',L('关闭图片','Close image'));
    dialog.setAttribute('aria-label',t(p.subtitle));
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-scroll-projects]')) {event.preventDefault();document.querySelector('#selected-projects')?.scrollIntoView({behavior:still||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
    if(event.target.closest('.skip-link')) {event.preventDefault();document.querySelector('#main').focus({preventScroll:false});return;}
    const button=event.target.closest('button');
    if(button?.matches('[data-language]')){window.SPATIAL?.preserveLanguageVisit();location.hash=`#/${lang==='zh'?'en':'zh'}/${page}`;}
    if(button?.matches('.menu-toggle')) {
      const expanded=button.getAttribute('aria-expanded')!=='true';
      button.setAttribute('aria-expanded',String(expanded));
      button.setAttribute('aria-label',expanded?L('关闭导航','Close navigation'):L('打开导航','Open navigation'));
      const nav=document.querySelector('#mobile-nav'); nav.hidden=!expanded; nav.classList.toggle('is-open',expanded);
    }
    if(event.target.closest('#mobile-nav a')) { const nav=document.querySelector('#mobile-nav'); nav.hidden=true;nav.classList.remove('is-open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false'); }
    if(button?.matches('[data-motion]')) {still=!still;window.SPATIAL?.setPaused(still);window.PORTFOLIO_INTERACTIONS?.setPaused(still);save('portfolio-still',String(still));document.body.classList.toggle('motion-off',still);button.setAttribute('aria-pressed',String(still));button.textContent=still?L('动态：已暂停','Motion: paused'):L('动态：开启','Motion: on');}
    if(button?.matches('[data-next-frame]')) {
      frame=(frame+1)%3;const p=data.projects[frame], el=document.querySelector('[data-frame]');
      el.querySelector('img').src=p.image;el.querySelector('img').alt=t(p.subtitle);
      el.querySelector('figcaption>span').textContent=`0${frame+1} / 03 · ${[L('官网项目截图','Website project capture'),L('参观路径示意 · 非现场照片','Visitor diagram · Not event photography'),L('原作品集活动拼图','Original portfolio montage')][frame]}`;
    }
    if(event.target.closest('[data-capability]'))filter=event.target.closest('[data-capability]').dataset.capability;
    if(button?.matches('[data-work-view]'))workView=button.dataset.workView;
    if(button?.matches('[data-filter]')) {filter=button.dataset.filter;app.innerHTML=work();window.PORTFOLIO_INTERACTIONS?.mount({paused:still});window.EXHIBITION?.mount();app.querySelector(`[data-filter="${filter}"]`).focus({preventScroll:true});}
    if(button?.matches('[data-zoom]'))openImage(button.dataset.zoom);
    if(button?.matches('.modal-close'))dialog.close();
    if(button?.matches('[data-copy-email]')) {
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(data.profile.email).then(()=>toast(L('邮箱已复制','Email copied'))).catch(()=>toast(L('请手动选择并复制页面上的邮箱','Please select and copy the email on the page')));
      else toast(L('请手动选择并复制页面上的邮箱','Please select and copy the email on the page'));
    }
  });
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const nav=document.querySelector('#mobile-nav');if(nav&&!nav.hidden){nav.hidden=true;nav.classList.remove('is-open');const b=document.querySelector('.menu-toggle');b.setAttribute('aria-expanded','false');b.setAttribute('aria-label',L('打开导航','Open navigation'));b.focus();}}});
  document.addEventListener('submit',event=>{
    if(event.target.id!=='brief-form')return;
    event.preventDefault();const fields=new FormData(event.target);
    const body=`Ideas, Made Real. / ${L('合作意向','Collaboration brief')}\n\n${L('称呼','Name')}: ${fields.get('name')}\n${L('主题','Topic')}: ${fields.get('topic')}\n\n${fields.get('message')}\n\n${L('此文件保存在你的设备上，尚未发送给王楚筠。','This file is saved on your device and has not been sent to Zoie Wong.')}\n`;
    const blob=new Blob(['\ufeff'+body],{type:'text/plain;charset=utf-8'}), objectURL=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=objectURL;a.download='creative-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(objectURL),1000);toast(L('合作意向已保存到下载文件，尚未发送','Brief downloaded. It has not been sent.'));
  });
  document.addEventListener('pointermove',event=>{const scene=document.querySelector('.idea-object');if(!scene||still||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=scene.parentElement.getBoundingClientRect();if(event.clientY<r.top||event.clientY>r.bottom)return;scene.style.setProperty('--move-x',`${(event.clientX/innerWidth-.5)*14}px`);scene.style.setProperty('--move-y',`${((event.clientY-r.top)/r.height-.5)*10}px`);});
  window.addEventListener('hashchange',route);
  route();
})();

