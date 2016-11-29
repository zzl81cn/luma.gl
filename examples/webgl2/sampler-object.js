// Ported from the OpenGL Samples Pack
// https://github.com/g-truc/ogl-samples/blob/master/tests/gl-330-sampler-object.cpp
// <title>WebGL 2 Samples - sampler_object</title>
// <div id="info">WebGL 2 Samples - sampler_object</div>
// <p id="description">
// This sample demonstrates using 2 sampler objects for texture filtering.
// <br>
// BOTTOM: Linear filtering / TOP: Nearest filtering
// </p>

const VERTEX_SHADER = `\
#version 300 es
#define POSITION_LOCATION 0
#define TEXCOORD_LOCATION 4

precision highp float;
precision highp int;

uniform mat4 mvp;

layout(location = POSITION_LOCATION) in vec2 position;
layout(location = TEXCOORD_LOCATION) in vec2 textureCoordinates;

out vec2 v_st;

void main()
{
  v_st = textureCoordinates;
  gl_Position = mvp * vec4(position, 0.0, 1.0) ;
}
`;

const FRAGMENT_SHADER = `\
#version 300 es
#define FRAG_COLOR_LOCATION 0

precision highp float;
precision highp int;

struct Material
{
  sampler2D diffuse[2];
};

uniform Material material;

in vec2 v_st;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;

void main()
{
  if (v_st.y / v_st.x < 1.0) {
    color = texture(material.diffuse[0], v_st);
  } else {
    color = texture(material.diffuse[1], v_st) * 0.77;
  }
}
`;

var canvas = document.createElement('canvas');
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

var gl = canvas.getContext( 'webgl2', { antialias: false } );
var isWebGL2 = !!gl;
if(!isWebGL2) {
  document.getElementById('info').innerHTML = 'WebGL 2 is not available.  See <a href="https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">How to get a WebGL 2 implementation</a>';
  return;
}

// -- Initialize program

var program = createProgram(gl, getShaderSource('vs'), getShaderSource('fs'));

var uniformMvpLocation = gl.getUniformLocation(program,'mvp');
var uniformDiffuse0Location = gl.getUniformLocation(program,'material.diffuse[0]');
var uniformDiffuse1Location = gl.getUniformLocation(program, 'material.diffuse[1]');

// -- Initialize buffer

// -- Initialize vertex array

var vertexArray = gl.createVertexArray();
gl.bindVertexArray(vertexArray);

var vertexPosLocation = 0; // set with GLSL layout qualifier
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vertexPosLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

var vertexTexLocation = 4; // set with GLSL layout qualifier
gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
gl.vertexAttribPointer(vertexTexLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vertexTexLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

gl.bindVertexArray(null);

// -- Initialize samplers

  var samplerA = new Sampler(gl, {
    [GL.TEXTURE_MIN_FILTER]: GL.NEAREST_MIPMAP_NEAREST,
    [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_R]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_MIN_LOD]: -1000.0,
    [GL.TEXTURE_MAX_LOD]: 1000.0,
    [GL.TEXTURE_COMPARE_MODE]: GL.NONE,
    [GL.TEXTURE_COMPARE_FUNC]: GL.LEQUAL
  });

  var samplerB = new Sampler(gl, {
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_R]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_MIN_LOD]: -1000.0,
    [GL.TEXTURE_MAX_LOD]: 1000.0,
    [GL.TEXTURE_COMPARE_MODE]: GL.NONE,
    [GL.TEXTURE_COMPARE_FUNC]: GL.LEQUAL
  });

  // -- Load texture then render

  var imageUrl = '../assets/img/Di-3d.png';
  var texture = new Texture2D();
  loadImage(imageUrl)
  .then(image => {
    texture
      .setImage({pixels: image})
      .generateMipmap();
  });

 function render() {
  // Clear color buffer
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var matrix = new Float32Array([
    0.8, 0.0, 0.0, 0.0,
    0.0, 0.8, 0.0, 0.0,
    0.0, 0.0, 0.8, 0.0,
    0.0, 0.0, 0.0, 1.0
  ]);

  clipSpaceQuad.setUniforms({
    MVP: matrix,
    diffuse0: [texture, samplerA],
    diffuse1: [texture, samplerB]
  });

  clipSpaceQuad.draw({});
})
.finalize(() => {
  // Cleanup
  samplerA.delete();
  samplerB.delete();
  texture.delete();
  clipSpaceQuad.delete();
});
