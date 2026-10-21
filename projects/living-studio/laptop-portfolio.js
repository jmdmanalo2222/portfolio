'use strict';
(() => {
  const room=document.querySelector('#laptop-website-screen');
  const plane=document.querySelector('#portfolio-live-plane');
  const frame=document.createElement('iframe');
  frame.id='portfolio-frame';frame.title='Josh Manalo’s live portfolio website';
  frame.loading='lazy';frame.referrerPolicy='strict-origin-when-cross-origin';
  frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation');
  const width=1600,height=900,listeners=new Set();
  let front=null,loaded=false,failed=false,slow=false,loadTimer=null;
  let mode=window.innerWidth<=650?'responsive':'desktop';
  const state=()=>({loaded,failed,slow,mode,inRoom:!front});
  function notify(){for(const listener of listeners)listener(state());}
  function access(interactive){plane.inert=!interactive;plane.toggleAttribute('inert',!interactive);frame.tabIndex=interactive?0:-1;if(interactive)plane.removeAttribute('aria-hidden');else plane.setAttribute('aria-hidden','true');plane.classList.toggle('is-interactive',interactive);}
  function dimensions(host){const r=host.getBoundingClientRect();return {width:host.clientWidth||r.width,height:host.clientHeight||r.height};}
  function fit(){
    const host=front||room,{width:w,height:h}=dimensions(host);if(!w||!h)return;
    let logicalWidth=width,logicalHeight=height,sx=w/width,sy=h/height,left=0,top=0;
    if(front){
      if(mode==='responsive'){logicalWidth=w;logicalHeight=h;sx=sy=1;}
      else{sx=sy=Math.min(w/width,h/height);left=(w-width*sx)/2;top=(h-height*sy)/2;}
    }
    plane.style.width=logicalWidth+'px';plane.style.height=logicalHeight+'px';
    plane.style.left=left+'px';plane.style.top=top+'px';plane.style.transform=`scale(${sx},${sy})`;
    plane.classList.add('is-ready');plane.dataset.layout=front?mode:'desktop';
    // A scaled desktop poster stays complete even in the responsive loading state.
    const poster=plane.querySelector('.portfolio-hero-poster');
    if(poster){const scale=Math.min(logicalWidth/width,logicalHeight/height);poster.style.transform=`scale(${scale})`;}
  }
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(fit):null;
  observer?.observe(room);if(!observer)window.addEventListener('resize',fit);
  function waiting(){loaded=false;failed=false;slow=false;plane.classList.remove('is-live');clearTimeout(loadTimer);loadTimer=setTimeout(()=>{slow=true;notify();},12000);notify();}
  frame.addEventListener('load',()=>{loaded=true;failed=false;slow=false;clearTimeout(loadTimer);plane.classList.add('is-live');notify();});
  frame.addEventListener('error',()=>{loaded=false;failed=true;clearTimeout(loadTimer);plane.classList.remove('is-live');notify();});
  function place(target){
    if(plane.parentElement===target)return;
    let preserved=false;
    if(typeof target.moveBefore==='function'&&plane.isConnected&&target.isConnected){try{target.moveBefore(plane,null);preserved=true;}catch{}}
    if(!preserved){waiting();target.append(plane);}
  }
  function mount(target){
    if(front&&front!==target)observer?.unobserve?.(front);
    front=target;plane.classList.add('in-front');access(true);frame.loading='eager';place(target);observer?.observe(target);fit();notify();
  }
  function returnToRoom(){
    if(front)observer?.unobserve?.(front);
    front=null;access(false);plane.classList.remove('in-front');place(room);fit();notify();
  }
  function navigate(section='',reload=false){const url=window.WORKSPACE_PROFILE.portfolio+(section?'#'+section:'');if(reload||frame.src!==url){waiting();frame.src=url;}}
  function setMode(value){if(!['desktop','responsive'].includes(value))return;mode=value;fit();notify();}
  function subscribe(listener){listeners.add(listener);listener(state());return ()=>listeners.delete(listener);}
  access(false);waiting();frame.src=window.WORKSPACE_PROFILE.portfolio;plane.append(frame);fit();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)fit();});
  window.addEventListener('pagehide',()=>clearTimeout(loadTimer));
  window.LaptopPortfolio=Object.freeze({mount,returnToRoom,navigate,setMode,subscribe,fit,getState:state});
})();
