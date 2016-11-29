/* eslint-disable no-inline-comments */
import {GL} from './api';
import Resource from './resource';
import formatCompilerError from './api/format-glsl-error';
import getShaderName from 'glsl-shader-name';
import {log, uid} from '../utils';

// For now this is an internal class
export class Shader extends Resource {

  static PARAMETERS = [
    GL.DELETE_STATUS, // GLboolean - whether shader is flagged for deletion.
    GL.COMPILE_STATUS, // GLboolean - was last shader compilation successful.
    GL.SHADER_TYPE // GLenum - GL.VERTEX_SHADER or GL.FRAGMENT_SHADER.
  ];

  static getTypeName(shaderType) {
    switch (shaderType) {
    case GL.VERTEX_SHADER: return 'vertex-shader';
    case GL.FRAGMENT_SHADER: return 'fragment-shader';
    default: return 'unknown-shader';
    }
  }

  /* eslint-disable max-statements */
  constructor(gl, source, shaderType) {
    super({
      gl,
      id: uid(Shader.getTypeName(shaderType))
    });

    this.shaderType = shaderType;
    this.update({source});
  }

  initialize({source}) {
    const shaderName = getShaderName(source);
    if (shaderName) {
      this.id = uid(shaderName);
    }
    this._compile(source);
    this.opts.source = source;
  }

  // Accessors

  get source() {
    return this.opts.source;
  }

  getParameter(pname) {
    return this.gl.getShaderParameter(this.handle, pname);
  }

  getName() {
    return getShaderName(this.opts.source) || 'unnamed-shader';
  }

  getSource() {
    return this.gl.getShaderSource(this.handle);
  }

  // Debug method - Returns translated source if available
  getTranslatedSource() {
    const extension = this.gl.getExtension('WEBGL_debug_shaders');
    return extension ?
      extension.getTranslatedShaderSource(this.handle) :
      'No translated source available. WEBGL_debug_shaders not implemented';
  }

  // PRIVATE METHODS

  _compile() {
    this.gl.shaderSource(this.handle, this.source);
    this.gl.compileShader(this.handle);

    // Throw if compilation failed
    const compileStatus = this.getParameter(GL.COMPILE_STATUS);
    if (!compileStatus) {
      const infoLog = this.gl.getShaderInfoLog(this.handle);
      const error = formatCompilerError(infoLog, this.source, this.shaderType);
      throw new Error(`Error while compiling the shader ${error}`);
    }

    // Log translated source, if compilation succeeded
    if (log.priority >= 3) {
      log.log(3, this.getTranslatedSource());
    }
  }

  _deleteHandle() {
    this.gl.deleteShader(this.handle);
  }

  _getHandleOpts() {
    return {
      type: this.getParameter(GL.SHADER_TYPE),
      source: this.getSource()
    };
  }
}

export class VertexShader extends Shader {
  constructor(gl, source) {
    super(gl, source, GL.VERTEX_SHADER);
  }

  // PRIVATE METHODS
  _createHandle() {
    return this.gl.createShader(GL.VERTEX_SHADER);
  }
}

export class FragmentShader extends Shader {
  constructor(gl, source) {
    super(gl, source, GL.FRAGMENT_SHADER);
  }

  // PRIVATE METHODS
  _createHandle() {
    return this.gl.createShader(GL.FRAGMENT_SHADER);
  }
}
