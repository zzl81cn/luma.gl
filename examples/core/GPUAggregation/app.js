/* eslint-disable no-var, max-statements */

import {
  AnimationLoop, Buffer, GL, setParameters,
  Model, Framebuffer, Renderbuffer, Texture2D
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


const VERTEX_SHADER_POINTS_TO_BINS = `\
attribute vec2 positions;
uniform vec2 windowRect;
uniform vec2 cellSize;
void main(void) {

  // Map each vertex from (0,0):windowRect -> (0, 0): texRect
  vec2 pos = positions / cellSize;
  vec2 texRect = windowRect / cellSize; // TODO-1: this must be Integer division

  // TODO-2: final rendering buffer size should be textRect

  // Map each vertex from (0,0):texRect -> (-1, -1):(1,1)
  pos = (pos * (2., 2.) / (texRect)) - (1., 1.);
  gl_Position = vec4(pos, 1.0, 1.0);
}
`;


const FRAGMENT_SHADER_POINTS = `\
#ifdef GL_ES
precision highp float;
#endif

void main(void) {
  gl_FragColor = vec4(0.1, 0, 0, 1.0);
}
`;

const RENDER_GRIDTEX_VS = `\
attribute vec2 positions;
attribute vec2 texCoords;
varying vec2 vTextureCoord;
void main(void) {
  gl_Position = vec4(positions, 1.0, 1.0);

  vTextureCoord = texCoords;
}
`;

const RENDER_GRIDTEX_FS = `\
#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  // gl_FragColor = vec4(1.0, 0, 0, 1.0);
  gl_FragColor = vec4(textureColor.rgb, 1.0);
}
`;

// RENDER each pixel in Grid as vertex, sample the value for gridTex
// Setup blending to sum values of RGB and Max value for A
const AGGREGATE_SUM_GRIDTEX_VS = `\
attribute vec2 positions;
attribute vec2 texCoords;
varying vec2 vTextureCoord;
void main(void) {
  // Position is in screen space
   gl_Position = vec4(-1.0, -1.0, 1.0, 1.0);
  //gl_Position = vec4(positions.rg, 1.0, 1.0); //-hack

  vTextureCoord = texCoords;
}
`;

const AGGREGATE_SUM_GRIDTEX_FS = `\
#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  // gl_FragColor = vec4(1.0, 0, 0, 1.0);
  gl_FragColor = vec4(textureColor.rgb, textureColor.r);
}
`;

let gridFramebuffer;
let girdAggregrationFramebuffer;

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

    const pointCount = 10; //00;
    // Get random points in (0, 0 ) -> (canvas.width, canvas.height)
    let points = getRandomPoints({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      count: 2
    });

    const points2 = getRandomPoints({
      x: 50,
      y: 50,
      width: 10,
      height: 10,
      count: pointCount - 2
    });

    points = points.concat(points2);

    const boundingRect = getBoundingRect(points, pointCount);
    // const canvasW = canvas.width;
    // const canvasH = canvas.height;

    const gridTexRectVertices = [1, 1,  -1, 1,  1, -1,  -1, -1];
    const gridTexCoords = new Float32Array([
      1.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      0.0, 0.0
    ]);

    const windowRect = [canvas.width, canvas.height];
    const cellSize = [10, 10];
    const gridSize = [
      Math.floor(windowRect[0] / cellSize[0]),
      Math.floor(windowRect[1] / cellSize[1])
    ];

    const gridTexPixels = getVertexPerEachPixel(gridSize);
    const gridTexTexCoords = getTexCoordPerEachPixel(gridSize);

    const pointPositions = new Buffer(gl, {size: 2, data: new Float32Array(points)});
    const boundingRectPositions = new Buffer(gl, {size: 2, data: new Float32Array(boundingRect)});
    const gridTexRectPositions = new Buffer(gl, {size: 2, data: new Float32Array(gridTexRectVertices)});
    const gridTexRectTexCoords = new Buffer(gl, {size: 2, data: new Float32Array(gridTexCoords)});

    const gridTexRectPixelPositions = new Buffer(gl, {size: 2, data: new Float32Array(gridTexPixels)});
    const gridTexRectPixelTexCoords = new Buffer(gl, {size: 2, data: new Float32Array(gridTexTexCoords)});

    const pointsModel = new Model(gl, {
      id: 'Points-Model',
      // vs: VERTEX_SHADER_POINTS,
      vs: VERTEX_SHADER_POINTS_TO_BINS,
      fs: FRAGMENT_SHADER_POINTS,
      attributes: {
        positions: pointPositions
      },
      uniforms: {
        windowRect,
        cellSize
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

    const girdTexModel = new Model(gl, {
      id: 'GridTexture-Model',
      vs: RENDER_GRIDTEX_VS,
      fs: RENDER_GRIDTEX_FS,
      attributes: {
        positions: gridTexRectPositions,
        texCoords: gridTexRectTexCoords
      },
      vertexCount: 4,
      drawMode: GL.TRIANGLE_STRIP
    });

    const girdAggregationTexModel = new Model(gl, {
      id: 'GridAggregationTexture-Model',
      vs: AGGREGATE_SUM_GRIDTEX_VS,
      fs: AGGREGATE_SUM_GRIDTEX_FS,
      attributes: {
        positions: gridTexRectPixelPositions,
        texCoords: gridTexRectPixelTexCoords
      },
      vertexCount: gridTexPixels.length / 2,
      drawMode: GL.POINTS
    });

    return {
      pointsModel,
      boundingRectModel,
      girdTexModel,
      girdAggregationTexModel,
      cellSize,
      gridSize
    };
  },
  onRender(context) {
    const {
      gl, pointsModel, boundingRectModel, girdTexModel,
      cellSize, gridSize, girdAggregationTexModel
    } = context;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    generateGridTexture(gl, {
      gridSize,
      pointsModel
    });

    girdTexModel.render({
      uSampler: gridFramebuffer.texture
    });
    // pointsModel.render();
    // boundingRectModel.render();
    //
    // pointsModel.render();
    // pointsModel.render();

    generateGridAggregationTexture(gl, {
      gridSize,
      girdAggregationTexModel
    });

    girdTexModel.render({
      uSampler: girdAggregrationFramebuffer.texture
    });

    return false;
  }
});

function generateGridAggregationTexture(gl, opts) {
  const {gridSize, girdAggregationTexModel} = opts;

  girdAggregrationFramebuffer = setupFramebuffer(gl, {gridSize});

  girdAggregationTexModel.draw({
    framebuffer: girdAggregrationFramebuffer,
    parameters: {
      clearColor: [0, 0, 0, 0],
      clearDepth: 0,
      blendEquation: [GL.FUNC_ADD, GL.MAX]
    },
    uniforms: {
      uSampler: gridFramebuffer.texture
    }
  });

}

function generateGridTexture(gl, opts) {
  const {gridSize, pointsModel} = opts;

  gridFramebuffer = setupFramebuffer(gl, {gridSize});

  pointsModel.draw({
    framebuffer: gridFramebuffer,
    parameters: {
      clearColor: [0, 0, 0, 0],
      clearDepth: 0
    }
  });

}

function setupFramebuffer(gl, opts) {
  const {gridSize} = opts;
  const rttTexture = new Texture2D(gl, {
    data: null,
    format: GL.RGBA,
    type: GL.UNSIGNED_BYTE,
    border: 0,
    mipmaps: false,
    parameters: {
      [GL.TEXTURE_MAG_FILTER]: GL.NEAREST, // GL.LINEAR,
      [GL.TEXTURE_MIN_FILTER]: GL.NEAREST // GL.LINEAR_MIPMAP_NEAREST
    },
    width: gridSize[0],
    height: gridSize[1],
    dataFormat: GL.RGBA
  });

  const renderbuffer = new Renderbuffer(gl, {
    format: GL.DEPTH_COMPONENT16,
    width: gridSize[0],
    height: gridSize[1]
  });

  const rttFramebuffer = new Framebuffer(gl, {
    width: gridSize[0],
    height: gridSize[1],
    attachments: {
      [GL.COLOR_ATTACHMENT0]: rttTexture,
      [GL.DEPTH_ATTACHMENT]: renderbuffer
    }
  });

  return rttFramebuffer;
}

// Generates (x, y) screen coordinates for each point in the rect
// x, y are in [-1, 1] range
function getVertexPerEachPixel(rectSize) {
  assert(Number.isFinite(rectSize[0]) && Number.isFinite(rectSize[1]));
  const points = [];
  for (let i = 0; i < rectSize[0]; i++) {
    for (let j = 0; j < rectSize[1]; j++) {
      const x = i * (2.0 / rectSize[0]) - 1.0;
      const y = j * (2.0 / rectSize[1]) - 1.0;
      points.push(x);
      points.push(y);
    }
  }
  return points;
}

// Generates (s, t) tex coordinates for each point in the rect
// s, t are in [0, 1] range
function getTexCoordPerEachPixel(rectSize) {
  assert(Number.isFinite(rectSize[0]) && Number.isFinite(rectSize[1]));
  const points = [];
  for (let i = 0; i < rectSize[0]; i++) {
    for (let j = 0; j < rectSize[1]; j++) {
      const s = i / rectSize[0];
      const t = j / rectSize[1];
      points.push(s);
      points.push(t);
    }
  }
  return points;
}

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
