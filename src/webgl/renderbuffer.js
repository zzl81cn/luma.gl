/* eslint-disable no-inline-comments */
import GL from './api';
import context from './context';
import Resource from './resource';

import assert from 'assert';

export default class Renderbuffer extends Resource {

  static PARAMETERS = [
    GL.RENDERBUFFER_WIDTH, // {GLint} - height of the image of renderbuffer.
    GL.RENDERBUFFER_HEIGHT, // {GLint} - height of the image of renderbuffer.
    // @returns {GLenum} internal format of the currently bound renderbuffer.
    // The default is GL.RGBA4. Possible return values:
    // GL.RGBA4: 4 red bits, 4 green bits, 4 blue bits 4 alpha bits.
    // GL.RGB565: 5 red bits, 6 green bits, 5 blue bits.
    // GL.RGB5_A1: 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.
    // GL.DEPTH_COMPONENT16: 16 depth bits.
    // GL.STENCIL_INDEX8: 8 stencil bits.
    GL.RENDERBUFFER_INTERNAL_FORMAT,
    GL.RENDERBUFFER_GREEN_SIZE, // {GLint} - resolution (in bits) of green color
    GL.RENDERBUFFER_BLUE_SIZE, // {GLint} - resolution (in bits) of blue color
    GL.RENDERBUFFER_RED_SIZE, // {GLint} - resolution (in bits) of red color
    GL.RENDERBUFFER_ALPHA_SIZE, // {GLint} - resolution (in bits) of alpha component
    GL.RENDERBUFFER_DEPTH_SIZE, // {GLint} - resolution (in bits) of depth component
    GL.RENDERBUFFER_STENCIL_SIZE, // {GLint} - resolution (in bits) of stencil component

    // When using a WebGL 2 context, the following value is available
    GL.RENDERBUFFER_SAMPLES
  ];

  constructor(gl, opts = {}) {
    super(gl, opts);
    Object.seal(this);
  }

  initialize({format, width, height}) {
    this.opts = {...this.opts, format, width, height};
    return this.storage({format, width, height});
  }

  // Accessors

  // @returns {GLint} - width of the image of the currently bound renderbuffer.
  get width() {
    return this.getParameter(GL.RENDERBUFFER_WIDTH);
  }

  // @returns {GLint} - height of the image of the currently bound renderbuffer.
  get height() {
    return this.getParameter(GL.RENDERBUFFER_HEIGHT);
  }

  // @returns {GLenum} internal format of the currently bound renderbuffer.
  // The default is gl.RGBA4. Possible return values:
  // gl.RGBA4: 4 red bits, 4 green bits, 4 blue bits 4 alpha bits.
  // gl.RGB565: 5 red bits, 6 green bits, 5 blue bits.
  // gl.RGB5_A1: 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.
  // gl.DEPTH_COMPONENT16: 16 depth bits.
  // gl.STENCIL_INDEX8: 8 stencil bits.
  get internalFormat() {
    return this.getParameter(GL.RENDERBUFFER_INTERNAL_FORMAT);
  }

  // When using a WebGL 2 context, the following value is available
  get samples() {
    return this.getParameter(GL.RENDERBUFFER_SAMPLES);
  }

  // Modifiers

  bind() {
    this.gl.bindRenderbuffer(GL.RENDERBUFFER, this.handle);
    return this;
  }

  unbind() {
    this.gl.bindRenderbuffer(GL.RENDERBUFFER, null);
    return this;
  }

  /**
   * Creates and initializes a renderbuffer object's data store
   *
   * @param {GLenum} opt.internalFormat -
   * @param {GLint} opt.width -
   * @param {GLint} opt.height
   * @returns {Renderbuffer} returns itself to enable chaining
   */
  storage({internalFormat, width, height}) {
    assert(internalFormat, 'Needs internalFormat');
    this.bind();
    this.gl.renderbufferStorage(GL.RENDERBUFFER, internalFormat, width, height);
    this.unbind();
    return this;
  }

  // @param {Boolean} opt.autobind=true - method call will bind/unbind object
  // @returns {GLenum|GLint} - depends on pname
  getParameter(pname) {
    this.bind();
    const value = this.gl.getRenderbufferParameter(GL.RENDERBUFFER, pname);
    this.unbind();
    return value;
  }

  // WEBGL2 METHODS

  // (OpenGL ES 3.0.4 §4.4.2)
  storageMultisample({
    samples,
    internalformat,
    width,
    height
  } = {}) {
    context.assertWebGL2(this.gl);
    this.gl.renderbufferStorageMultisample(
      GL.RENDERBUFFER, samples, internalformat, width, height
    );
    return this;
  }

  // (OpenGL ES 3.0.4 §6.1.15)
  getInternalformatParameter({internalformat, pname = GL.SAMPLES}) {
    context.assertWebGL2(this.gl);
    return this.gl.getInternalformatParameter(
      GL.RENDERBUFFER, internalformat, pname
    );
  }

  // PRIVATE METHODS

  _createHandle() {
    this.handle = this.gl.createRenderbuffer();
  }

  _deleteHandle() {
    this.gl.deleteRenderbuffer(this.handle);
  }

  _getHandleOpts() {
    return {
      format: this.getParameter(GL.RENDERBUFFER_INTERNAL_FORMAT),
      width: this.getParameter(GL.RENDERBUFFER_WIDTH),
      height: this.getParameter(GL.RENDERBUFFER_HEIGHT)
    };
  }
}
