/* global LumaGL, document */
const {AnimationFrame, createGLContext, Model, Geometry, GL} = LumaGL;

const MANDELBROT_32_VERTEX_SHADER = `
#define SHADER_NAME mandelbrot_vertex_32

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

const MANDELBROT_32_FRAGMENT_SHADER = `\
#define SHADER_NAME mandelbrot_fragment_32

#ifdef GL_ES
precision highp float;
#endif

// Based on a renderman shader by Michael Rivero
const int maxIterations = 1;
varying vec2 position;
uniform vec2 mandelbrotVertices[4];

void main (void) {
  float rangeReal = mandelbrotVertices[3].x - mandelbrotVertices[0].x;
  float real = mandelbrotVertices[0].x + position.x * rangeReal;

  float rangeImag = mandelbrotVertices[3].y - mandelbrotVertices[0].y;
  float imag = mandelbrotVertices[0].y + position.y * rangeImag;

  float Creal = real;
  float Cimag = imag;

  int divergeIteration = 0;
  for (int i = 0; i < 256; i++) {
    // z = z^2 + c
    float tempReal = real;
    float tempImag = imag;
    real = (tempReal * tempReal) - (tempImag * tempImag);
    imag = 2. * tempReal * tempImag;
    real += Creal;
    imag += Cimag;
    float r2 = (real * real) + (imag * imag);
    if (divergeIteration == 0 && r2 >= 4.0) {
      divergeIteration = i;
    }
  }
  int r = divergeIteration / 64;
  int g = (divergeIteration - r * 64) / 8;

  // Base the color on the number of iterations
  float r_val = fract((float(r) / 8.0));
  float g_val = fract((float(g) / 8.0));
  float b_val = fract((float(divergeIteration) / 8.0));
  gl_FragColor = vec4(b_val, r_val, g_val, 1.0);
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
  [-1.296354375872896773478, 0.4418515556622909852670589],
  [-0.896320622847, 0.000000000029],
  [-1.00183473, -0.00202091]
];

let centerOffsetX32 = centerPoints[0][0];
let centerOffsetY32 = centerPoints[0][1];
let zoom32 = 1;
const zoomThreshold32 = 1e7;
const width = 2.0;
const heigh = 2.0;
const zoomCenterX32 = -0.75;
const zoomCenterY32 = 1.0;

new AnimationFrame()
.context(() => createGLContext({canvas: 'canvas-0'}))
.init(({gl}) => ({
  clipSpaceQuad: new Model({
    gl,
    vs: MANDELBROT_32_VERTEX_SHADER,
    fs: MANDELBROT_32_FRAGMENT_SHADER,
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

  zoom32 *= 1.05;
  if (zoom32 >= zoomThreshold32) {
    zoom32 = zoomThreshold32;
  }

  const div32 = document.getElementById('zoom-32bit');
  div32.innerHTML = `Zoom ${zoom32.toPrecision(2)}`;

  let corners = [];
  for (const corner of baseCorners) {
    const x = corner[0] / zoom32 + centerOffsetX32;
    const y = corner[1] / zoom32 + centerOffsetY32;
    corners = [...corners, x, y];
  }

  clipSpaceQuad
    .setUniforms({
      'mandelbrotVertices': corners
    })
    .render();
});
