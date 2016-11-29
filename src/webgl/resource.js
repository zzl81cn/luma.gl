import {assertWebGLContext} from './api';

function glGetContextLossCount(gl) {
  return (gl.luma && gl.luma.glCount) || 0;
}

// Stats
let resourceCount = 0;
const resourceMap = {};

export default class Resource {

  constructor(gl, {userData = {}, handle = null, ...opts} = {}) {
    assertWebGLContext(gl);
    this.gl = {};
    this.ext = null;
    this.userData = userData;
    this.opts = {};

    // Use .handle (e.g from stack.gl's gl-buffer), else use handle directly
    if (handle) {
      this._handle = handle.handle || handle;
    }

    // Resource creation stats
    resourceCount++;
    resourceMap[this.constructor.name] =
      resourceMap[this.constructor.name] || {count: 0};
    resourceMap[this.constructor.name].count++;
  }

  reinitialize() {
    this.initialize(this.opts);
  }

  toString() {
    return `${this.constructor.name}(${this.id},${this.width}x${this.height})`;
  }

  set handle(handle) {
    this.glCount = glGetContextLossCount(this.gl);
    this._handle = handle;
  }

  get handle() {
    const glCount = glGetContextLossCount(this.gl);
    if (this.glCount !== glCount) {
      this._handle = this._createHandle(this.opts);
      this._glCount = glCount;
      this.reinitialize();
    }
    return this._handle;
  }

  delete() {
    if (this._handle) {
      this._deleteHandle();
      this._handle = null;
      this.glCount = undefined;
    }
    return this;
  }

  // Many resources support a getParameter call -
  // getParameters will get all parameters - slow but useful for debugging
  getParameters(parameters = this.constructor.PARAMETERS || []) {
    const params = {};
    for (const pname of parameters) {
      params[pname] = this.getParameter(pname);
    }
    return params;
  }

  /*
   * Batch update sampler settings
   * Assumes the subclass supports a setParameter call
   */
  setParameters(parameters) {
    for (const pname in parameters) {
      this.setParameter(pname, parameters[pname]);
    }
    return this;
  }
}
