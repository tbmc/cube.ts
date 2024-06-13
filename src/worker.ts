import Cube from './cube';

importScripts('cube.js', 'solve.js');

let initialized = false;

const init = function () {
  if (initialized) {
    return;
  }
  Cube.initSolver();
  return (initialized = true);
};

const solve = function (args: { scramble: any; cube: any }) {
  let cube: { move: (arg0: any) => void; solve: () => any };
  if (!initialized) {
    return;
  }

  if (args.scramble) {
    cube = new Cube();
    cube.move(args.scramble);
  } else if (args.cube) {
    cube = new Cube(args.cube);
  }

  return cube.solve();
};

self.onmessage = function (event: { data: any }) {
  const args = event.data;

  switch (args.cmd) {
    case 'init':
      init();
      return self.postMessage({ cmd: 'init', status: 'ok' });

    case 'solve':
      return self.postMessage({ cmd: 'solve', algorithm: solve(args) });
  }
};
