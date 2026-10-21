'use strict';
(() => {
  const rows=[
    ['Escape','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Backspace'],
    ['Tab','KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight','Backslash'],
    ['CapsLock','KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote','Enter'],
    ['ShiftLeft','KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash','ShiftRight'],
    ['ControlLeft','MetaLeft','AltLeft','Space','AltRight','ControlRight','ArrowLeft','ArrowDown','ArrowUp','ArrowRight']
  ];
  const labels={Escape:'esc',Backspace:'⌫',Tab:'tab',CapsLock:'caps',Enter:'enter',ShiftLeft:'shift',ShiftRight:'shift',ControlLeft:'ctrl',ControlRight:'ctrl',MetaLeft:'◇',AltLeft:'alt',AltRight:'alt',Space:'space',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',BracketLeft:'[',BracketRight:']',Backslash:'\\',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/'};
  const text={BracketLeft:'[',BracketRight:']',Backslash:'\\',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Space:' '};
  const shifted={Digit1:'!',Digit2:'@',Digit3:'#',Digit4:'$',Digit5:'%',Digit6:'^',Digit7:'&',Digit8:'*',Digit9:'(',Digit0:')',BracketLeft:'{',BracketRight:'}',Backslash:'|',Semicolon:':',Quote:'"',Comma:'<',Period:'>',Slash:'?'};
  const weight=code=>code==='Space'?4.8:/Shift|Enter|Backspace|CapsLock|Tab/.test(code)?1.45:1;
  let id=0;
  const layout=rows.flatMap((row,r)=>{const total=row.reduce((sum,k)=>sum+weight(k),0);let x=.015;return row.map((code,col)=>{const width=weight(code)/total*.97,left=x+.003,right=x+width-.003,top=r/5+.018,bottom=(r+1)/5-.018;x+=width;return Object.freeze({code,id:++id,row:r,col,left,right,top,bottom,label:labels[code]||code.replace(/^Key|^Digit/,''),text:code.startsWith('Key')?code.slice(3).toLowerCase():code.startsWith('Digit')?code.slice(5):text[code]||'',shifted:shifted[code]});});});
  window.WorkspaceKeys=Object.freeze({rows:Object.freeze(rows.map(Object.freeze)),layout:Object.freeze(layout),id:(source,code)=>{const key=layout.find(k=>k.code===code);return key?key.id+(source==='laptop'?100:0):0;}});
})();
