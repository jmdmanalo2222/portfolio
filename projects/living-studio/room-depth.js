'use strict';
(() => {
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  // Inverse depth keeps each photographed screen planar. A small feather outside
  // each silhouette stitches it into the desk without opening holes in the photo.
  const surfaces = {
    lightbar: {depth:.20, polygon:[[.291,.194],[.499,.194],[.498,.224],[.291,.225]]},
    monitor: {depth:.20, polygon:[[.200,.227],[.559,.220],[.559,.526],[.198,.597]]},
    laptop: {depth:.23, polygon:[[.602,.298],[.787,.298],[.813,.608],[.612,.617]]},
    phone: {depth:.37, polygon:[[.025,.57],[.078,.565],[.104,.797],[.02,.81]]},
    coffee: {depth:.45, polygon:[[.092,.73],[.178,.722],[.187,.877],[.09,.878]]},
    keyboard: {depth:.40, polygon:[[.373,.793],[.566,.704],[.627,.786],[.43,.874]]},
    pad: {depth:.30, polygon:[[.392,.623],[.477,.606],[.500,.715],[.420,.738]]},
    shelf: {depth:.045, polygon:[[.724,.05],[1,.05],[1,.228],[.72,.228]]},
    chair: {depth:.54, polygon:[[1,.519],[1,1],[.674,1],[.67,.879],[.819,.804]]}
  };
  function coverage(x, y, polygon) {
    let inside = false, distance = Infinity;
    for (let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
      const [ax,ay]=polygon[j],[bx,by]=polygon[i],dx=bx-ax,dy=by-ay;
      if ((ay>y)!==(by>y) && x<(bx-ax)*(y-ay)/(by-ay)+ax) inside=!inside;
      const t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy),0,1);
      distance=Math.min(distance,Math.hypot(x-ax-dx*t,y-ay-dy*t));
    }
    if(inside)return 1;
    const t=clamp(1-distance/.075,0,1);
    return t*t*(3-2*t);
  }
  function depthAt(x,y) {
    const ground=.015+clamp((y-.50-.075*x)/.46,0,1)*.47;
    const weights=Object.values(surfaces).map(surface=>({surface,weight:coverage(x,y,surface.polygon)}));
    const solid=weights.find(({weight})=>weight===1);
    if(solid)return solid.surface.depth;
    let depth=ground,total=1;
    for (const {surface,weight} of weights) {
      // Odds weights approach the rigid surface continuously, even when two
      // feathered silhouettes are close together (the pad and keyboard).
      const influence=weight/(1-weight);
      depth+=surface.depth*influence;total+=influence;
    }
    return depth/total;
  }
  function project(x,y,depth,view) {
    const w=1+view.x*.7*(x-.5)+view.y*.7*(y-.5);
    return [.5+((x-.5)*view.zoom+view.x*(depth-.12))/w,
      .5+((y-.5)*view.zoom+view.y*(depth-.12))/w];
  }
  function matrix(width,height,points) {
    const x=points.map(p=>p[0]),y=points.map(p=>p[1]);
    const dx1=x[1]-x[2],dx2=x[3]-x[2],dx3=x[0]-x[1]+x[2]-x[3];
    const dy1=y[1]-y[2],dy2=y[3]-y[2],dy3=y[0]-y[1]+y[2]-y[3];
    const det=dx1*dy2-dx2*dy1;
    if(!width||!height||Math.abs(det)<1e-10)return null;
    const g=(dx3*dy2-dx2*dy3)/det,h=(dx1*dy3-dx3*dy1)/det;
    return `matrix3d(${[(x[1]-x[0]+g*x[1])/width,(y[1]-y[0]+g*y[1])/width,0,g/width,
      (x[3]-x[0]+h*x[3])/height,(y[3]-y[0]+h*y[3])/height,0,h/height,0,0,1,0,x[0],y[0],0,1].join(',')})`;
  }
  function mesh(columns=184,rows=104) {
    const vertices=new Float32Array((columns+1)*(rows+1)*3);
    const indices=new Uint16Array(columns*rows*6);
    let v=0,i=0;
    for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){
      const u=x/columns,t=y/rows;
      vertices.set([u,t,depthAt(u,t)],v);v+=3;
    }
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const a=y*(columns+1)+x,b=a+1,c=a+columns+1;
      indices.set([a,c,b,b,c,c+1],i);i+=6;
    }
    return {vertices,indices};
  }
  const vertexSource=`
    attribute vec3 a_point;
    uniform vec3 u_view;
    varying vec2 v_uv;
    void main(){
      float w=1.0+u_view.x*.7*(a_point.x-.5)+u_view.y*.7*(a_point.y-.5);
      vec2 p=(a_point.xy-.5)*u_view.z+u_view.xy*(a_point.z-.12);
      gl_Position=vec4(2.0*p.x,-2.0*p.y,0.0,w);
      v_uv=a_point.xy;
    }`;
  const fragmentSource=`
    precision highp float;
    uniform sampler2D u_night;
    uniform sampler2D u_day;
    uniform float u_daylight;
    uniform float u_time;
    varying vec2 v_uv;
    void main(){
      vec3 color=mix(texture2D(u_night,v_uv).rgb,texture2D(u_day,v_uv).rgb,u_daylight);
      // Window shadows move across the wall and desk, away from live screens.
      float wall=smoothstep(.80,.85,v_uv.x)*(1.0-smoothstep(.45,.56,v_uv.y));
      float desk=smoothstep(.69,.75,v_uv.y)*(1.0-smoothstep(.95,1.0,v_uv.y));
      float sweep=v_uv.x*.82+v_uv.y*.55+sin(u_time*.045)*.035;
      float stripe=smoothstep(.10,.12,abs(fract(sweep*3.0)-.5));
      color*=1.0-u_daylight*(wall*.075+desk*.035)*stripe;
      vec2 spill=(v_uv-vec2(.23,.58))/vec2(.35,.14);
      float glow=exp(-dot(spill,spill))*sin(u_time*.55)*.013*(1.0-u_daylight);
      color+=vec3(.25,.38,1.0)*glow;
      gl_FragColor=vec4(color,1.0);
    }`;
  function createRenderer(canvas,night,day,ready,failed) {
    let gl,program,disposed=false,nightReady=false,dayReady=false;
    const buffers=[],textures=[],shaders=[];
    try {
      gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});
      if(!gl)throw new Error('No graphics context');
      function shader(type,source){
        const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);
        if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader unavailable');
        return s;
      }
      program=gl.createProgram();
      gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexSource));
      gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentSource));gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Renderer unavailable');
      gl.useProgram(program);
      const geometry=mesh(),vertexBuffer=gl.createBuffer(),indexBuffer=gl.createBuffer();
      buffers.push(vertexBuffer,indexBuffer);
      gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,geometry.vertices,gl.STATIC_DRAW);
      const attribute=gl.getAttribLocation(program,'a_point');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,geometry.indices,gl.STATIC_DRAW);
      const view=gl.getUniformLocation(program,'u_view'),light=gl.getUniformLocation(program,'u_daylight'),time=gl.getUniformLocation(program,'u_time');
      for(let unit=0;unit<2;unit++){
        const texture=gl.createTexture();textures.push(texture);gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([9,12,22,255]));
        gl.uniform1i(gl.getUniformLocation(program,unit?'u_day':'u_night'),unit);
      }
      function upload(image,unit){
        if(disposed||!image.complete||!image.naturalWidth)return;
        try{
          gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,textures[unit]);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
          if(unit)dayReady=true;else nightReady=true;
          if(nightReady)ready();
        }catch{failed();}
      }
      const loadNight=()=>upload(night,0),loadDay=()=>upload(day,1);
      night.addEventListener('load',loadNight);day.addEventListener('load',loadDay);
      // Defer callbacks until the caller has received the renderer instance.
      queueMicrotask(()=>{loadNight();loadDay();});
      return {
        draw(camera,daylight,width,height,seconds=0){
          if(disposed||!nightReady)return false;
          const ratio=Math.min(window.devicePixelRatio||1,1.5,2200/Math.max(width,1));
          const w=Math.max(1,Math.round(width*ratio)),h=Math.max(1,Math.round(height*ratio));
          if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
          gl.viewport(0,0,w,h);gl.uniform3f(view,camera.x,camera.y,camera.zoom);
          gl.uniform1f(time,seconds);
          gl.uniform1f(light,dayReady?clamp(daylight,0,1):0);
          gl.drawElements(gl.TRIANGLES,geometry.indices.length,gl.UNSIGNED_SHORT,0);
          return true;
        },
        dispose(){
          if(disposed)return;disposed=true;night.removeEventListener('load',loadNight);day.removeEventListener('load',loadDay);
          buffers.forEach(b=>gl.deleteBuffer(b));textures.forEach(t=>gl.deleteTexture(t));shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);
        }
      };
    }catch{
      if(gl){buffers.forEach(b=>gl.deleteBuffer(b));textures.forEach(t=>gl.deleteTexture(t));shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);}
      queueMicrotask(failed);return null;
    }
  }
  window.RoomDepth=Object.freeze({clamp,depthAt,project,matrix,mesh,surfaces,createRenderer});
})();
