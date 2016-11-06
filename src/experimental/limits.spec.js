import {createGLContext} from '../../src/headless';
import {glGetInfo, ES300, TEST_LIMITS} from './limits';
import test from 'tape-catch';

const fixture = {
  gl: createGLContext()
};

test('WebGL#glGetInfo', t => {
  const {gl} = fixture;

  t.ok(glGetInfo, 'glGetInfo defined');
  t.ok(ES300, 'ES300 defined');

  const info = glGetInfo(gl);

  t.ok('limits' in info, 'info has limits');
  t.ok('caps' in info, 'info has caps');
  t.ok('info' in info, 'info has info');

  t.end();
});

test('glGetInfo#limits', t => {
  const {gl} = fixture;

  const info = glGetInfo(gl);

  for (const limit in TEST_LIMITS.WEBGL1_LIMITS) {
    t.ok(info.limits[limit].value >= info.limits[limit].webgl1,
      `${limit}: actual limit larger than or equal to webgl1 limit`);
    t.ok(info.limits[limit].webgl2 >= info.limits[limit].webgl1,
      `${limit}: webgl2 limit larger than or equal to webgl1 limit`);
  }

  for (const limit in TEST_LIMITS.WEBGL2_LIMITS) {
    t.ok(info.limits[limit].value >= info.limits[limit].webgl1,
      `${limit}: actual limit larger than or equal to webgl1 limit`);
    t.ok(info.limits[limit].webgl2 >= info.limits[limit].webgl1,
      `${limit}: webgl2 limit larger than or equal to webgl1 limit`);
  }

  t.end();
});

test('glGetInfo#caps', t => {
  const {gl} = fixture;

  const info = glGetInfo(gl);

  for (const cap in TEST_LIMITS.WEBGL_CAPS) {
    const value = info.caps[cap];
    t.ok(value === false || value === true || value === ES300,
      `${cap}: cap has one of three allowed values`);
  }

  t.end();
});
