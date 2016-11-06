// Helper definitions for validation of webgl parameters
/* eslint-disable no-inline-comments, max-len */
import GL from './constants';
import {WebGLRenderingContext, WebGL2RenderingContext} from './types';
import assert from 'assert';

const ERR_CONTEXT = 'Invalid WebGLRenderingContext';
const ERR_WEBGL2 = 'Requires WebGL2';

export function isWebGLContext(gl) {
  return gl instanceof WebGLRenderingContext ||
    (gl && gl.ARRAY_BUFFER === 0x8892);
}

export function isWebGL2Context(gl) {
  return gl instanceof WebGL2RenderingContext ||
    (gl && gl.TEXTURE_BINDING_3D === 0x806A);
}

export function assertWebGLContext(gl) {
  // Need to handle debug context
  assert(isWebGLContext(gl), ERR_CONTEXT);
}

export function assertWebGL2Context(gl) {
  // Need to handle debug context
  assert(isWebGL2Context(gl), ERR_WEBGL2);
}

// GL errors

const GL_ERROR_MESSAGES = {
  //  If the WebGL context is lost, this error is returned on the
  // first call to getError. Afterwards and until the context has been
  // restored, it returns gl.NO_ERROR.
  [GL.CONTEXT_LOST_WEBGL]: 'WebGL context lost',
  // An unacceptable value has been specified for an enumerated argument.
  [GL.INVALID_ENUM]: 'WebGL invalid enumerated argument',
  // A numeric argument is out of range.
  [GL.INVALID_VALUE]: 'WebGL invalid value',
  // The specified command is not allowed for the current state.
  [GL.INVALID_OPERATION]: 'WebGL invalid operation',
  // The currently bound framebuffer is not framebuffer complete
  // when trying to render to or to read from it.
  [GL.INVALID_FRAMEBUFFER_OPERATION]: 'WebGL invalid framebuffer operation',
  // Not enough memory is left to execute the command.
  [GL.OUT_OF_MEMORY]: 'WebGL out of memory'
};

function glGetErrorMessage(gl, glError) {
  return GL_ERROR_MESSAGES[glError] || `WebGL unknown error ${glError}`;
}

// Returns an Error representing the Latest webGl error or null
export function glGetError(gl) {
  // Loop to ensure all errors are cleared
  const errorStack = [];
  let glError = gl.getError();
  while (glError !== gl.NO_ERROR) {
    errorStack.push(glGetErrorMessage(gl, glError));
    glError = gl.getError();
  }
  return errorStack.length ? new Error(errorStack.join('\n')) : null;
}

export function glCheckError(gl) {
  if (gl.debug) {
    const error = glGetError(gl);
    if (error) {
      throw error;
    }
  }
}
