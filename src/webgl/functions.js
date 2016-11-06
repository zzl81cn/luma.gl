/* eslint-disable */
// TODO - generic draw call
// One of the good things about GL is that there are so many ways to draw things
import {GL, glGet} from './webgl';
import {assertWebGLContext, assertDrawMode, assertIndexType}
  from './webgl-checks';
import {glContextWithState} from './context';
import assert from 'assert';

// A good thing about webGL is that there are so many ways to draw things,
// e.g. depending on whether data is indexed and/or isInstanced.
// This function unifies those into a single call with simple parameters
// that have sane defaults.
export function draw(gl, {
  drawMode = GL.TRIANGLES,
  vertexCount,
  offset = 0,
  isIndexed = false,
  indexType = GL.UNSIGNED_SHORT,
  isInstanced = false,
  instanceCount = 0
}) {
  assertWebGLContext(gl);

  const extension = gl.getExtension('ANGLE_instanced_arrays');

  drawMode = glGet(drawMode);
  indexType = glGet(indexType);

  assertDrawMode(drawMode, 'in draw');
  if (isIndexed) {
    assertIndexType(indexType, 'in draw');
  }

  // TODO - Use polyfilled WebGL2RenderingContext instead of ANGLE extension
  if (isInstanced && isIndexed) {
    extension.drawElementsInstancedANGLE(
      drawMode, vertexCount, indexType, offset, instanceCount
    );
  } else if (isInstanced) {
    extension.drawArraysInstancedANGLE(
      drawMode, offset, vertexCount, instanceCount
    );
  } else if (isIndexed) {
    gl.drawElements(drawMode, vertexCount, indexType, offset);
  } else {
    gl.drawArrays(drawMode, offset, vertexCount);
  }
}

const ERR_ARGUMENTS = 'clear called without arguments';

/**
 * Optionally clears depth, color and stencil buffers
 * @param {WebGLRenderingContext} gl - context
 * @param {Object} options
 */
export function clear(gl, {
  color,
  depth,
  stencil
} = {}) {
  glContextWithState(gl, {color, depth, stencil}, () => {
    const clearFlags =
      (color ? GL.COLOR_BUFFER_BIT : 0) |
      (depth ? GL.COLOR_BUFFER_BIT : 0) |
      (stencil ? gl.DEPTH_BUFFER_BIT : 0);
    assert(clearFlags, ERR_ARGUMENTS);
    gl.clear(clearFlags);
  });
}
