// WEBGL BUILT-IN TYPES
import GL from 'gl-constants';
import assert from 'assert';

// Resolve a WebGL enumeration name (returns itself if already a number)
export function glGet(name) {
  // assertWebGLContext(gl);
  let value = name;
  if (typeof name === 'string') {
    value = GL[name];
    assert(value !== undefined, `Accessing GL.${name}`);
  }
  return value;
}

export function glKey(value) {
  for (const key in GL) {
    if (GL[key] === value) {
      return `GL.${key}`;
    }
  }
  return String(value);
}

// Extract constants from WebGL prototype
// function getWebGLConstants() {
//   const constants = {};
//   const WebGLContext =
//     glob.WebGL2RenderingContext || WebGLRenderingContext;
//   for (const key in WebGLContext.prototype) {
//     if (typeof WebGLContext[key] !== 'function') {
//       constants[key] = WebGLContext[key];
//     }
//   }
//   Object.freeze(constants);
//   return constants;
// }

// const GL = getWebGLConstants();

/* eslint-disable key-spacing */
Object.assign(GL, {
  // webgl_debug_info Extension
  UNMASKED_VENDOR_WEBGL: 0x9245,
  UNMASKED_RENDERER_WEBGL: 0x9246,

  // WebGL2 Query
  CURRENT_QUERY:          0x8865,
  QUERY_RESULT:           0x8866,
  QUERY_RESULT_AVAILABLE: 0x8867,

  // EXT_disjoint_timer_query
  QUERY_COUNTER_BITS_EXT: 0x8864,
  CURRENT_QUERY_EXT:      0x8865,
  QUERY_RESULT_EXT:       0x8866,
  QUERY_RESULT_AVAILABLE_EXT: 0x8867,
  TIME_ELAPSED_EXT:       0x88BF,
  TIMESTAMP_EXT:          0x8E28,
  GPU_DISJOINT_EXT:       0x8FBB
});
/* eslint-enable key-spacing */

export {GL};
export default GL;
