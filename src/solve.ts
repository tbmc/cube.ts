import Cube from './cube';
import { BR, DF, DLF, DRB, faceNames, faceNums, FR, UB, UL, UR, URF } from './contants';
import { moveList } from './moveList';
import { range } from './range';
import { permutationIndex } from './solveUtilFunction';
import { State } from './state';
import { N_FLIP, N_PARITY, N_SLICE1, N_SLICE2, N_TWIST, N_URFtoDLF, N_URtoDF } from './moveTables';

const Include = {
  // The twist of the 8 corners, 0 <= twist < 3^7. The orientation of
  // the DRB corner is fully determined by the orientation of the other
  // corners.
  twist(twist: number): number {
    if (twist != null) {
      let parity = 0;
      for (let i = 6; i >= 0; i--) {
        const ori = twist % 3;
        twist = (twist / 3) | 0;

        this.co[i] = ori;
        parity += ori;
      }

      this.co[7] = (3 - (parity % 3)) % 3;
      return this;
    } else {
      let v = 0;
      for (let i = 0; i <= 6; i++) {
        v = 3 * v + this.co[i];
      }
      return v;
    }
  },

  // The flip of the 12 edges, 0 <= flip < 2^11. The orientation of the
  // BR edge is fully determined by the orientation of the other edges.
  flip(flip: number) {
    if (flip != null) {
      let parity = 0;
      for (let i = 10; i >= 0; i--) {
        const ori = flip % 2;
        flip = (flip / 2) | 0;

        this.eo[i] = ori;
        parity += ori;
      }

      this.eo[11] = (2 - (parity % 2)) % 2;
      return this;
    } else {
      let v = 0;
      for (let i = 0; i <= 10; i++) {
        v = 2 * v + this.eo[i];
      }
      return v;
    }
  },

  // Parity of the corner permutation
  cornerParity() {
    let s = 0;
    for (let i = DRB, end = URF + 1, asc = DRB <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      for (
        let start = i - 1, j = start, end1 = URF, asc1 = start <= end1;
        asc1 ? j <= end1 : j >= end1;
        asc1 ? j++ : j--
      ) {
        if (this.cp[j] > this.cp[i]) {
          s++;
        }
      }
    }

    return s % 2;
  },

  // Parity of the edge permutation. Parity of corners and edges are
  // the same if the cube is solvable.
  edgeParity() {
    let s = 0;
    for (let i = BR, end = UR + 1, asc = BR <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      for (
        let start = i - 1, j = start, end1 = UR, asc1 = start <= end1;
        asc1 ? j <= end1 : j >= end1;
        asc1 ? j++ : j--
      ) {
        if (this.ep[j] > this.ep[i]) {
          s++;
        }
      }
    }

    return s % 2;
  },

  // Permutation of the six corners URF, UFL, ULB, UBR, DFR, DLF
  URFtoDLF: permutationIndex('corners', URF, DLF),

  // Permutation of the three edges UR, UF, UL
  URtoUL: permutationIndex('edges', UR, UL),

  // Permutation of the three edges UB, DR, DF
  UBtoDF: permutationIndex('edges', UB, DF),

  // Permutation of the six edges UR, UF, UL, UB, DR, DF
  URtoDF: permutationIndex('edges', UR, DF),

  // Permutation of the equator slice edges FR, FL, BL and BR
  FRtoBR: permutationIndex('edges', FR, BR, true),
};

for (let key in Include) {
  Cube.prototype[key] = Include[key];
}

const computeMoveTable = function (context: string, coord: string | number, size: number) {
  // Loop through all valid values for the coordinate, setting cube's
  // state in each iteration. Then apply each of the 18 moves to the
  // cube, and compute the resulting coordinate.
  const apply = context === 'corners' ? 'cornerMultiply' : 'edgeMultiply';

  const cube = new Cube();

  const result = [];
  for (let i = 0, end = size - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
    cube[coord](i);
    const inner = [];
    for (let j = 0; j <= 5; j++) {
      const move = moveList[j];
      for (let k = 0; k <= 2; k++) {
        cube[apply](move);
        inner.push(cube[coord]());
      }
      // 4th face turn restores the cube
      cube[apply](move);
    }
    result.push(inner);
  }
  return result;
};

// Because we only have the phase 2 URtoDF coordinates, we need to
// merge the URtoUL and UBtoDF coordinates to URtoDF in the beginning
// of phase 2.
const mergeURtoDF = (function () {
  const a = new Cube();
  const b = new Cube();

  return function (URtoUL: any, UBtoDF: any) {
    // Collisions can be found because unset are set to -1
    a.URtoUL(URtoUL);
    b.UBtoDF(UBtoDF);

    for (let i = 0; i <= 7; i++) {
      if (a.ep[i] !== -1) {
        if (b.ep[i] !== -1) {
          return -1; // collision
        } else {
          b.ep[i] = a.ep[i];
        }
      }
    }

    return b.URtoDF();
  };
})();

// The move table for parity is so small that it's included here
Cube.moveTables = {
  parity: [
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  ],
  twist: null,
  flip: null,
  FRtoBR: null,
  URFtoDLF: null,
  URtoDF: null,
  URtoUL: null,
  UBtoDF: null,
  mergeURtoDF: null,
};

Cube.computeMoveTables = function (...tables: { length?: any }) {
  if (tables.length === 0) {
    tables = (() => {
      const result = [];
      for (let name in moveTableParams) {
        result.push(name);
      }
      return result;
    })();
  }

  for (let tableName of tables) {
    // Already computed
    if (this.moveTables[tableName] !== null) {
      continue;
    }

    if (tableName === 'mergeURtoDF') {
      this.moveTables.mergeURtoDF = (() =>
        range(0, 335, true).map((URtoUL: any) =>
          range(0, 335, true).map((UBtoDF: any) => mergeURtoDF(URtoUL, UBtoDF)),
        ))();
    } else {
      const [scope, size] = moveTableParams[tableName];
      this.moveTables[tableName] = computeMoveTable(scope, tableName, size);
    }
  }

  return this;
};

Cube.pruningTables = {
  sliceTwist: null,
  sliceFlip: null,
  sliceURFtoDLFParity: null,
  sliceURtoDFParity: null,
};

const pruningTableParams = {
  // name: [phase, size, currentCoords, nextIndex]
  sliceTwist: [
    1,
    N_SLICE1 * N_TWIST,
    (index: number) => [index % N_SLICE1, (index / N_SLICE1) | 0],
    function (current: any, move: string | number) {
      const [slice, twist] = current;
      const newSlice = (Cube.moveTables.FRtoBR[slice * 24][move] / 24) | 0;
      const newTwist = Cube.moveTables.twist[twist][move];
      return newTwist * N_SLICE1 + newSlice;
    },
  ],
  sliceFlip: [
    1,
    N_SLICE1 * N_FLIP,
    (index: number) => [index % N_SLICE1, (index / N_SLICE1) | 0],
    function (current: any, move: string | number) {
      const [slice, flip] = current;
      const newSlice = (Cube.moveTables.FRtoBR[slice * 24][move] / 24) | 0;
      const newFlip = Cube.moveTables.flip[flip][move];
      return newFlip * N_SLICE1 + newSlice;
    },
  ],
  sliceURFtoDLFParity: [
    2,
    N_SLICE2 * N_URFtoDLF * N_PARITY,
    (index: number) => [
      index % 2,
      ((index / 2) | 0) % N_SLICE2,
      (((index / 2) | 0) / N_SLICE2) | 0,
    ],
    function (current: any, move: string | number) {
      const [parity, slice, URFtoDLF] = current;
      const newParity = Cube.moveTables.parity[parity][move];
      const newSlice = Cube.moveTables.FRtoBR[slice][move];
      const newURFtoDLF = Cube.moveTables.URFtoDLF[URFtoDLF][move];
      return (newURFtoDLF * N_SLICE2 + newSlice) * 2 + newParity;
    },
  ],
  sliceURtoDFParity: [
    2,
    N_SLICE2 * N_URtoDF * N_PARITY,
    (index: number) => [
      index % 2,
      ((index / 2) | 0) % N_SLICE2,
      (((index / 2) | 0) / N_SLICE2) | 0,
    ],
    function (current: any, move: string | number) {
      const [parity, slice, URtoDF] = current;
      const newParity = Cube.moveTables.parity[parity][move];
      const newSlice = Cube.moveTables.FRtoBR[slice][move];
      const newURtoDF = Cube.moveTables.URtoDF[URtoDF][move];
      return (newURtoDF * N_SLICE2 + newSlice) * 2 + newParity;
    },
  ],
};

Cube.computePruningTables = function (...tables: { length?: any }) {
  if (tables.length === 0) {
    tables = (() => {
      const result = [];
      for (let name in pruningTableParams) {
        result.push(name);
      }
      return result;
    })();
  }

  for (let tableName of tables) {
    // Already computed
    if (this.pruningTables[tableName] !== null) {
      continue;
    }

    const params = pruningTableParams[tableName];
    this.pruningTables[tableName] = computePruningTable(...(params || []));
  }

  return this;
};

Cube.initSolver = function () {
  Cube.computeMoveTables();
  return Cube.computePruningTables();
};

Cube.prototype.solveUpright = function (maxDepth: number | null = null) {
  // Names for all moves, i.e. U, U2, U', F, F2, ...
  if (maxDepth == null) {
    maxDepth = 22;
  }
  const moveNames = [];

  for (let face = 0; face <= 5; face++) {
    for (let power = 0; power <= 2; power++) {
      moveNames.push(faceName[face] + powerName[power]);
    }
  }

  let solution = null;

  const freeStates = range(0, maxDepth + 1, true).map((x: any) => new State());
  const state = freeStates.pop().init(this);
  phase1search(state);
  freeStates.push(state);

  if (solution == null) {
    return null;
  }
  // Trim the trailing space and return
  return solution.trim();
};

Cube.prototype.solve = function (maxDepth: number) {
  if (maxDepth == null) {
    maxDepth = 22;
  }
  const clone = this.clone();
  const upright = clone.upright();
  clone.move(upright);
  const rotation = new Cube().move(upright).center;
  const uprightSolution = clone.solveUpright(maxDepth);
  if (uprightSolution == null) {
    return null;
  }
  const solution = [];
  for (let move of uprightSolution.split(' ')) {
    solution.push(faceNames[rotation[faceNums[move[0]]]]);
    if (move.length > 1) {
      solution[solution.length - 1] += move[1];
    }
  }
  return solution.join(' ');
};

Cube.scramble = () => Cube.inverse(Cube.random().solve());
