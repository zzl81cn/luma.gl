// Export core modules for luma.gl
export * from './webgl';
export * from './webgl2';
export * from './math';
export * from './core';

import * as webgl from './webgl';
import * as webgl2 from './webgl2';
import * as math from './math';
import * as core from './core';

export * from './geometry';
export * from './models';

import * as geometry from './geometry';
import * as models from './models';

export * from './experimental';
import * as experimental from './experimental';

export * from './deprecated';
import * as deprecated from './deprecated';

export {default as Shaders} from '../shaderlib';
import {default as Shaders} from '../shaderlib';

import luma from './globals';
Object.assign(luma,
  webgl,
  webgl2,
  math,
  core,

  Shaders,
  geometry,
  models,

  experimental,
  deprecated
);
