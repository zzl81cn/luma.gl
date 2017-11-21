/* global document */
import AnimationLoop, {requestAnimationFrame, cancelAnimationFrame} from './animation-loop';
import {getPageLoadPromise, createCanvas, getCanvas} from '../webgl-utils';

export default class AnimationLoopOffThread {

  static createWorker(opts) {
    return self => {

      self.animationLoop = null;

      self.addEventListener('message', evt => {
        const {animationLoop} = self;

        switch (evt.data.command) {

        case 'initialize':
          opts.offThread = true;
          self.animationLoop = new AnimationLoop(opts);
          break;

        case 'start':
          if (animationLoop) {
            animationLoop.start(evt.data.opts);
          }
          break;

        case 'stop':
          if (animationLoop) {
            animationLoop.stop();
          }
          break;

        case 'resize':
          self.canvasWidth = evt.data.width;
          self.canvasHeight = evt.data.height;
          break;

        case 'setViewParameters':
          if (animationLoop) {
            animationLoop.setViewParameters(evt.data.params);
          }
          break;
        }

      });

    };
  }

  /*
   * @param {HTMLCanvasElement} canvas - if provided, width and height will be passed to context
   */
  constructor({worker}) {
    worker.postMessage({command: 'initialize'});
    this.worker = worker;

    this.canvas = null;
    this.width = null;
    this.height = null;

    this._updateFrame = this._updateFrame.bind(this);
  }

  // Public methods
  start(opts) {
    const {canvas, width, height, throwOnError} = opts;

    // Error reporting function, enables exceptions to be disabled
    function onError(message) {
      if (throwOnError) {
        throw new Error(message);
      }
      // log.log(0, message);
      return null;
    }
    this._stopped = false;
    // console.debug(`Starting ${this.constructor.name}`);
    if (!this._animationFrameId) {
      // Wait for start promise before rendering frame
      this._startPromise = getPageLoadPromise()
      .then(() => {
        let realCanvas;
        if (!canvas) {
          realCanvas = createCanvas({id: 'lumagl-canvas', width, height, onError});
        } else if (typeof canvas === 'string') {
          realCanvas = getCanvas({id: canvas});
        } else {
          realCanvas = canvas;
        }

        if (!realCanvas.transferControlToOffscreen) {
          onError('OffscreenCanvas is not available. Enable Experimental canvas features in chrome://flags');
        }
        const offscreen = realCanvas.transferControlToOffscreen();

        this.worker.postMessage({
          command: 'start',
          opts: Object.assign({}, opts, {canvas: offscreen, isWorker: true})
        }, [offscreen]);

        this.canvas = realCanvas;
      })
      .then(() => {
        if (!this._stopped && !this._animationFrameId) {
          requestAnimationFrame(this._updateFrame);
        }
      });
    }
    return this;
  }

  setViewParameters(params) {
    this.worker.postMessage({command: 'setViewParameters', params});
    return this;
  }

  stop() {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
      this._stopped = true;
    }
    this.worker.postMessage({command: 'stop'});
    return this;
  }

  _updateFrame() {
    if (this.canvas) {
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;

      if (this.width !== width || this.height !== height) {
        this.width = width;
        this.height = height;
        this.worker.postMessage({
          command: 'resize',
          width,
          height,
          devicePixelRatio: window.devicePixelRatio
        });
      }
    }
    requestAnimationFrame(this._updateFrame);
  }

}
