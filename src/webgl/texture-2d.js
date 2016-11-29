import {GL} from './api';
import {assertWebGLContext} from './api';
import Texture from './texture';

export default class Texture2D extends Texture {

  static makeFromSolidColor(gl, [r = 0, g = 0, b = 0, a = 1]) {
    return new Texture2D(gl, {
      pixels: new Uint8Array([r, g, b, a]),
      width: 1,
      format: gl.RGBA,
      magFilter: gl.NEAREST,
      minFilter: gl.NEAREST
    });
  }

  static makeFromPixelArray(gl, {dataArray, format, width, height, ...opts}) {
    // Don't need to do this if the data is already in a typed array
    const dataTypedArray = new Uint8Array(dataArray);
    return new Texture2D(gl, {
      pixels: dataTypedArray,
      width: 1,
      format: gl.RGBA,
      ...opts
    });
  }

  /**
   * @classdesc
   * 2D WebGL Texture
   * Note: Constructor will initialize your texture.
   *
   * @class
   * @param {WebGLRenderingContext} gl - gl context
   * @param {Image|ArrayBuffer|null} opts= - named options
   * @param {Image|ArrayBuffer|null} opts.data= - buffer
   * @param {GLint} width - width of texture
   * @param {GLint} height - height of texture
   */
  constructor(gl, opts = {}) {
    assertWebGLContext(gl);

    super(gl, {...opts, target: GL.TEXTURE_2D});
    Object.seal(this);

    this.update(opts);
  }
}
