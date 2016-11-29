---
layout: docs
title: Program
categories: [Documentation]
---

# Program

## Overview

The Program class encapsulates a WebGLProgram object. It contains a matched
pair of vertex and fragment shaders.

`Program` handles
- Compilation and linking of shaders
- Setting and unsetting buffers (attributes)
- Setting uniform values
- Running shaders (i.e. drawing)

## Notes on Shader Programming

* Shader sources: A Program needs to be constructed with two strings
  containing source code for vertex and fragment shaders.
  While it is of course possible to store shader sources inline in
  JavaScript strings,
  when doing extensive shader programming, use of a tool like
  [glslify](https://github.com/stackgl/glslify)
  is recommended, as it supports organization of shader code
  directly in an application's source file tree.
  luma.gl is fully integrated with glslify and the babel plugin
  babel-plugin-glslify was written specifically to support luma.gl.

  Also, for smaller examples, there are functions to help load shaders
  from HTML templates or URLs in `addons/helpers.js`.

* Default Shaders: Luma.GL comes with a set of default shaders that can
  be used for basic rendering and picking.

## Properties

### `handle` (WebGLProgram)

The native WebGL program instance.


## Methods

| Method         | Description |
| -------------- | ----------- |
| `constructor`  | Creates a Program |
| `update`       | Updates a Program |
| `delete`       | Deletes WebGL resources held by program |
| `setAttributes` | Sets named uniforms from a map, ignoring unused keys |
| `setUniforms`  | Sets named uniforms from a map, ignoring unused keys |
| `draw`         | Runs the shaders with the supplied parameters |

Remarks
* All instance methods in `Program` (unless they return some documented value)
  are chainable.


### Program `constructor`

Creates a new program by using the strings passed as arguments
as source for the shaders. The shaders are compiled into WebGLShaders
and a WebGLProgram is created and the shaders are linked.

{% highlight js %}
	const program = new Program(gl, {
    id: 'my-identifier',
    vs: vertexShaderSource,
    fs: fragmentShaderSource
  });
{% endhighlight %}

Arguments:
1. **gl** (*WebGLRenderingContext*)
2. **opts.vs** (*string*) - The vertex shader source as a string.
3. **opts.fs** (*string*) - The fragment shader source as a string.
4. **opts.id** (*string*) - Optional string id to help indentify the program
   during debugging.

Examples:

Create a Program from the given vertex and fragment shader source code.

{% highlight js %}
const vs = `
  attribute vec3 aVertexPosition;
  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  }
`;

const fs = `
  #ifdef GL_ES
    precision highp float;
  #endif
  void main(void) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`;

const program = new Program(gl, {vs, fs});
{% endhighlight %}


### Program.draw

This call will run the shaders in this program.

Arguments:
* `opt.drawMode` = `GL.TRIANGLES`
* `count`
* `offset` = 0
* `isIndexed` = `false`
* `indexType` = `GL.UNSIGNED_SHORT`
* `isInstanced` = false
* `instanceCount` = 0
* `elements` = null

Note: instanced renderering requires WebGL2 or ANGLE_instanced_arrays.
Check with `GL_CAPS.INSTANCED_ARRAYS`;

Remarks:
* `Program.use` is automatically called by `Program.draw`
* `isIndexed` and `isInstanced` determine the actual draw call that is made.

References
* [gl.drawArrays]()
* [gl.drawElements]()
* [gl.drawArraysInstanced]()
* [gl.drawElementsInstanced]()
* [gl.extension.drawArraysInstancedANGLE]()
* [gl.extension.drawElementsInstancedANGLE]()
* [ANGLE_instanced_arrays]()

### Program.setUniforms

Every program can store a number of uniforms, and setting them in advance
when they don't change between draw calls is a good idea.

For each `key, value` of the object passed in it executes `setUniform(key, value)`.

    program.setUniforms(object);


1. object - (*object*) An object with key value pairs matching a
                       uniform name and its value respectively.


1. key - (*string*) The name of the uniform to be set.
                    The name of the uniform will be matched with the name of
                    the uniform declared in the shader. You can set more
                    uniforms on the Program than its shaders use, the extra
                    uniforms will simply be ignored.
2. value - (*mixed*) The value to be set.
                     Can be a float, an array of floats, a boolean, etc.
                     When the shaders are run (through a draw call),
                     The must match the declaration.
                     There's no need to convert arrays into a typed array,
                     that's done automatically.

Set matrix information for the projection matrix and element matrix of the
camera and world.
The context of this example can be seen
[here]http://uber.github.io/luma.gl/examples/lessons/3/).

{% highlight js %}
program.setUniforms({
  uMVMatrix: view,
  uPMatrix: camera.projection
});
{% endhighlight %}


### `Program.setBuffers`

For each `key, value` of the object passed in it sets the attribute
location matching the key to the supplied buffer.
Unmatched keys are ignored.

    program.setBuffers(object);

1. object - (*object*) An object with key value pairs matching
   a buffer name and its value respectively.

Set buffer values for the vertices of a triangle and a square.
The context of this example can be seen
[here]http://uber.github.io/luma.gl/examples/lessons/1/).

{% highlight js %}
triangleProgram.setBuffers({
  aVertexPosition: {
    value: new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]),
    size: 3
  }
});
squareProgram.setBuffers({
  aVertexPosition: {
    value: new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0]),
    size: 3
  }
});
{% endhighlight %}


## WebGL API

| WebGL API   | Description |
| -------------- | ----------- |
| `use`          | Sets the program as active |
| `getAttributeCount` | Gets number of active attributes |
| `getAttributeInfo` | Gets {name, type, size} for attribute at index |
| `getAttributeLocation` | Gets index for attribute with name |
| `getUniformCount` | Gets number of active uniforms |
| `getUniformInfo` | Gets {name, type, size} for uniform at index |
| `getFragDataLocation` WebGL2 | |

### Program.use

Calls `gl.useProgram(this.program)`. To set the current program as active.
After this call, `gl.draw` calls will run the shaders in this program.

    program.use();

References
* [gl.useProgram]()

Remarks
* `Program.use` is automatically called by `Program.draw`

Calling `Program.use()` after construction
will cause any subsequent `draw*` calls to use the shaders from this program.
