/* eslint-disable no-var, max-statements */

import {AnimationLoop, Program, Buffer, Matrix4, setParameters} from 'luma.gl';

/* global console */
/* eslint-disable no-console */

const VERTEX_SHADER = `\
attribute vec2 positions;
uniform vec2 windowRect;
void main(void) {
  vec2 pos = (positions * (2., 2.) / (windowRect)) - (1., 1.);
  gl_Position = vec4(pos, 1.0, 1.0);
}
`;

const FRAGMENT_SHADER = `\
#ifdef GL_ES
precision highp float;
#endif

void main(void) {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

const animationLoop = new AnimationLoop({
  useDevicePixels: false,
  onInitialize({gl, canvas, aspect}) {

    console.log(`Canvas W: ${canvas.width} H: ${canvas.height}`);

    setParameters(gl, {
      clearColor: [0, 0, 0, 1],
      clearDepth: [1],
      depthTest: true,
      depthFunc: gl.LEQUAL
    });

    var program = new Program(gl, {
      vs: VERTEX_SHADER,
      fs: FRAGMENT_SHADER
    });

    const LINE_VERTS = [50, 10,   canvas.width, canvas.height]; // [-1, -1,   0.9, 0.9];
    const TRIANGLE_VERTS = [0, 1, 0,  -1, -1, 0,  1, -1, 0]; // eslint-disable-line
    const SQUARE_VERTS = [1, 1, 0,  -1, 1, 0,  1, -1, 0,  -1, -1, 0]; // eslint-disable-line

    var linePositions = new Buffer(gl, {size: 2, data: new Float32Array(LINE_VERTS)});
    var trianglePositions = new Buffer(gl, {size: 3, data: new Float32Array(TRIANGLE_VERTS)});
    var squarePositions = new Buffer(gl, {size: 3, data: new Float32Array(SQUARE_VERTS)});

    const view = new Matrix4(); // .translate([-1.5, 0, -7]);
    const projection = new Matrix4(); // .perspective({aspect});
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
    gl.drawArrays(gl.POINTS, 0, 2);

/*
    // Draw Triangle
    program
      .setBuffers({
        positions: trianglePositions
      })
      .setUniforms({
        uMVMatrix: view,
        uPMatrix: projection
      });
    gl.drawArrays(gl.TRIANGLES, 0, 3);
*/
/*
    // Draw Square
//    view.translate([3, 0, 0]);
    program
      .setBuffers({
        positions: squarePositions
      })
      .setUniforms({
        uMVMatrix: view,
        uPMatrix: projection
      });
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
*/
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

export default animationLoop;

// expose on Window for standalone example
window.animationLoop = animationLoop; // eslint-disable-lie
