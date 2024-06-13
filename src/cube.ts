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
} from './contants';
import { Move, moveList } from './moveList';
import {
  generateValidRandomOrientation,
  generateValidRandomPermutation,
  parseAlg,
} from './utilFunctions';

class Cube {
  // Todo: check if reallocation or modification. I think it is safe
  newCenter = [0, 0, 0, 0, 0];
  newCp = [0, 0, 0, 0, 0, 0, 0];
  newEp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  newCo = [0, 0, 0, 0, 0, 0, 0];
  newEo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  center: number[];
  co: number[];
  ep: number[];
  cp: number[];
  eo: number[];

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
}

export default Cube;
