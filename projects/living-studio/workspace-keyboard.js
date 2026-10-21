'use strict';
(() => {
  const {layout,id}=window.WorkspaceKeys,$=s=>document.querySelector(s),ns='http://www.w3.org/2000/svg';
  const known=new Set(layout.map(k=>k.code)),timers=new Map(),notes={},shift={desk:false,laptop:false},caps={desk:false,laptop:false};
  let activeSource=null,lastKey=null;
  const bar=$('#keyboard-playbar');bar.setAttribute('tabindex','-1');
  bar.innerHTML='<span><strong id="keyboard-play-title"></strong><small>Click the keys, or type on your keyboard</small></span><button data-keyboard-open>Open screen</button><button data-keyboard-clear>Clear</button><button data-keyboard-done>Done</button>';
  for(const source of ['desk','laptop']){
    const svg=$('#'+source+'-keyboard-svg');
    svg.setAttribute('role','group');svg.setAttribute('aria-label',(source==='desk'?'Desk':'Laptop')+' keyboard');
    for(const key of layout){
      const g=document.createElementNS(ns,'g');g.classList.add('studio-key');g.dataset.keyCode=key.code;g.dataset.keySource=source;g.setAttribute('role','button');g.setAttribute('tabindex',key.id===1?'0':'-1');g.setAttribute('aria-label','Press '+key.label+' on the '+source+' keyboard');
      const polygon=document.createElementNS(ns,'polygon');polygon.setAttribute('points',[[key.left,key.top],[key.right,key.top],[key.right,key.bottom],[key.left,key.bottom]].map(([u,v])=>(u*430).toFixed(2)+','+(v*155).toFixed(2)).join(' '));
      const label=document.createElementNS(ns,'text');label.setAttribute('x',(key.left+key.right)*215);label.setAttribute('y',(key.top+key.bottom)*77.5);label.setAttribute('aria-hidden','true');label.textContent=key.label;
      g.append(polygon,label);svg.append(g);
    }
    const panel=document.createElement('section');panel.className='keyboard-notes keyboard-notes-'+source;panel.hidden=true;panel.setAttribute('aria-label',(source==='desk'?'Desk':'Laptop')+' notes');
    panel.innerHTML='<header><span>DESK NOTES</span><button type="button" aria-label="Close notes">×</button></header><textarea maxlength="280" spellcheck="false" placeholder="Make a little something…" aria-label="'+source+' keyboard notes"></textarea><footer><span>Just a little space to play.</span><button type="button">Clear</button></footer>';
    (source==='desk'?$('#desktop-plane'):$('#portfolio-live-plane')).append(panel);
    notes[source]={panel,input:panel.querySelector('textarea')};
    panel.querySelector('header button').addEventListener('click',close);
    panel.querySelector('footer button').addEventListener('click',()=>clear(source));
  }
  function updateBar(){bar.hidden=!activeSource||!!document.querySelector('dialog[open]');if(activeSource)$('#keyboard-play-title').textContent=activeSource==='desk'?'Desk keyboard':'Laptop keyboard';}
  function activate(source){activeSource=source;for(const key of ['desk','laptop'])notes[key].panel.hidden=key!==source;updateBar();}
  function close(){activeSource=null;for(const n of Object.values(notes))n.panel.hidden=true;updateBar();if(lastKey&&!document.querySelector('dialog[open]'))lastKey.focus({preventScroll:true});}
  function clear(source=activeSource){if(!source)return;notes[source].input.value='';notes[source].input.setSelectionRange(0,0);}
  function flash(code,source='desk'){
    if(!known.has(code)||document.hidden)return;
    const timerKey=source+code;clearTimeout(timers.get(timerKey));
    document.querySelectorAll(`[data-key-code="${code}"]`).forEach(node=>{if(!node.dataset.keySource||node.dataset.keySource===source)node.classList.add('is-lit');});
    document.dispatchEvent(new CustomEvent('workspace:key-press',{detail:{id:id(source,code),code,source}}));
    timers.set(timerKey,setTimeout(()=>{document.querySelectorAll(`[data-key-code="${code}"]`).forEach(node=>{if(!node.dataset.keySource||node.dataset.keySource===source)node.classList.remove('is-lit');});timers.delete(timerKey);},220));
  }
  function press(source,code,character=null,hardware=false){
    if(!known.has(code))return;
    if(code==='Escape'){close();return;}
    activate(source);const input=notes[source].input,key=layout.find(k=>k.code===code),start=input.selectionStart,end=input.selectionEnd;
    if(code==='CapsLock'){if(!hardware)caps[source]=!caps[source];return;}
    if(code.startsWith('Shift')){if(!hardware)shift[source]=!shift[source];return;}
    if(/^(Control|Alt|Meta)/.test(code))return;
    if(code==='Backspace'){input.setRangeText('',Math.max(0,start-(start===end?1:0)),end,'end');return;}
    if(code.startsWith('Arrow')){
      let pos=start;if(code==='ArrowLeft')pos=Math.max(0,start-1);if(code==='ArrowRight')pos=Math.min(input.value.length,end+1);
      if(code==='ArrowUp')pos=Math.max(0,input.value.lastIndexOf('\n',Math.max(0,start-1)));
      if(code==='ArrowDown'){const next=input.value.indexOf('\n',end);pos=next<0?input.value.length:next+1;}
      input.setSelectionRange(pos,pos);return;
    }
    let value=character??(code==='Enter'?'\n':code==='Tab'?'  ':key.text);
    if(!hardware&&key.text){if(code.startsWith('Key'))value=shift[source]!==caps[source]?key.text.toUpperCase():key.text;else if(shift[source])value=key.shifted||key.text;}
    if(value&&input.value.length-(end-start)+value.length<=280)input.setRangeText(value,start,end,'end');
    if(value)shift[source]=false;
  }
  function clickedKey(event){return event.target instanceof Element?event.target.closest('.studio-key'):null;}
  document.addEventListener('pointerdown',event=>{const key=clickedKey(event);if(!key)return;event.stopPropagation();lastKey=key;key.closest('svg').querySelectorAll('.studio-key').forEach(n=>n.setAttribute('tabindex',n===key?'0':'-1'));key.focus({preventScroll:true});flash(key.dataset.keyCode,key.dataset.keySource);});
  document.addEventListener('click',event=>{const key=clickedKey(event);if(key){event.preventDefault();event.stopPropagation();lastKey=key;flash(key.dataset.keyCode,key.dataset.keySource);press(key.dataset.keySource,key.dataset.keyCode);if(activeSource)bar.focus({preventScroll:true});return;}if(!(event.target instanceof Element))return;if(activeSource&&event.target.closest('[data-keyboard-open]'))$(activeSource==='desk'?'#monitor-focus':'#laptop-open').click();if(event.target.closest('[data-keyboard-clear]'))clear();if(event.target.closest('[data-keyboard-done]'))close();if(event.target.closest('[data-launch],[data-shortcut],#monitor-open,#shelf-home'))close();});
  document.addEventListener('keydown',event=>{
    const key=clickedKey(event);
    if(key&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(event.key)){
      event.preventDefault();event.stopPropagation();
      if(event.key==='Enter'||event.key===' '){flash(key.dataset.keyCode,key.dataset.keySource);press(key.dataset.keySource,key.dataset.keyCode);return;}
      const current=layout.find(k=>k.code===key.dataset.keyCode),row=current.row+(event.key==='ArrowUp'?-1:event.key==='ArrowDown'?1:0),col=current.col+(event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0);
      const next=layout.find(k=>k.row===row&&k.col===Math.max(0,Math.min(col,window.WorkspaceKeys.rows[Math.max(0,Math.min(row,4))].length-1)));
      if(next){const node=key.closest('svg').querySelector(`[data-key-code="${next.code}"]`);key.setAttribute('tabindex','-1');node.setAttribute('tabindex','0');node.focus({preventScroll:true});}return;
    }
    if(event.isComposing||event.defaultPrevented)return;
    const source=event.target.closest?.('.keyboard-notes-laptop')?'laptop':activeSource||'desk';flash(event.code,source);
    const editable=event.target.closest?.('input,textarea,select,[contenteditable],button,a');
    if(activeSource&&!editable&&!document.querySelector('dialog[open]')&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&event.code!=='Tab'&&known.has(event.code)){
      event.preventDefault();if(event.code==='Escape')event.stopImmediatePropagation();press(activeSource,event.code,event.key.length===1?event.key:null,true);
    }
  });
  function clearFeedback(){for(const timer of timers.values())clearTimeout(timer);timers.clear();document.querySelectorAll('[data-key-code].is-lit').forEach(n=>n.classList.remove('is-lit'));}
  const observer=new MutationObserver(updateBar);observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearFeedback();});
  window.addEventListener('pagehide',event=>{clearFeedback();if(!event.persisted)observer.disconnect();});
  window.WorkspaceKeyboard=Object.freeze({getState:()=>({activeSource,deskLength:notes.desk.input.value.length,laptopLength:notes.laptop.input.value.length}),close});
})();
