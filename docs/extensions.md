---
layout: docs
title: WebGL Extensions
categories: [Documentation]
---

This section describes luma.gl's support for WebGL extensions, which
is intended to make WebGL feature detection a little easier, especially for
codebases that want to support both WebGL1 and WebGL2.

# Capabilities

luma.gl's capability queries let you focus on whether a capability is
present and not worry about whether you are running WebGL1 or WebGL2 etc
or what WebGL extensions are involved.

Working with WebGL can be challenging due to many important features being
provided as optional extensions. In addition, WebGL2 is not allowed to
provide WebGL1 extensions for built-in functionality, so applications also
need to check if context is WebGL1 or WebGL2 based to conclusively determine
if a capability is supported or not.

Example:
```
const caps = getGLInfo(gl);

// true if gl is a WebGL2 context, or OES_TEXTURE_FLOAT extension is available
if (info.caps.TEXTURE_FLOAT) {
  const texture = new Texture2D({width, height, type: GL.FLOAT});
  ...
}
```

## General/Debug Capabilities

## Debug Capabilities

| Capability           | Extension | Enables | luma.gl support |
| -------------------- | --------- | ------- | --------------- |
| DEBUG_RENDERER_INFO  | [WEBGL_debug_renderer_info](https://www.khronos.org/registry/webgl/extensions/WEBGL_debug_renderer_info/) | Returns strings identifying GPU | glGetDebugInfo, logged to console on startup |
| DEBUG_SHADERS        | WEBGL_debug_shaders | | TBD |
| DISJOINT_TIMER_QUERY | EXT_disjoint_timer_query, EXT_disjoint_timer_query_webgl2 | Enables async queries of GPU timings | Luma offers Query objects with queryTime under WebGL1 and WebGL2 |
| LOSE_CONTEXT         | [WEBGL_lose_context](https://www.khronos.org/registry/webgl/extensions/WEBGL_lose_context/) | Simulate context loss | TBD |
| -                    | [WEBGL_shared_resources](https://www.khronos.org/registry/webgl/WEBGL_shared_resources/) | Share resource between WebGL contexts | TBD |
|                      | [WEBGL_security_sensitive_resources](https://www.khronos.org/registry/webgl/WEBGL_security_sensitive_resources/) | Cross-origin resource loading | TBD |

Remarks:
* luma.gl uses the debug extensions under the hood (when available) to provide
  a better debug experience, so applications would normally not need to
  check for these.

## WebGL1 Feature Extensions

These extensions expose selected WebGL2 (OpenGL ES 3.0) functionality to WebGL1 apps.
Note that these extensions are no longer available in WebGL2 as the
functionality they enable is provided by default in WebGL2
(which requires an OpenGL ES 3.0 compliant device).

| Capability          | Extension               | Enables | luma.gl support |
| ------------------- | ----------------------- | ------- | --------------- |
| VERTEX_ARRAY_OBJECT | OES_vertex_array_object | WebGL2 VertexArrayObjects             | `VertexArrayObject` uses this extension under WebGL1 |
| INSTANCED_ARRAYS    | ANGLE_instanced_arrays  | Instanced draw functions / divisor    | luma's `draw` uses this extension when required |
| ELEMENT_INDEX_UINT  | OES_element_index_uint  | Querying enables Uint32Array ELEMENTS | luma queries on startup to enable, app needs to query again it wants to test platform |
| TEXTURE_FLOAT       | OES_texture_float       | Enables Float32Array textures | |
| TEXTURE_HALF_FLOAT  | OES_texture_half_float  | Enables Uint16Array / HALF_FLOAT_OES textures | |
| TEXTURE_HALF_FLOAT_LINEAR | OES_texture_half_float_linear | Enables linear filter for half float textures | |
| TEXTURE_FLOAT_LINEAR | OES_texture_float_linear | Enables linear filter for float textures | |
| TEXTURE_FILTER_ANISOTROPIC | EXT_texture_filter_anisotropic | Enables anisotropic filtering | |
| COLOR_BUFFER_FLOAT_RGBA32  | EXT_color_buffer_float | framebuffer render to float color buffer | |
| COLOR_BUFFER_HALF_FLOAT | EXT_color_buffer_half_float | framebuffer render to half float color buffer | |
| DEPTH_TEXTURE       | WEBGL_depth_texture     | Enables storing depth buffers in textures | |
| STANDARD_DERIVATIVES | OES_standard_derivatives | Enables derivative functions in GLSL | |
| FRAG_DEPTH          | EXT_frag_depth          | Enables fragment shader to control depth value | |
| DRAW_BUFFERS        | WEBGL_draw_buffers      | Enables fragment shaders to draw to multiple framebuffers | |
| BLEND_MINMAX        | EXT_blend_minmax        | Extends blending function | |
| SHADER_TEXTURE_LOD  | EXT_shader_texture_lod  | enables shader control of LOD | |
| FBO_RENDER_MIPMAP   | OES_fbo_render_mipmap   | Render to specific texture mipmap level | |
| SRGB                | EXT_sRGB                | sRGB encoded rendering | |

## WebGL2 Extensions

These extensions can bring OpenGL ES 3.1 or 3.2 capabilities to WebGL2 contexts,
if the device supports them.

| COLOR_BUFFER_FLOAT         | WEBGL_color_buffer_float | frame buffer render of various floating point format | |

## Compressed Texture Format Support

These enable various proprietary (patent-encumbered) compressed texture formats.

The primary advantage of compressed texture formats is that in contrast to
JPGs or PNGs, they do not have to be decompressed to be used by the GPU.
As a non-scientific guideline, compressed texture formats might achieve about 4x
compression, compared to say 16x compression for JPEG. So while they might be
slower to load, they could allow 4x more textures to be uploaded in the same
amount of GPU memory.

| Capability | Extension | Enables | luma.gl support |
| --- | --- | --- |
| COMPRESSED_TEXTURE_S3TC | WEBGL_compressed_texture_s3tc | Certain S3TC compressed texture formats | None |
| COMPRESSED_TEXTURE_ATC | WEBGL_compressed_texture_atc | Certain AMD compressed texture formats | None |
| COMPRESSED_TEXTURE_PVRTC | WEBGL_compressed_texture_pvrtc | Certain IMG compressed texture formats | None |
| COMPRESSED_TEXTURE_ETC1 | WEBGL_compressed_texture_etc1 | Certain compressed texture formats | None |
| COMPRESSED_TEXTURE_ETC | WEBGL_compressed_texture_etc | Certaincompressed texture formats | None |
| COMPRESSED_TEXTURE_ASTC | WEBGL_compressed_texture_astc | Certain compressed texture formats | None |
| COMPRESSED_TEXTURE_S3TC_SRGB | WEBGL_compressed_texture_s3tc_srgb | Certain compressed texture formats | None |

Remarks:
Because of patent issues, to use these formats an application would typically:
1. generate these in external commercial applications (which have already
   licensed any supported formats).
2. load them in binary form without touching the content
3. Pass them directly to a texture, so that they are processed inside the
   GPU driver (which also has licensed the formats).

Finding a compressed texture format which is supported across
a range of target devices is another consideration.

## Proposed Extensions

Khronos lists a couple of proposed extensions. They will be considered by
luma.gl as they become available in browsers.

| Extension | Enables | luma.gl support |
| --- | --- | --- |
| EXT_clip_cull_distance (WebGL2) | hardware clip/cull planes (ES3.2) |  |
| EXT_float_blend | 32 bit color blending | |
| EXT_texture_storage | texture storage effiency | |
| WEBGL_debug | Debug events | |
| WEBGL_dynamic_texture | frequently changin textures | |
| WEBGL_subarray_uploads | Efficient buffer update | |

## About WebGL Extensions

The Khronos group's official list of
[WebGL Extensions](https://www.khronos.org/registry/webgl/extensions/)
is intimidatingly long, the extensions can be categorized into a few
basic categories:

* **General Extensions** - These extensions expose some optional general
    capability that was not included in the initial standards perhaps due to
    performance or security concerns.
* **Debug Extensions** - These extensions expose additional information and
    capabilities that help debug and profile a WebGL program.
* **WebGL1 Feature Extensions** - These extensions expose various OpenGL ES 3.0
    features that are often available on the target devices that run the
    OpenGL ES 2.0 based WebGL1 standard today.
* **WebGL2 Feature Extensions** - These extensions expose various
    OpenGL ES 3.1 and 3.2 features that are occasionally available on target
    devices that run the OpenGL ES 3.0 based WebGL2 standard today.
* **Compressed Texture Extensions** - Used to query if the GPU supports
    specific proprietary compressed texture formats.

Also note that because luma.gl gives the application direct access to the WebGL
context, the application can always work directly with any extensions it needs.
Using the support that luma.gl provides for a specific extension is optional.

# Limits

In addition to capabilities, luma.gl can also query the context for all limits.
These are available as `glGetInfo(gl).limits` and can be indexed with the
GL constant representing the limit. Each limit is an object with multiple
values:

- `value` - the value of the limit in the current context
- `webgl1` - the minimum allowed value of the limit for WebGL1 contexts
- `webgl2` - the minimum allowed value of the limit for WebGL2 contexts

