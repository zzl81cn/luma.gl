import {GL} from './webgl-constants';
import {withState} from './state';
import assert from 'assert';

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
  withState(gl, {color, depth, stencil}, () => {
    const clearFlags =
      (color ? GL.COLOR_BUFFER_BIT : 0) |
      (depth ? GL.COLOR_BUFFER_BIT : 0) |
      (stencil ? gl.DEPTH_BUFFER_BIT : 0);
    assert(clearFlags, ERR_ARGUMENTS);
    gl.clear(clearFlags);
  });
}
