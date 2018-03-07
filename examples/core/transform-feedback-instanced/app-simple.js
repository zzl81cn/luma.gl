/* eslint-disable array-bracket-spacing, no-multi-spaces */
import {
  GL, AnimationLoop, Program, Model, Geometry, Matrix4,
  setParameters, loadTextures
} from 'luma.gl';

const FRAGMENT_SHADER = `\
#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
  gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
}
`;

const VERTEX_SHADER = `\
attribute vec3 positions;
attribute vec2 texCoords;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;
void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(positions, 1.0);
  vTextureCoord = texCoords;
}
`;

const TEXCOORDS = new Float32Array([
  1.0, 1.0,
  0.0, 1.0,
  1.0, 0.0,
  0.0, 0.0
]);

const animationLoop = new AnimationLoop({
  onInitialize({gl}) {

    setParameters(gl, {
      clearColor: [0, 0, 0, 1],
      clearDepth: [1],
      depthTest: true,
      depthFunc: gl.LEQUAL
    });

    return loadTextures(gl, {
     urls: ['car-top-view.png']
    }).then(textures => {
      const program = new Program(gl, {vs: VERTEX_SHADER, fs: FRAGMENT_SHADER});
      const square = new Model(gl, {
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_STRIP,
          attributes: {
            positions: new Float32Array([1, 1, 0,  -1, 1, 0,  1, -1, 0,  -1, -1, 0]),
            texCoords: TEXCOORDS
          }
        }),
        uniforms: {
          uSampler: textures[0]
        },
        program
      });

      return {square};
    })
  },

  onRender(context) {
    const {gl, tick, aspect, square} = context;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projection = new Matrix4().perspective({aspect});

    // Draw Square
    square
      .setPosition([1.5, 0, -7])
      .setRotation([tick * 0.1, 0, 0])
      .updateMatrix()
      .render({
        uMVMatrix: square.matrix,
        uPMatrix: projection
      });
  }
});

animationLoop.getInfo = () => {
  return `
  <p>
    <a href="http://learningwebgl.com/blog/?p=239" target="_blank">
      A Bit of Movement
    </a>
  <p>
    The classic WebGL Lessons in luma.gl
    `;
};

export default animationLoop;

// expose on Window for standalone example
window.animationLoop = animationLoop; // eslint-disable-lie
