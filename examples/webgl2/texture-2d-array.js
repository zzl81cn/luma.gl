// A texture animation using texture 2d array.
// The texture is also non-power-of-2.

// luma.gl adaptation of WebGL2 samples
/* eslint-disable no-inline-comments */
/* global window, document, LumaGL */
const {GL, AnimationFrame, createGLContext, loadImage} = LumaGL;
const {Texture2DArray, ClipSpaceQuad, Program} = LumaGL;

// WebGL 2 shaders.
// This section is adapted from Example 6.15 and 6.16,
// OpenGL® Programming Guide: The Official Guide to Learning OpenGL®, Version 4.3,
// Dave Shreiner, Graham Sellers

const VERTEX_SHADER = `\
#version 300 es
#define POSITION_LOCATION 0
#define TEXCOORD_LOCATION 4

precision highp float;
precision highp int;

uniform mat4 MVP;

layout(location = POSITION_LOCATION) in vec2 position;
layout(location = TEXCOORD_LOCATION) in vec2 texcoord;

out vec2 v_st;

void main()
{
  v_st = texcoord;
  gl_Position = MVP * vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `\
#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;

uniform sampler2DArray diffuse;
uniform int layer;

in vec2 v_st;

out vec4 color;

void main()
{
  color = texture(diffuse, vec3(v_st, layer));
}
`;

const NUM_IMAGES = 3;

new AnimationFrame({
  onError: error => {
    document.getElementById('info').innerHTML = error;
  }
})
.context(() => createGLContext({
  webgl2: true,
  antialias: false,
  width: window.innerHeight * 960 / 540,
  height: window.innerHeight
}))
.setupFrame(({gl, canvas}) => {
  // width: window.innerHeight * 960 / 540,
  // height: window.innerHeight
})
.frame(({gl}) => {
  const texture = new Texture2DArray(gl, {
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR
  });

  loadImage('../assets/img/di-animation-array.jpg')
  .then(image => {
    const IMAGE_SIZE = {
      width: 960,
      height: 540
    };
    // use canvas to get the pixel data array of the image
    const canvas = document.createElement('canvas');
    canvas.width = IMAGE_SIZE.width;
    canvas.height = IMAGE_SIZE.height * NUM_IMAGES;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData =
      ctx.getImageData(0, 0, IMAGE_SIZE.width, IMAGE_SIZE.height * NUM_IMAGES);
    const pixels = new Uint8Array(imageData.data.buffer);

    texture.setImage({
      width: IMAGE_SIZE.width,
      height: IMAGE_SIZE.height,
      depth: NUM_IMAGES,
      pixels
    });
  });

  const matrix = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  ]);

  // -- Init program
  const program = new Program(gl, {vs: VERTEX_SHADER, fs: FRAGMENT_SHADER});
  const mvpLocation = program.getUniformLocation('MVP');
  const diffuseLocation = program.getUniformLocation('diffuse');
  const layerLocation = program.getUniformLocation('layer');

  const clipSpaceQuad = new ClipSpaceQuad(gl, {program})
  .setUniforms({
    [mvpLocation]: matrix,
    [diffuseLocation]: texture
  });

  return {clipSpaceQuad, layerLocation};
})
.frame(({gl, tick, clipSpaceQuad, layerLocation}) => {
  // -- Render
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  clipSpaceQuad.draw({
    [layerLocation]: tick % NUM_IMAGES
  });
})
.finalize(({clipSpaceQuad}) => {
  clipSpaceQuad.delete();
});

new AnimationFrame({
  onError: error => {
    document.getElementById('info').innerHTML = error;
  }
})
.context(() => createGLContext({
  webgl2: true,
  antialias: false,
  width: Math.min(window.innerWidth, window.innerHeight),
  height: Math.min(window.innerWidth, window.innerHeight)
}))
.frame(({gl}) => {
  // -- Initialize texture
  // Note By @kenrussel: The sample was changed from R32F to R8 for
  // best portability. not all devices can render to floating-point textures
  // (and, further, this functionality is in a WebGL extension:
  // EXT_color_buffer_float),
  // and renderability is a requirement for generating mipmaps.

  const SIZE = 32;
  const data = new Uint8Array(SIZE * SIZE * SIZE);
  for (let k = 0; k < SIZE; ++k) {
    for (let j = 0; j < SIZE; ++j) {
      for (let i = 0; i < SIZE; ++i) {
        data[i + j * SIZE + k * SIZE * SIZE] = snoise([i, j, k]) * 256;
      }
    }
  }

  const texture = new Texture3D(gl, {
    [GL.TEXTURE_BASE_LEVEL]: 0,
    [GL.TEXTURE_MAX_LEVEL]: Math.log2(SIZE),
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    width: SIZE,
    height: SIZE,
    depth: SIZE,
    level: 0,
    internalFormat: GL.R8,
    format: GL.RED,
    type: GL.UNSIGNED_BYTE,
    pixels: data,
    generateMipmap: true
  });
  // .generateMipmap();

  const clipSpaceQuad = new ClipSpaceQuad(gl, {
    vs: VERTEX_SHADER,
    fs: FRAGMENT_SHADER
  })
  .setUniforms({diffuse: texture});

  // -- Initialize program
  return {clipSpaceQuad};
})
.frame(({gl, tick, width, height, clipSpaceQuad}) => {
  // -- Divide viewport
  const viewports = [
    [0, 0, width / 2, height / 2],
    [width / 2, 0, width / 2, height / 2],
    [width / 2, height / 2, width / 2, height / 2],
    [0, height / 2, width / 2, height / 2]
  ];

  // -- Render
  const orientation = [
    tick * 0.020, // yaw
    tick * 0.010, // pitch
    tick * 0.005 // roll
  ];

  const yawMatrix = yawPitchRoll(orientation[0], 0.0, 0.0);
  const pitchMatrix = yawPitchRoll(0.0, orientation[1], 0.0);
  const rollMatrix = yawPitchRoll(0.0, 0.0, orientation[2]);
  const yawPitchRollMatrix = yawPitchRoll(orientation[0], orientation[1], orientation[2]);
  const matrices = [yawMatrix, pitchMatrix, rollMatrix, yawPitchRollMatrix];

  // Clear color buffer
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let i = 0; i < 4; ++i) {
    gl.viewport(...viewports[i]);
    clipSpaceQuad.draw({
      uniforms: {orientation: matrices[i]}
    });
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 1);
  }
})
.end(({clipSpaceQuad}) => {
  clipSpaceQuad.delete();
});

function yawPitchRoll(yaw, pitch, roll) {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const cosRoll = Math.cos(roll);
  const sinRoll = Math.sin(roll);

  return new Float32Array([
    cosYaw * cosPitch,
    cosYaw * sinPitch * sinRoll - sinYaw * cosRoll,
    cosYaw * sinPitch * cosRoll + sinYaw * sinRoll,
    0.0,
    sinYaw * cosPitch,
    sinYaw * sinPitch * sinRoll + cosYaw * cosRoll,
    sinYaw * sinPitch * cosRoll - cosYaw * sinRoll,
    0.0,
    -sinPitch,
    cosPitch * sinRoll,
    cosPitch * cosRoll,
    0.0,
    0.0, 0.0, 0.0, 1.0
  ]);
}
