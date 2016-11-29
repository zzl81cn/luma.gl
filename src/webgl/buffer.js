/* eslint-disable no-inline-comments */
import GL, {glTypeFromArray} from './api';
import {context} from './context';
import Resource from './resource';
import assert from 'assert';

export class BufferLayout {
  /**
   * @classdesc
   * Store characteristics of a data layout
   * This data can be used when updating vertex attributes with
   * the associated buffer, freeing the application from keeping
   * track of this metadata.
   *
   * @class
   * @param {GLuint} size - number of values per element (1-4)
   * @param {GLuint} type - type of values (e.g. gl.FLOAT)
   * @param {GLbool} normalized=false - normalize integers to [-1,1] or [0,1]
   * @param {GLuint} integer=false - WebGL2 only, int-to-float conversion
   * @param {GLuint} stride=0 - supports strided arrays
   * @param {GLuint} offset=0 - supports strided arrays
   */
  constructor({
    // Characteristics of stored data
    type,
    size = 1,
    offset = 0,
    stride = 0,
    normalized = false,
    integer = false,
    instanced = 0
  } = {}) {
    this.type = type;
    this.size = size;
    this.offset = offset;
    this.stride = stride;
    this.normalized = normalized;
    this.integer = integer;
    this.instanced = instanced;
  }
}

export default class Buffer extends Resource {

  static PARAMETERS = [
    GL.BUFFER_SIZE, // GLint indicating the size of the buffer in bytes.
    GL.BUFFER_USAGE // GLenum indicating the usage pattern of the buffer.
  ];

  /*
   * @classdesc
   * Can be used to store vertex data, pixel data retrieved from images
   * or the framebuffer, and a variety of other things.
   *
   * Mainly used for uploading VertexAttributes to GPU
   * Setting data on a buffers (arrays) uploads it to the GPU.
   *
   * Holds an attribute name as a convenience...
   * setData - Initializes size of buffer and sets
   *
   * @param {WebGLRenderingContext} gl - gl context
   * @param {string} opt.id - id for debugging
   */
  constructor(gl = {}, opts = {}) {
    super(gl, opts);
    this.initalize(opts);
    Object.seal(this);
  }

  /**
   * Creates and initializes the buffer object's data store.
   *
   * @param {ArrayBufferView} opt.data - contents
   * @param {GLsizeiptr} opt.bytes - the size of the buffer object's data store.
   * @param {GLenum} opt.usage=gl.STATIC_DRAW - Allocation hint for GPU driver
   *
   * Characteristics of stored data, hints for vertex attribute
   *
   * @param {GLenum} opt.dataType=gl.FLOAT - type of data stored in buffer
   * @param {GLuint} opt.size=1 - number of values per vertex
   * @returns {Buffer} Returns itself for chaining.
   */
  initialize({
    data,
    bytes,
    target = GL.ARRAY_BUFFER,
    usage = GL.STATIC_DRAW,
    // Characteristics of stored data
    layout,
    type,
    size = 1,
    offset = 0,
    stride = 0,
    normalized = false,
    integer = false,
    instanced = 0
  } = {}) {
    assert(data || bytes >= 0, 'Buffer.setData needs data or bytes');
    type = type || glTypeFromArray(data);

    if (data) {
      assert(glTypeFromArray(data), type, 'in Buffer.setData');
    }

    this.bytes = bytes;
    this.data = data;
    this.target = target;
    this.layout = layout || new BufferLayout({
      type,
      size,
      offset,
      stride,
      normalized,
      integer,
      instanced
    });

    // Note: When we are just creating and/or filling the buffer with data,
    // the target we use doesn't technically matter, so use ARRAY_BUFFER
    // https://www.opengl.org/wiki/Buffer_Object
    this.bind({target});
    this.gl.bufferData(target, data || bytes, usage);
    this.unbind({target});

    return this;
  }

  /**
   * Updates a subset of a buffer object's data store.
   * @param {ArrayBufferView} opt.data - contents
   * @returns {Buffer} Returns itself for chaining.
   */
  subData({
    data,
    offset = 0
  } = {}) {
    assert(data, 'Buffer.updateData needs data');

    // Note: When we are just creating and/or filling the buffer with data,
    // the target we use doesn't technically matter, so use ARRAY_BUFFER
    // https://www.opengl.org/wiki/Buffer_Object
    this.bind({target: GL.ARRAY_BUFFER});
    this.gl.bufferSubData(GL.ARRAY_BUFFER, offset, data);
    this.unbind({target: GL.ARRAY_BUFFER});

    return this;
  }

  /**
   * Binds a buffer to a given binding point (target).
   *
   * @param {Glenum} target - target for the bind operation.
   *  Possible values: gl.TRANSFORM_FEEDBACK_BUFFER and gl.UNIFORM_BUFFER
   * @param {GLuint} index - the index of the target.
   * @returns {Buffer} - Returns itself for chaining.
   */
  bind({target = this.target} = {}) {
    this.gl.bindBuffer(target, this.handle);
    return this;
  }

  unbind({target = this.target} = {}) {
    // this.gl.bindBuffer(target, null);
    return this;
  }

  /**
   * Note: WEBGL2
   * Binds a buffer to a given binding point (target) at a given index.
   *
   * @param {Glenum} target - target for the bind operation.
   *  Possible values: gl.TRANSFORM_FEEDBACK_BUFFER and gl.UNIFORM_BUFFER
   * @param {GLuint} index - the index of the target.
   * @returns {Buffer} - Returns itself for chaining.
   */
  bindBase({target = this.target, index} = {}) {
    context.assertWebGL2(this.gl);
    this.gl.bindBufferBase(target, index, this.handle);
    return this;
  }

  unbindBase({target = this.target, index} = {}) {
    context.assertWebGL2(this.gl);
    this.gl.bindBufferBase(target, index, null);
    return this;
  }

  /**
   * Note: WEBGL2
   * binds a range of a given WebGLBuffer to a given binding point (target)
   * at a given index.
   *
   * @param {Glenum} target - target for the bind operation.
   *  Possible values: gl.TRANSFORM_FEEDBACK_BUFFER and gl.UNIFORM_BUFFER
   * @param {GLuint} index - the index of the target.
   * @returns {Buffer} - Returns itself for chaining.
   */
  bindRange({target = this.target, index, offset = 0, size} = {}) {
    context.assertWebGL2(this.gl);
    this.gl.bindBufferRange(target, index, this.handle, offset, size);
    return this;
  }

  unbindRange({target = this.target, index} = {}) {
    context.assertWebGL2(this.gl);
    this.gl.bindBufferBase(target, index, null);
    return this;
  }

  getParameter(pname) {
    this.bind();
    const value = this.gl.getBufferParameter(this.target, pname);
    this.unbind();
    return value;
  }

  // PRIVATE METHODS

  _createHandle() {
    return this.gl.createBuffer();
  }

  _deleteHandle() {
    this.gl.deleteBuffer(this.handle);
  }
}
