/* global LumaGL, document */
const {AnimationFrame, createGLContext, Model, Geometry, GL} = LumaGL;

const MANDELBROT_64_VERTEX_SHADER = `
#define SHADER_NAME mandelbrot_vertex_64

attribute vec2 aClipSpacePosition;
attribute vec2 aTexCoord;
attribute vec2 aCoordinate;
varying vec2 position;
varying vec2 uv;

void main(void) {
  gl_Position = vec4(aClipSpacePosition, 0., 1.);
  position = aClipSpacePosition;
  uv = aTexCoord;
}
`;

const MANDELBROT_64_FRAGMENT_SHADER = `\
#define SHADER_NAME mandelbrot_fragment_64

#ifdef GL_ES
precision highp float;
#endif

uniform float ONE;

// Based on a renderman shader by Michael Rivero
const int maxIterations = 1;
varying vec2 position;
uniform vec2 mandelbrotVertices[8];

vec2 split(float a) {
  const float SPLIT = 4097.0;
  float t = a * SPLIT;
  float a_hi = t * ONE - (t - a);
  float a_lo = a * ONE - a_hi;
  return vec2(a_hi, a_lo);
}

vec2 quickTwoSum(float a, float b) {
  float sum = (a + b) * ONE;
  float err = b - (sum - a) * ONE;
  return vec2(sum, err);
}

vec2 twoSum(float a, float b) {
  float s = (a + b) * ONE;
  float v = (s - a);
  float err = (a - (s - v) * ONE) * ONE + (b - v);
  return vec2(s, err);
}

vec2 twoSub(float a, float b) {
  float s = (a - b) * ONE;
  float v = (s - a);
  float err = (a - (s - v) * ONE) * ONE - (b + v);
  return vec2(s, err);
}

vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  float err = ((a_fp64.x * b_fp64.x - prod) + a_fp64.x * b_fp64.y +
    a_fp64.y * b_fp64.x) + a_fp64.y * b_fp64.y;
  return vec2(prod, err);
}

vec2 sum_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSum(a.x, b.x);
  t = twoSum(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 mul_fp64(vec2 a, vec2 b) {
  vec2 prod = twoProd(a.x, b.x);
  // y component is for the error
  prod.y += a.x * b.y;
  prod.y += a.y * b.x;
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

vec2 sub_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSub(a.x, b.x);
  t = twoSub(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

void main (void) {
  vec2 rangeReal = sub_fp64(mandelbrotVertices[6], mandelbrotVertices[0]);

  vec2 vReal = sum_fp64(mandelbrotVertices[0], mul_fp64(rangeReal, vec2(position.x, 0.0)));

  vec2 rangeImag = sub_fp64(mandelbrotVertices[7], mandelbrotVertices[1]);

  vec2 vImag = sum_fp64(mandelbrotVertices[1], mul_fp64(rangeImag, vec2(position.y, 0.0)));

  vec2 vCReal = vReal;
  vec2 vCImag = vImag;

  int divergeIteration = 0;
  for (int i = 0; i < 256; i++) {
    vec2 vTempReal = vReal;
    vec2 vTempImag = vImag;

    vec2 vTempRealSquared = mul_fp64(vTempReal, vTempReal);
    vec2 vTempImagSquared = mul_fp64(vTempImag, vTempImag);

    vReal = sub_fp64(vTempRealSquared, vTempImagSquared);
    vImag = mul_fp64(vec2(2.0, 0.0), mul_fp64(vTempReal, vTempImag));

    vReal = sum_fp64(vReal, vCReal);
    vImag = sum_fp64(vImag, vCImag);

    vec2 vRealSquared = mul_fp64(vReal, vReal);
    vec2 vImagSqaured = mul_fp64(vImag, vImag);
    vec2 vR2 = sum_fp64(vRealSquared, vImagSqaured);

    if (divergeIteration == 0 && vR2.x >= 4.0) {
      divergeIteration = i;
    }
  }
  int r = divergeIteration / 64;
  int g = (divergeIteration - r * 64) / 8;

  // Base the color on the number of iterations
  float r_val = fract((float(r) / 8.0));
  float g_val = fract((float(g) / 8.0));
  float b_val = fract((float(divergeIteration) / 8.0));
  gl_FragColor = vec4(r_val, g_val, b_val, 1.0);
}
`;

const geometry = new Geometry({
  drawMode: GL.TRIANGLE_STRIP,
  attributes: {
    aClipSpacePosition: {
      value: new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1, 1]),
      size: 2
    },
    aTexCoord: {
      value: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1, 1]),
      size: 2
    },
    aVec4Coord: {
      value: new Float32Array([0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0]),
      size: 4
    }
  }
});

// These are all interesting points
let centerPoints = [
  [-1.257368028466541028848, 0.378730831028625370052],
  [-1.985540371654130485531, 0.0],
  [-1.778103342740640371105, 0.007673942421213393926726719],
  [-1.428683445072090832353, 0.162497141672790506229031],
  [-1.749721929742338571710, -0.000029016647753687627476],
  [-0.896320622847, 0.000000000029],
  [-1.00183473, -0.00202091]
];
let centerOffsetX64 = centerPoints[0][0];
let centerOffsetY64 = centerPoints[0][1];
let zoom64 = 1;
const zoomThreshold64 = 1e12;

function fp64ify(a) {
  const hiPart = Math.fround(a);
  const loPart = a - Math.fround(a);
  return [hiPart, loPart];
}

new AnimationFrame()
.context(() => createGLContext({canvas: 'canvas-1'}))
.init(({gl}) => ({
  clipSpaceQuad: new Model({
    gl,
    vs: MANDELBROT_64_VERTEX_SHADER,
    fs: MANDELBROT_64_FRAGMENT_SHADER,
    geometry,
    vertexCount: 4
  })
}))
.setupFrame(({gl, canvas}) => {
  canvas.width = canvas.clientWidth;
  canvas.style.height = `${canvas.width}px`;
  canvas.height = canvas.width;
  gl.viewport(0, 0, canvas.width, canvas.height);
})
.frame(({tick, clipSpaceQuad}) => {

  const baseCorners = [
    [-1.0, -1.0],
    [1.0, -1.0],
    [-1.0, 1.0],
    [1.0, 1.0]
  ];
  zoom64 *= 1.05;
  if (zoom64 >= zoomThreshold64) {
    zoom64 = zoomThreshold64;
  }

  const div64 = document.getElementById('zoom-64bit');
  div64.innerHTML = `Zoom ${zoom64.toPrecision(2)}`;

  let corners64 = [];
  for (const corner of baseCorners) {
    const x = corner[0] / zoom64 + centerOffsetX64;
    const y = corner[1] / zoom64 + centerOffsetY64;
    corners64 = [...corners64, ...fp64ify(x), ...fp64ify(y)];
  }

  clipSpaceQuad
    .setUniforms({
      'mandelbrotVertices': corners64,
      'ONE': 1.0
    })
    .render();
});
