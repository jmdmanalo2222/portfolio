'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const paths = {
    folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 9h18"/>',
    briefcase:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M8 6V3h8v3M3 11l9 4 9-4m-9 4v3"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    terminal:'<rect x="2" y="3" width="20" height="18" rx="3"/><path d="m6 8 4 4-4 4m7 0h5"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    expand:'<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
    'arrow-left':'<path d="M20 12H4m6-6-6 6 6 6"/>',
    'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    'arrow-up-right':'<path d="M6 18 18 6M6 6h12v12"/>',
    split:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M7 9l-2 3 2 3M17 9l2 3-2 3"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18m-13 5 2 2 5-5"/>',
    sliders:'<path d="M4 6h4m5 0h7M4 12h10m5 0h1M4 18h3m5 0h8"/><circle cx="10.5" cy="6" r="2.5"/><circle cx="16.5" cy="12" r="2.5"/><circle cx="9.5" cy="18" r="2.5"/>',
    cube:'<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 9 9-4M12 12 3 8m9 4v10M7.5 5.5l9 5"/>',
    chart:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 17v-4M12 17V7M17 17V10"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5m-14-9 2-3 3 1 2-3"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minimize:'<path d="M5 17h14"/>',
    maximize:'<rect x="5" y="5" width="14" height="14" rx="1"/>',
    restore:'<path d="M9 5V3h12v12h-2"/><rect x="3" y="9" width="12" height="12" rx="1"/>',
    desktop:'<rect x="3" y="4" width="18" height="15" rx="2"/><path d="M3 15h18m-9 4v3m-4 0h8"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
    monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 22h8m-4-5v5"/>',
    phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-3 14h2"/>',
    linkedin:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7m0-10v.1M11 17v-7m0 3a3 3 0 0 1 6 0v4"/>',
    github:'<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.5 6 4.3 4.3 0 0 0 18.4 3s-1-.3-3.4 1.3a11.7 11.7 0 0 0-6 0C6.6 2.7 5.6 3 5.6 3A4.3 4.3 0 0 0 5.5 6a4.7 4.7 0 0 0-1.2 3.3c0 4.7 2.8 5.7 5.5 6A3 3 0 0 0 9 17.6V22"/>',
    whatsapp:'<path d="M21 11.5a9 9 0 0 1-13.3 8L3 21l1.5-4.7A9 9 0 1 1 21 11.5Z"/><path d="m8 7 2 3-1 1a8 8 0 0 0 4 4l1-1 3 2c-2 4-11-2-10-7l1-2Z"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
  const demos = [
    {id:'redesign',name:'Website redesign comparison',icon:'split'},
    {id:'booking',name:'Appointment booking',icon:'calendar'},
    {id:'quote',name:'Quote calculator',icon:'sliders'},
    {id:'product',name:'Product configurator',icon:'cube'},
    {id:'dashboard',name:'Business dashboard',icon:'chart'},
    {id:'seo',name:'SEO and performance',icon:'search'}
  ];
  const desktopApps=[...window.WorkspaceBusiness.apps,...demos];
  function artwork(id) {
    switch (id) {
      case 'redesign': return '<div class="mini-window"><div class="mini-bar"><i></i><i></i><i></i></div><div class="comparison"><div><i class="comparison-line wide"></i><i class="comparison-line"></i><i class="comparison-line"></i><i class="comparison-line"></i><i class="comparison-line"></i></div><div><i class="comparison-line bright"></i><i class="comparison-line"></i><i class="comparison-line"></i><i class="comparison-line accent"></i></div><span class="comparison-divider"></span></div></div>';
      case 'booking': return `<div class="calendar-mock"><div class="calendar-top"><i></i><i></i></div><div class="calendar-cells">${'<i></i>'.repeat(28)}</div><div class="calendar-pop"><i></i><i></i></div></div>`;
      case 'quote': return '<div class="quote-mock"><div class="quote-row"><i class="checked"></i><i></i><i></i></div><div class="quote-row"><i class="checked"></i><i></i><i></i></div><div class="quote-row"><i></i><i></i><i></i></div><div class="quote-total"><i></i><i></i></div></div>';
      case 'product': return '<div class="product-mock"><div class="product-bottle"></div><div class="product-options"><i></i><i></i><i></i><div class="swatches"><i></i><i></i><i></i></div></div></div>';
      case 'dashboard': return '<div class="dashboard-mock"><div class="dashboard-nav"><i></i><i></i><i></i><i></i><i></i></div><div class="dashboard-body"><div class="dashboard-stats"><i></i><i></i><i></i></div><div class="dashboard-chart"><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>';
      case 'seo': return '<div class="seo-mock"><div class="seo-gauge"><span class="seo-needle"></span><span class="seo-dot"></span></div><div class="seo-lines"><i></i><i></i><i></i></div></div>';
      default: return '';
    }
  }
  function card(demo,index) {
    return `<button class="demo-card" data-demo="${demo.id}" aria-label="Open ${demo.name}"><div class="tile-art tile-${demo.id}" aria-hidden="true">${artwork(demo.id)}</div><span class="tile-footer" aria-hidden="true">${icon(demo.icon)}<span class="tile-arrow">${icon('arrow-up-right')}</span></span><span class="shelf-marker" aria-hidden="true"></span></button>`;
  }
  const monitorContent = $('#monitor-content');
  const page = $('#screen-page');
  const opener = $('#monitor-open');
  const desktop = $('#monitor-desktop');
  const desktopPlane = $('#desktop-plane');
  const shortcuts = $('#desktop-icons');
  const deviceDialog = $('#device-dialog');
  const deviceStage = $('#device-stage');
  let deviceTransition = null;
  let deviceClosing = false;
  let activeDevice = null;
  const monitorDialog = $('#monitor-dialog');
  const frontScreen = $('#front-monitor-screen');
  const frontBody = $('#front-monitor-body');
  const roomEntry = $('#monitor-focus');
  const secondEntry = $('#studio-display-open');
  let monitorOrigin = desktop;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let monitorFocused = false;
  let monitorClosing = false;
  let monitorFocusReturn = roomEntry;
  let focusTransition = null;
  let appOpen = false;
  let appMinimized = false;
  let appMaximized = true;
  let windowPosition = {x:250,y:42};
  let windowDrag = null;
  let selected = null;
  let monitorReturnFocus = opener;
  let deviceReturnFocus = null;
  let activeCase=null,portfolioSection='',phoneTab='contacts';
  let monitorClosePromise=null,deviceClosePromise=null;
  let applyingRoute=false,navigationSerial=0,lastAppliedHash=location.hash;
  let unsubscribePortfolio=null;
  const routeForApp=id=>id==='work'?(activeCase?'work/'+activeCase:'work'):id==='inquiry'?'contact':demos.some(d=>d.id===id)?'demo/'+id:id;
  const currentMonitorRoute=()=>selected?routeForApp(selected):'demos';
  function recordRoute(route,replace=false){
    if(applyingRoute)return;
    const url=new URL(location.href);url.hash=route==='room'?'':route;
    if(url.href!==location.href)history[replace?'replaceState':'pushState']({workspace:route},'',url);
    lastAppliedHash=location.hash;
  }

  shortcuts.innerHTML=desktopApps.map((demo,index)=>`<button class="desktop-shortcut shortcut-${demo.id}" data-shortcut="${demo.id}" aria-label="Open ${demo.name}" aria-controls="monitor-content" aria-expanded="false"><span class="desktop-app-icon" aria-hidden="true">${icon(demo.icon)}<i class="shortcut-arrow">${icon('arrow-up-right')}</i></span><span class="desktop-shortcut-label">${demo.name}</span></button>`).join('');

  // One desktop surface is projected into the room, then moved into the front view.
  function quadMatrix(width,height,points) {
    const x=points.map(point=>point[0]),y=points.map(point=>point[1]);
    const dx1=x[1]-x[2],dx2=x[3]-x[2],dx3=x[0]-x[1]+x[2]-x[3];
    const dy1=y[1]-y[2],dy2=y[3]-y[2],dy3=y[0]-y[1]+y[2]-y[3];
    const determinant=dx1*dy2-dx2*dy1;
    if(!width||!height||!determinant)return null;
    const g=(dx3*dy2-dx2*dy3)/determinant;
    const h=(dx1*dy3-dx3*dy1)/determinant;
    const a=x[1]-x[0]+g*x[1],b=x[3]-x[0]+h*x[3];
    const d=y[1]-y[0]+g*y[1],e=y[3]-y[0]+h*y[3];
    return `matrix3d(${[a/width,d/width,0,g/width,b/height,e/height,0,h/height,0,0,1,0,x[0],y[0],0,1].join(',')})`;
  }
  function roomCorners() {
    const native=document.body.classList.contains('room-native');
    const projected=window.WorkspaceViewpoint?.corners(monitorOrigin,native?[[0,0],[1,0],[1,1],[0,1]]:[[0,.034],[1,0],[1,.801],[.002,1]]);
    if(projected)return projected;
    const r=monitorOrigin.getBoundingClientRect();
    return [[r.left,r.top+r.height*.034],[r.right,r.top],[r.right,r.top+r.height*.801],[r.left+r.width*.002,r.bottom]];
  }
  function fitDesktop() {
    const r=(monitorFocused?frontScreen:desktop).getBoundingClientRect();
    const host=monitorFocused?frontScreen:desktop;
    const width=host.clientWidth||r.width;
    const height=host.clientHeight||r.height;
    if(!width||!height)return;
    const corners=monitorFocused||document.body.classList.contains('room-native')?[[0,0],[width,0],[width,height],[0,height]]:[[0,height*.034],[width,0],[width,height*.801],[width*.002,height]];
    const compact=monitorFocused&&(frontBody.dataset.display==='secondary'||(window.innerWidth<=650&&window.innerHeight>window.innerWidth));
    const virtualWidth=compact?480:1000,virtualHeight=compact?480*height/width:562.5;
    desktopPlane.dataset.compact=String(compact);
    desktopPlane.style.width=virtualWidth+'px';desktopPlane.style.height=virtualHeight+'px';
    const matrix=quadMatrix(virtualWidth,virtualHeight,corners);
    if(matrix){desktopPlane.style.transform=matrix;desktopPlane.classList.add('is-ready');}
  }
  if(typeof ResizeObserver==='function'){
    const observer=new ResizeObserver(fitDesktop);observer.observe(desktop);observer.observe(frontScreen);
  }else window.addEventListener('resize',fitDesktop);
  fitDesktop();
  function entryTransform(corners,element=frontBody) {
    const r=element.getBoundingClientRect();
    return quadMatrix(r.width,r.height,corners.map(([x,y])=>[x-r.left,y-r.top]));
  }
  function setDesktopAccess(active) {
    desktopPlane.inert=!active;desktopPlane.toggleAttribute('inert',!active);
    if(active)desktopPlane.removeAttribute('aria-hidden');else desktopPlane.setAttribute('aria-hidden','true');
  }
  function openFocusedMonitor(trigger=roomEntry) {
    if(monitorDialog.open||monitorClosing)return;
    monitorOrigin=trigger.closest('[data-monitor-origin="secondary"]')||desktop;
    const source=roomCorners();monitorFocusReturn=trigger;focusDevice('monitor');
    const portrait=monitorOrigin!==desktop;frontBody.dataset.display=portrait?'secondary':'primary';frontBody.parentElement.dataset.display=frontBody.dataset.display;if(portrait)appMaximized=true;
    monitorFocused=true;desktopPlane.classList.add('is-focused');setDesktopAccess(true);
    frontScreen.append(desktopPlane);monitorDialog.showModal();fitDesktop();
    (monitorOrigin===desktop?roomEntry:secondEntry)?.setAttribute('aria-expanded','true');
    frontBody.dataset.display=monitorOrigin===desktop?'primary':'secondary';
    $('#focused-monitor-title').textContent=monitorOrigin===desktop?'Interactive desktop monitor':'Client Work on the portrait monitor';
    if(!reducedMotion.matches&&typeof frontBody.animate==='function'){
      const start=entryTransform(source);
      if(start)focusTransition=frontBody.animate([{transform:start,opacity:.65},{transform:'none',opacity:1}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
    if(appOpen&&!appMinimized)focusTitle();else shortcuts.querySelector('button')?.focus({preventScroll:true});
    $('#scene-status').textContent='Desktop monitor facing you. Work, services, inquiries, terminal, and six demos are ready.';
    recordRoute(appOpen&&!appMinimized?currentMonitorRoute():'desktop');
  }
  function closeFocusedMonitor() {
    if(monitorClosePromise)return monitorClosePromise;
    if(!monitorDialog.open)return Promise.resolve();
    monitorClosePromise=(async()=>{
    monitorClosing=true;focusTransition?.cancel();windowDrag=null;
    if(!reducedMotion.matches&&typeof frontBody.animate==='function'){
      const end=entryTransform(roomCorners());
      if(end){
        focusTransition=frontBody.animate([{transform:'none',opacity:1},{transform:end,opacity:.25}],{duration:390,easing:'cubic-bezier(.4,0,.7,.3)'});
        try{await focusTransition.finished;}catch{}
      }
    }
    focusTransition?.cancel();desktop.insertBefore(desktopPlane,roomEntry);
    monitorFocused=false;desktopPlane.classList.remove('is-focused');setDesktopAccess(false);
    monitorDialog.close();fitDesktop();roomEntry.setAttribute('aria-expanded','false');secondEntry?.setAttribute('aria-expanded','false');
    monitorFocusReturn.focus({preventScroll:true});monitorClosing=false;
    $('#scene-status').textContent='Returned to the room. Your desktop state is preserved.';
    recordRoute('room');
    })().finally(()=>{monitorClosePromise=null;});
    return monitorClosePromise;
  }
  function updateWindowState() {
    const visible=appOpen&&!appMinimized;
    monitorContent.hidden=!visible;shortcuts.hidden=false;
    opener.setAttribute('aria-expanded',String(visible));
    const running=$('#taskbar-projects');running.hidden=!appOpen;
    running.setAttribute('aria-expanded',String(visible));
    running.setAttribute('aria-label',visible?'Minimize project window':'Restore project window');
    $$('[data-shortcut]').forEach(button=>button.setAttribute('aria-expanded',String(visible&&button.dataset.shortcut===selected)));
    monitorContent.classList.toggle('is-maximized',appMaximized);
    $('#maximize-project').setAttribute('aria-pressed',String(appMaximized));
    $('#maximize-project').setAttribute('aria-label',appMaximized?'Restore project window size':'Maximize project window');
    $('#maximize-project span').innerHTML=icon(appMaximized?'restore':'maximize');
    const demo=desktopApps.find(item=>item.id===selected);
    $('#window-app-icon').innerHTML=icon(demo?.icon||'grid');
  }
  function positionWindow(x,y) {
    const width=monitorContent.offsetWidth||720,height=monitorContent.offsetHeight||430;
    const taskbarHeight=$('.desktop-taskbar').offsetHeight||40;
    windowPosition={x:Math.max(0,Math.min((parseFloat(desktopPlane.style.width)||1000)-width,x)),y:Math.max(0,Math.min((parseFloat(desktopPlane.style.height)||562.5)-taskbarHeight-height,y))};
    monitorContent.style.setProperty('--window-x',windowPosition.x+'px');
    monitorContent.style.setProperty('--window-y',windowPosition.y+'px');
  }
  positionWindow(windowPosition.x,windowPosition.y);
  function updateControls() {
    const isDemo=demos.some(d=>d.id===selected);
    $$('.step-button').forEach(button=>button.hidden=!isDemo);
    $('#position-dots').hidden=Boolean(selected&&!isDemo);
    $('#window-share').hidden=!selected;
    $('#window-status').textContent=desktopApps.find(d=>d.id===selected)?.name||'Apps & playground';
    $('#position-dots').innerHTML=demos.map((demo,i)=>`<button class="position-dot ${selected===demo.id?'active':''}" data-dot="${demo.id}" aria-label="Show demo ${i+1}: ${demo.name}" aria-pressed="${selected===demo.id}"></button>`).join('');
    updateWindowState();
  }
  function focusTitle() { $('#showcase-title')?.focus({preventScroll:true}); }
  function reveal() { page.scrollTop=0;page.classList.remove('enter');void page.offsetWidth;page.classList.add('enter'); }
  function renderShelf(focusCard=null) {
    selected=null;activeCase=null;$('#window-share-status').textContent='';
    page.innerHTML=`<h2 id="showcase-title" class="sr-only" tabindex="-1">Workspace apps and six interactive demos</h2><div class="shelf-business-apps">${window.WorkspaceBusiness.apps.map(app=>`<button data-shortcut="${app.id}" class="shelf-app-link" aria-label="Open ${app.name}"><span>${icon(app.icon)}</span><strong>${app.name}</strong><small>${app.caption}</small></button>`).join('')}</div><div class="shelf-grid">${demos.map(card).join('')}</div>`;
    updateControls();reveal();recordRoute('demos');
    const focusTarget=focusCard?(page.querySelector(`[data-demo="${focusCard}"]`)||page.querySelector(`[data-shortcut="${focusCard}"]`)):null;
    if(focusTarget)focusTarget.focus({preventScroll:true});else focusTitle();
  }
  function renderDetail(id,options={}) {
    const demo=desktopApps.find(item=>item.id===id);
    if(!demo)return;
    selected=id;activeCase=id==='work'?options.caseId||null:null;$('#window-share-status').textContent='';
    const isDemo=demos.some(item=>item.id===id);
    page.innerHTML=`<h2 id="showcase-title" class="sr-only" tabindex="-1">${demo.name}</h2>${isDemo?window.WorkspaceApps.render(id):window.WorkspaceBusiness.render(id,{caseId:activeCase})}`;
    if(isDemo)window.WorkspaceApps.mount(id,page);else window.WorkspaceBusiness.mount(id,page);
    updateControls();reveal();focusTitle();recordRoute(currentMonitorRoute());
  }
  function focusDevice(name) {
    document.body.dataset.focusDevice=name;
  }
  function openMonitor(id=null,trigger=opener,options={}) {
    if(!monitorFocused)openFocusedMonitor(trigger===opener?roomEntry:trigger);
    if(!appOpen)appMaximized=true;
    monitorReturnFocus=trigger;appOpen=true;appMinimized=false;
    id?renderDetail(id,options):renderShelf();
    $('#scene-status').textContent=id?`${desktopApps.find(demo=>demo.id===id).name} window open.`:'Workspace apps and six demos are available.';
  }
  function closeMonitor() {
    const closedApp=selected;
    appOpen=false;appMinimized=false;selected=null;updateWindowState();
    if(monitorFocused)(monitorReturnFocus?.isConnected?monitorReturnFocus:shortcuts.querySelector(`[data-shortcut="${closedApp}"]`)||opener).focus({preventScroll:true});
    $('#scene-status').textContent='Project window closed. Desktop icons are ready.';recordRoute('desktop');
  }
  function minimizeWindow() {
    if(!appOpen)return;
    appMinimized=true;updateWindowState();$('#taskbar-projects').focus({preventScroll:true});
    $('#scene-status').textContent='Project window minimized. Restore it from the taskbar.';recordRoute('desktop');
  }
  function restoreWindow() {
    if(!appOpen)return;
    appMinimized=false;updateWindowState();focusTitle();
    $('#scene-status').textContent='Project window restored.';recordRoute(currentMonitorRoute());
  }
  function toggleMaximize() {
    appMaximized=!appMaximized;updateWindowState();
  }
  function contactMarkup() {
    const destinations=window.WORKSPACE_CONTACTS||{};
    const contacts=[['linkedin','LinkedIn','linkedin.com'],['github','GitHub','github.com'],['whatsapp','WhatsApp','wa.me']];
    return contacts.map(([key,label,domain])=>{
      let url=null;
      try{const parsed=new URL(destinations[key]);if(parsed.protocol==='https:'&&(parsed.hostname===domain||parsed.hostname==='www.'+domain))url=parsed.href;}catch{}
      const content=`<span class="contact-logo">${icon(key)}</span><span class="contact-label">${label}${url?'':'<small>Coming soon</small>'}</span>${url?icon('arrow-up-right'):''}`;
      return url?`<a class="contact-route contact-${key}" href="${url.replaceAll('&','&amp;').replaceAll('"','&quot;')}" target="_blank" rel="noopener noreferrer" aria-label="Open Josh's ${label} in a new tab">${content}</a>`:`<div class="contact-route contact-pending" aria-label="${label} contact coming soon">${content}</div>`;
    }).join('');
  }
  function deviceRoomCorners(name) {
    const hardware=window.WorkspaceViewpoint?.deviceCorners?.(name);if(hardware)return hardware;
    const node=$('#'+(name==='phone'?'phone':'laptop')+'-open');
    const projected=window.WorkspaceViewpoint?.corners(node,name==='phone'?[[.03,.06],[.63,0],[1,.91],[.38,1]]:[[0,0],[1,0],[1.15,1.8],[.03,1.8]]);
    if(projected)return projected;
    const r=node.getBoundingClientRect();
    return name==='phone'?[[r.left+r.width*.03,r.top+r.height*.06],[r.left+r.width*.63,r.top],[r.right,r.top+r.height*.91],[r.left+r.width*.38,r.bottom]]:[[r.left,r.top],[r.right,r.top],[r.right+r.width*.15,r.top+r.height*1.8],[r.left+r.width*.03,r.top+r.height*1.8]];
  }
  function phoneMarkup(){
    return `<div class="phone-screen-header"><p class="device-eyebrow">LET’S CONNECT</p><h2 id="device-title" tabindex="-1">Josh Manalo</h2><div class="phone-tabs" role="group" aria-label="Phone screen"><button data-phone-tab="contacts" aria-pressed="${phoneTab==='contacts'}">Contacts</button><button data-phone-tab="project" aria-pressed="${phoneTab==='project'}">Start a project</button></div></div>${phoneTab==='project'?`<div class="phone-project-intro">Tell me a little about your idea.</div>${window.WorkspaceBusiness.inquiryForm('phone-inquiry')}`:`<div class="contact-routes">${contactMarkup()}<a class="contact-route contact-email" href="mailto:${window.WORKSPACE_CONTACTS.email}" aria-label="Email Josh"><span class="contact-logo">${icon('mail')}</span><span class="contact-label">Email<small>${window.WORKSPACE_CONTACTS.email}</small></span>${icon('arrow-up-right')}</a></div><button class="phone-project-cta" data-phone-tab="project" aria-label="Start a project inquiry">Have a project in mind? ↗</button>`}`;
  }
  function portfolioURL(section=portfolioSection){return window.WORKSPACE_PROFILE.portfolio+(section?'#'+section:'');}
  function laptopMarkup(){return `<div class="laptop-browser"><h2 id="device-title" class="sr-only" tabindex="-1">Josh Manalo’s live portfolio</h2><header class="laptop-browser-bar"><div class="laptop-browser-address"><i aria-hidden="true"></i><span>jmdmanalo2222.github.io / portfolio</span></div><div class="laptop-browser-actions"><button id="portfolio-view-mode" class="portfolio-view-mode" aria-label="Switch between the full desktop page and a responsive reading layout">Read view</button><button id="portfolio-reload" aria-label="Reload the portfolio">↻</button><a href="${portfolioURL()}" id="portfolio-external" target="_blank" rel="noopener noreferrer" aria-label="Open the portfolio in a new tab">↗</a></div></header><nav class="portfolio-sections" aria-label="Portfolio sections">${[['','Home'],['about','About'],['skills','Skills'],['projects','Work'],['contact','Contact'],['cv','CV']].map(([section,label])=>`<button data-portfolio-section="${section}" aria-pressed="${portfolioSection===section}">${label}</button>`).join('')}<span id="portfolio-load-status" role="status">Loading portfolio…</span></nav><div class="portfolio-frame-wrap" id="portfolio-front-host"><div class="portfolio-loading" id="portfolio-loading"><span aria-hidden="true"></span><p>Opening my portfolio…</p><small>You can also use ↗ to open it in a new tab.</small></div></div></div>`;}
  function bindPortfolio(){
    const live=window.LaptopPortfolio;
    live.mount($('#portfolio-front-host'));live.navigate(portfolioSection);
    unsubscribePortfolio=live.subscribe(state=>{
      const status=$('#portfolio-load-status'),cover=$('#portfolio-loading'),toggle=$('#portfolio-view-mode');
      if(!status||!cover||!toggle)return;
      cover.hidden=state.loaded||state.failed||state.slow;
      status.textContent=state.failed?'Use ↗ to open the portfolio in a tab.':state.slow?'Still loading? Use ↗ to open a tab.':state.loaded?'Live portfolio':'Loading portfolio…';
      toggle.textContent=state.mode==='desktop'?'Read view':'Full page';toggle.setAttribute('aria-pressed',String(state.mode==='responsive'));
    });
    $('#portfolio-view-mode').onclick=()=>live.setMode(live.getState().mode==='desktop'?'responsive':'desktop');
    $('#portfolio-reload').onclick=()=>live.navigate(portfolioSection,true);
    $$('#device-content [data-portfolio-section]').forEach(button=>button.onclick=()=>{portfolioSection=button.dataset.portfolioSection;live.navigate(portfolioSection);$('#portfolio-external').href=portfolioURL();$$('[data-portfolio-section]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.portfolioSection===portfolioSection)));recordRoute('portfolio'+(portfolioSection?'/'+portfolioSection:''));});
  }
  function populateDevice(name){
    unsubscribePortfolio?.();unsubscribePortfolio=null;
    if($('#portfolio-live-plane').closest('#device-content'))window.LaptopPortfolio.returnToRoom();
    $('#device-content').innerHTML=name==='phone'?phoneMarkup():laptopMarkup();
    if(name==='phone')window.WorkspaceBusiness.bindInquiry($('#device-content'));else bindPortfolio();
  }
  function openDevice(name,trigger,options={}) {
    if(deviceDialog.open||monitorDialog.open||deviceClosing)return;
    const source=deviceRoomCorners(name);
    deviceReturnFocus=trigger?.closest('#desktop-plane')?$('#'+name+'-open'):trigger;activeDevice=name;focusDevice(name);
    if(name==='phone'&&options.tab)phoneTab=options.tab;
    if(name==='laptop'&&options.section!==undefined)portfolioSection=options.section;
    deviceStage.dataset.device=name;$('#device-card').dataset.device=name;
    populateDevice(name);
    deviceDialog.showModal();if(name==='laptop')window.LaptopPortfolio.fit();$('#device-title').focus({preventScroll:true});
    $('#'+name+'-open').setAttribute('aria-expanded','true');
    if(!reducedMotion.matches&&typeof deviceStage.animate==='function'){
      const start=entryTransform(source,deviceStage);
      if(start)deviceTransition=deviceStage.animate([{transform:start,opacity:.6},{transform:'none',opacity:1}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
    $('#scene-status').textContent=name==='phone'?'Phone facing you. Contacts and project inquiries are ready.':'Laptop facing you. Your portfolio is displayed inside its screen.';
    recordRoute(name==='phone'?(phoneTab==='project'?'phone/project':'phone'):'portfolio'+(portfolioSection?'/'+portfolioSection:''));
  }
  function closeDevice() {
    if(deviceClosePromise)return deviceClosePromise;
    if(!deviceDialog.open)return Promise.resolve();
    deviceClosePromise=(async()=>{
      deviceClosing=true;deviceTransition?.cancel();
      if(!reducedMotion.matches&&typeof deviceStage.animate==='function'){
        const end=entryTransform(deviceRoomCorners(activeDevice),deviceStage);
        if(end){
          deviceTransition=deviceStage.animate([{transform:'none',opacity:1},{transform:end,opacity:.2}],{duration:390,easing:'cubic-bezier(.4,0,.7,.3)'});
          try{await deviceTransition.finished;}catch{}
        }
      }
      deviceTransition?.cancel();unsubscribePortfolio?.();unsubscribePortfolio=null;
      if(activeDevice==='laptop')window.LaptopPortfolio.returnToRoom();
      deviceDialog.close();$('#device-content').replaceChildren();
      $('#'+activeDevice+'-open').setAttribute('aria-expanded','false');
      deviceReturnFocus?.focus({preventScroll:true});deviceClosing=false;
      $('#scene-status').textContent='Returned to the room.';recordRoute('room');
    })().finally(()=>{deviceClosePromise=null;});
    return deviceClosePromise;
  }
  async function navigate(route,{fromHistory=false,replace=false,trigger=null}={}){
    const parsed=window.WorkspaceBusiness.parseRoute(route);if(!parsed)return;
    const token=++navigationSerial;applyingRoute=true;
    try{
      if($('#room-dialog').open)window.WorkspaceLife.closePanel(false);
      if(parsed.view==='room'){
        await Promise.all([closeFocusedMonitor(),closeDevice()]);
      }else if(parsed.view==='monitor'||parsed.view==='desktop'){
        if(deviceDialog.open||deviceClosing)await closeDevice();if(token!==navigationSerial)return;
        openFocusedMonitor(trigger||roomEntry);
        if(parsed.view==='desktop'){if(appOpen)minimizeWindow();}
        else openMonitor(parsed.app,trigger||shortcuts.querySelector(`[data-shortcut="${parsed.app}"]`)||opener,{caseId:parsed.caseId});
      }else{
        if(monitorDialog.open||monitorClosing)await closeFocusedMonitor();if(token!==navigationSerial)return;
        if(deviceDialog.open)await closeDevice();if(token!==navigationSerial)return;
        openDevice(parsed.view,trigger||$('#'+parsed.view+'-open'),{section:parsed.section,tab:parsed.tab});
      }
    }finally{
      if(token===navigationSerial){applyingRoute=false;if(!fromHistory)recordRoute(route.replace(/^#/,''),replace);else lastAppliedHash=location.hash;}
    }
  }
  window.WorkspaceNavigation=Object.freeze({go:(route,trigger=null)=>navigate(route,{trigger})});
  let historyQueued=false;
  function restoreRoute(){if(historyQueued)return;historyQueued=true;queueMicrotask(()=>{historyQueued=false;if(location.hash!==lastAppliedHash)navigate(location.hash,{fromHistory:true});});}
  window.addEventListener('popstate',restoreRoute);window.addEventListener('hashchange',restoreRoute);

  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.shortcut){navigate(routeForApp(button.dataset.shortcut),{trigger:button});return;}
    if(button.dataset.launch){navigate(routeForApp(button.dataset.launch),{trigger:button});return;}
    if(button.dataset.case){navigate(button.dataset.case==='all'?'work':'work/'+button.dataset.case,{trigger:button});return;}
    if(button.dataset.inquiryService){window.WorkspaceBusiness.seedService(button.dataset.inquiryService);navigate('contact',{trigger:button});return;}
    if(button.hasAttribute('data-open-portfolio')){navigate('portfolio'+(button.dataset.openPortfolio?'/'+button.dataset.openPortfolio:''),{trigger:button});return;}
    if(button.dataset.shareRoute){window.WorkspaceBusiness.copyLink(button.dataset.shareRoute,page);return;}
    if(button.dataset.phoneTab){phoneTab=button.dataset.phoneTab;populateDevice('phone');$('#device-title').focus({preventScroll:true});recordRoute(phoneTab==='project'?'phone/project':'phone');return;}
    if(button.dataset.demo)renderDetail(button.dataset.demo);
    if(button.dataset.dot)renderDetail(button.dataset.dot);
    if(button.dataset.step&&demos.some(d=>d.id===selected)){const i=demos.findIndex(d=>d.id===selected);renderDetail(demos[(i+Number(button.dataset.step)+demos.length)%demos.length].id);}
    if(button.dataset.device==='monitor')openFocusedMonitor(button);
    if(['phone','laptop'].includes(button.dataset.device))openDevice(button.dataset.device,button);
  });
  roomEntry.addEventListener('click',()=>openFocusedMonitor());
  secondEntry?.addEventListener('click',event=>navigate('work',{trigger:event.currentTarget}));
  $('#return-to-room').addEventListener('click',closeFocusedMonitor);
  opener.addEventListener('click',()=>openMonitor());
  $('#minimize-project').addEventListener('click',minimizeWindow);
  $('#maximize-project').addEventListener('click',toggleMaximize);
  $('#taskbar-projects').addEventListener('click',()=>appMinimized?restoreWindow():minimizeWindow());
  $('#show-desktop').addEventListener('click',()=>{if(appOpen)minimizeWindow();else shortcuts.querySelector('button')?.focus({preventScroll:true});});
  monitorDialog.addEventListener('cancel',event=>{
    event.preventDefault();
    if(appOpen&&!appMinimized){if(selected==='work'&&activeCase)renderDetail('work');else selected?renderShelf(selected):closeMonitor();}else closeFocusedMonitor();
  });
  monitorDialog.addEventListener('click',event=>{if(event.target===monitorDialog)closeFocusedMonitor();});
  const dragHandle=$('#window-drag-handle');
  dragHandle.addEventListener('dblclick',toggleMaximize);
  dragHandle.addEventListener('pointerdown',event=>{
    if(event.button!==0||appMaximized||!monitorFocused)return;
    event.preventDefault();dragHandle.focus({preventScroll:true});
    windowDrag={id:event.pointerId,x:event.clientX,y:event.clientY,left:windowPosition.x,top:windowPosition.y,scale:desktopPlane.getBoundingClientRect().width/(parseFloat(desktopPlane.style.width)||1000)||1};
    dragHandle.setPointerCapture?.(event.pointerId);
  });
  dragHandle.addEventListener('pointermove',event=>{
    if(!windowDrag||windowDrag.id!==event.pointerId)return;
    positionWindow(windowDrag.left+(event.clientX-windowDrag.x)/windowDrag.scale,windowDrag.top+(event.clientY-windowDrag.y)/windowDrag.scale);
  });
  function stopWindowDrag(event){
    if(!windowDrag||windowDrag.id!==event.pointerId)return;
    if(dragHandle.hasPointerCapture?.(event.pointerId))dragHandle.releasePointerCapture(event.pointerId);
    windowDrag=null;
  }
  dragHandle.addEventListener('pointerup',stopWindowDrag);
  dragHandle.addEventListener('pointercancel',stopWindowDrag);
  dragHandle.addEventListener('lostpointercapture',()=>windowDrag=null);
  dragHandle.addEventListener('keydown',event=>{
    if(appMaximized)return;
    const step=event.shiftKey?40:16;
    const movement={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[event.key];
    if(movement){event.preventDefault();positionWindow(windowPosition.x+movement[0],windowPosition.y+movement[1]);}
  });
  $('#shelf-home').addEventListener('click',()=>renderShelf(selected));
  $('#close-showcase').addEventListener('click',closeMonitor);
  $('#phone-open').addEventListener('click',event=>openDevice('phone',event.currentTarget));
  $('#laptop-open').addEventListener('click',event=>openDevice('laptop',event.currentTarget));
  $('#keyboard-open').addEventListener('click',event=>navigate('terminal',{trigger:event.currentTarget}));
  $('#window-share').addEventListener('click',()=>window.WorkspaceBusiness.copyLink(currentMonitorRoute(),page));
  $('#close-device').addEventListener('click',closeDevice);
  deviceDialog.addEventListener('cancel',event=>{event.preventDefault();closeDevice();});
  deviceDialog.addEventListener('click',event=>{if(event.target===deviceDialog)closeDevice();});
  const digitPaths={
    a:'M6 1H28L32 5L28 9H6L2 5Z',
    b:'M29 8L33 12V28L29 32L25 28V12Z',
    c:'M29 34L33 38V54L29 58L25 54V38Z',
    d:'M6 57H28L32 61L28 65H6L2 61Z',
    e:'M5 34L9 38V54L5 58L1 54V38Z',
    f:'M5 8L9 12V28L5 32L1 28V12Z',
    g:'M6 29H28L32 33L28 37H6L2 33Z'
  };
  const digitSegments=['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg'];
  function digitalNumber(value) {
    return [...value].map(number=>`<svg viewBox="0 0 34 66" aria-hidden="true">${Object.entries(digitPaths).map(([segment,path])=>`<path d="${path}" class="${digitSegments[Number(number)].includes(segment)?'lit':''}"/>`).join('')}</svg>`).join('');
  }
  let clockTimer=null;
  function tickClock(){
    const now=new Date();
    const face=window.WorkspaceLife.clockFace(now);
    ['clock-hours','clock-minutes','clock-seconds'].forEach((id,index)=>{
      const pair=$('#'+id),value=face.values[index];
      if(pair.dataset.value!==value){pair.innerHTML=digitalNumber(value);pair.dataset.value=value;}
    });
    $('#live-clock').dateTime=now.toISOString();
    $('#live-clock').setAttribute('aria-label',face.label);
    $('#live-clock').classList.toggle('is-date',face.date);
    $('#clock-mode-label').textContent=face.badge;
    document.dispatchEvent(new CustomEvent('workspace:tick',{detail:{now}}));
  }
  window.addEventListener('workspace:clock-change',tickClock);
  function syncClock(){
    clearInterval(clockTimer);clockTimer=null;
    if(!document.hidden){tickClock();clockTimer=setInterval(tickClock,1000);}
  }
  document.addEventListener('visibilitychange',syncClock);
  syncClock();
  $$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  if(location.hash&&window.WorkspaceBusiness.parseRoute(location.hash))navigate(location.hash,{fromHistory:true});
})();
