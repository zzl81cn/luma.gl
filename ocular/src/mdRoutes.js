/* eslint-disable max-len */
import apiReference from '../../docs/api-reference/README.md';
import animationLoop from '../../docs/api-reference/core/animation-loop.md';
import buffer from '../../docs/api-reference/webgl/buffer.md';
import geometry from '../../docs/api-reference/core/geometry.md';
import model from '../../docs/api-reference/core/model.md';
import cone from '../../docs/api-reference/models/cone.md';
import cube from '../../docs/api-reference/models/cube.md';
import cylinder from '../../docs/api-reference/models/cylinder.md';
import icoSphere from '../../docs/api-reference/models/ico-sphere.md';
import plane from '../../docs/api-reference/models/plane.md';
import sphere from '../../docs/api-reference/models/sphere.md';
import program from '../../docs/api-reference/webgl/program.md';
import query from '../../docs/api-reference/webgl/query.md';
import renderbuffer from '../../docs/api-reference/webgl/renderbuffer.md';
import resource from '../../docs/api-reference/webgl/resource.md';
import sampler from '../../docs/api-reference/webgl/sampler.md';
import shader from '../../docs/api-reference/webgl/shader.md';
import shaderCache from '../../docs/api-reference/shadertools/shader-cache.md';
import shadertools from '../../docs/api-reference/shadertools/README.md';
import shadertoolsPicking from '../../docs/api-reference/shadertools/shadertools-picking.md';
import texture from '../../docs/api-reference/webgl/texture.md';
import texture2d from '../../docs/api-reference/webgl/texture-2d.md';
import texture2dArray from '../../docs/api-reference/webgl/texture-2d-array.md';
import texture3d from '../../docs/api-reference/webgl/texture-3d.md';
import textureCube from '../../docs/api-reference/webgl/texture-cube.md';
import transformFeedback from '../../docs/api-reference/webgl/transform-feedback.md';
import uniformBufferLayout from '../../docs/api-reference/webgl/uniform-buffer-layout.md';
import vertexArray from '../../docs/api-reference/webgl/vertex-array.md';
import context from '../../docs/api-reference/webgl/context/context.md';
import contextIsWebGL2 from '../../docs/api-reference/webgl/context/is-webGL2.md';
import contextHasFeatures from '../../docs/api-reference/webgl/context-features/has-features.md';
import contextGetFeatures from '../../docs/api-reference/webgl/context-features/get-features.md';
import contextGetContextInfo from '../../docs/api-reference/webgl/context-limits/get-context-info.md';
import contextGetContextLimits from '../../docs/api-reference/webgl/context-limits/get-context-limits.md';
import contextGetParameters from '../../docs/api-reference/webgl/context-state/get-parameters.md';
import contextResetParameters from '../../docs/api-reference/webgl/context-state/reset-parameters.md';
import contextWithParameters from '../../docs/api-reference/webgl/context-state/with-parameters.md';

export default [{
  name: 'Documentation',
  path: '/docs',
  data: [{
    name: 'API Reference',
    path: '/api-reference',
    data: [
      {
        name: 'Introduction',
        content: apiReference
      },
      {
        name: 'AnimationLoop',
        content: animationLoop
      },
      {
        name: 'Buffer',
        content: buffer
      },
      {
        name: 'Geometry',
        content: geometry
      },
      // {
      //   name: 'Group',
      //   content: group
      // },
      {
        name: 'Model',
        content: model
      },
      {
        name: 'Model:Cone',
        content: cone
      },
      {
        name: 'Model:Cube',
        content: cube
      },
      {
        name: 'Model:Cylinder',
        content: cylinder
      },
      {
        name: 'Model:IcoSphere',
        content: icoSphere
      },
      {
        name: 'Model:Plane',
        content: plane
      },
      {
        name: 'Model:Sphere',
        content: sphere
      },
      // {
      //   name: 'Object3d',
      //  core/object-3d,
      // },
      // {
      //   name: 'Picking',
      //  picking/picking,
      // },
      {
        name: 'Program',
        content: program
      },
      {
        name: 'Query',
        content: query
      },
      {
        name: 'Renderbuffer',
        content: renderbuffer
      },
      {
        name: 'Resource',
        content: resource
      },
      {
        name: 'Sampler',
        content: sampler
      },
      {
        name: 'Shader',
        content: shader
      },
      {
        name: 'ShaderCache',
        content: shaderCache
      },
      {
        name: 'Shader Modules',
        content: shadertools
      },
      {
        name: 'Shader Module:picking',
        content: shadertoolsPicking
      },
      {
        name: 'Texture',
        content: texture
      },
      {
        name: 'Texture2D',
        content: texture2d
      },
      {
        name: 'Texture2DArray',
        content: texture2dArray
      },
      {
        name: 'Texture3D',
        content: texture3d
      },
      {
        name: 'TextureCube',
        content: textureCube
      },
      {
        name: 'TransformFeedback',
        content: transformFeedback
      },
      {
        name: 'UniformBufferLayout',
        content: uniformBufferLayout
      },
      {
        name: 'VertexArray',
        content: vertexArray
      },
      {
        name: 'createGLContext',
        content: context
      },
      {
        name: 'isWebGL2',
        content: contextIsWebGL2
      },
      {
        name: 'hasFeature(s)',
        content: contextHasFeatures
      },
      {
        name: 'getFeatures',
        content: contextGetFeatures
      },
      {
        name: 'getContextInfo',
        content: contextGetContextInfo
      },
      {
        name: 'getContextLimits',
        content: contextGetContextLimits
      },
      {
        name: 'get|setParameter(s)',
        content: contextGetParameters
      },
      {
        name: 'resetParameters',
        content: contextResetParameters
      },
      {
        name: 'withParameters',
        content: contextWithParameters
      }
    ]
  }]
}];

/*

const GITHUB_TREE = 'https://github.com/uber/luma.gl/tree/master';
const RAW_GITHUB = 'https://raw.githubusercontent.com/uber/luma.gl/master';

export const EXAMPLE_PAGES = [
  {
    name: 'Overview',
    content: 'markdown/examples.md'
  },
  {
    name: 'Core Examples',
    children: [
      {
        name: 'Cubemap',
        content: {
          demo: 'CubemapDemo',
          code: `${GITHUB_TREE}/examples/core/cubemap`
        }
      },
      // {
      //   name: 'Custom Picking',
      //   content: {
      //     demo: 'CustomPickingDemo',
      //     path: `${GITHUB_TREE}/examples/core/custom-picking/`
      //   }
      // },
      {
        name: 'Fragment',
        content: {
          demo: 'FragmentDemo',
          code: `${GITHUB_TREE}/examples/core/fragment`
        }
      },
      {
        name: 'Instancing',
        content: {
          demo: 'InstancingDemo',
          code: `${GITHUB_TREE}/examples/core/instancing`
        }
      },
      {
        name: 'Mandelbrot',
        content: {
          demo: 'MandelbrotDemo',
          code: `${GITHUB_TREE}/examples/core/mandelbrot`
        }
      },
      {
        name: 'Picking',
        content: {
          demo: 'PickingDemo',
          code: `${GITHUB_TREE}/examples/core/picking`,
          path: `${RAW_GITHUB}/examples/core/picking/`
        }
      },
      // {
      //   name: 'DeferredRendering',
      //   content: {
      //     demo: 'DeferredRenderingDemo'
      //   }
      // },
      // {
      //   name: 'Particles',
      //   content: {
      //     demo: 'ParticlesDemo'
      //   }
      // },
      // {
      //   name: 'Persistence',
      //   content: {
      //     demo: 'PersistenceDemo'
      //   }
      // },
      {
        name: 'Shadowmap',
        content: {
          demo: 'ShadowmapDemo',
          code: `${GITHUB_TREE}/examples/core/shadowmap`
        }
      },
      {
        name: 'Transform Feedback',
        content: {
          demo: 'TransformFeedbackDemo',
          code: `${GITHUB_TREE}/examples/core/transform-feedback`
        }
      }
    ]
  },
  {
    name: 'WebGL Lessons',
    children: [
      {
        name: 'Lesson 01 - Drawing',
        content: {
          demo: 'Lesson01',
          code: `${GITHUB_TREE}/examples/lessons/01`
        }
      },
      {
        name: 'Lesson 02 - Color',
        content: {
          demo: 'Lesson02',
          code: `${GITHUB_TREE}/examples/lessons/02`
        }
      },
      {
        name: 'Lesson 03 - Movement',
        content: {
          demo: 'Lesson03',
          code: `${GITHUB_TREE}/examples/lessons/03`
        }
      },
      {
        name: 'Lesson 04 - 3D Objects',
        content: {
          demo: 'Lesson04',
          code: `${GITHUB_TREE}/examples/lessons/04`
        }
      },
      {
        name: 'Lesson 05 - Textures',
        content: {
          demo: 'Lesson05',
          code: `${GITHUB_TREE}/examples/lessons/05`,
          path: `${RAW_GITHUB}/examples/lessons/05/`
        }
      },
      {
        name: 'Lesson 06 - Texture Filters',
        content: {
          demo: 'Lesson06',
          code: `${GITHUB_TREE}/examples/lessons/06/`,
          path: `${RAW_GITHUB}/examples/lessons/06/`
        }
      },
      {
        name: 'Lesson 07 - Lighting',
        content: {
          demo: 'Lesson07',
          code: `${GITHUB_TREE}/examples/lessons/07/`,
          path: `${RAW_GITHUB}/examples/lessons/07/`
        }
      },
      {
        name: 'Lesson 08 - Transparency',
        content: {
          demo: 'Lesson08',
          code: `${GITHUB_TREE}/examples/lessons/08/`,
          path: `${RAW_GITHUB}/examples/lessons/08/`
        }
      },
      {
        name: 'Lesson 09 - Moving Objects',
        content: {
          demo: 'Lesson09',
          code: `${GITHUB_TREE}/examples/lessons/09/`,
          path: `${RAW_GITHUB}/examples/lessons/09/`
        }
      },
      // {
      //   name: 'Lesson 10',
      //   content: {
      //     demo: 'Lesson03'
      //   }
      // },
      // {
      //   name: 'Lesson 11',
      //   content: {
      //     demo: 'Lesson03'
      //   }
      // },
      // {
      //   name: 'Lesson 12',
      //   content: {
      //     demo: 'Lesson03'
      //   }
      // },
      // {
      //   name: 'Lesson 13',
      //   content: {
      //     demo: 'Lesson03'
      //   }
      // },
      // {
      //   name: 'Lesson 14',
      //   content: {
      //     demo: 'Lesson03'
      //   }
      // },
      // {
      //   name: 'Lesson 15',
      //   content: {
      //     demo: 'Lesson03'
      //   }
      // },
      {
        name: 'Lesson 16 - Render to Texture',
        content: {
          demo: 'Lesson16',
          code: `${GITHUB_TREE}/examples/lessons/16/`,
          path: `${RAW_GITHUB}/examples/lessons/16/`
        }
      }
    ]
  }
];

export const DOC_PAGES = [
  {
    name: 'Overview',
    children: [
      {
        name: 'Introduction',
        content: 'README.md'
      },
      {
        name: 'What\'s New',
        content: 'whats-new.md'
      },
      {
        name: 'Upgrade Guide',
        content: 'upgrade-guide.md'
      }
    ]
  },
  {
    name: 'Getting Started',
    children: [
      {
        name: 'Overview',
        content: 'get-started/README.md'
      },
      {
        name: 'Installation',
        content: 'get-started/installation.md'
      },
      {
        name: 'Examples',
        content: 'get-started/examples.md'
      },
      {
        name: 'Using with deck.gl',
        content: 'get-started/using-with-deckgl.md'
      },
      {
        name: 'Using with Node.js',
        content: 'get-started/using-with-node.md'
      },
      {
        name: 'Debugging',
        content: 'get-started/debugging.md'
      }
      // {
      //   name: 'Using with other Frameworks',
      //   content: 'get-started/using-with-other-frameworks.md'
      // }
    ]
  },
  // ,
  // {
  //   name: 'Advanced',
  //   children: [
  //     {
  //       name: 'Roadmap',
  //       content: 'user-guide/extensions.md'
  //     },
  //     {
  //       name: 'Extensions',
  //       content: 'user-guide/extensions.md'
  //     },
      // {
      //   name: 'WebGL2',
      //   content: 'user-guide/webgl2.md'
      // },
      // {
      //   name: 'GPGPU Programming',
      //   content: 'user-guide/gpgpu.md'
      // }
  //   ]
  // }
*/