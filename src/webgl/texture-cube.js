import GL from './api';
import Texture from './texture';
import context from './context';
import assert from 'assert';

export default class TextureCube extends Texture {
  constructor(gl, opts = {}) {
    super(gl, {...opts, target: GL.TEXTURE_CUBE_MAP});
    this.initialize(opts);
    Object.seal(this);
  }

  /* eslint-disable max-len, max-statements */
  initialize({
    [GL.TEXTURE_CUBE_MAP_POSITIVE_X]: dataPosX,
    [GL.TEXTURE_CUBE_MAP_POSITIVE_Y]: dataPosY,
    [GL.TEXTURE_CUBE_MAP_POSITIVE_Z]: dataPosZ,
    [GL.TEXTURE_CUBE_MAP_NEGATIVE_X]: dataNegX,
    [GL.TEXTURE_CUBE_MAP_NEGATIVE_Y]: dataNegY,
    [GL.TEXTURE_CUBE_MAP_NEGATIVE_Z]: dataNegZ,
    width = 1,
    height = 1,
    format = GL.RGBA,
    type = GL.UNSIGNED_BYTE,
    dataFormat,
    border = 0,
    mipmaps = false,
    ...opts
  } = {}) {
    // Deduce width and height
    ({type, dataFormat} = this._deduceTypeAndDataFormat({format, type, dataFormat}));
    ({width, height} = this._deduceSize({data: dataPosX, width, height}));

    // Enforce cube
    assert(width === height);

    // Temporarily apply any pixel store settings and build textures
    context.withParameters(this.gl, opts, () => {
      this._setImage({target: GL.TEXTURE_CUBE_MAP_POSITIVE_X, data: dataPosX, width, height, format, type, dataFormat, border, mipmaps});
      this._setImage({target: GL.TEXTURE_CUBE_MAP_POSITIVE_Y, data: dataPosY, width, height, format, type, dataFormat, border, mipmaps});
      this._setImage({target: GL.TEXTURE_CUBE_MAP_POSITIVE_Z, data: dataPosZ, width, height, format, type, dataFormat, border, mipmaps});
      this._setImage({target: GL.TEXTURE_CUBE_MAP_NEGATIVE_X, data: dataNegX, width, height, format, type, dataFormat, border, mipmaps});
      this._setImage({target: GL.TEXTURE_CUBE_MAP_NEGATIVE_Y, data: dataNegY, width, height, format, type, dataFormat, border, mipmaps});
      this._setImage({target: GL.TEXTURE_CUBE_MAP_NEGATIVE_Z, data: dataNegZ, width, height, format, type, dataFormat, border, mipmaps});
    });

    // Called here so that GL.
    // TODO - should genMipmap() be called on the cubemap or on the faces?
    if (mipmaps) {
      this.generateMipmap(opts);
    }

    // Store opts for accessors
    this.opts.width = width;
    this.opts.height = height;
    this.opts.format = format;
    this.opts.type = type;
    this.opts.dataFormat = dataFormat;
    this.opts.border = border;

    // TODO - Store data to enable auto recreate on context loss
    if (opts.recreate) {
      this.opts[GL.TEXTURE_CUBE_MAP_POSITIVE_X] = dataPosX;
      this.opts[GL.TEXTURE_CUBE_MAP_POSITIVE_Y] = dataPosY;
      this.opts[GL.TEXTURE_CUBE_MAP_POSITIVE_Z] = dataPosZ;
      this.opts[GL.TEXTURE_CUBE_MAP_NEGATIVE_X] = dataNegX;
      this.opts[GL.TEXTURE_CUBE_MAP_NEGATIVE_Y] = dataNegY;
      this.opts[GL.TEXTURE_CUBE_MAP_NEGATIVE_Z] = dataNegZ;
    }
  }

  subImage(face, {data, x = 0, y = 0, mipmapLevel = 0}) {
    return this._subImage({target: face, data, x, y, mipmapLevel});
  }

  bind({index} = {}) {
    assert(index !== undefined);
    this.gl.activeTexture(GL.TEXTURE0 + index);
    this.gl.bindTexture(GL.TEXTURE_CUBE_MAP, this.handle);
    return index;
  }

  unbind() {
    this.gl.bindTexture(GL.TEXTURE_CUBE_MAP, null);
    return this;
  }
}
