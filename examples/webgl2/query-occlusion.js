// Ported from the OpenGL Samples Pack:
// https://github.com/g-truc/ogl-samples/blob/master/tests/gl-330-query-occlusion.cpp

//    <title>WebGL 2 Samples - query_occlusion</title>
//    <div id="info">WebGL 2 Samples - query_occlusion</div>
//    <p>&nbsp;</p>
//    <div id="samplesPassed"></div>

const VERTEX_SHADER = `\
#version 300 es
#define POSITION_LOCATION 0

precision highp float;
precision highp int;

layout(location = POSITION_LOCATION) in vec2 pos;

void main()
{
  gl_Position = vec4(pos,0.0,1.0);
}
`;

const FRAGMENT_SHADER = `\
#version 300 es
precision highp float;
precision highp int;

out vec4 color;

void main()
{
  color = vec4(1.0,0.5,0.0,1.0);
}
`;

export default new AnimationFrame({
  gl: createGLContext({webgl2: true, antialias: false})
})
.init(({gl}) => {
  // -- Init Buffer
  const vertices = new Float32Array([
    -0.3, -0.5,
    0.3, -0.5,
    0.0, 0.5
  ]);

  const triangle = new Model(gl, {
    vs: VERTEX_SHADER,
    fs: FRAGMENT_SHADER,
    attributes: {
      [0]: {size: 2, value: vertices}
    }
  });

  // -- Init Query
  const query = new Query();

  return {triangle, query};
})
.frame(({animation, gl, triangle, query}) => {
  // -- Render
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(GL.COLOR_BUFFER_BIT);

  query.begin(GL.ANY_SAMPLES_PASSED);
  triangle.draw();
  query.end();

  if (query.isResultAvailable()) {
    const samplesPassed = query.getResult();
    animation.callback(`Any samples passed: ${Number(samplesPassed)}`);
    animation.finish();
  }
})
.finalize(({triangle, query}) => {
  // -- Delete WebGL resources
  triangle.delete();
  query.delete();
});
