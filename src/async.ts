import Cube from './cube';

const Extend = {
  asyncOK: !!window.Worker,

  _asyncSetup(workerURI: any) {
    if (this._worker) {
      return;
    }
    this._worker = new window.Worker(workerURI);
    this._worker.addEventListener('message', (e: any) => this._asyncEvent(e));
    return (this._asyncCallbacks = {});
  },

  _asyncEvent(e: { data: { cmd: string | number } }) {
    const callbacks = this._asyncCallbacks[e.data.cmd];
    if (!callbacks || !callbacks.length) {
      return;
    }
    const callback = callbacks[0];
    callbacks.splice(0, 1);
    return callback(e.data);
  },

  _asyncCallback(cmd: string | number, callback: any) {
    if (!this._asyncCallbacks[cmd]) {
      this._asyncCallbacks[cmd] = [];
    }
    return this._asyncCallbacks[cmd].push(callback);
  },

  asyncInit(workerURI: any, callback: () => any) {
    this._asyncSetup(workerURI);
    this._asyncCallback('init', () => callback());
    return this._worker.postMessage({ cmd: 'init' });
  },

  _asyncSolve(cube: { toJSON: () => any }, callback: (arg0: any) => any) {
    this._asyncSetup();
    this._asyncCallback('solve', (data: { algorithm: any }) => callback(data.algorithm));
    return this._worker.postMessage({ cmd: 'solve', cube: cube.toJSON() });
  },

  asyncScramble(callback: (arg0: any) => any) {
    this._asyncSetup();
    this._asyncCallback('solve', (data: { algorithm: any }) =>
      callback(Cube.inverse(data.algorithm)),
    );
    return this._worker.postMessage({ cmd: 'solve', cube: Cube.random().toJSON() });
  },

  asyncSolve(callback: any) {
    return Cube._asyncSolve(this, callback);
  },
};

for (let key in Extend) {
  const value = Extend[key];
  Cube[key] = value;
}
