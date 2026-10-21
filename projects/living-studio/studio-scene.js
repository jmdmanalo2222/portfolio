'use strict';
(() => {
  const PI=Math.PI,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
  function multiply(a,b){const out=Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];return out;}
  const translation=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1];
  const scaling=(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1];
  const rotationX=a=>[1,0,0,0,0,Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1];
  const rotationY=a=>[Math.cos(a),0,-Math.sin(a),0,0,1,0,0,Math.sin(a),0,Math.cos(a),0,0,0,0,1];
  const rotationZ=a=>[Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1,0,0,0,0,1];
  const transform=(p,m,w=1)=>[0,1,2,3].map(r=>m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r]*w);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot=(a,b)=>a.reduce((sum,n,i)=>sum+n*b[i],0);
  const normalize=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
  function lookAt(eye,target){const z=normalize(eye.map((n,i)=>n-target[i])),x=normalize(cross([0,1,0],z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];}
  function perspective(fov,aspect,near=.1,far=60){const f=1/Math.tan(fov/2);return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];}
  function ortho(l,r,b,t,n,f){return [2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1];}
  function camera(aspect,look={x:0,y:0}){
    const distance=7.12*Math.max(1,1.43/Math.max(aspect,.25));
    const eye=[-1.65+look.x*.58,3.14+look.y*.27,distance],target=[.10+look.x*.06,1.98+look.y*.035,.10];
    return {eye,matrix:multiply(perspective(40*PI/180,aspect),lookAt(eye,target))};
  }
  function project(p,m,width,height){const v=transform(p,m);return [(v[0]/v[3]*.5+.5)*width,(.5-v[1]/v[3]*.5)*height,v[2]/v[3]];}
  const compose=(p,s,r=[0,0,0])=>multiply(translation(...p),multiply(rotationZ(r[2]),multiply(rotationY(r[1]),multiply(rotationX(r[0]),scaling(...s)))));
  const color=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  const C={cream:color('#d9ceb6'),paper:color('#eee7d6'),metal:color('#a6b0ac'),dark:color('#242b2b'),orange:color('#f35220'),blue:color('#25485d'),red:color('#a73730'),gold:color('#b5a36c'),gray:color('#777a73'),navy:color('#182d3d')};
  const primitives={};
  function triangle(out,a,b,c,normal){for(const p of [a,b,c])out.push(...p,...normal);}
  function quad(out,a,b,c,d,n){triangle(out,a,b,c,n);triangle(out,a,c,d,n);}
  function cubeGeometry(){const out=[];for(const [axis,sign] of [[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]]){
    const n=[0,0,0];n[axis]=sign;const u=(axis+1)%3,v=(axis+2)%3,points=[];
    for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const p=[0,0,0];p[axis]=sign*.5;p[u]=a*.5;p[v]=b*.5;points.push(p);}
    if(sign<0)points.reverse();quad(out,...points,n);
  }return out;}
  function cylinderGeometry(segments=20,topRadius=1){const out=[];for(let i=0;i<segments;i++){
    const a=i/segments*PI*2,b=(i+1)/segments*PI*2,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
    const p=[ca,-.5,sa],q=[cb,-.5,sb],r=[cb*topRadius,.5,sb*topRadius],s=[ca*topRadius,.5,sa*topRadius];
    const na=normalize([ca,1-topRadius,sa]),nb=normalize([cb,1-topRadius,sb]);
    for(const [point,n] of [[p,na],[s,na],[r,nb],[p,na],[r,nb],[q,nb]])out.push(...point,...n);
    triangle(out,[0,-.5,0],q,p,[0,-1,0]);if(topRadius)triangle(out,[0,.5,0],s,r,[0,1,0]);
  }return out;}
  function sphereGeometry(segments=16,rings=10,half=false){const out=[];const point=(u,v)=>{const a=u*2*PI,b=v*PI*(half?.5:1);return [Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)];};
    for(let y=0;y<rings;y++)for(let x=0;x<segments;x++){
      const p=point(x/segments,y/rings),q=point((x+1)/segments,y/rings),r=point((x+1)/segments,(y+1)/rings),s=point(x/segments,(y+1)/rings);
      for(const v of [p,q,r,p,r,s])out.push(...v,...v);
    }return out;
  }
  function torusGeometry(segments=24,tubes=6){const out=[];const point=(u,v)=>{const a=u*PI*2,b=v*PI*2;return {p:[(1+Math.cos(b)*.15)*Math.cos(a),(1+Math.cos(b)*.15)*Math.sin(a),Math.sin(b)*.15],n:[Math.cos(b)*Math.cos(a),Math.cos(b)*Math.sin(a),Math.sin(b)]};};
    for(let i=0;i<segments;i++)for(let j=0;j<tubes;j++){const p=point(i/segments,j/tubes),q=point((i+1)/segments,j/tubes),r=point((i+1)/segments,(j+1)/tubes),s=point(i/segments,(j+1)/tubes);for(const v of [p,q,r,p,r,s])out.push(...v.p,...v.n);}return out;
  }
  function roundedGeometry(){
    const out=[],steps=[-.5,-.42,.42,.5];
    function point(axis,sign,u,v){const p=[0,0,0];p[axis]=sign*.5;p[(axis+1)%3]=u;p[(axis+2)%3]=v;const core=p.map(n=>clamp(n,-.42,.42)),n=normalize(p.map((x,i)=>x-core[i]));return {p:core.map((x,i)=>x+n[i]*.08),n};}
    for(let axis=0;axis<3;axis++)for(const sign of [-1,1])for(let u=0;u<3;u++)for(let v=0;v<3;v++){
      const q=[point(axis,sign,steps[u],steps[v]),point(axis,sign,steps[u+1],steps[v]),point(axis,sign,steps[u+1],steps[v+1]),point(axis,sign,steps[u],steps[v+1])];if(sign<0)q.reverse();for(const i of [0,1,2,0,2,3])out.push(...q[i].p,...q[i].n);
    }return out;
  }
  // Device cases use a small physical chamfer, with flat faces and crisp corner facets.
  function chamferedGeometry(size,radius){
    const out=[],half=size.map(n=>n/2),bevel=Math.min(radius,...size.map(n=>n*.45)),inner=half.map(n=>n-bevel);
    for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
      const u=(axis+1)%3,v=(axis+2)%3,n=[0,0,0];n[axis]=sign;
      const points=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>{const p=[0,0,0];p[axis]=sign*half[axis];p[u]=a*inner[u];p[v]=b*inner[v];return p;});
      if(sign<0)points.reverse();quad(out,...points,n);
    }
    for(let axis=0;axis<3;axis++)for(const a of [-1,1])for(const b of [-1,1]){
      const u=(axis+1)%3,v=(axis+2)%3,n=[0,0,0];n[u]=a;n[v]=b;
      const point=(end,face)=>{const p=[0,0,0];p[axis]=end*inner[axis];p[u]=a*(face?inner[u]:half[u]);p[v]=b*(face?half[v]:inner[v]);return p;};
      quad(out,point(-1,0),point(-1,1),point(1,1),point(1,0),normalize(n));
    }
    for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
      triangle(out,[x*half[0],y*inner[1],z*inner[2]],[x*inner[0],y*half[1],z*inner[2]],[x*inner[0],y*inner[1],z*half[2]],normalize([x,y,z]));
    }
    return out;
  }
  const chairOutline=[[-.41,0],[-.46,.18],[-.43,.60],[-.37,.86],[-.29,1.10],[-.20,1.18],[.20,1.18],[.29,1.10],[.37,.86],[.43,.60],[.46,.18],[.41,0]];
  function chairBackGeometry(){
    const out=[],front=chairOutline.map(([x,y])=>[x,y,-y*.13]),back=front.map(p=>[p[0],p[1],p[2]-.12]);
    for(let i=0;i<front.length;i++){
      const j=(i+1)%front.length;
      for(const p of [[0,.57,-.015],front[j],front[i]])out.push(...p,...normalize([p[0]*.65,.13,1]));
      triangle(out,[0,.57,-.18],back[i],back[j],normalize([0,-.13,-1]));
      const a=front[i],b=front[j],edge=normalize([-(b[1]-a[1]),b[0]-a[0],0]);quad(out,a,b,back[j],back[i],edge);
    }return out;
  }
  function geometry(type){return primitives[type]||(primitives[type]=type==='cube'?cubeGeometry():type==='rounded'?roundedGeometry():type==='chairback'?chairBackGeometry():type==='wheel'?cylinderGeometry(12):type==='sphere'?sphereGeometry():type==='dome'?sphereGeometry(32,10,true):type==='torus'?torusGeometry():cylinderGeometry(type==='wire'?10:24,type==='cone'?0:1));}
  function normalMatrix(m){const a=[m[0],m[1],m[2]],b=[m[4],m[5],m[6]],c=[m[8],m[9],m[10]],x=cross(b,c),y=cross(c,a),z=cross(a,b),det=dot(a,x)||1;return [...x,...y,...z].map(v=>v/det);}
  function buildScene(){
    const groups={static:[],floor:[],shadow:[],ceiling:[],city:[],chair:[],curtains:[],monitor:[],laptop:[],phone:[],coffee:[],keyboard:[],shelf:[],record:[],acHousing:[],acLouver:[],acIndicator:[],vinyl:[],cv:[],skills:[],tools:[],snake:[],pong:[],arcade:[]};
    let group='static';
    const ink=color('#273537'),ivory=color('#d8d0b9'),wood=color('#9c7958'),ash=color('#c4ae8e');
    function primitive(type,p,s,c,mat=[0,.6,0],r=[0,0,0],bevel=.008){
      const physical=type==='chamfered',raw=physical?chamferedGeometry(s,bevel):geometry(type),m=compose(p,physical?[1,1,1]:s,r),n=normalMatrix(m),out=groups[group];
      for(let i=0;i<raw.length;i+=6){const pos=transform(raw.slice(i,i+3),m),v=raw.slice(i+3,i+6),normal=normalize([n[0]*v[0]+n[3]*v[1]+n[6]*v[2],n[1]*v[0]+n[4]*v[1]+n[7]*v[2],n[2]*v[0]+n[5]*v[1]+n[8]*v[2]]);out.push(...pos.slice(0,3),...normal,...c,...mat);}
    }
    const box=(p,s,c,mat,r)=>primitive('cube',p,s,c,mat,r),round=(p,s,c,mat,r)=>primitive('rounded',p,s,c,mat,r),cylinder=(p,s,c,mat,r)=>primitive('cylinder',p,s,c,mat,r),sphere=(p,s,c,mat,r)=>primitive('sphere',p,s,c,mat,r);
    const chamfer=(p,s,c,mat,r,bevel=.008)=>primitive('chamfered',p,s,c,mat,r,bevel);
    function beam(a,b,r,c=C.metal,mat=[.98,.12,0]){
      const dir=b.map((v,i)=>v-a[i]),y=normalize(dir),x=normalize(cross(y,Math.abs(y[2])>.9?[1,0,0]:[0,0,1])),z=cross(x,y),m=[...x.map(v=>v*r),0,...y.map(v=>v*Math.hypot(...dir)),0,...z.map(v=>v*r),0,...a.map((v,i)=>(v+b[i])/2),1];
      const raw=geometry('wire'),nm=normalMatrix(m),out=groups[group];
      for(let i=0;i<raw.length;i+=6){const p=transform(raw.slice(i,i+3),m),v=raw.slice(i+3,i+6),n=normalize([nm[0]*v[0]+nm[3]*v[1]+nm[6]*v[2],nm[1]*v[0]+nm[4]*v[1]+nm[7]*v[2],nm[2]*v[0]+nm[5]*v[1]+nm[8]*v[2]]);out.push(...p.slice(0,3),...n,...c,...mat);}
    }
    // The original desk composition, rebuilt as warm, tactile 3D objects.
    // The plain back wall keeps the display area calm; the window now sits on the right.
    box([0,5.6,-.91],[7.60,12,.18],C.cream);
    box([-3.78,2.3,2.2],[.18,4.60,6.2],C.cream);
    box([3.78,2.3,4.80],[.18,4.60,4.30],C.cream);
    box([3.78,.085,.91],[.18,.53,3.50],C.cream);
    box([3.78,4.55,.91],[.18,.30,3.50],C.cream);
    box([0,4.71,1.35],[7.60,.16,4.5],C.paper,[0,.9,0]);
    box([0,4.49,-.74],[7.6,.085,.16],ivory);
    // Flush ceiling light: a matte black rim and a warm-white diffuser, like the reference.
    group='ceiling';
    cylinder([1.20,4.55,-.30],[.44,.15,.44],color('#262a29'),[.25,.56,0]);
    cylinder([1.20,4.469,-.30],[.419,.012,.419],C.paper,[0,.65,9]);
    group='static';
    // Right-side glazing and a recessed outdoor view follow the day cycle.
    box([12.5,4.5,-6],[.03,16,40],C.blue,[0,.9,3]);
    // Actual geometry behind the glass gives the skyline depth when looking around.
    group='city';
    box([8,.20,-5],[8,.15,30],color('#a1a59a'),[.1,.8,0]);
    const towers=[
      [8.8,-2.2,3.9,.78,.75],[9.1,-1.12,4.8,.72,.82],[8.9,.04,3.65,.90,.82],
      [9.5,1.32,5.1,.72,.80],[8.7,2.48,4.15,.92,.82],[9.2,3.82,4.65,.86,.83],
      [8.8,5.10,3.85,.94,.78],[6.3,-1.8,2.5,.74,.70],[6.0,-.58,3.15,.84,.72],
      [6.4,.72,2.7,.90,.80],[6.1,2.05,3.55,.74,.76],[6.4,3.31,2.3,1.02,.82],
      [6.2,4.70,3.0,.90,.80]
    ];
    towers.forEach(([x,originalZ,h,w,depth],index)=>{
      const z=originalZ-5;
      const far=x>8,stone=color(far?'#8b9b9b':index%3===0?'#7b8988':index%3===1?'#a1a99f':'#657b82');
      box([x,h/2+.30,z],[depth,h,w],stone,[.23,.62,0]);
      box([x,h+.32,z],[depth+.05,.045,w+.045],color('#a6afa5'),[.3,.55,0]);
      box([x+.08,h+.41,z],[depth*.45,.16,w*.42],C.gray,[.2,.7,0]);
      if(index===3||index===10){beam([x,h+.47,z],[x,h+.82,z],.009,C.gray,[.55,.4,0]);box([x,h+.83,z],[.022,.025,.022],color('#bb5a46'),[0,.5,7]);}
      const cols=far?3:4,rows=Math.floor((h-.2)/.24),wx=x-depth/2-.008,glass=color(far?'#849b9e':'#718e92');
      for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
        const y=.47+row*.24,zc=z-w/2+.13+col*(w-.26)/Math.max(1,cols-1),ww=far?.08:.095,hh=.115;
        const raw=[];quad(raw,[wx,y-hh/2,zc-ww/2],[wx,y-hh/2,zc+ww/2],[wx,y+hh/2,zc+ww/2],[wx,y+hh/2,zc-ww/2],[-1,0,0]);
        const seed=((index*71+row*17+col*43)%101)/101;
        for(let i=0;i<raw.length;i+=6)groups.city.push(...raw.slice(i,i+6),...glass,.2,.3,6+seed*.4);
      }
      if(!far)for(const side of [-1,1])box([wx-.003,h/2+.3,z+side*w*.41],[.018,h,.026],color('#a2b1a9'),[.3,.55,0]);
    });
    group='static';
    for(const y of [.32,4.42])box([3.67,y,.91],[.16,.065,3.49],C.gray,[.6,.32,0]);
    for(const z of [-.80,2.62])box([3.67,2.37,z],[.16,4.10,.065],C.gray,[.6,.32,0]);
    for(const z of [.34,1.48])box([3.67,2.37,z],[.11,4.03,.032],C.gray,[.6,.32,0]);
    box([3.67,1.31,.91],[.11,.031,3.42],C.gray,[.6,.32,0]);
    box([3.60,.285,.91],[.28,.065,3.60],ivory,[.25,.35,0]);
    cylinder([3.58,4.47,.91],[.018,3.80,.018],C.metal,[.95,.17,0],[PI/2,0,0]);
    for(const z of [-1.02,2.84])sphere([3.58,4.47,z],[.03,.03,.03],C.metal,[.95,.17,0]);
    group='curtains';
    for(const side of [0,1]){
      const anchor=side?2.73:-.91,direction=side?-1:1,flag=side?5:4,cloth=color('#ccc5b2');
      function point(u,v){
        const x=3.52+Math.sin(u*PI*16)*.045,y=4.43-v*4.30,z=anchor+direction*u*1.82;
        const dx=Math.cos(u*PI*16)*.045*PI*16;
        return {p:[x,y,z],n:normalize([-1,0,dx/(direction*1.82)])};
      }
      for(let row=0;row<16;row++)for(let col=0;col<40;col++){
        const q=[point(col/40,row/16),point((col+1)/40,row/16),point((col+1)/40,(row+1)/16),point(col/40,(row+1)/16)];
        for(const i of [0,1,2,0,2,3])groups.curtains.push(...q[i].p,...q[i].n,...cloth,0,.85,flag);
      }
    }
    group='static';
    box([0,.13,-.75],[24,.26,.12],C.paper);box([0,.27,-.75],[24,.025,.15],ivory);
    group='floor';const floor=[];quad(floor,[-18,0,14],[18,0,14],[18,0,-14],[-18,0,-14],[0,1,0]);
    for(let i=0;i<floor.length;i+=6)groups.floor.push(...floor.slice(i,i+6),...color('#c5ac88'),.10,.65,0);
    group='static';
    // Chrome trestles, a warm laminate top, and the low wooden monitor riser.
    round([0,1.08,.40],[6.55,.09,1.90],ivory,[.18,.43,0]);
    // A recessed amber strip follows the right edge, with a second diffuser below it.
    box([3.266,1.055,.40],[.020,.026,1.74],C.gray,[.65,.32,0]);
    box([3.278,1.055,.40],[.006,.012,1.68],color('#ffd2a2'),[0,.38,8]);
    box([3.19,1.025,.40],[.045,.020,1.74],C.gray,[.65,.32,0]);
    box([3.19,1.012,.40],[.025,.006,1.68],color('#ffd2a2'),[0,.38,8]);
    for(const x of [-3.02,3.02]){
      for(const z of [-.35,1.12]){beam([x,.05,z],[x,1.05,z],.027);cylinder([x,.04,z],[.045,.028,.045],ink);}
      beam([x,.08,-.35],[x,.08,1.12],.028);beam([x,1.00,-.35],[x,1.00,1.12],.028);
    }
    for(const z of [-.35,1.12])beam([-3.02,1.00,z],[3.02,1.00,z],.026);
    round([-.55,1.134,.85],[4.10,.012,.91],color('#455a54'),[0,.80,0]);
    group='monitor';
    round([-.63,1.29,.02],[3.05,.075,.72],ash,[.05,.55,0]);
    for(const x of [-1.97,.72])round([x,1.19,.02],[.055,.17,.67],wood,[.05,.6,0]);
    for(let i=0;i<3;i++)box([-1.51,1.145+i*.023,.16],[.67,.018,.32],[C.blue,C.paper,wood][i]);
    // Main monitor: warm ivory casing, metal neck, dark glass and tiny status lamp.
    chamfer([-.60,2.14,.02],[2.72,1.57,.13],ivory,[.25,.32,0],undefined,.010);
    // Rear diffusers cast a steady wall wash without adding animation or a bloom pass.
    for(const x of [-1.82,.62])box([x,2.14,-.052],[.018,1.25,.008],color('#ffd2a2'),[0,.38,8]);
    box([-.60,2.81,-.052],[2.44,.018,.008],color('#ffd2a2'),[0,.38,8]);
    box([-.60,2.15,.089],[2.53,1.423125,.007],C.navy,[0,.65,.14]);
    cylinder([-.60,1.405,-.02],[.075,.18,.075],C.metal,[1,.13,0]);chamfer([-.60,1.34,.04],[.72,.025,.39],C.metal,[.9,.17,0],undefined,.003);
    sphere([.59,1.409,.093],[.009,.009,.005],color('#8fc6b5'),[0,.4,1.8]);
    // The original light bar stays above the monitor, now in brushed chrome.
    cylinder([-.60,2.958,.05],[.033,2.05,.033],C.metal,[1,.13,0],[0,0,PI/2]);
    box([-.60,2.939,.061],[1.96,.012,.023],C.paper,[0,.3,.7]);
    box([-.60,2.93,-.03],[.12,.09,.14],ink,[.4,.35,0]);
    // An upright second display with a desk arm, next to the lowered laptop.
    group='static';
    chamfer([.98,2.40,-.32],[1.45,2.46,.12],ivory,[.25,.32,0],undefined,.010);
    for(const x of [.38,1.58])box([x,2.40,-.387],[.018,2.18,.008],color('#ffd2a2'),[0,.38,8]);
    box([.98,3.51,-.387],[1.20,.018,.008],color('#ffd2a2'),[0,.38,8]);
    box([.98,2.408,-.254],[1.288125,2.29,.008],C.navy,[0,.65,.14]);
    beam([.98,1.15,-.39],[.98,1.95,-.39],.035);
    chamfer([.98,1.15,-.25],[.57,.035,.42],C.metal,[.9,.17,0],undefined,.003);
    sphere([1.57,1.198,-.253],[.008,.008,.005],color('#8fc6b5'),[0,.4,1.8]);
    group='laptop';
    const laptopTilt=-.12;
    chamfer([1.78,1.83,.0],[1.65,.98,.07],C.metal,[.7,.25,0],[laptopTilt,0,0],.006);
    box([1.78,1.85,.047],[1.47,.825,.007],color('#25151c'),[0,.65,.12],[laptopTilt,0,0]);
    chamfer([1.78,1.305,.47],[1.78,.055,.82],ivory,[.45,.3,0],undefined,.004);
    cylinder([1.78,1.337,.10],[.028,1.57,.028],C.metal,[1,.2,0],[0,0,PI/2]);
    for(const key of WorkspaceKeys.layout){
      const x=.99+(key.left+key.right)*1.58/2,z=.17+(key.top+key.bottom)*.41/2;
      box([x,1.338,z],[(key.right-key.left)*1.58,.012,(key.bottom-key.top)*.41],ink,[.12,.6,-(key.id+100)]);
    }
    chamfer([1.78,1.336,.70],[.54,.003,.20],C.metal,[.45,.4,0],undefined,.0008);
    for(const x of [1.34,2.22]){beam([x,1.13,.15],[x,1.28,.25],.026);beam([x,1.13,.15],[x,1.28,.69],.026);}
    group='phone';
    // Phone stays on the left. Cream casing and dark glass echo the reference's objects.
    chamfer([-2.60,1.555,.73],[.36,.73,.046],ivory,[.45,.27,0]);
    chamfer([-2.60,1.558,.758],[.307,.644,.006],C.blue,[0,.55,.12],undefined,.0015);
    box([-2.60,1.866,.763],[.098,.015,.003],ink);
    chamfer([-2.60,1.145,.72],[.47,.031,.40],C.metal,[1,.18,0],undefined,.003);beam([-2.60,1.16,.53],[-2.60,1.50,.66],.025);
    group='coffee';
    // Ceramic coffee, the dark liquid surface and a polished little saucer.
    cylinder([-2.03,1.295,1.00],[.13,.31,.13],C.paper,[.15,.23,0]);
    cylinder([-2.03,1.452,1.00],[.116,.004,.116],color('#35261c'),[.15,.28,0]);
    primitive('torus',[-2.03,1.452,1.00],[.119,.119,.065],C.paper,[.2,.25,0],[PI/2,0,0]);
    primitive('torus',[-2.20,1.30,1.00],[.078,.10,.08],C.paper,[.15,.25,0]);
    cylinder([-2.03,1.136,1.00],[.18,.015,.18],C.metal,[.85,.18,0]);
    group='keyboard';
    // A mechanical keyboard and mouse are modeled key by key.
    chamfer([-.54,1.15,.91],[1.82,.055,.58],C.metal,[.6,.32,0],undefined,.004);
    for(const key of WorkspaceKeys.layout){
      const x=-1.45+(key.left+key.right)*1.82/2,z=.62+(key.top+key.bottom)*.58/2;
      box([x,1.19,z],[(key.right-key.left)*1.82,.023,(key.bottom-key.top)*.58],key.code==='Escape'?C.orange:ivory,[.1,.48,-key.id]);
    }
    group='static';
    sphere([.84,1.20,.91],[.18,.095,.25],ink,[.25,.29,0]);box([.84,1.283,.84],[.012,.015,.075],C.metal,[.95,.15,0]);
    beam([.84,1.285,.90],[.84,1.279,1.05],.002,C.gray);
    // The room controls are still on the little physical desk pad.
    round([.20,1.18,.33],[.39,.13,.31],ink,[.4,.4,0]);
    for(let y=0;y<2;y++)for(let x=0;x<3;x++)box([.09+x*.106,1.251,.25+y*.13],[.073,.007,.069],[C.blue,C.orange,C.paper][x],[.1,.45,1.7]);
    group='shelf';
    // The shelf preserves the original books/controllers arrangement on the right wall.
    round([2.02,2.89,-.49],[2.63,.052,.55],ash,[.1,.45,0]);
    for(const x of [.84,3.19]){beam([x,2.82,-.75],[x,2.82,-.24],.012);beam([x,2.66,-.75],[x,2.82,-.24],.012);}
    const bookData=[['cv',.92,.45,C.blue],['skills',1.11,.49,C.paper],['tools',1.30,.41,C.red]];
    for(const [key,x,h,c] of bookData){
      group=key;round([x,2.927+h/2,-.46],[.155,h,.34],c,[.1,.5,0]);
      box([x,2.927+h/2,-.283],[.119,h-.035,.004],c);
      for(const y of [2.98,3.02,2.927+h-.06])box([x,y,-.277],[.092,.008,.004],C.gold,[.4,.4,0]);
    }
    for(const [key,x,c] of [['snake',1.81,C.red],['pong',2.35,ink],['arcade',2.89,C.paper]]){
      group=key;const y=3.055,z=-.40;
      sphere([x,y,z],[.19,.075,.085],c,[.22,.35,0]);box([x,2.93,z],[.14,.018,.14],ink);box([x,2.97,z-.03],[.025,.08,.028],ink);
      for(const sign of [-1,1])sphere([x+sign*.13,y-.05,z+.02],[.075,.10,.06],c,[.2,.4,0]);
      for(const sign of [-1,1]){cylinder([x+sign*.057,y+.068,z+.022],[.023,.018,.023],ink,[.1,.45,0]);}
      for(let i=0;i<4;i++)sphere([x+.12+Math.sin(i*PI/2)*.021,y+.065,z-.018+Math.cos(i*PI/2)*.021],[.007,.010,.007],[C.paper,C.red,C.blue,C.gold][i]);
      box([x-.115,y+.065,z-.03],[.043,.012,.012],ink);box([x-.115,y+.065,z-.03],[.012,.012,.043],ink);
      box([x,y+.075,z+.065],[.024,.008,.006],C.paper,[0,.4,1.7]);
    }
    group='static';
    // The real-time clock sits at the left of the desk, as in the reference.
    round([-2.35,1.29,.42],[.90,.33,.075],ink,[.45,.26,0]);
    // Orange mushroom lamp: a practical warm accent from the reference.
    cylinder([2.93,1.14,-.10],[.23,.025,.23],C.orange,[.18,.28,0]);
    cylinder([2.93,1.40,-.10],[.052,.50,.052],C.orange,[.18,.3,0]);
    primitive('dome',[2.93,1.71,-.10],[.37,.24,.37],C.orange,[.05,.28,0]);
    cylinder([2.93,1.706,-.10],[.35,.010,.35],color('#ffcd7d'),[0,.4,1]);
    group='record';
    // Turntable on a small chrome plinth above the phone, with a visible turning label.
    round([-2.55,2.06,-.50],[1.17,.045,.70],C.metal,[.9,.18,0]);
    for(const x of [-3.06,-2.04]){beam([x,1.88,-.82],[x,2.03,-.22],.012);beam([x,2.03,-.82],[x,2.03,-.22],.012);}
    round([-2.55,2.14,-.47],[1.03,.08,.64],wood,[.1,.48,0]);box([-2.55,2.185,-.47],[.96,.015,.56],ink,[.45,.3,0]);
    group='vinyl';cylinder([0,0,0],[.257,.014,.257],ink,[.55,.20,0]);
    for(let i=0;i<10;i++)primitive('torus',[0,.009,0],[.107+i*.015,.107+i*.015,.010],C.gray,[.75,.23,0],[PI/2,0,0]);
    cylinder([0,.013,0],[.073,.004,.073],C.orange,[.1,.4,0]);box([.02,.017,0],[.012,.002,.068],C.paper);sphere([0,.020,0],[.007,.007,.007],C.metal,[1,.15,0]);
    group='record';beam([-2.20,2.21,-.68],[-2.19,2.22,-.43],.013);beam([-2.19,2.22,-.43],[-2.36,2.22,-.27],.011);box([-2.36,2.215,-.27],[.043,.03,.043],ink);
    group='acHousing';
    // A split air conditioner replaces the ceiling fan. Its lower louver opens quietly.
    round([1.67,3.96,-.62],[2.32,.55,.39],C.paper,[.18,.38,0]);
    box([1.67,4.192,-.422],[2.13,.018,.006],ivory,[.2,.5,0]);
    round([1.67,3.775,-.414],[2.08,.105,.018],ink,[.2,.6,0]);
    for(let i=0;i<13;i++)box([.71+i*.16,3.775,-.401],[.009,.079,.018],C.gray,[.3,.6,0]);
    box([.75,4.018,-.418],[.20,.012,.007],C.gray,[.2,.6,0]);
    box([2.58,3.965,-.419],[.045,.018,.006],ink);
    group='acIndicator';box([2.58,3.965,-.412],[.031,.009,.005],color('#94bea8'),[0,.4,1.8]);
    group='acLouver';round([0,0,.04],[2.07,.025,.14],ivory,[.18,.48,0]);
    group='static';
    // A woven mat softens the floor below the desk.
    round([-.75,.025,1.36],[4.34,.035,1.34],color('#c4baa5'),[0,.92,0]);
    for(let i=0;i<32;i++)box([-2.82+i*.134,.044,1.36],[.007,.002,1.22],color('#b7ad99'),[0,.95,0]);
    // The reference's padded high-back gaming chair, with a five-caster base.
    group='chair';
    const leather=color('#303534'),bolster=color('#232a28'),stitch=color('#626b62');
    primitive('chairback',[0,.74,-.27],[1,1,1],leather,[.10,.69,0]);
    for(let i=0;i<chairOutline.length;i++){
      const point=([x,y])=>[x,.74+y,-.25-y*.13];beam(point(chairOutline[i]),point(chairOutline[(i+1)%chairOutline.length]),.0035,stitch,[.15,.7,0]);
    }
    for(const side of [-1,1]){
      round([side*.35,1.20,-.24],[.15,.66,.15],bolster,[.12,.62,0],[-.13,0,-side*.13]);
      beam([side*.24,.89,-.19],[side*.24,1.51,-.28],.003,stitch,[.1,.8,0]);
      box([side*.15,1.56,-.28],[.045,.30,.025],bolster,[.1,.8,0]);
    }
    round([0,1.68,-.31],[.41,.18,.14],bolster,[.12,.70,0],[-.13,0,0]);
    round([0,1.035,-.16],[.56,.24,.18],bolster,[.10,.72,0],[-.10,0,0]);
    for(const y of [1.62,1.72])beam([-.15,y,-.232],[.15,y,-.232],.0025,stitch,[.1,.8,0]);
    round([0,.72,.04],[.93,.18,.88],leather,[.12,.65,0]);
    for(const side of [-1,1])round([side*.40,.80,.035],[.12,.10,.75],bolster,[.12,.65,0],[0,0,-side*.20]);
    box([0,.60,.05],[.76,.05,.65],bolster,[.45,.45,0]);
    for(const side of [-1,1]){
      beam([side*.27,.56,.07],[side*.27,.54,.56],.018,C.metal,[.7,.35,0]);
      beam([side*.40,.61,-.20],[side*.51,.97,-.22],.022,bolster,[.25,.5,0]);
      beam([side*.40,.61,.25],[side*.51,.97,.36],.022,bolster,[.25,.5,0]);
      const p=t=>[side*.52,.99+Math.sin(t*PI)*.045,-.27+t*.66];
      for(let i=0;i<7;i++)beam(p(i/7),p((i+1)/7),.057,bolster,[.16,.55,0]);
      for(const t of [0,1])round(p(t),[.115,.085,.105],bolster,[.16,.55,0]);
    }
    round([0,.50,.54],[.72,.13,.30],leather,[.12,.70,0]);
    cylinder([0,.42,0],[.062,.30,.062],bolster,[.45,.45,0]);
    cylinder([0,.27,0],[.044,.22,.044],C.metal,[.85,.23,0]);
    cylinder([0,.18,0],[.108,.09,.108],bolster,[.5,.4,0]);
    beam([-.32,.57,.01],[-.56,.49,.12],.012,C.metal,[.65,.35,0]);round([-.56,.49,.12],[.12,.037,.06],bolster);
    for(let i=0;i<5;i++){
      const a=i*PI*2/5+.1,x=Math.sin(a)*.61,z=Math.cos(a)*.61;
      beam([0,.18,0],[x,.13,z],.030,bolster,[.55,.4,0]);cylinder([x,.105,z],[.025,.075,.025],bolster);
      for(const side of [-1,1])primitive('wheel',[x+Math.cos(a)*side*.032,.063,z-Math.sin(a)*side*.032],[.062,.025,.062],bolster,[.25,.55,0],[PI/2,a+PI/2,0]);
    }
    group='static';
    // Soft cable curves. Only visible scene geometry casts shadows.
    for(let i=0;i<30;i++){
      const p=t=>[-3.08-t*.65,.024,-.30+t*1.90+Math.sin(t*7)*.075];beam(p(i/30),p((i+1)/30),.006,ink,[.1,.6,0]);
    }
    for(let i=0;i<24;i++){
      const p=t=>[2.98,1.10*(1-t)+.025,-.25+Math.sin(t*7)*.03];beam(p(i/24),p((i+1)/24),.004,ink,[.1,.6,0]);
    }
    const plane=(x,y,z,w,h)=>[[x-w/2,y+h/2,z],[x+w/2,y+h/2,z],[x+w/2,y-h/2,z],[x-w/2,y-h/2,z]];
    const laptopScreen=plane(0,0,0,1.47,.825).map(p=>transform(p,compose([1.78,1.85,.052],[1,1,1],[laptopTilt,0,0])).slice(0,3));
    const surfaces={
      monitor:{quad:plane(-.60,2.15,.096,2.53,1.423125),size:[600,337.5],group:'monitor'},
      display:{quad:plane(.98,2.408,-.247,1.288125,2.29),size:[360,640]},
      laptop:{quad:laptopScreen,size:[400,225],group:'laptop'},
      phone:{quad:plane(-2.60,1.558,.765,.307,.644),size:[95,199],group:'phone'},
      clock:{quad:plane(-2.35,1.29,.462,.84,.252),size:[200,60]},
      cv:{quad:plane(.92,3.152,-.271,.155,.45),size:[50,145],group:'cv'},
      skills:{quad:plane(1.11,3.172,-.271,.155,.49),size:[50,158],group:'skills'},
      tools:{quad:plane(1.30,3.132,-.271,.155,.41),size:[50,132],group:'tools'},
      snake:{quad:plane(1.81,3.055,-.28,.43,.23),size:[100,54],group:'snake'},
      pong:{quad:plane(2.35,3.055,-.28,.43,.23),size:[100,54],group:'pong'},
      arcade:{quad:plane(2.89,3.055,-.28,.43,.23),size:[100,54],group:'arcade'},
      coffee:{quad:plane(-2.03,1.30,1.15,.43,.34),size:[100,79],group:'coffee'},
      steam:{quad:plane(-2.03,1.72,1.00,.30,.55),size:[80,146],group:'coffee'},
      curtain:{quad:[[3.45,4.45,-.85],[3.45,4.45,2.70],[3.45,.12,2.70],[3.45,.12,-.85]],size:[300,420]},
      laptopKeyboard:{quad:[[.99,1.353,.17],[2.57,1.353,.17],[2.57,1.353,.58],[.99,1.353,.58]],size:[430,155],group:'laptop'},
      keyboard:{quad:[[-1.45,1.21,.62],[.37,1.21,.62],[.37,1.21,1.20],[-1.45,1.21,1.20]],size:[430,155],group:'keyboard'},
      pad:{quad:[[0,1.26,.17],[.40,1.26,.17],[.40,1.26,.49],[0,1.26,.49]],size:[100,80]},
      lamp:{quad:plane(2.93,1.57,.30,.77,.73),size:[180,171]},
      record:{quad:[[-3.05,2.21,-.78],[-2.02,2.21,-.78],[-2.02,2.21,-.15],[-3.05,2.21,-.15]],size:[180,110],group:'record'},
      ac:{quad:plane(1.67,3.96,-.405,2.36,.58),size:[330,81],group:'acHousing'}
    };
    const deviceQuads={laptop:[[.955,2.32,.0],[2.605,2.32,.0],[2.67,1.278,.88],[.89,1.278,.88]]};
    return {groups:Object.fromEntries(Object.entries(groups).map(([key,data])=>[key,new Float32Array(data)])),surfaces,deviceQuads};
  }
  // One layout matrix positions both the real meshes and their live HTML surfaces.
  const layout={
    monitor:translation(-.65,0,0),keyboard:translation(-.65,0,0),
    laptop:compose([.88,.012,.24],[.88,.88,.88]),phone:translation(-.40,0,0),
    coffee:translation(2.43,0,.08),shelf:translation(0,.85,0),
    chair:compose([3.08,0,1.72],[.94,.94,.94],[0,-.85,0]),
    record:translation(-.10,1.15,0),acHousing:translation(-3.32,0,0)
  };
  function groupMatrix(key,time,hover={},state={}){
    if(key==='acLouver')return multiply(translation(-1.65,3.76,-.396),rotationX(state.ac===false?-1.45:-.38+Math.sin(time*.22)*.035));
    if(key==='acIndicator')return translation(-3.32,0,state.ac===false?-.025:0);
    if(key==='vinyl')return multiply(translation(-2.71,3.351,-.47),rotationY(time*.50));
    const base=layout[key]||(['cv','skills','tools','snake','pong','arcade'].includes(key)?layout.shelf:identity());
    const h=hover[key]||0;return h?multiply(base,translation(0,h*.012,h*.02)):base;
  }
  const deformationSource=`
    uniform float u_time;uniform float u_curtain;uniform vec4 u_keyCodes;uniform vec4 u_keyPress;
    float keyPressure(vec3 mat){
      if(mat.z>=-.5)return 0.0;
      return clamp(dot(vec4(1.0)-step(vec4(.25),abs(vec4(-mat.z)-u_keyCodes)),u_keyPress),0.0,1.0);
    }
    vec3 animatePoint(vec3 p,vec3 mat){
      if(mat.z>=3.9&&mat.z<=5.1){
        float drop=clamp((4.43-p.y)/4.30,0.0,1.0);drop*=drop;
        float anchor=mat.z<4.5?-.91:2.73;
        p.z=anchor+(p.z-anchor)*mix(1.0,.22,u_curtain);
        p.x+=sin(u_time*.31+p.z*3.0)*.010*drop;
      }
      p.y-=keyPressure(mat)*.011;
      return p;
    }`;
  const vertexSource=`
    attribute vec3 a_position; attribute vec3 a_normal; attribute vec3 a_color; attribute vec3 a_material;
    uniform mat4 u_camera; uniform mat4 u_model; uniform mat4 u_lightMatrix; uniform mat4 u_ceilingMatrix; uniform float u_reflect;
    varying highp vec3 v_world; varying vec3 v_normal; varying vec3 v_color; varying vec3 v_material; varying highp vec4 v_shadow; varying highp vec4 v_ceilingShadow;
    ${deformationSource}
    void main(){
      vec4 world=u_model*vec4(a_position,1.0);world.xyz=animatePoint(world.xyz,a_material);
      v_world=world.xyz;v_normal=mat3(u_model)*a_normal;
      if(a_material.z>=3.9&&a_material.z<=5.1)v_normal.z/=mix(1.0,.22,u_curtain);
      v_color=mix(a_color,vec3(.83,.66,.43),keyPressure(a_material)*.30);
      v_material=a_material;if(a_material.z<0.0||(a_material.z>3.9&&a_material.z<5.5))v_material.z=0.0;
      v_shadow=u_lightMatrix*world;
      v_ceilingShadow=u_ceilingMatrix*world;
      vec4 projected=world;if(u_reflect>.5)projected.y=-projected.y;
      gl_Position=u_camera*projected;
    }`;
  const fragmentSource=`
    precision highp float;
    uniform sampler2D u_shadow; uniform sampler2D u_ceilingShadow; uniform vec3 u_ceilingPosition; uniform float u_roomLight; uniform vec3 u_eye; uniform vec3 u_sun; uniform float u_day; uniform float u_brightness; uniform float u_lamp; uniform float u_time; uniform float u_reflect; uniform float u_floor;uniform float u_curtain;
    varying highp vec3 v_world; varying vec3 v_normal; varying vec3 v_color; varying vec3 v_material; varying highp vec4 v_shadow; varying highp vec4 v_ceilingShadow;
    float unpackDepth(vec4 c){return dot(c,vec4(1.0,1.0/255.0,1.0/65025.0,1.0/16581375.0));}
    float visibility(sampler2D map,vec4 projected,vec3 towardLight,float biasScale,float outside){
      vec3 p=projected.xyz/projected.w*.5+.5;
      if(projected.w<=0.0||p.x<0.0||p.x>1.0||p.y<0.0||p.y>1.0||p.z<0.0||p.z>1.0)return outside;
      float incidence=max(dot(normalize(v_normal),towardLight),0.0);
      float slope=sqrt(max(0.0,1.0-incidence*incidence))/max(incidence,.15);
      float bias=clamp(.0009+.0010*slope,.0012,.0075)*biasScale,sum=0.0;
      float radius=biasScale<.5?.0030:.0011;
      for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){float d=unpackDepth(texture2D(map,p.xy+vec2(float(x),float(y))*radius));sum+=p.z-bias<=d?1.0:0.0;}
      return sum/9.0;
    }
    void main(){
      if(v_material.z>2.5&&v_material.z<3.5){
        float height=clamp((v_world.y-.35)/4.05,0.0,1.0);
        vec3 daySky=mix(vec3(.84,.87,.81),vec3(.45,.66,.77),height);
        float drift=sin(u_time*.035)*.10;
        vec2 sky=vec2(v_world.z+9.0,v_world.y);
        vec2 a=(sky-vec2(-.30+drift,3.57))/vec2(.45,.10);
        vec2 b=(sky-vec2(1.10+drift,3.07))/vec2(.36,.082);
        float cloud=clamp(exp(-dot(a,a))*1.3+exp(-dot(b,b))*1.2,0.0,.80);
        daySky=mix(daySky,vec3(.96,.95,.88),cloud);
        vec3 nightSky=mix(vec3(.085,.14,.21),vec3(.025,.06,.13),height);
        gl_FragColor=vec4(mix(nightSky,daySky,u_day)*min(1.05,u_brightness),1.0);return;
      }
      vec3 n=normalize(v_normal),eye=u_eye;if(u_reflect>.5)eye.y=-eye.y;
      vec3 view=normalize(eye-v_world),halfVector=normalize(u_sun+view);
      float diffuse=max(dot(n,u_sun),0.0),shade=visibility(u_shadow,v_shadow,u_sun,1.0,1.0);
      vec3 base=pow(v_color,vec3(2.2));
      if(u_floor>.5){
        float row=floor(v_world.z/.31),offset=mod(row,3.0)*.61;
        float edge=min(fract(v_world.z/.31)*.31,fract((v_world.x+offset)/1.85)*1.85);
        float seam=smoothstep(.002,.009,edge);
        float grain=sin(v_world.x*84.0+sin(v_world.z*31.0)*1.6)*.015+sin(v_world.x*23.0+sin(v_world.z*19.0))*.018;
        base*=mix(.69,1.0,seam)*(1.0+grain+sin(row*41.2)*.045);
      }
      // Daylight enters from the right window; indoor bounce stays weaker than the key.
      float interior=1.0-smoothstep(3.50,3.80,v_world.x);
      // A ray must cross the actual opening before direct window light can enter the room.
      float travel=max(0.0,(3.67-v_world.x)/max(u_sun.x,.01));
      vec2 entry=v_world.yz+u_sun.yz*travel;
      float aperture=smoothstep(.30,.37,entry.x)*(1.0-smoothstep(4.38,4.45,entry.x));
      aperture*=smoothstep(-.83,-.76,entry.y)*(1.0-smoothstep(2.58,2.65,entry.y));
      shade*=mix(1.0,aperture,interior);
      float windowOpen=mix(1.0,mix(.32,1.0,u_curtain),interior);
      float windowFacing=max(dot(n,normalize(vec3(1.0,.38,.16))),0.0);
      vec3 ambient=mix(vec3(.075,.092,.14),vec3(.34,.34,.30),u_day)*(0.72+.28*max(n.y,0.0));
      ambient*=mix(1.0,windowOpen,.55*u_day);
      ambient+=mix(vec3(.018,.028,.050),vec3(.16,.17,.15),u_day)*windowFacing*windowOpen;
      vec3 sunlight=mix(vec3(.035,.055,.09),vec3(1.65,1.39,.98),u_day)*windowOpen;
      vec3 lit=base*(ambient+sunlight*diffuse*shade);
      float shine=pow(max(dot(n,halfVector),0.0),mix(10.0,170.0,1.0-v_material.y));
      lit+=sunlight*shine*mix(.06,1.0,v_material.x)*shade*step(.001,diffuse);
      float fresnel=pow(1.0-max(dot(n,view),0.0),3.0);
      vec3 reflection=mix(vec3(.09,.12,.17),vec3(.65,.72,.77),.5+.5*n.y);
      lit+=reflection*v_material.x*(.20+fresnel*.55)*mix(.35,.80,u_day)*mix(.40,1.0,shade)*windowOpen;
      if(u_roomLight>.001&&interior>.001){
        vec3 ceilingVector=u_ceilingPosition-v_world;
        vec3 towardCeiling=normalize(ceilingVector),warmWhite=vec3(1.0,.90,.76);
        float ceilingShade=visibility(u_ceilingShadow,v_ceilingShadow,towardCeiling,.20,0.0);
        vec2 ceilingUV=v_ceilingShadow.xy/v_ceilingShadow.w*.5+.5;
        float coverage=min(min(ceilingUV.x,1.0-ceilingUV.x),min(ceilingUV.y,1.0-ceilingUV.y));
        ceilingShade*=smoothstep(0.0,.10,coverage);
        float ceilingDiffuse=max(dot(n,towardCeiling),0.0);
        // The diffuser emits downward; broad indirect bounce fills the rest of the room.
        float reach=3.6*max(towardCeiling.y,0.0)/(1.0+dot(ceilingVector,ceilingVector)*.18);
        lit+=base*warmWhite*u_roomLight*interior*(.38+ceilingDiffuse*reach*ceilingShade);
        float highlight=pow(max(dot(n,normalize(towardCeiling+view)),0.0),mix(10.0,170.0,1.0-v_material.y));
        lit+=warmWhite*highlight*mix(.025,.30,v_material.x)*reach*ceilingShade*u_roomLight*interior*step(.001,ceilingDiffuse);
      }
      vec3 lampVector=vec3(2.93,1.65,-.10)-v_world;float lampDistance=length(lampVector);
      lit+=base*vec3(1.0,.43,.10)*max(dot(n,normalize(lampVector)),0.0)*u_lamp*1.7/(1.0+lampDistance*lampDistance*3.0);
      // Broad, bounded area-light approximations keep the glow soft and inexpensive.
      float sideGlow=u_lamp*mix(1.0,.18,smoothstep(.05,.82,u_day));
      vec3 amber=vec3(1.0,.49,.18);
      vec3 mainGlow=vec3(clamp(v_world.x,-2.47,-.03),clamp(v_world.y,1.51,2.81),-.13)-v_world;
      vec3 portraitGlow=vec3(clamp(v_world.x,.38,1.58),clamp(v_world.y,1.31,3.51),-.44)-v_world;
      float behind=1.0-smoothstep(-.12,-.05,v_world.z);
      float roomOnly=1.0-smoothstep(3.50,3.80,v_world.x);
      float wallWash=max(dot(n,normalize(mainGlow)),0.0)*1.9/(1.0+dot(mainGlow,mainGlow)*6.0);
      wallWash+=max(dot(n,normalize(portraitGlow)),0.0)*1.6/(1.0+dot(portraitGlow,portraitGlow)*7.0);
      vec3 edgeGlow=vec3(3.19,1.025,clamp(v_world.z,-.44,1.24))-v_world;
      float underDesk=1.0-smoothstep(1.025,1.10,v_world.y);
      float floorWash=max(dot(n,normalize(edgeGlow)),0.0)*1.5/(1.0+dot(edgeGlow,edgeGlow)*3.0);
      lit+=base*amber*sideGlow*roomOnly*(wallWash*behind+floorWash*underDesk);
      float emission=v_material.z;
      if(emission>8.5){
        lit+=vec3(1.0,.90,.76)*u_roomLight*2.6;emission=0.0;
      }else if(emission>7.5){
        lit+=amber*sideGlow*1.2;emission=0.0;
      }else if(emission>5.5){
        float night=1.0-smoothstep(.06,.58,u_day);
        if(emission<6.5){
          float seed=fract((emission-6.0)*2.5),occupied=step(.27,seed);
          vec3 glow=mix(vec3(1.0,.66,.29),vec3(.56,.77,1.0),step(.87,seed));
          lit+=glow*night*occupied*(.70+.035*sin(u_time*.12+seed*25.0));
        }else{
          float pulse=.20+.80*pow(.5+.5*sin(u_time*.60+v_world.z),4.0);
          lit+=vec3(.90,.18,.08)*night*pulse;
        }
        emission=0.0;
      }else if(emission>1.5)emission=.46+.025*sin(u_time*.55+v_world.x*17.0);
      else if(emission>.9)emission*=u_lamp;
      lit+=base*emission*1.8;
      lit*=u_brightness;
      vec3 result=pow(lit/(lit+vec3(.72)),vec3(1.0/2.2));
      float alpha=1.0;if(u_reflect>.5)alpha=.45*exp(-v_world.y*.20);if(u_floor>.5)alpha=.88;
      gl_FragColor=vec4(result,alpha);
    }`;
  const shadowVertex=`attribute vec3 a_position;attribute vec3 a_material;uniform mat4 u_camera;uniform mat4 u_model;${deformationSource}void main(){vec4 world=u_model*vec4(a_position,1.0);world.xyz=animatePoint(world.xyz,a_material);gl_Position=u_camera*world;}`;
  const shadowFragment=`
    precision highp float;
    void main(){highp float depth=gl_FragCoord.z;highp vec4 c=fract(depth*vec4(1.0,255.0,65025.0,16581375.0));c-=c.yzww*vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);gl_FragColor=c;}`;
  function lighting(day,minute=630){
    // Keep the source beyond the right-hand glazing as the day cycle progresses.
    // Both shading and the shadow camera share this direction, toward the left of the room.
    const drift=Math.sin(minute/1440*PI*2)*.40,target=[0,1.65,.20];
    const sunPosition=[11.8,5.65+clamp(day,0,1)*.30,2.45+drift];
    return {sun:normalize(sunPosition.map((v,i)=>v-target[i])),matrix:multiply(ortho(-6.5,6.5,-5.5,5.5,.2,28),lookAt(sunPosition,target))};
  }
  function ceilingLighting(){
    const position=[1.20,4.43,-.30];
    return {position,matrix:multiply(perspective(160*PI/180,1,.08,13),lookAt(position,[.1,0,1.4]))};
  }
  function createRenderer(canvas,scene,onFailure){
    let gl,disposed=false;const buffers=[],programs=[],shaders=[],textures=[],renderbuffers=[],framebuffers=[];
    try{
      gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false});if(!gl)throw new Error('Graphics unavailable');
      function shader(type,source){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader compilation failed');return s;}
      function program(v,f){const p=gl.createProgram();programs.push(p);gl.attachShader(p,shader(gl.VERTEX_SHADER,v));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('Shader link failed');return p;}
      const main=program(vertexSource,fragmentSource),shadow=program(shadowVertex,shadowFragment),gpu={};
      for(const [key,data] of Object.entries(scene.groups)){const buffer=gl.createBuffer();buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gpu[key]={buffer,count:data.length/12};}
      const shadowSize=1024;
      const depth=gl.createRenderbuffer();renderbuffers.push(depth);gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,shadowSize,shadowSize);
      function shadowMap(){
        const texture=gl.createTexture();textures.push(texture);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,shadowSize,shadowSize,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
        for(const [key,value] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,key,value);
        const framebuffer=gl.createFramebuffer();framebuffers.push(framebuffer);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Shadow buffer unavailable');
        return {texture,framebuffer};
      }
      const sunMap=shadowMap(),ceilingMap=shadowMap();gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      const locations=p=>Object.fromEntries(['camera','model','lightMatrix','ceilingMatrix','ceilingPosition','ceilingShadow','roomLight','eye','sun','day','brightness','lamp','time','reflect','floor','shadow','curtain','keyCodes','keyPress'].map(key=>[key,gl.getUniformLocation(p,'u_'+key)]));
      const uniforms=locations(main),shadowUniforms=locations(shadow),attributes=new Map();
      function bind(key,p){
        const mesh=gpu[key];gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
        let list=attributes.get(p);if(!list){list=['position','normal','color','material'].map((name,index)=>({location:gl.getAttribLocation(p,'a_'+name),index}));attributes.set(p,list);}
        for(const {location,index} of list)if(location>=0){gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,48,index*12);}
        return mesh.count;
      }
      const matrix=(location,m)=>{if(location!==null)gl.uniformMatrix4fv(location,false,new Float32Array(m));};
      let lastShadow=-Infinity,lastMinute=-100,lastInputs='',lastDay=-1;
      const ceiling=ceilingLighting();
      function draw({width,height,look={x:0,y:0},time=0,acTime=time,ac=true,recordTime=time,day=1,brightness=1,minute=630,lamp=true,roomLight=false,hover={},curtain=1,keyCodes=[0,0,0,0],keyPress=[0,0,0,0],force=false}){
        if(disposed||!width||!height)return null;
        const ratio=Math.min(window.devicePixelRatio||1,1.25,1700/width),w=Math.max(1,Math.round(width*ratio)),h=Math.max(1,Math.round(height*ratio));
        if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
        const view=camera(width/height,look),sun=lighting(day,minute),keys=Object.keys(gpu).filter(key=>!['floor','shadow'].includes(key));
        const model=key=>groupMatrix(key,key==='acLouver'?acTime:key==='vinyl'?recordTime:time,hover,{ac});
        gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.disable(gl.DITHER);
        const inputs=curtain.toFixed(3)+String(ac)+String(roomLight)+keyCodes.join(',')+keyPress.map(v=>v.toFixed(3)).join(',');
        if(force||inputs!==lastInputs||Math.abs(time-lastShadow)>.16||Math.abs(minute-lastMinute)>3||Math.abs(day-lastDay)>.01){
          function shadows(map,lightCamera,casters){
            gl.bindFramebuffer(gl.FRAMEBUFFER,map.framebuffer);gl.viewport(0,0,shadowSize,shadowSize);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.disable(gl.BLEND);gl.useProgram(shadow);matrix(shadowUniforms.camera,lightCamera);gl.uniform1f(shadowUniforms.time,time);gl.uniform1f(shadowUniforms.curtain,curtain);gl.uniform4fv(shadowUniforms.keyCodes,new Float32Array(keyCodes));gl.uniform4fv(shadowUniforms.keyPress,new Float32Array(keyPress));
            for(const key of casters){matrix(shadowUniforms.model,model(key));gl.drawArrays(gl.TRIANGLES,0,bind(key,shadow));}
          }
          shadows(sunMap,sun.matrix,keys);
          if(roomLight)shadows(ceilingMap,ceiling.matrix,keys.filter(key=>!['ceiling','city'].includes(key)));
          lastShadow=time;lastMinute=minute;lastInputs=inputs;lastDay=day;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.clearColor(.70,.67,.60,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(main);
        matrix(uniforms.camera,view.matrix);matrix(uniforms.lightMatrix,sun.matrix);gl.uniform3fv(uniforms.eye,new Float32Array(view.eye));gl.uniform3fv(uniforms.sun,new Float32Array(sun.sun));
        matrix(uniforms.ceilingMatrix,ceiling.matrix);gl.uniform3fv(uniforms.ceilingPosition,new Float32Array(ceiling.position));gl.uniform1f(uniforms.roomLight,roomLight?1:0);
        gl.uniform1f(uniforms.curtain,curtain);gl.uniform4fv(uniforms.keyCodes,new Float32Array(keyCodes));gl.uniform4fv(uniforms.keyPress,new Float32Array(keyPress));
        gl.uniform1f(uniforms.day,day);gl.uniform1f(uniforms.brightness,brightness);gl.uniform1f(uniforms.lamp,lamp?1:0);gl.uniform1f(uniforms.time,time);gl.uniform1f(uniforms.reflect,0);gl.uniform1f(uniforms.floor,0);
        gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,sunMap.texture);gl.uniform1i(uniforms.shadow,0);
        gl.activeTexture(gl.TEXTURE0+1);gl.bindTexture(gl.TEXTURE_2D,ceilingMap.texture);gl.uniform1i(uniforms.ceilingShadow,1);
        gl.disable(gl.BLEND);matrix(uniforms.model,identity());gl.drawArrays(gl.TRIANGLES,0,bind('static',main));
        // Mirror the actual geometry and animation before laying the translucent floor.
        gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(uniforms.reflect,1);
        for(const key of keys){matrix(uniforms.model,model(key));gl.drawArrays(gl.TRIANGLES,0,bind(key,main));}
        gl.uniform1f(uniforms.reflect,0);gl.uniform1f(uniforms.floor,1);matrix(uniforms.model,identity());gl.drawArrays(gl.TRIANGLES,0,bind('floor',main));
        gl.uniform1f(uniforms.floor,0);gl.disable(gl.BLEND);
        for(const key of keys.filter(key=>key!=='static')){matrix(uniforms.model,model(key));gl.drawArrays(gl.TRIANGLES,0,bind(key,main));}
        return view;
      }
      function dispose(){if(disposed)return;disposed=true;buffers.forEach(v=>gl.deleteBuffer(v));programs.forEach(v=>gl.deleteProgram(v));shaders.forEach(v=>gl.deleteShader(v));textures.forEach(v=>gl.deleteTexture(v));renderbuffers.forEach(v=>gl.deleteRenderbuffer(v));framebuffers.forEach(v=>gl.deleteFramebuffer(v));}
      return {draw,dispose};
    }catch{
      if(gl){buffers.forEach(v=>gl.deleteBuffer(v));programs.forEach(v=>gl.deleteProgram(v));shaders.forEach(v=>gl.deleteShader(v));textures.forEach(v=>gl.deleteTexture(v));renderbuffers.forEach(v=>gl.deleteRenderbuffer(v));framebuffers.forEach(v=>gl.deleteFramebuffer(v));}
      queueMicrotask(onFailure);return null;
    }
  }
  window.RoomStudio=Object.freeze({buildScene,createRenderer,camera,project,groupMatrix,lighting,ceilingLighting,shaders:{vertexSource,fragmentSource,shadowVertex,shadowFragment},math:{identity,multiply,translation,scaling,rotationY,transform,normalize}});
})();
