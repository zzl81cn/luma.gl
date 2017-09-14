import {setContextDefaults} from 'luma.gl';
setContextDefaults({webgl2: true});

// NEED TO USE ES6 STYLE EXPORT...: IMPORT FIRST AND THEN EXPORT
import {default as Instancing} from '../../examples/core/instancing/app.js';
import {default as Cubemap} from '../../examples/core/cubemap/app.js';
// import {default as CustomPicking} from '../../examples/core/custom-picking/app.js';
// import {default as DeferredRendering} from '../../examples/core/deferred-rendering/app.js';
import {default as Mandelbrot} from '../../examples/core/mandelbrot/app.js';
import {default as Fragment} from '../../examples/core/fragment/app.js';
// import {default as Particles} from '../../examples/core/particles/app.js';
// import {default as Persistence} from '../../examples/core/persistence/app.js';
import {default as Picking} from '../../examples/core/picking/app.js';
import {default as Shadowmap} from '../../examples/core/shadowmap/src/app.js';
import {default as TransformFeedback} from '../../examples/core/transform-feedback/app.js';

import {default as Lesson01} from '../../examples/lessons/01/app.js';
import {default as Lesson02} from '../../examples/lessons/02/app.js';
import {default as Lesson03} from '../../examples/lessons/03/app.js';
import {default as Lesson04} from '../../examples/lessons/04/app.js';
import {default as Lesson05} from '../../examples/lessons/05/app.js';
import {default as Lesson06} from '../../examples/lessons/06/app.js';
import {default as Lesson07} from '../../examples/lessons/07/app.js';
import {default as Lesson08} from '../../examples/lessons/08/app.js';
import {default as Lesson09} from '../../examples/lessons/09/app.js';
import {default as Lesson10} from '../../examples/lessons/10/app.js';
import {default as Lesson11} from '../../examples/lessons/11/app.js';
import {default as Lesson16} from '../../examples/lessons/16/app.js';

/* eslint-disable */
import React from 'react';
import Demo from './react-demo-runner';
/* eslint-enable */

export default {
  InstancingDemo: props => (<Demo {...props} demo={Instancing}/>),
  CubemapDemo: props => (<Demo {...props} demo={Cubemap}/>),
  // CustomPickingDemo: props => (<Demo {...props} demo={CustomPicking}/>),
  // DeferredRenderingDemo: props => (<Demo {...props} demo={DeferredRendering/>),
  MandelbrotDemo: props => (<Demo {...props} demo={Mandelbrot}/>),
  FragmentDemo: props => (<Demo {...props} demo={Fragment}/>),
  // ParticlesDemo: props => (<Demo {...props} demo={Particles}/>),
  // PersistenceDemo: props => (<Demo {...props} demo={Persistence}/>),
  PickingDemo: props => (<Demo {...props} demo={Picking}/>),
  ShadowmapDemo: props => (<Demo {...props} demo={Shadowmap}/>),
  TransformFeedbackDemo: props => (<Demo {...props} demo={TransformFeedback}/>),

  Lesson01: props => (<Demo {...props} demo={Lesson01}/>),
  Lesson02: props => (<Demo {...props} demo={Lesson02}/>),
  Lesson03: props => (<Demo {...props} demo={Lesson03}/>),
  Lesson04: props => (<Demo {...props} demo={Lesson04}/>),
  Lesson05: props => (<Demo {...props} demo={Lesson05}/>),
  Lesson06: props => (<Demo {...props} demo={Lesson06}/>),
  Lesson07: props => (<Demo {...props} demo={Lesson07}/>),
  Lesson08: props => (<Demo {...props} demo={Lesson08}/>),
  Lesson09: props => (<Demo {...props} demo={Lesson09}/>),
  Lesson10: props => (<Demo {...props} demo={Lesson10}/>),
  Lesson11: props => (<Demo {...props} demo={Lesson11}/>),
  Lesson16: props => (<Demo {...props} demo={Lesson16}/>)
};
