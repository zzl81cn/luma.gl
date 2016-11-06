const {createGLContext} = require('../');
const {isWebGLContext} = require('../api');

const test = require('tape-catch');

test('WebGL#headless context creation', t => {
  const gl = createGLContext();
  t.ok(isWebGLContext(gl), 'Context creation ok');
  t.end();
});
