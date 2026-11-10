(() => {
  'use strict';
  const C=window.CURATION;
  function context(h){
    const {data,txt,L,url,image,escape,link,tabs,panels}=h;
    const p=id=>data.projects.find(p=>p.id===id);
    const facts=(project,limit=3)=>`<dl class="curated-facts">${project.facts.slice(0,limit).map(f=>`<div><dt>${txt(f.label)}</dt><dd>${escape(f.value)}</dd></div>`).join('')}</dl>`;
    const title=id=>txt(C.headings[id]||p(id).subtitle);
    // Crop only the browser viewport. Original rasters remain intact in the lightbox.
    const visual=(project,detail=false,eager=false)=>{
      const crops={'cisce':[683,276,606,274,1290,834],'chinese-doctors':[220,325,550,219,1077,561]};
      const crop=detail&&crops[project.id];
      if(!crop)return image(project.image,txt(project.mediaCaption),'',eager);
      return `<svg class="detail-photo" viewBox="${crop.slice(0,4).join(' ')}" role="img" aria-label="${L('原作品集照片局部：','Detail from the original portfolio: ')}${txt(project.subtitle)}" preserveAspectRatio="xMidYMid slice"><image href="${escape(project.image)}" width="${crop[4]}" height="${crop[5]}"/></svg>`;
    };
    const chapter=(n,zh,en)=>`<p class="curated-kicker">${n} <span>${L(zh,en)}</span></p>`;
    const shot=(project,cls='',eager=false,detail=false)=>`<figure class="curated-shot ${cls}"><button data-zoom="${project.id}" aria-label="${L('放大查看完整原图：','View the full original: ')}${txt(project.subtitle)}">${visual(project,detail,eager)}<span class="curated-zoom" aria-hidden="true">↗</span></button>${cls==='case-opening-shot'?'':`<figcaption>${detail?L('原作品集照片局部 · 点击查看完整资料','Detail from the original portfolio · Open the full source'):txt(project.mediaCaption)}</figcaption>`}</figure>`;
    const projectLink=project=>link('work/'+project.id,L('阅读完整案例','Read the case'),'curated-link');
    const evidence=project=>`<details class="curated-source"><summary>${L('资料与署名','Sources & credits')}</summary><p>${txt(project.evidence)}</p></details>`;
    const audience=group=>`<div class="audience-demo">${tabs(group,C.audience)}${panels(group,C.audience,(item,i)=>`<div class="audience-path" aria-hidden="true"><span ${i===0?'class="is-current"':''}>01 / ${L('产品中心','Products')}</span><i>→</i><span ${i===1?'class="is-current"':''}>02 / ${L('解决方案','Solutions')}</span><i>→</i><span ${i===2?'class="is-current"':''}>03 / ${L('合作入口','Contact')}</span></div><h3>${txt(item.title)}</h3><p>${txt(item.body)}</p>`)}<small>${L('依据官网内容整理的阅读示意','Reading diagram based on the website content')}</small></div>`;
    const film=group=>`<div class="campaign-touchpoints">${tabs(group,p('chinese-doctors').touchpoints)}${panels(group,p('chinese-doctors').touchpoints,item=>`<div class="campaign-stat"><strong>${escape(item.value)}</strong><span>${txt(item.unit)}</span></div><p>${txt(item.body)}</p>`)}<small>${L('项目渠道记录 · 各渠道分别呈现','Campaign channel records · Reported separately')}</small></div>`;
    const orders=()=>`<div class="order-record"><div class="order-record-head"><span>${L('四日小店订单','Store orders across four days')}</span><strong>623 <small>${L('单','orders')}</small></strong></div><div class="order-bars">${C.orders.map((n,i)=>`<button data-order-day="${i}" aria-pressed="${i===0}" style="--bar:${n/247*100}%"><span>${L('第','DAY ')}${i+1}${L('日','')}</span><i><b></b></i><strong>${n}</strong></button>`).join('')}</div><p data-order-reading aria-live="polite">${L('第1日完成125单。四日合计623单，为会期团队项目记录。','125 orders on day 1. The four-day total of 623 is an on-site team project record.')}</p><small>${L('依据 WAIC 项目复盘 · 订单不等同于独立客户或转化','Source: WAIC retrospective · Orders are not unique customers or conversions')}</small></div>`;
    const visit=group=>`<div class="visitor-path">${tabs(group,p('waic').journey)}${panels(group,p('waic').journey,(item,i)=>`<div class="visitor-step"><span>0${i+1}</span><div><h3>${txt(item.title)}</h3><p>${txt(item.body)}</p></div></div>`)}<small>${L('依据复盘整理的参观路径示意 · 非现场影像','Visitor-path diagram based on the retrospective · Not event footage')}</small></div>`;
    return {p,facts,title,chapter,shot,visual,projectLink,evidence,audience,film,orders,visit};
  }
  function renderHome(h){
    const {data,txt,L,url,escape,link}=h;
    const {p,visual}=context(h);
    const feature=p('cisce'),website=p('zerith-site'),campaign=p('chinese-doctors');
    const entry=(project,kind,title,description)=>      `<article class="home-work-card"><a href="${url('work/'+project.id)}" class="home-work-image home-work-image--${kind}" aria-label="${L('阅读案例：','Read case: ')}${title}">${visual(project,kind==='film')}<span class="home-image-arrow" aria-hidden="true">↗</span></a><div class="home-work-caption"><div><h3><a href="${url('work/'+project.id)}">${title}</a></h3><p>${description}</p></div><span>${escape(project.year)}</span></div></article>`;
    return `<div class="home-edit container">
      <header class="home-edit-intro"><div><p class="home-eyebrow">CREATIVE STRATEGIST</p><h1><span>${escape(C.home.headline.lead)}</span> <em>${escape(C.home.headline.finish)}</em></h1></div><div class="home-edit-aside"><h2 class="home-tagline">${txt(C.home.tagline).replace('，','，<br>')}</h2><p class="home-identity">${txt(C.home.identity)}</p><div class="home-intro-links">${link('work',L('浏览作品','Explore work'),'home-text-link')}${link('about',L('关于我','About me'),'home-text-link')}</div></div></header>
      <figure class="home-feature"><a class="home-feature-image" href="${url('work/'+feature.id)}" aria-label="${L('阅读链博会案例','Read the CISCE case')}">${visual(feature,true,true)}<span class="home-feature-open">${L('查看案例','View case')} ↗</span></a><figcaption><span>${txt(C.home.featureCaption)}</span><span>${escape(feature.year)}</span></figcaption></figure>
      <section class="home-selected" id="selected-projects"><div class="home-selected-heading"><h2>${L('精选作品','Selected work')}</h2>${link('work',L('全部作品','All work'),'home-text-link')}</div><div class="home-work-grid">${entry(website,'website',txt(C.home.websiteTitle),txt(C.home.websiteCaption))}${entry(campaign,'film',txt(C.home.filmTitle),txt(C.home.filmCaption))}</div></section>
      <section class="home-closing"><div><p class="home-eyebrow">${L('继续了解','EXPLORE FURTHER')}</p><div class="home-background-links">${link('experience',L('工作经历','Experience'),'home-text-link')}${link('archive',L('教育与荣誉','Education & honors'),'home-text-link')}</div></div><div class="home-connect"><p>${L('聊聊下一个项目。','A conversation, a new possibility.')}</p>${link('contact',L('联系我','Get in touch'),'home-text-link')}</div></section>
    </div>`;
  }
  function renderCase(project,h){
    const {data,txt,L,escape,link}=h;
    const {facts,shot,evidence,audience,film,orders,visit}=context(h);
    const ordered=[...(data.portfolio?.order||data.projects.map(p=>p.id)),...(data.portfolio?.proposals||[]),...(data.portfolio?.supporting||[])].map(id=>data.projects.find(p=>p.id===id)).filter(Boolean);
    const next=ordered[(ordered.indexOf(project)+1)%ordered.length];
    const specialised=project.id==='zerith-site'?audience('case-audience'):project.id==='chinese-doctors'?film('case-film'):project.id==='waic'?`<div class="case-waic-tools">${visit('case-visit')}${orders()}</div>`:'';
    return `<article class="curated-case container">
      <header class="curated-case-header">${link('work',L('全部作品','All work'),'curated-link')}${project.kind==='proposal'?`<p class="case-status">${L('策划提案 · 尚未实施','Campaign proposal · Not implemented')}</p>`:''}<h1>${txt(project.subtitle)}</h1><p class="curated-case-summary">${txt(project.summary)}</p><p class="case-responsibility">${txt(project.contribution)}</p></header>
      ${shot(project,'case-opening-shot',true)}
      <div class="curated-case-layout"><nav class="curated-case-index" aria-label="${L('案例阅读目录','Case reading index')}">${project.sections.map((s,i)=>`<a href="#case-section-${i}" data-section-jump><span>0${i+1}</span>${txt(s.title).replace(/^0\d\s*\/\s*/,'')}</a>`).join('')}</nav><div class="curated-case-content">
        ${project.sections.map((s,i)=>`<section class="curated-case-chapter ${i===0?'case-question':i===4&&project.kind==='delivered'?'case-outcome':''}" id="case-section-${i}"><h2 class="case-chapter-title">${txt(s.title)}</h2><p>${txt(s.body)}</p>${i===2?specialised:''}${i===4&&project.facts.length?facts(project):''}</section>`).join('')}${evidence(project)}
      </div></div><nav class="curated-case-next"><span>${L('下一项实践','NEXT PRACTICE')}</span>${link('work/'+next.id,txt(next.subtitle),'curated-link')}</nav>
    </article>`;
  }
  document.addEventListener('click',e=>{
    const day=e.target.closest('[data-order-day]');if(!day)return;
    const root=day.closest('.order-record'),index=Number(day.dataset.orderDay),zh=document.documentElement.lang.startsWith('zh');
    root.querySelectorAll('[data-order-day]').forEach(b=>b.setAttribute('aria-pressed',String(b===day)));
    root.querySelector('[data-order-reading]').textContent=zh?`第${index+1}日完成${C.orders[index]}单。四日合计623单，为会期团队项目记录。`:`${C.orders[index]} orders on day ${index+1}. The four-day total of 623 is an on-site team project record.`;
  });
  let observer;
  function mount(){
    observer?.disconnect();
    if(!('IntersectionObserver' in window))return;
    const links=[...document.querySelectorAll('.curated-case-index a')];if(!links.length)return;
    const chapters=[...document.querySelectorAll('.curated-case-chapter')];
    observer=new IntersectionObserver(()=>{const visible=chapters.find(s=>{const r=s.getBoundingClientRect();return r.top<innerHeight*.45&&r.bottom>110;});for(const a of links){const active=!!visible&&a.getAttribute('href')==='#'+visible.id;a.classList.toggle('is-current',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}},{rootMargin:'-110px 0px -55% 0px'});
    chapters.forEach(s=>observer.observe(s));
  }
  window.CURATED={renderHome,renderCase,mount};
})();
