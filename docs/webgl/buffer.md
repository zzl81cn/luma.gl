---
layout: docs
title: Buffer
categories: [Documentation]
---

# Buffer

Holds a `WebGLBuffer`. A `WebGLBuffer` is essentially a mechanism to upload
memory buffers (e.g. containing vertex attributes) to the GPU (the cost of
upload can vary depending on whether the system uses a unified memory
architecture or not).


## Buffer Methods

| Method               | Description           |
| -------------------- | --------------------- |
| `constructor`        | creates a Buffer      |
| `delete`             | Destroys buffer       |
| `update`             | Updates data in the buffer |
| `initializeData`     | Creates and initializes the buffer object's data store. |
| `updateData`         | Updates a subset of a buffer object's data store. |

| WebGL Method         | Description           |
| -------------------- | --------------------- |
| `bind`               | Binds a buffer to a given binding point (target). |
| `unbind`             | bind(null) |
| `bindBase` WebGL2    | Binds a buffer to a given binding point (target) at a given index. |
| `unbindBase` WebGL2  | |
| `bindRange` WebGL2   | binds a range of a given WebGLBuffer to a given binding point (target) at a given index. |
| `unbindRange` WebGL2 | |

Remarks
* All instance methods in a buffer (unless they return some documented value)
  are chainable.


### `Buffer` constructor

Creates a new `Buffer`.

{% highlight js %}
  import {Buffer} from 'luma.gl';
	const buffer = new Buffer(gl, options);
{% endhighlight %}

Arguments:
1. name - (*string*) The name (unique id) of the buffer. If no `attribute`
value is set in `options` then the buffer name will be used as attribute name.
2. options - (*object*) An object with options/data described below:

Options:
* attribute - (*string*, optional) The name of the attribute to generate
  attribute calls to. If this parameter is not specified then the attribute
  name will be the buffer name.
* bufferType - (*enum*, optional) The type of the buffer. Possible
  options are `gl.ELEMENT_ARRAY_BUFFER`, `gl.ARRAY_BUFFER`. Default is
  `gl.ARRAY_BUFFER`.
* size - (*numer*, optional) The size of the components in the buffer. Default is 1.
* dataType - (*enum*, optional) The type of the data being stored in the buffer. Default's `gl.FLOAT`.
* stride - (*number*, optional) The `stride` parameter when calling `gl.vertexAttribPointer`. Default's 0.
* offset - (*number*, optional) The `offset` parameter when calling `gl.vertexAttribPointer`. Default's 0.
* drawType - (*enum*, optional) The type of draw used when setting the `gl.bufferData`. Default's `gl.STATIC_DRAW`.

