/* eslint-disable no-var, max-statements */

import {
  AnimationLoop, Buffer, GL, setParameters,
  Model
} from 'luma.gl';
import assert from 'assert';
/* global console */
/* eslint-disable no-console */

const VERTEX_SHADER_POINTS = `\
attribute vec2 positions;
uniform vec2 windowRect;
void main(void) {
  // Map each vertex from (0,0):windowRect -> (-1, -1):(1,1)
  vec2 pos = (positions * (2., 2.) / (windowRect)) - (1., 1.);
  gl_Position = vec4(pos, 1.0, 1.0);
}
`;

const FRAGMENT_SHADER_POINTS = `\
#ifdef GL_ES
precision highp float;
#endif

void main(void) {
  gl_FragColor = vec4(1.0, 0, 0, 1.0);
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

    const pointCount = 100;
    // Get random points in (0, 0 ) -> (canvas.width, canvas.height)
    const points = getRandomPoints({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      count: pointCount
    });
    const boundingRect = getBoundingRect(points, pointCount);

    const pointPositions = new Buffer(gl, {size: 2, data: new Float32Array(points)});
    const boundingRectPositions = new Buffer(gl, {size: 2, data: new Float32Array(boundingRect)});
    const windowRect = [canvas.width, canvas.height];
    const pointsModel = new Model(gl, {
      id: 'Points-Model',
      vs: VERTEX_SHADER_POINTS,
      fs: FRAGMENT_SHADER_POINTS,
      attributes: {
        positions: pointPositions
      },
      uniforms: {
        windowRect
      },
      vertexCount: pointCount,
      drawMode: GL.POINTS
    });
    const boundingRectModel = new Model(gl, {
      id: 'BoundingRect-Model',
      vs: VERTEX_SHADER_POINTS,
      fs: FRAGMENT_SHADER_POINTS,
      attributes: {
        positions: boundingRectPositions
      },
      uniforms: {
        windowRect
      },
      vertexCount: 2,
      drawMode: GL.LINES
    });

    return {
      pointsModel,
      boundingRectModel
    };
  },
  onRender(context) {
    const {gl, pointsModel, boundingRectModel} = context;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pointsModel.render();
    boundingRectModel.render();
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
