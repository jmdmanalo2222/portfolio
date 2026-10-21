'use strict';
(() => {
  const $=s=>document.querySelector(s),world=$('#room-world'),main=$('#main'),canvas=$('#room-depth-canvas');
  const panel=$('#viewpoint-controls'),opener=$('#room-viewpoint-open'),hint=$('#viewpoint-hint');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let saved={};try{saved=JSON.parse(localStorage.getItem('josh-studio-v2')||'{}')||{};}catch{}
  let cameraEnabled=saved.cameraMode==='manual'&&saved.camera===true,playing=saved.motion!==false&&!reduced.matches,strength=Number.isFinite(saved.strength)?clamp(saved.strength,20,100):60;
  let lamp=saved.lamp!==false,ac=saved.ac!==false,record=saved.record!==false;
  let roomLight=saved.roomLight===true;
  let curtainOpen=saved.curtainOpen!==false,curtain=curtainOpen?1:0;
  const presses=new Map();
  let renderer=null,failed=false,disposed=false,frame=0,lastReal=0,lastPaint=-100,time=0,acTime=0,recordTime=0,width=1,height=1,drag=null,hintTimer=0;
  let visualLight=null,lightDelta=.033,presentedView=null;
  const current={x:0,y:0},target={x:0,y:0},hover={},hoverTarget={};
  const scene=RoomStudio.buildScene();
  document.body.classList.add('room-native');
  const definitions=[
    ['#monitor-desktop','monitor'],['#studio-display','display'],['#laptop-website-screen','laptop'],['#laptop-open','laptop'],['#phone-open','phone'],
    ['#live-clock','clock'],['#clock-open','clock'],['.book-cv','cv'],['.book-skills','skills'],['.book-tools','tools'],
    ['.controller-snake','snake'],['.controller-pong','pong'],['.controller-arcade','arcade'],['#coffee-open','coffee'],['.coffee-steam','steam'],
    ['#keyboard-open','keyboard'],['#desk-keyboard-glow','keyboard'],['#laptop-keyboard-surface','laptopKeyboard'],['.control-pad-hotspot','pad'],['#studio-curtain','curtain'],
    ['#studio-lamp','lamp'],['#studio-record','record'],['#studio-ac','ac']
  ];
  const anchors=definitions.map(([selector,key])=>{
    const node=$(selector),surface=scene.surfaces[key];node.dataset.studioObject=key;
    node.style.width=surface.size[0]+'px';node.style.height=surface.size[1]+'px';
    return {node,key,...surface};
  });
  const isBlocked=()=>!!($('#studio-loader')?.open||$('#monitor-dialog').open||$('#device-dialog').open||($('#room-dialog').open&&$('#room-dialog').dataset.kind!=='controls'));
  const paused=()=>document.hidden||disposed||isBlocked();
  function save(){try{localStorage.setItem('josh-studio-v2',JSON.stringify({camera:cameraEnabled,cameraMode:'manual',motion:playing,strength,lamp,ac,record,roomLight,curtainOpen}));}catch{}}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;lastReal=0;}
  function freezeLook(){target.x=current.x;target.y=current.y;}
  function dismissHint(){clearTimeout(hintTimer);hintTimer=0;hint.hidden=true;}
  function measure(){width=world.clientWidth||innerWidth||1672;height=world.clientHeight||innerHeight||941;}
  function look(){return {x:current.x*strength/100,y:current.y*strength/100};}
  function view(){return presentedView||RoomStudio.camera(width/height,look());}
  function worldPoint(p){
    if(renderer)return RoomStudio.project(p,view().matrix,width,height);
    const coverWidth=Math.max(width,height*1672/941),coverHeight=coverWidth*941/1672;
    const projected=RoomStudio.project(p,RoomStudio.camera(1672/941).matrix,coverWidth,coverHeight);
    return [projected[0]+(width-coverWidth)/2,projected[1]+(height-coverHeight)/2,projected[2]];
  }
  function physicalQuad(key){const surface=scene.surfaces[key],m=RoomStudio.groupMatrix(surface.group||'',time,hover);return surface.quad.map(p=>RoomStudio.math.transform(p,m).slice(0,3));}
  function surfacePoints(key,ratios=[[0,0],[1,0],[1,1],[0,1]]){
    const q=physicalQuad(key);
    return ratios.map(([u,v])=>worldPoint(q[0].map((n,i)=>n+(q[1][i]-n)*u+(q[3][i]-n)*v)));
  }
  function align(){
    for(const a of anchors){const points=surfacePoints(a.key).map(p=>p.slice(0,2)),matrix=RoomDepth.matrix(a.size[0],a.size[1],points);if(matrix)a.node.style.transform=matrix;}
  }
  function lighting(){const style=getComputedStyle(world),room=window.WorkspaceLife?.getState();return {day:clamp(parseFloat(style.getPropertyValue('--daylight'))||0,0,1),brightness:parseFloat(style.getPropertyValue('--room-brightness'))||1,minute:room?.minute??630};}
  function paint(force=false){
    if(paused())return;
    const desired=lighting();
    if(!visualLight||force||reduced.matches||!playing)visualLight={...desired};
    else{
      const alpha=1-Math.exp(-lightDelta*6);
      for(const key of ['day','brightness'])visualLight[key]+=(desired[key]-visualLight[key])*alpha;
      const difference=((desired.minute-visualLight.minute+2160)%1440)-720;
      visualLight.minute=(visualLight.minute+difference*alpha+1440)%1440;
    }
    const light=visualLight;
    if(renderer){
      const keyCodes=[...presses.keys()].concat([0,0,0,0]).slice(0,4),keyPress=[...presses.values()].map(age=>Math.max(0,1-age/.26)**2).concat([0,0,0,0]).slice(0,4);
      presentedView=renderer.draw({width,height,look:look(),time,acTime,ac,recordTime,...light,lamp,roomLight,hover,curtain,keyCodes,keyPress,force});
      world.classList.add('room-studio-rendered');
    }
    document.body.dataset.studioTone=light.day>.4?'day':'night';
    align();
  }
  function moving(){return presses.size>0||Math.abs(curtain-(curtainOpen?1:0))>.001||Math.abs(target.x-current.x)+Math.abs(target.y-current.y)>.0005||Object.keys(hoverTarget).some(key=>Math.abs((hoverTarget[key]||0)-(hover[key]||0))>.001);}
  function needsFrames(){return !!renderer&&!paused()&&((playing&&!reduced.matches)||moving());}
  function schedule(){if(!frame&&needsFrames())frame=requestAnimationFrame(animate);}
  function animate(now){
    frame=0;if(paused()){lastReal=0;return;}
    const dt=lastReal?Math.min((now-lastReal)/1000,.08):.033;lastReal=now;
    lightDelta=dt;
    if(playing&&!reduced.matches){time+=dt;if(ac)acTime+=dt;if(record)recordTime+=dt;}
    const ease=1-Math.exp(-dt*11);
    for(const [id,age] of presses){if(age+dt>=.26)presses.delete(id);else presses.set(id,age+dt);}
    curtain+=((curtainOpen?1:0)-curtain)*ease;if(Math.abs(curtain-(curtainOpen?1:0))<.001)curtain=curtainOpen?1:0;
    current.x+=(target.x-current.x)*ease;current.y+=(target.y-current.y)*ease;
    if(Math.abs(target.x-current.x)+Math.abs(target.y-current.y)<.0005){current.x=target.x;current.y=target.y;}
    for(const key of Object.keys(hoverTarget)){hover[key]=(hover[key]||0)+((hoverTarget[key]||0)-(hover[key]||0))*ease;if(Math.abs(hover[key]-hoverTarget[key])<.001)hover[key]=hoverTarget[key];}
    // One capped loop for the geometry, camera, meters, shadows, and reflections.
    if(now-lastPaint>=32||!needsFrames()){paint();lastPaint=now;}
    schedule();
  }
  function updateUI(){
    const available=!!renderer&&!failed,active=available&&cameraEnabled&&!reduced.matches;
    opener.classList.toggle('is-active',active);$('#viewpoint-toggle').setAttribute('aria-pressed',String(active));$('#viewpoint-toggle').disabled=!available||reduced.matches;
    $('#viewpoint-strength').value=strength;$('#viewpoint-strength').disabled=!active;$('#viewpoint-strength-value').value=strength+'%';
    panel.querySelectorAll('[data-viewpoint]').forEach(b=>b.disabled=!active);
    $('#viewpoint-status').textContent=failed?'Still view is active on this device.':reduced.matches?'Motion follows your reduced-motion setting.':active?'Look around is on. Move your pointer or drag the room.':'The camera stays still. Turn on Look around to move it.';
    $('#studio-motion').setAttribute('aria-pressed',String(playing&&!reduced.matches&&available));$('#studio-motion').setAttribute('aria-label',playing?'Pause room ambience':'Play room ambience');$('#studio-motion').disabled=!available||reduced.matches;
    $('#studio-motion-label').textContent=failed||reduced.matches?'STILL VIEW':playing?'PAUSE MOTION':'PLAY MOTION';
    for(const [id,value,label] of [['lamp',lamp,'lamp and side glow'],['record',record,'record'],['ac',ac,'air conditioning']]){
      const b=$('#studio-'+id);b.setAttribute('aria-pressed',String(value));b.setAttribute('aria-label',(id==='record'?(value?'Pause ':'Play '):(value?'Turn off ':'Turn on '))+label);if(id==='record')b.disabled=!available||reduced.matches;else if(id==='ac')b.disabled=!available;
    }
    $('#studio-record-caption').textContent=record?'Spinning, softly':'A quiet moment';
    $('#studio-ac-caption').innerHTML=ac?'Quiet cooling<small>Click to turn off the AC</small>':'AC is off<small>Click for quiet cooling</small>';
    $('#studio-ac .studio-ac-readout').textContent=ac?'22°':'';
    $('#studio-curtain').disabled=!available;$('#studio-curtain').setAttribute('aria-pressed',String(!curtainOpen));$('#studio-curtain').setAttribute('aria-label',curtainOpen?'Close curtains':'Open curtains');$('#studio-curtain-caption').textContent=curtainOpen?'Close the curtains':'Let the light in';
    const lightSwitch=$('#studio-room-light'),lightLabel=`Turn ${roomLight?'off':'on'} the room light`;
    lightSwitch.setAttribute('aria-pressed',String(roomLight));lightSwitch.setAttribute('aria-label',lightLabel);lightSwitch.title=lightLabel;
    document.body.classList.toggle('studio-room-light-on',roomLight);
    document.body.classList.toggle('studio-still',!playing||reduced.matches||!available);
  }
  function fail(){presses.clear();failed=true;playing=false;renderer?.dispose();renderer=null;stop();current.x=current.y=target.x=target.y=0;world.classList.remove('room-studio-rendered');document.body.classList.add('studio-still');measure();align();updateUI();}
  function closePanel(restore=true){panel.hidden=true;opener.setAttribute('aria-expanded','false');if(restore)opener.focus({preventScroll:true});}
  function setLook(x,y,immediate=false){
    if(!renderer||reduced.matches||!cameraEnabled||paused())return;
    target.x=clamp(x,-1,1);target.y=clamp(y,-1,1);
    if(immediate){current.x=target.x;current.y=target.y;paint();}schedule();
  }
  function interactive(node){return node instanceof Element&&node.closest('button,a,input,textarea,select,iframe,[data-key-code],.viewpoint-controls');}
  function hoverObject(node,active){const key=node?.closest('[data-studio-object]')?.dataset.studioObject;if(!['cv','skills','tools','snake','pong','arcade'].includes(key))return;if(reduced.matches)return;hoverTarget[key]=active?1:0;schedule();}
  main.addEventListener('pointerover',event=>hoverObject(event.target,true));main.addEventListener('pointerout',event=>hoverObject(event.target,false));
  main.addEventListener('focusin',event=>{freezeLook();hoverObject(event.target,true);});main.addEventListener('focusout',event=>hoverObject(event.target,false));
  main.addEventListener('pointermove',event=>{
    if(paused()||!panel.hidden)return;
    if(drag&&event.pointerId===drag.id){const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>6){event.preventDefault();dismissHint();setLook(drag.lookX-dx/Math.max(width,1)*2.1,drag.lookY+dy/Math.max(height,1)*2.1);}return;}
    if(event.pointerType==='touch'||event.pointerType==='pen')return;
    if(interactive(event.target)){freezeLook();return;}
    setLook((event.clientX/Math.max(innerWidth,1)*2-1),-(event.clientY/Math.max(innerHeight,1)*2-1));
  },{passive:false});
  world.addEventListener('pointerdown',event=>{
    freezeLook();if(interactive(event.target)||event.button!==0||paused()||!panel.hidden||!cameraEnabled)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,lookX:current.x,lookY:current.y};world.setPointerCapture?.(event.pointerId);
  },true);
  function endDrag(event){if(drag?.id===event.pointerId){if(world.hasPointerCapture?.(drag.id))world.releasePointerCapture(drag.id);drag=null;}}
  main.addEventListener('pointerup',endDrag);main.addEventListener('pointercancel',endDrag);main.addEventListener('pointerleave',()=>{if(!drag)setLook(0,0);});
  opener.addEventListener('click',()=>{freezeLook();dismissHint();panel.hidden=!panel.hidden;opener.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)$('#viewpoint-close').focus({preventScroll:true});});
  $('#viewpoint-close').addEventListener('click',()=>closePanel());
  $('#viewpoint-toggle').addEventListener('click',()=>{cameraEnabled=!cameraEnabled;current.x=current.y=target.x=target.y=0;save();paint();updateUI();});
  $('#viewpoint-strength').addEventListener('input',event=>{strength=clamp(Number(event.target.value)||60,20,100);save();paint();updateUI();});
  panel.addEventListener('click',event=>{
    const action=event.target.closest('[data-viewpoint]')?.dataset.viewpoint;if(!action)return;
    const delta={left:[-.3,0],right:[.3,0],up:[0,.3],down:[0,-.3],center:[-current.x,-current.y]};setLook(current.x+delta[action][0],current.y+delta[action][1],true);
  });
  panel.addEventListener('keydown',event=>{
    const action={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Home:'center'}[event.key];if(!action||event.target.id==='viewpoint-strength')return;
    event.preventDefault();event.stopPropagation();panel.querySelector(`[data-viewpoint="${action}"]`).click();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();event.stopPropagation();closePanel();}},true);
  document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!opener.contains(event.target))closePanel(false);});
  $('#studio-motion').addEventListener('click',()=>{playing=!playing;save();updateUI();if(playing)schedule();});
  $('#studio-curtain').addEventListener('click',()=>{curtainOpen=!curtainOpen;if(reduced.matches)curtain=curtainOpen?1:0;save();updateUI();paint(true);schedule();});
  $('#studio-room-light').addEventListener('click',()=>{
    roomLight=!roomLight;save();updateUI();paint(true);schedule();
    $('#scene-status').textContent=roomLight?'Room light on. The ceiling light brightens the whole room.':'Room light off.';
  });
  document.addEventListener('workspace:key-press',event=>{
    const id=event.detail?.id;if(!Number.isInteger(id)||!id||paused()||reduced.matches||!renderer)return;
    presses.delete(id);presses.set(id,0);while(presses.size>4)presses.delete(presses.keys().next().value);
    if(!frame)lastReal=0;paint(true);schedule();
  });
  for(const key of ['lamp','ac','record'])$('#studio-'+key).addEventListener('click',()=>{
    if(key==='lamp')lamp=!lamp;else if(key==='ac')ac=!ac;else record=!record;
    save();paint(true);updateUI();$('#scene-status').textContent=key==='lamp'?`The lamp and side glow are ${lamp?'on':'off'}.`:key==='record'?`The record is ${record?'spinning':'paused'}.`:`Air conditioning is ${ac?'on at 22 degrees':'off'}.`;schedule();
  });
  const observer=new MutationObserver(records=>{
    const blocked=isBlocked();document.body.classList.toggle('studio-suspended',blocked||document.hidden);
    if(blocked){stop();presses.clear();freezeLook();drag=null;closePanel(false);dismissHint();}else if(records.some(r=>r.attributeName==='open')){paint();schedule();}
    if(records.some(r=>r.target===world)){paint();schedule();}
  });
  observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});observer.observe(world,{attributes:true,attributeFilter:['style']});
  function resize(){measure();paint(true);align();schedule();}
  window.addEventListener('resize',resize);if(typeof ResizeObserver==='function'){const ro=new ResizeObserver(resize);ro.observe(world);}
  document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('studio-suspended',document.hidden||isBlocked());stop();presses.clear();drag=null;dismissHint();if(!document.hidden){paint();schedule();}});
  reduced.addEventListener?.('change',()=>{playing=!reduced.matches;presses.clear();curtain=curtainOpen?1:0;current.x=current.y=target.x=target.y=0;stop();paint();updateUI();schedule();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fail();});
  window.addEventListener('pagehide',event=>{stop();presses.clear();dismissHint();if(!event.persisted){disposed=true;renderer?.dispose();observer.disconnect();}});
  window.addEventListener('pageshow',event=>{if(event.persisted){measure();paint();schedule();}});
  function viewportPoints(points){const r=world.getBoundingClientRect();return points.map(p=>[p[0]+r.left,p[1]+r.top]);}
  window.WorkspaceViewpoint=Object.freeze({
    corners(node,ratios){const anchor=anchors.find(a=>a.node===node);return anchor?viewportPoints(surfacePoints(anchor.key,ratios)):null;},
    deviceCorners(name){
      if(name==='phone')return viewportPoints(surfacePoints('phone'));
      if(name==='laptop')return viewportPoints(scene.deviceQuads.laptop.map(p=>RoomStudio.math.transform(p,RoomStudio.groupMatrix('laptop',time)).slice(0,3)).map(worldPoint));
      return null;
    },
    getState:()=>({enabled:cameraEnabled&&!!renderer&&!reduced.matches,ready:!!renderer,failed,reduced:reduced.matches,strength,x:current.x,y:current.y,playing,ac,record,lamp,roomLight,time,acTime,recordTime,curtainOpen,curtain,pressedKeys:[...presses.keys()],look:look(),animating:!!frame,blocked:isBlocked()}),
    center:()=>setLook(0,0,true),scene,
    core:Object.freeze({camera:RoomStudio.camera,project:RoomStudio.project})
  });
  measure();renderer=RoomStudio.createRenderer(canvas,scene,fail);paint(true);align();updateUI();schedule();
  if(renderer&&cameraEnabled&&!reduced.matches&&!paused()){hint.querySelector('span').textContent=matchMedia('(pointer: coarse)').matches?'Drag to look around':'Move to look around';hint.hidden=false;hintTimer=setTimeout(dismissHint,7000);}
})();
