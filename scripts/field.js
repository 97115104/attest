// field.js — WebGL noise field background for attest
// Renders a full-screen fragment shader with flowing simplex noise

(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'field';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);

  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: false });
  if (!gl) return; // no WebGL, CSS fallback handles it

  const vert = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const frag = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_res;
    uniform float u_scroll;
    uniform float u_light;

    // --- simplex 2D noise (Ashima Arts) ---
    vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fbm(vec2 p) {
      float f = 0.0;
      f += 0.5000 * snoise(p); p *= 2.02;
      f += 0.2500 * snoise(p); p *= 2.03;
      f += 0.1250 * snoise(p); p *= 2.01;
      f += 0.0625 * snoise(p);
      return f / 0.9375;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float aspect = u_res.x / u_res.y;
      vec2 p = vec2(uv.x * aspect, uv.y);

      float scroll = u_scroll * 0.0003;
      float t = u_time * 0.08;

      // domain warping — feed noise into itself for organic distortion
      float warp1 = fbm(p * 1.8 + vec2(t * 0.7, scroll + t * 0.3));
      float warp2 = fbm(p * 1.5 + vec2(warp1 * 0.8 - t * 0.4, warp1 * 0.6 + t * 0.2));
      float n = fbm(p * 2.0 + vec2(warp2 * 1.2, warp2 * 0.9 + scroll));

      // color palette — shifts between dark and light mode
      vec3 base  = mix(vec3(0.06, 0.055, 0.07),  vec3(0.94, 0.93, 0.90),  u_light);
      vec3 col1  = mix(vec3(0.12, 0.08, 0.18),   vec3(0.88, 0.85, 0.92),  u_light);
      vec3 col2  = mix(vec3(0.08, 0.14, 0.20),   vec3(0.86, 0.90, 0.94),  u_light);
      vec3 col3  = mix(vec3(0.22, 0.12, 0.06),   vec3(0.92, 0.86, 0.78),  u_light);
      vec3 col4  = mix(vec3(0.04, 0.10, 0.12),   vec3(0.90, 0.94, 0.93),  u_light);

      // layer the colors using noise thresholds
      vec3 color = base;
      color = mix(color, col1, smoothstep(-0.4, 0.2, n));
      color = mix(color, col4, smoothstep(-0.1, 0.3, warp1) * 0.5);
      color = mix(color, col2, smoothstep(0.0, 0.5, warp2) * 0.4);

      // subtle bright veins where noise derivatives are steep
      float edge = abs(fbm(p * 3.0 + vec2(warp2, t * 0.5)) - 0.1);
      float vein = smoothstep(0.02, 0.0, edge) * 0.15;
      color += col3 * vein;

      // subtle vignette
      float vigStr = mix(0.3, 0.15, u_light);
      float vig = 1.0 - vigStr * length((uv - 0.5) * 1.4);
      color *= vig;

      // slight grain
      float grainStr = mix(0.015, 0.008, u_light);
      float grain = (fract(sin(dot(uv * u_time * 0.01, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * grainStr;
      color += grain;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compile(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(vert, gl.VERTEX_SHADER);
  const fs = compile(frag, gl.FRAGMENT_SHADER);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  // fullscreen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uScroll = gl.getUniformLocation(prog, 'u_scroll');
  const uLight = gl.getUniformLocation(prog, 'u_light');

  function isLightMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 1.0 : 0.0;
  }

  let lightMode = isLightMode();
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
      lightMode = isLightMode();
    });
  }

  let scrollY = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap for perf
  // render at half resolution for performance
  const SCALE = 0.5;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(canvas.clientWidth * dpr * SCALE);
    canvas.height = Math.floor(canvas.clientHeight * dpr * SCALE);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  resize();

  let start = performance.now();
  let frame = 0;

  function render() {
    // throttle to ~30fps to save battery
    frame++;
    if (frame % 2 === 0) {
      const t = (performance.now() - start) * 0.001;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uScroll, scrollY);
      gl.uniform1f(uLight, lightMode);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(render);
  }

  render();
})();
