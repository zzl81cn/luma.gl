/* global window,*/

/* eslint-disable max-len */
// NOTE: This is a port of standard WebGL2 Example : https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/transform_feedback_instanced.html
// This example demonstrates how to use luma.gl TransformFeedback API.
/* eslint-enable max-len */

import {
  AnimationLoop, Buffer, TransformFeedback, VertexArray,
  setParameters, Model, GL, loadTextures,
  Geometry
} from 'luma.gl';
import Star from './star'

const OFFSET_LOCATION = 0;
const ROTATION_LOCATION = 1;
const POSITION_LOCATION = 2;
const COLOR_LOCATION = 3;
const EMIT_VARYINGS = ['v_offset', 'v_rotation'];

const EMIT_VS = `\
#version 300 es
#define OFFSET_LOCATION 0
#define ROTATION_LOCATION 1

#define M_2PI 6.28318530718
#define PI_N 0.0031415926535
#define RADIUS 0.8

// We simulate the wandering of agents using transform feedback in this vertex shader
// The simulation goes like this:
// Assume there's a circle in front of the agent whose radius is WANDER_CIRCLE_R
// the origin of which has a offset to the agent's pivot point, which is WANDER_CIRCLE_OFFSET
// Each frame we pick a random point on this circle
// And the agent moves MOVE_DELTA toward this target point
// We also record the rotation facing this target point, so it will be the base rotation
// for our next frame, which means the WANDER_CIRCLE_OFFSET vector will be on this direction
// Thus we fake a smooth wandering behavior

#define MAP_HALF_LENGTH 1.01
#define WANDER_CIRCLE_R 0.01
#define WANDER_CIRCLE_OFFSET 0.04
#define MOVE_DELTA 0.01
precision highp float;
precision highp int;
uniform float u_time;
layout(location = OFFSET_LOCATION) in vec2 a_offset;
layout(location = ROTATION_LOCATION) in float a_rotation;
out vec2 v_offset;
out float v_rotation;

float rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{
    float cos_r = cos(a_rotation);
    float sin_r = sin(a_rotation);

    v_rotation = a_rotation + PI_N; 
    vec2 offset = vec2(cos(v_rotation), sin(v_rotation)) * RADIUS; 
    v_offset = offset;

    // wrapping at edges
    v_offset = vec2 (
        v_offset.x > MAP_HALF_LENGTH ? - MAP_HALF_LENGTH :
          ( v_offset.x < - MAP_HALF_LENGTH ? MAP_HALF_LENGTH : v_offset.x ) ,
        v_offset.y > MAP_HALF_LENGTH ? - MAP_HALF_LENGTH :
          ( v_offset.y < - MAP_HALF_LENGTH ? MAP_HALF_LENGTH : v_offset.y )
        );

    gl_Position = vec4(v_offset, 0.0, 1.0);
}
`;

const EMIT_FS = `\
#version 300 es
precision highp float;
precision highp int;
void main()
{
}
`;

const DRAW_VS = `\
#version 300 es
#define OFFSET_LOCATION 0
#define ROTATION_LOCATION 1
#define POSITION_LOCATION 2
#define COLOR_LOCATION 3
precision highp float;
precision highp int;
layout(location = POSITION_LOCATION) in vec2 a_position;
layout(location = ROTATION_LOCATION) in float a_rotation;
layout(location = OFFSET_LOCATION) in vec2 a_offset;
layout(location = COLOR_LOCATION) in vec3 a_color;
out vec3 v_color;

attribute vec2 texCoords;
varying vec2 vTextureCoord;

void main()
{
    v_color = a_color;

    float cos_r = cos(a_rotation);
    float sin_r = sin(a_rotation);
    mat2 rot = mat2(
        cos_r, sin_r,
        -sin_r, cos_r
    );
    gl_Position = vec4(rot * a_position + a_offset, 0.0, 1.0);
    vTextureCoord = texCoords;
}
`;

const DRAW_FS = `\
#version 300 es
#define ALPHA 0.9
precision highp float;
precision highp int;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main()
{
  gl_FragColor = texture2D(uSampler, vec2(1, 1));
}
`;

const NUM_INSTANCES = 1000;
let currentSourceIdx = 0;

const animationLoop = new AnimationLoop({
  glOptions: {webgl2: true},
  /* eslint-disable max-statements */
  onInitialize({canvas, gl}) {
    return loadTextures(gl, {
      urls: ['car-top-view.png']
    }).then(textures => {
      const modelRender = new Model(gl, {
        id: 'Model-Render',
        vs: DRAW_VS,
        fs: DRAW_FS,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_STRIP,
          attributes: {
            positions: new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0]),
            texCoords: new Float32Array([
              1.0, 1.0,
              0.0, 1.0,
              1.0, 0.0,
              0.0, 0.0
            ])
          }
        }),
        uniforms: {
          uSampler: textures[0]
        },
        drawMode: gl.TRIANGLE_FAN,
        vertexCount: 3,
        isInstanced: true,
        instanceCount: NUM_INSTANCES
      });

      const modelTransform = new Model(gl, {
        id: 'Model-Transform',
        vs: EMIT_VS,
        fs: EMIT_FS,
        varyings: EMIT_VARYINGS,
        drawMode: gl.POINTS,
        vertexCount: NUM_INSTANCES,
        isInstanced: false
      });

      // -- Initialize data
      const trianglePositions = new Float32Array([
        0.015, 0.0,
        -0.010, 0.010,
        -0.010, -0.010
      ]);

      const instanceOffsets = new Float32Array(NUM_INSTANCES * 2);
      const instanceRotations = new Float32Array(NUM_INSTANCES);
      const instanceColors = new Float32Array(NUM_INSTANCES * 3);

      for (let i = 0; i < NUM_INSTANCES; ++i) {
        instanceOffsets[i * 2] = Math.random() * 2.0 - 1.0;
        instanceOffsets[i * 2 + 1] = Math.random() * 2.0 - 1.0;

        instanceRotations[i] = Math.random() * 2 * Math.PI;

        instanceColors[i * 3] = Math.random();
        instanceColors[i * 3 + 1] = Math.random();
        instanceColors[i * 3 + 2] = Math.random();
      }

      // -- Init VertexArrays and TransformFeedback objects

      const vertexArrays = new Array(2);
      const transformVertexArrays = new Array(2);
      const transformFeedbacks = new Array(2);

      const positionBuffer = new Buffer(gl, {
        data: trianglePositions,
        size: 2,
        type: gl.FLOAT
      });
      const colorBuffer = new Buffer(gl, {
        data: instanceColors,
        size: 3,
        type: gl.FLOAT
      });

      for (let va = 0; va < vertexArrays.length; ++va) {
        const offsetBuffer = new Buffer(gl, {
          data: instanceOffsets,
          size: 2,
          type: gl.FLOAT
        });

        const rotationBuffer = new Buffer(gl, {
          data: instanceRotations,
          size: 1,
          type: gl.FLOAT
        });

        vertexArrays[va] = new VertexArray(gl, {
          buffers: {
            [COLOR_LOCATION]: {
              buffer: colorBuffer,
              instanced: 1
            },
            [OFFSET_LOCATION]: {
              buffer: offsetBuffer,
              instanced: 1
            },
            [ROTATION_LOCATION]: {
              buffer: rotationBuffer,
              instanced: 1
            },
            [POSITION_LOCATION]: {
              buffer: positionBuffer,
              instanced: 0
            }
          }
        });

        transformVertexArrays[va] = new VertexArray(gl, {
          buffers: {
            [OFFSET_LOCATION]: {
              buffer: offsetBuffer,
              instanced: 0
            },
            [ROTATION_LOCATION]: {
              buffer: rotationBuffer,
              instanced: 0
            }
          }
        });

        /* eslint-disable camelcase  */
        transformFeedbacks[va] = new TransformFeedback(gl, {
          buffers: {
            v_rotation: rotationBuffer,
            v_offset: offsetBuffer
          },
          varyingMap: modelTransform.varyingMap
        });
        /* eslint-enable camelcase  */
      }

      setParameters(gl, {
        clearColor: [0.0, 0.0, 0.0, 1.0],
        blend: true,
        blendFunc: [gl.SRC_ALPHA, gl.ONE]
      });

      return {
        vertexArrays,
        transformVertexArrays,
        transformFeedbacks,
        modelRender,
        modelTransform
      };
    })
  },
  /* eslint-enable max-statements */

  onRender({
    gl,
    width,
    height,
    vertexArrays,
    transformVertexArrays,
    transformFeedbacks,
    modelRender,
    modelTransform
  }) {

    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const destinationIdx = (currentSourceIdx + 1) % 2;

    modelTransform.draw({
      vertexArray: transformVertexArrays[currentSourceIdx],
      transformFeedback: transformFeedbacks[destinationIdx]
    });

    modelRender.draw({
      vertexArray: vertexArrays[currentSourceIdx]
    });

    currentSourceIdx = destinationIdx;
  },

  onFinalize({
    vertexArrays,
    transformVertexArrays,
    transformFeedbacks,
    modelRender,
    modelTransform
  }) {
    for (let i = 0; i < 2; i++) {
      vertexArrays[i].delete();
      transformVertexArrays[i].delete();
      transformFeedbacks[i].delete();
    }
    modelRender.delete();
    modelTransform.delete();
  }
});

animationLoop.getInfo = () => {
  return `
    <p></p>
  `;
};

export default animationLoop;

// expose on Window for standalone example
window.animationLoop = animationLoop; // eslint-disable-lie
