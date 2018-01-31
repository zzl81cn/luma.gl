/* eslint-disable no-var, max-statements */

import {AnimationLoop, Program, Buffer, GL, setParameters} from 'luma.gl';
import assert from 'assert';
/* global console */
/* eslint-disable no-console */

const VERTEX_SHADER = `\
attribute vec2 positions;
uniform vec2 windowRect;
void main(void) {
  // Map each vertex from (0,0):windowRect -> (-1, -1):(1,1)
  vec2 pos = (positions * (2., 2.) / (windowRect)) - (1., 1.);
  gl_Position = vec4(pos, 1.0, 1.0);
}
`;

const FRAGMENT_SHADER = `\
#ifdef GL_ES
precision highp float;
#endif

void main(void) {
  gl_FragColor = vec4(0.2, 0.2, 1.0, 1.0);
}
`;

const animationLoop = new AnimationLoop({
  useDevicePixels: false,
  onInitialize({gl, canvas, aspect, width, height}) {

    console.log(`Canvas W: ${width} H: ${height}`);

    setParameters(gl, {
      clearColor: [0, 0, 0, 1],
      clearDepth: [1],
      depthTest: true,
      depthFunc: gl.LEQUAL,

      blend: true,
      blendEquation: GL.FUNC_ADD,
      blendFunc: [GL.ONE, GL.ONE]
//      blendColor: [1.0, 1.0, 1.0, 1.0],

    });

    var program = new Program(gl, {
      vs: VERTEX_SHADER,
      fs: FRAGMENT_SHADER
    });

    // const LINE_VERTS = [50, 10,   canvas.width, canvas.height]; // [-1, -1,   0.9, 0.9];
    const points = getRandomPoints({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      count: 100
    });
    const boundingRect = getBoundingRect(points, 100);

    var linePositions = new Buffer(gl, {size: 2, data: new Float32Array(points)});
    const boundingRectPositions = new Buffer(gl, {size: 2, data: new Float32Array(boundingRect)});
    const windowRect = [canvas.width, canvas.height];
    program.use();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw Lines
    program
      .setBuffers({
        positions: linePositions
      })
      .setUniforms({
        windowRect
      });
    gl.drawArrays(gl.POINTS, 0, 100);

    // EACH draw render (0.2, 0.2, 1.0) as it looks blue ish here but following draw make it white.
    gl.drawArrays(gl.POINTS, 0, 100);
    gl.drawArrays(gl.POINTS, 0, 100);
    gl.drawArrays(gl.POINTS, 0, 100);
    gl.drawArrays(gl.POINTS, 0, 100);

    program
      .setBuffers({
        positions: boundingRectPositions
      })
      .setUniforms({
        windowRect
      });
    gl.drawArrays(gl.LINES, 0, 2);
    gl.drawArrays(gl.LINES, 0, 2);
    gl.drawArrays(gl.LINES, 0, 2);
    gl.drawArrays(gl.LINES, 0, 2);

  }
});

animationLoop.getInfo = () => {
  return `
  <p>
    <a href="http://learningwebgl.com/blog/?p=28" target="_blank">
      A Triangle and a Square
    </a>
  <p>
    The classic WebGL Lessons in luma.gl
    `;
};

// cell start :origin (x, y)
// cell size : rect (width, height)
// number of points: count
// Result count number of points in an array , each point (x, y)
// such that  origin.x <= x < orgin.x + width
function getRandomPoints(opts) {
  assert(
    Number.isFinite(opts.x) &&
    Number.isFinite(opts.y) &&
    Number.isFinite(opts.width) &&
    Number.isFinite(opts.height) &&
    Number.isFinite(opts.count)
  );
  const points = new Array(opts.count * 2);
  for (let i = 0; i < opts.count; i++) {
    points[i * 2] = Math.floor(Math.random() * opts.width) + opts.x;
    points[(i * 2) + 1] = Math.floor(Math.random() * opts.height) + opts.y;
  }
  return points;
}

function getBoundingRect(points, count) {
  const rect = [points[0], points[1], points[0], points[1]];
  for (let i = 1; i < count; i++) {
    const x = points[i * 2];
    const y = points[(i * 2) + 1];
    if (x < rect[0]) {
      rect[0] = x;
    }
    if (y < rect[1]) {
      rect[1] = y;
    }
    if (x > rect[2]) {
      rect[2] = x;
    }
    if (y > rect[3]) {
      rect[3] = y;
    }
  }
  return rect;
}

export default animationLoop;

// expose on Window for standalone example
window.animationLoop = animationLoop; // eslint-disable-lie
