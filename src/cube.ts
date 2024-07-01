import {
  centerColor,
  cornerColor,
  cornerFacelet,
  edgeColor,
  edgeFacelet,
  faceNames,
  B,
  D,
  F,
  L,
  R,
  U,
  DRB,
  URF,
  BR,
  UR,
  DLF,
  UL,
  DF,
  UB,
  FR,
  faceNums,
} from './contants';
import { Move, moveList } from './moveList';
import {
  generateValidRandomOrientation,
  generateValidRandomPermutation,
  parseAlg,
} from './utilFunctions';
import { permutationIndex } from './solveUtilFunction';
import { range } from './range';
import {
  moveTableParams,
  N_FLIP,
  N_PARITY,
  N_SLICE1,
  N_SLICE2,
  N_TWIST,
  N_URFtoDLF,
  N_URtoDF,
} from './moveTables';
import { computePruningTable } from './pruning';
import { solveUpright } from './solveUpright';
import { Vector2Or3 } from './types';

// Because we only have the phase 2 URtoDF coordinates, we need to
// merge the URtoUL and UBtoDF coordinates to URtoDF in the beginning
// of phase 2.
const mergeURtoDF = (() => {
  const a = new Cube();
  const b = new Cube();

  return (URtoUL: number, UBtoDF: number) => {
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

type PruningTableParam = [
  number,
  number,
  (index: number) => Vector2Or3,
  (current: Vector2Or3, move: number) => number,
];
const pruningTableParams: Record<string, PruningTableParam> = {
  // name: [phase, size, currentCoords, nextIndex]
  sliceTwist: [
    1,
    N_SLICE1 * N_TWIST,
    (index: number) => [index % N_SLICE1, (index / N_SLICE1) | 0],
    function (current: Vector2Or3, move: number) {
      const [slice, twist] = current;
      const newSlice = (Cube.moveTables.FRtoBR![slice * 24][move] / 24) | 0;
      const newTwist = Cube.moveTables.twist![twist][move];
      return newTwist * N_SLICE1 + newSlice;
    },
  ],
  sliceFlip: [
    1,
    N_SLICE1 * N_FLIP,
    (index: number) => [index % N_SLICE1, (index / N_SLICE1) | 0],
    function (current: Vector2Or3, move: number) {
      const [slice, flip] = current;
      const newSlice = (Cube.moveTables.FRtoBR![slice * 24][move] / 24) | 0;
      const newFlip = Cube.moveTables.flip![flip][move];
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
    function (current: Vector2Or3, move: number) {
      const [parity, slice, URFtoDLF] = current;
      const newParity = Cube.moveTables.parity[parity][move];
      const newSlice = Cube.moveTables.FRtoBR![slice][move];
      const newURFtoDLF = Cube.moveTables.URFtoDLF![URFtoDLF!][move];
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
    function (current: Vector2Or3, move: number) {
      const [parity, slice, URtoDF] = current;
      const newParity = Cube.moveTables.parity[parity][move];
      const newSlice = Cube.moveTables.FRtoBR![slice][move];
      const newURtoDF = Cube.moveTables.URtoDF![URtoDF!][move];
      return (newURtoDF * N_SLICE2 + newSlice) * 2 + newParity;
    },
  ],
};

function computeMoveTables(...tables: any[]) {
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
    if (Cube.moveTables[tableName] !== null) {
      continue;
    }

    if (tableName === 'mergeURtoDF') {
      this.moveTables.mergeURtoDF = (() =>
        range(0, 335, true).map((URtoUL: number) =>
          range(0, 335, true).map((UBtoDF: number) => mergeURtoDF(URtoUL, UBtoDF)),
        ))();
    } else {
      const [scope, size] = moveTableParams[tableName];
      this.moveTables[tableName] = computeMoveTable(scope, tableName, size);
    }
  }

  return this;
}

function computePruningTables(...tables: string[]) {
  if (tables.length === 0) tables = [...Object.keys(pruningTableParams)];

  for (let tableName of tables) {
    // Already computed
    if (this.pruningTables[tableName] !== null) continue;

    const params = pruningTableParams[tableName];
    this.pruningTables[tableName] = computePruningTable(...params);
  }

  return this;
}

function computeMoveTable(context: string, coord: string | number, size: number) {
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
}

class Cube {
  // Todo: check if reallocation or modification. I think it is safe
  newCenter = [0, 0, 0, 0, 0];
  newCp = [0, 0, 0, 0, 0, 0, 0];
  newEp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  newCo = [0, 0, 0, 0, 0, 0, 0];
  newEo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  center!: number[];
  co!: number[];
  ep!: number[];
  cp!: number[];
  eo!: number[];

  constructor(other: Cube | null = null) {
    if (other != null) {
      this.init(other);
    } else {
      this.identity();
    }
  }

  randomize() {
    generateValidRandomPermutation(this.cp, this.ep);
    generateValidRandomOrientation(this.co, this.eo);

    return this;
  }

  init(other: Cube) {
    this.center = other.center.slice(0);
    this.co = other.co.slice(0);
    this.ep = other.ep.slice(0);
    this.cp = other.cp.slice(0);
    this.eo = other.eo.slice(0);
  }

  identity() {
    // Initialize to the identity cube
    this.center = [0, 1, 2, 3, 4, 5];
    this.cp = [0, 1, 2, 3, 4, 5, 6, 7];
    this.co = [0, 0, 0, 0, 0, 0, 0];
    this.ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    this.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  toJSON() {
    // todo: check if necessary
    return JSON.parse(
      JSON.stringify({
        center: this.center,
        cp: this.cp,
        co: this.co,
        ep: this.ep,
        eo: this.eo,
      }),
    );
  }

  asString(): string {
    const result: string[] = [];

    for (let i = 0; i <= 5; i++) {
      result[9 * i + 4] = centerColor[this.center[i]];
    }

    for (let i = 0; i <= 7; i++) {
      const corner = this.cp[i];
      const ori = this.co[i];
      for (let n = 0; n <= 2; n++) {
        result[cornerFacelet[i][(n + ori) % 3]] = cornerColor[corner][n];
      }
    }

    for (let i = 0; i <= 11; i++) {
      const edge = this.ep[i];
      const ori = this.eo[i];
      for (let n = 0; n <= 1; n++) {
        result[edgeFacelet[i][(n + ori) % 2]] = edgeColor[edge][n];
      }
    }

    return result.join('');
  }

  static fromString(str: string): Cube {
    const cube = new Cube();

    for (let i = 0; i <= 5; i++) {
      for (let j = 0; j <= 5; j++) {
        if (str[9 * i + 4] === centerColor[j]) {
          cube.center[i] = j;
        }
      }
    }

    for (let i = 0; i <= 7; i++) {
      let ori: number;
      for (ori = 0; ori <= 2; ori++) {
        if (['U', 'D'].includes(str[cornerFacelet[i][ori]])) {
          break;
        }
      }
      const col1 = str[cornerFacelet[i][(ori + 1) % 3]];
      const col2 = str[cornerFacelet[i][(ori + 2) % 3]];

      for (let j = 0; j <= 7; j++) {
        if (col1 === cornerColor[j][1] && col2 === cornerColor[j][2]) {
          cube.cp[i] = j;
          cube.co[i] = ori % 3;
        }
      }
    }

    for (let i = 0; i <= 11; i++) {
      for (let j = 0; j <= 11; j++) {
        if (
          str[edgeFacelet[i][0]] === edgeColor[j][0] &&
          str[edgeFacelet[i][1]] === edgeColor[j][1]
        ) {
          cube.ep[i] = j;
          cube.eo[i] = 0;
          break;
        }
        if (
          str[edgeFacelet[i][0]] === edgeColor[j][1] &&
          str[edgeFacelet[i][1]] === edgeColor[j][0]
        ) {
          cube.ep[i] = j;
          cube.eo[i] = 1;
          break;
        }
      }
    }

    return cube;
  }

  clone(): Cube {
    return new Cube(this.toJSON());
  }

  // A class method returning a new random cube
  static random(): Cube {
    return new Cube().randomize();
  }

  isSolved(): boolean {
    const clone = this.clone();
    clone.move(clone.upright());

    for (let cent = 0; cent <= 5; cent++) {
      if (clone.center[cent] !== cent) {
        return false;
      }
    }

    for (let c = 0; c <= 7; c++) {
      if (clone.cp[c] !== c) {
        return false;
      }
      if (clone.co[c] !== 0) {
        return false;
      }
    }

    for (let e = 0; e <= 11; e++) {
      if (clone.ep[e] !== e) {
        return false;
      }
      if (clone.eo[e] !== 0) {
        return false;
      }
    }

    return true;
  }

  // Multiply this Cube with another Cube, restricted to centers.
  centerMultiply(other: Cube | Move) {
    let from: number;
    for (let to = 0; to <= 5; to++) {
      from = other.center[to];
      this.newCenter[to] = this.center[from];
    }

    [this.center, this.newCenter] = [this.newCenter, this.center];
  }

  // Multiply this Cube with another Cube, restricted to corners.
  cornerMultiply(other: Cube | Move) {
    let from: number;
    for (let to = 0; to <= 7; to++) {
      from = other.cp[to];
      this.newCp[to] = this.cp[from];
      this.newCo[to] = (this.co[from] + other.co[to]) % 3;
    }

    [this.cp, this.newCp] = [this.newCp, this.cp];
    [this.co, this.newCo] = [this.newCo, this.co];
  }

  // Multiply this Cube with another Cube, restricted to edges
  edgeMultiply(other: Cube | Move) {
    let from: number;
    for (let to = 0; to <= 11; to++) {
      from = other.ep[to];
      this.newEp[to] = this.ep[from];
      this.newEo[to] = (this.eo[from] + other.eo[to]) % 2;
    }

    [this.ep, this.newEp] = [this.newEp, this.ep];
    [this.eo, this.newEo] = [this.newEo, this.eo];
  }

  // Multiply this cube with another Cube
  multiply(other: Cube | Move) {
    this.centerMultiply(other);
    this.cornerMultiply(other);
    this.edgeMultiply(other);
  }

  move(arg: string): this {
    for (let move of parseAlg(arg)) {
      const face = (move / 3) | 0;
      const power = move % 3;
      const asc = 0 <= power;

      for (let x = 0; asc ? x <= power : x >= power; asc ? x++ : x--) {
        this.multiply(moveList[face]);
      }
    }

    return this;
  }

  upright(): string {
    const clone = this.clone();
    const result: string[] = [];

    let i: number;
    for (i = 0; i <= 5; i++) {
      if (clone.center[i] === F) {
        break;
      }
    }

    switch (i) {
      case D:
        result.push('x');
        break;
      case U:
        result.push("x'");
        break;
      case B:
        result.push('x2');
        break;
      case R:
        result.push('y');
        break;
      case L:
        result.push("y'");
        break;
    }

    if (result.length) {
      clone.move(result[0]);
    }

    let j: number;
    for (j = 0; j <= 5; j++) {
      if (clone.center[j] === U) {
        break;
      }
    }

    switch (j) {
      case L:
        result.push('z');
        break;
      case R:
        result.push("z'");
        break;
      case D:
        result.push('z2');
        break;
    }
    return result.join(' ');
  }

  static inverse(arg: number[] | string | number) {
    const result = parseAlg(arg).map((move) => {
      const face = (move / 3) | 0;
      const power = move % 3;
      return face * 3 + -(power - 1) + 1;
    });

    result.reverse();

    if (typeof arg === 'string') {
      let str = '';
      for (const move of result) {
        const face = (move / 3) | 0;
        const power = move % 3;
        str += faceNames[face];
        if (power === 1) {
          str += '2';
        } else if (power === 2) {
          str += "'";
        }
        str += ' ';
      }
      return str.substring(0, str.length - 1);
    } else if ((arg as number[]).length != null) {
      return result;
    } else {
      return result[0];
    }
  }

  // Permutation of the six corners URF, UFL, ULB, UBR, DFR, DLF
  URFtoDLF = permutationIndex('corners', URF, DLF);

  // Permutation of the three edges UR, UF, UL
  URtoUL = permutationIndex('edges', UR, UL);

  // Permutation of the three edges UB, DR, DF
  UBtoDF = permutationIndex('edges', UB, DF);

  // Permutation of the six edges UR, UF, UL, UB, DR, DF
  URtoDF = permutationIndex('edges', UR, DF);

  // Permutation of the equator slice edges FR, FL, BL and BR
  FRtoBR = permutationIndex('edges', FR, BR, true);
  // The twist of the 8 corners, 0 <= twist < 3^7. The orientation of
  // the DRB corner is fully determined by the orientation of the other
  // corners.
  twist(twist: number | null = null): number | this {
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
  }

  // The flip of the 12 edges, 0 <= flip < 2^11. The orientation of the
  // BR edge is fully determined by the orientation of the other edges.
  flip(flip: number | null = null): number | this {
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
  }

  // Parity of the corner permutation
  cornerParity(): number {
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
  }

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
  }

  static pruningTables: Record<string, PruningTableParam | null> = {
    sliceTwist: null,
    sliceFlip: null,
    sliceURFtoDLFParity: null,
    sliceURtoDFParity: null,
  };

  static initSolver() {
    computeMoveTables();
    return computePruningTables();
  }

  solveUpright = solveUpright;

  solve(maxDepth: number | null = null): string | null {
    if (maxDepth == null) {
      maxDepth = 22;
    }
    const clone = this.clone();
    const upright = clone.upright();
    clone.move(upright);
    const rotation = new Cube().move(upright).center;
    const uprightSolution = clone.solveUpright(maxDepth);

    if (uprightSolution == null) return null;

    const solution = [];
    for (let move of uprightSolution.split(' ')) {
      solution.push(faceNames[rotation[faceNums[move[0]]]]);
      if (move.length > 1) {
        solution[solution.length - 1] += move[1];
      }
    }
    return solution.join(' ');
  }

  static scramble = () => Cube.inverse(Cube.random().solve()!);
}

export default Cube;
