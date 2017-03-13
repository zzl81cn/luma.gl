// WebGL2 Transform Feedback Helper
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLQuery

import {glCheckError, isWebGL2Context} from './webgl-checks';
import assert from 'assert';

/* eslint-disable max-len */
// void bindTransformFeedback (GLenum target, WebGLTransformFeedback? id);
// void beginTransformFeedback(GLenum primitiveMode);
// void endTransformFeedback();
// void transformFeedbackVaryings(WebGLProgram? program, sequence<DOMString> varyings, GLenum bufferMode);
// WebGLActiveInfo? getTransformFeedbackVarying(WebGLProgram? program, GLuint index);
// void pauseTransformFeedback();
// void resumeTransformFeedback();

export default class TransformFeedback {

  /**
   * @class
   * @param {WebGL2RenderingContext} gl
   */
  constructor(gl) {
    assert(isWebGL2Context(gl));
    this.gl = gl;
    this.handle = gl.createTransformFeedback();
    this.userData = {};
    Object.seal(this);
  }

  /**
   * @param {GLenum} target
   * @return {TransformFeedback} returns self to enable chaining
   */
  delete() {
    const {gl} = this;
    gl.deleteTransformFeedback(this.handle);
    this.handle = null;
    glCheckError(gl);
    return this;
  }

  /**
   * @return {TransformFeedback} returns self to enable chaining
   */
  bind() {
    const {gl} = this;
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.handle);
    glCheckError(gl);
    return this;
  }

  unbind() {
    const {gl} = this;
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    glCheckError(gl);
    return this;
  }

  /**
   * @param {GLenum} primitiveMode
   * @return {TransformFeedback} returns self to enable chaining
   */
  begin(primitiveMode) {
    const {gl} = this;
    gl.beginTransformFeedback(primitiveMode);
    glCheckError(gl);
    return this;
  }

  /**
   * @return {TransformFeedback} returns self to enable chaining
   */
  pause() {
    const {gl} = this;
    gl.pauseTransformFeedback();
    glCheckError(gl);
    return this;
  }

  /**
   * @return {TransformFeedback} returns self to enable chaining
   */
  resume() {
    const {gl} = this;
    gl.resumeTransformFeedback();
    glCheckError(gl);
    return this;
  }

  /**
   * @return {TransformFeedback} returns self to enable chaining
   */
  end() {
    const {gl} = this;
    gl.endTransformFeedback();
    glCheckError(gl);
    return this;
  }

  /**
   * @param {WebGLProgram?} program
   * @param {sequence<DOMString>} varyings
   * @param {GLenum} bufferMode gl.INTERLEAVED_ATTRIBS or gl.SEPARATE_ATTRIBS.
   * @return {TransformFeedback} returns self to enable chaining
   */
  varyings(program, varyings, bufferMode) {
    const {gl} = this;
    const result = gl.transformFeedbackVaryings(program, varyings, bufferMode);
    glCheckError(gl);
    return result;
  }

  /**
   * @param {WebGLProgram} program
   * @param {GLuint} index
   * @return {WebGLActiveInfo} - object with {name, size, type}
   */
  getVarying(program, index) {
    const {gl} = this;
    const result = gl.getTransformFeedbackVarying(program, index);
    glCheckError(gl);
    return result;
  }

}
