import {createGLContext, Program} from '../';
import {isWebGLContext} from '../api';
import test from 'tape-catch';

test('WebGL#draw', t => {
  const gl = createGLContext();
  t.ok(isWebGLContext(gl), 'Created gl context');

  const program = new Program(gl);
  t.ok(program instanceof Program, 'Program construction successful');
  t.end();

  // draw(gl, {
  // instanced: true,
  // });
});
