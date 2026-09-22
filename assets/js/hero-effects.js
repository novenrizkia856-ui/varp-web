const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function createGradientCanvas(host) {
  const canvas = document.createElement("canvas");
  canvas.className = "varp-hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return;

  const noiseCanvas = document.createElement("canvas");
  const noiseContext = noiseCanvas.getContext("2d", { alpha: true });
  let width = 0;
  let height = 0;
  let lastNoise = -1;
  let frame = 0;

  function resize() {
    const bounds = host.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 1.35);
    width = Math.max(640, Math.round(bounds.width * scale * 0.78));
    height = Math.max(420, Math.round(bounds.height * scale * 0.78));
    canvas.width = width;
    canvas.height = height;
    noiseCanvas.width = Math.max(320, Math.round(width / 2));
    noiseCanvas.height = Math.max(210, Math.round(height / 2));
  }

  function drawNoise(seed) {
    if (!noiseContext || seed === lastNoise) return;
    lastNoise = seed;
    const image = noiseContext.createImageData(noiseCanvas.width, noiseCanvas.height);
    let state = (seed * 1103515245 + 12345) >>> 0;
    for (let index = 0; index < image.data.length; index += 4) {
      state = (state * 1664525 + 1013904223) >>> 0;
      const value = (state >>> 24) & 255;
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 42;
    }
    noiseContext.putImageData(image, 0, 0);
  }

  function radial(x, y, radius, inner, outer = "rgba(0,0,0,0)") {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, inner);
    gradient.addColorStop(1, outer);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }

  function render(timestamp = 0) {
    const time = reduceMotion.matches ? 1.8 : timestamp * 0.001;
    const wave = Math.sin(time * 0.34);
    const drift = Math.sin(time * 0.19 + 1.2);
    const light = 0.78 + 0.22 * Math.sin(time * 0.42 - 0.7);

    const base = context.createLinearGradient(0, 0, 0, height);
    base.addColorStop(0, `rgb(${Math.round(20 + light * 24)} ${Math.round(20 + light * 18)} ${Math.round(18 + light * 14)})`);
    base.addColorStop(0.43, `rgb(${Math.round(104 + light * 46)} ${Math.round(103 + light * 40)} ${Math.round(98 + light * 34)})`);
    base.addColorStop(0.78, "rgb(224 223 219)");
    base.addColorStop(1, "rgb(251 251 250)");
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    context.fillStyle = base;
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = "screen";
    context.globalAlpha = 1;
    radial(width * (0.06 + drift * 0.025), height * (-0.04 + wave * 0.025), width * 0.64, `rgba(255,67,5,${0.84 + light * 0.16})`);
    context.globalAlpha = 0.6;
    radial(width * (1.03 - drift * 0.035), height * 0.23, width * 0.42, "rgba(115,191,196,.82)");

    context.globalCompositeOperation = "multiply";
    context.globalAlpha = 0.86;
    radial(width * (0.64 + wave * 0.035), height * -0.05, width * 0.48, "rgba(20,19,17,.94)");

    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.88;
    radial(width * (0.02 + drift * 0.02), height * -0.08, width * 0.48, "rgba(255,58,0,.92)");

    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.72 + light * 0.22;
    const beamX = width * (0.79 + wave * 0.045);
    const beam = context.createLinearGradient(beamX - width * 0.18, 0, beamX + width * 0.2, height);
    beam.addColorStop(0, "rgba(255,255,255,0)");
    beam.addColorStop(0.42, "rgba(255,244,230,.14)");
    beam.addColorStop(0.57, "rgba(255,248,236,.92)");
    beam.addColorStop(0.72, "rgba(255,255,255,.18)");
    beam.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = beam;
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.76;
    const bottomFade = context.createLinearGradient(0, height * 0.43, 0, height);
    bottomFade.addColorStop(0, "rgba(255,255,255,0)");
    bottomFade.addColorStop(1, "rgba(255,255,255,.96)");
    context.fillStyle = bottomFade;
    context.fillRect(0, 0, width, height);

    drawNoise(Math.floor(time * 9));
    context.globalCompositeOperation = "overlay";
    context.globalAlpha = 0.22;
    context.imageSmoothingEnabled = true;
    context.drawImage(noiseCanvas, 0, 0, width, height);
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";

    if (!reduceMotion.matches) frame = window.requestAnimationFrame(render);
  }

  resize();
  host.classList.add("is-canvas-ready");
  render();
  window.addEventListener("resize", resize, { passive: true });
  reduceMotion.addEventListener?.("change", () => {
    window.cancelAnimationFrame(frame);
    render();
  });
}

const vertexShader = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 vP;
void main(){vP=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;

const fragmentShader = `#version 300 es
precision highp float;
in vec2 vP;
out vec4 oC;
uniform sampler2D u_tex;
uniform float u_time,u_ratio,u_imgRatio,u_seed,u_scale,u_refract,u_blur,u_liquid;
uniform float u_bright,u_contrast,u_angle,u_fresnel,u_sharp,u_wave,u_noise,u_chroma;
uniform float u_distort,u_contour;
uniform vec3 u_lightColor,u_darkColor,u_tint;
vec3 sC,sM;
vec3 pW(vec3 v){vec3 i=floor(v),f=fract(v),s=sign(fract(v*.5)-.5),h=fract(sM*i+i.yzx),c=f*(f-1.);return s*c*((h*16.-4.)*c-1.);}
vec3 aF(vec3 b,vec3 c){return pW(b+c.zxy-pW(b.zxy+c.yzx)+pW(b.yzx+c.xyz));}
vec3 lM(vec3 s,vec3 p){return(p+aF(s,p))*.5;}
vec2 fA(){vec2 c=vP-.5;c.x*=u_ratio>u_imgRatio?u_ratio/u_imgRatio:1.;c.y*=u_ratio>u_imgRatio?1.:u_imgRatio/u_ratio;return vec2(c.x+.5,.5-c.y);}
vec2 rot(vec2 p,float r){float c=cos(r),s=sin(r);return vec2(p.x*c+p.y*s,p.y*c-p.x*s);}
float bM(vec2 c,float t){vec2 l=smoothstep(vec2(0.),vec2(t),c),u=smoothstep(vec2(0.),vec2(t),1.-c);return l.x*l.y*u.x*u.y;}
float mG(float hi,float lo,float t,float sh,float cv){sh*=(2.-u_sharp);float ci=smoothstep(.15,.85,cv),r=lo;float e1=.08/u_scale;r=mix(r,hi,smoothstep(0.,sh*1.5,t));r=mix(r,lo,smoothstep(e1-sh,e1+sh,t));float e2=e1+.05/u_scale*(1.-ci*.35);r=mix(r,hi,smoothstep(e2-sh,e2+sh,t));float e3=e2+.025/u_scale*(1.-ci*.45);r=mix(r,lo,smoothstep(e3-sh,e3+sh,t));float e4=e1+.1/u_scale;r=mix(r,hi,smoothstep(e4-sh,e4+sh,t));float rm=1.-e4,gT=clamp((t-e4)/rm,0.,1.);r=mix(r,mix(hi,lo,smoothstep(0.,1.,gT)),smoothstep(e4-sh*.5,e4+sh*.5,t));return r;}
void main(){
  sC=fract(vec3(.7548,.5698,.4154)*(u_seed+17.31))+.5;sM=fract(sC.zxy-sC.yzx*1.618);
  vec2 sc=vec2(vP.x*u_ratio,1.-vP.y);float angleRad=u_angle*3.14159/180.;sc=rot(sc-.5,angleRad)+.5;sc=clamp(sc,0.,1.);
  float sl=sc.x-sc.y,an=u_time*.001;vec2 iC=fA();vec4 texSample=texture(u_tex,iC);float dp=texSample.r;float shapeMask=texSample.a;
  vec3 hi=u_lightColor*u_bright;vec3 lo=u_darkColor*(2.-u_bright);lo.b+=smoothstep(.6,1.4,sc.x+sc.y)*.08;
  vec2 fC=sc-.5;float rd=length(fC+vec2(0.,sl*.15));vec2 ag=rot(fC,(.22-sl*.18)*3.14159);float cv=1.-pow(rd*1.65,1.15);cv*=pow(sc.y,.35);
  float vs=shapeMask;vs*=bM(iC,.01);float fr=pow(1.-cv,u_fresnel)*.3;vs=min(vs+fr*vs,1.);
  float mT=an*.0625;vec3 wO=vec3(-1.05,1.35,1.55);vec3 wA=aF(vec3(31.,73.,56.),mT+wO)*.22*u_wave;vec3 wB=aF(vec3(24.,64.,42.),mT-wO.yzx)*.22*u_wave;
  vec2 nC=sc*45.*u_noise;nC+=aF(sC.zxy,an*.17*sC.yzx-sc.yxy*.35).xy*18.*u_wave;vec3 tC=vec3(.00041,.00053,.00076)*mT+wB*nC.x+wA*nC.y;tC=lM(sC,tC);tC=lM(sC+1.618,tC);
  float tb=sin(tC.x*3.14159)*.5+.5;tb=tb*2.-1.;float noiseVal=pW(vec3(sc*8.+an,an*.5)).x;float edgeFactor=smoothstep(0.,.5,dp)*smoothstep(1.,.5,dp);
  float lD=dp+(1.-dp)*u_liquid*tb;lD+=noiseVal*u_distort*.15*edgeFactor;float rB=clamp(1.-cv,0.,1.);float fl=ag.x+sl;fl+=noiseVal*sl*u_distort*edgeFactor;fl*=mix(1.,1.-dp*.5,u_contour);fl-=dp*u_contour*.8;
  float eI=smoothstep(0.,1.,lD)*smoothstep(1.,0.,lD);fl-=tb*sl*1.8*eI;float cA=cv*clamp(pow(sc.y,.12),.25,1.);fl*=.12+(1.05-lD)*cA;fl*=smoothstep(1.,.65,lD);
  float vA1=smoothstep(.08,.18,sc.y)*smoothstep(.38,.18,sc.y);float vA2=smoothstep(.08,.18,1.-sc.y)*smoothstep(.38,.18,1.-sc.y);fl+=vA1*.16+vA2*.025;fl*=.45+pow(sc.y,2.)*.55;fl*=u_scale;fl-=an;
  float rO=rB+cv*tb*.025;float vM1=smoothstep(-.12,.18,sc.y)*smoothstep(.48,.08,sc.y);float cM1=smoothstep(.35,.55,cv)*smoothstep(.95,.35,cv);rO+=vM1*cM1*4.5;rO-=sl;
  float bO=rB*1.25;float vM2=smoothstep(-.02,.35,sc.y)*smoothstep(.75,.08,sc.y);float cM2=smoothstep(.35,.55,cv)*smoothstep(.75,.35,cv);bO+=vM2*cM2*.9;bO-=lD*.18;rO*=u_refract*u_chroma;bO*=u_refract*u_chroma;
  float sf=u_blur;float rP=fract(fl+rO);float rC=mG(hi.r,lo.r,rP,sf+.018+u_refract*cv*.025,cv);float gP=fract(fl);float gC=mG(hi.g,lo.g,gP,sf+.008/max(.01,1.-sl),cv);float bP=fract(fl-bO);float bC=mG(hi.b,lo.b,bP,sf+.008,cv);
  vec3 col=vec3(rC,gC,bC);col=(col-.5)*u_contrast+.5;col=clamp(col,0.,1.);col=mix(col,1.-min(vec3(1.),(1.-col)/max(u_tint,vec3(.001))),length(u_tint-1.)*.5);col=clamp(col,0.,1.);oC=vec4(col*vs,vs);
}`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createDistanceTexture(image, size = 384) {
  const source = document.createElement("canvas");
  source.width = size;
  source.height = size;
  const context = source.getContext("2d", { willReadFrequently: true });
  context.clearRect(0, 0, size, size);
  context.drawImage(image, 0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  const count = size * size;
  const alpha = new Float32Array(count);
  const mask = new Uint8Array(count);
  const edge = new Uint8Array(count);
  const distance = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 4;
    alpha[index] = pixels[offset + 3] / 255;
    mask[index] = alpha[index] > 0.1 ? 1 : 0;
  }
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      if (!mask[index]) continue;
      if (x === 0 || x === size - 1 || y === 0 || y === size - 1 || !mask[index - 1] || !mask[index + 1] || !mask[index - size] || !mask[index + size]) edge[index] = 1;
    }
  }
  for (let pass = 0; pass < 110; pass += 1) {
    for (let y = 1; y < size - 1; y += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const index = y * size + x;
        if (!mask[index] || edge[index]) continue;
        const average = (distance[index - 1] + distance[index + 1] + distance[index - size] + distance[index + size]) / 4;
        distance[index] = 1.85 * (0.01 + average) - 0.85 * distance[index];
      }
    }
  }
  let maximum = 1;
  for (const value of distance) maximum = Math.max(maximum, value);
  const texture = context.createImageData(size, size);
  for (let index = 0; index < count; index += 1) {
    const offset = index * 4;
    const normalized = distance[index] / maximum;
    const value = Math.round(255 * (1 - normalized * normalized));
    texture.data[offset] = value;
    texture.data[offset + 1] = value;
    texture.data[offset + 2] = value;
    texture.data[offset + 3] = Math.round(255 * alpha[index]);
  }
  return texture;
}

function color(hex) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  return [0, 2, 4].map((index) => parseInt(normalized.slice(index, index + 2), 16) / 255);
}

function createLiquidLogo(host) {
  const canvas = document.createElement("canvas");
  canvas.className = "varp-hero-liquid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!gl) return;

  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {};
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let index = 0; index < uniformCount; index += 1) {
    const info = gl.getActiveUniform(program, index);
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }

  const setFloat = (name, value) => gl.uniform1f(uniforms[name], value);
  const setColor = (name, value) => gl.uniform3fv(uniforms[name], color(value));
  setFloat("u_seed", 42);
  setFloat("u_scale", 4);
  setFloat("u_refract", 0.01);
  setFloat("u_blur", 0.015);
  setFloat("u_liquid", 0.75);
  setFloat("u_bright", 2);
  setFloat("u_contrast", 0.5);
  setFloat("u_angle", 0);
  setFloat("u_fresnel", 1);
  setFloat("u_sharp", 1);
  setFloat("u_wave", 1);
  setFloat("u_noise", 0.5);
  setFloat("u_chroma", 2);
  setFloat("u_distort", 1);
  setFloat("u_contour", 0.2);
  setColor("u_lightColor", "#ea580c");
  setColor("u_darkColor", "#222222");
  setColor("u_tint", "#f97316");

  const size = Math.min(900, Math.max(600, Math.round(700 * Math.min(window.devicePixelRatio || 1, 1.35))));
  canvas.width = size;
  canvas.height = size;
  gl.viewport(0, 0, size, size);
  gl.clearColor(0, 0, 0, 0);

  const image = new Image();
  image.onload = () => {
    const data = createDistanceTexture(image);
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, data.width, data.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data.data);
    gl.uniform1i(uniforms.u_tex, 0);
    setFloat("u_imgRatio", 1);
    setFloat("u_ratio", 1);

    host.append(canvas);
    host.classList.add("is-liquid-ready");
    let previous = performance.now();
    let elapsed = 0;
    const render = (now) => {
      elapsed += (now - previous) * 0.3;
      previous = now;
      setFloat("u_time", reduceMotion.matches ? 1500 : elapsed);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduceMotion.matches) window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);
  };
  image.src = "assets/images/varp-hero-burst.svg";
}

export function initHeroEffects() {
  const atmosphere = document.querySelector(".varp-hero-atmosphere");
  const burst = document.querySelector(".varp-hero-burst");
  if (atmosphere) createGradientCanvas(atmosphere);
  if (burst) createLiquidLogo(burst);
}
