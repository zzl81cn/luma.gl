// luma.gl adaptation of WebGL2 samples
/* eslint-disable no-inline-comments */
/* global window, document, LumaGL */
const {GL, AnimationFrame, createGLContext, Texture3D, ClipSpaceQuad} = LumaGL;

// WebGL 2 shaders.
// This section is adapted from Example 6.15 and 6.16,
// OpenGL® Programming Guide: The Official Guide to Learning OpenGL®, Version 4.3,
// Dave Shreiner, Graham Sellers

const VERTEX_SHADER = `\
#version 300 es
#define POSITION_LOCATION 0
#define TEXCOORD_LOCATION 1

precision highp float;
precision highp int;

layout(location = POSITION_LOCATION) in vec2 position;
layout(location = TEXCOORD_LOCATION) in vec2 in_texcoord;

// Output 3D texture coordinate after transformation
out vec3 v_texcoord;

// Matrix to transform the texture coordinates into 3D space
uniform mat4 orientation;

void main()
{
  // Multiply the texture coordinate by the transformation
  // matrix to place it into 3D space
  v_texcoord = (orientation * vec4(in_texcoord - vec2(0.5, 0.5), 0.5, 1.0)).stp;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `\
#version 300 es

precision highp float;
precision highp int;
precision highp sampler3D;

uniform sampler3D diffuse;

in vec3 v_texcoord;

out vec4 color;

void main()
{
  color = texture(diffuse, v_texcoord);
}
`;

export default new AnimationFrame({
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

  const SAMPLER_WRAP_PARAMS = {
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_R]: GL.CLAMP_TO_EDGE
  };

  const samplers = [
    new Sampler(gl, {
      ...SAMPLER_WRAP_PARAMS,
      [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
      [GL.TEXTURE_MAG_FILTER]: GL.NEAREST
    }),
    new Sampler(gl, {
      ...SAMPLER_WRAP_PARAMS,
      [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
      [GL.TEXTURE_MAG_FILTER]: GL.LINEAR
    }),
    new Sampler(gl, {
      ...SAMPLER_WRAP_PARAMS,
      [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_NEAREST,
      [GL.TEXTURE_MAG_FILTER]: GL.LINEAR
    }),
    new Sampler(gl, {
      ...SAMPLER_WRAP_PARAMS,
      [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
      [GL.TEXTURE_MAG_FILTER]: GL.LINEAR
    })
  ];

  // -- Initialize program
  return {clipSpaceQuad, texture, samplers};
})
.frame(({gl, tick, width, height, clipSpaceQuad, samplers, texture}) => {
  // -- Divide viewport
  const viewports = [
    [0, 0, width / 2, height / 2],
    [width / 2, 0, width / 2, height / 2],
    [width / 2, height / 2, width / 2, height / 2],
    [0, height / 2, width / 2, height / 2]
  ];

  // Clear color buffer
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let i = 0; i < 4; ++i) {
    gl.viewport(...viewports[i]);
    clipSpaceQuad.draw({
      uniforms: {diffuse: samplers[i].bind(texture)}
    });
  }
})
.finish(({clipSpaceQuad, texture, samplers}) => {
  clipSpaceQuad.delete();
  texture.delete();
  samplers.forEach(sampler => sampler.delete());
});
