import Cube from './cube';
import { N_PARITY, N_SLICE1, N_SLICE2 } from './moveTables';
import { max } from './solveUtilFunction';
import { allMoves2 } from './contants';

export class State {
  parent: any;
  lastMove: any;
  depth: number;
  flip: any;
  twist: any;
  slice: number;
  parity: any;
  URFtoDLF: any;
  FRtoBR: any;
  URtoUL: any;
  UBtoDF: any;
  URtoDF: any;

  constructor(cube: State | null = null) {
    this.parent = null;
    this.lastMove = null;
    this.depth = 0;

    if (cube) {
      this.init(cube);
    }
  }

  init(cube: Cube) {
    // Phase 1 coordinates
    this.flip = cube.flip();
    this.twist = cube.twist();
    this.slice = (cube.FRtoBR() / N_SLICE2) | 0;

    // Phase 2 coordinates
    this.parity = cube.cornerParity();
    this.URFtoDLF = cube.URFtoDLF();
    this.FRtoBR = cube.FRtoBR();

    // These are later merged to URtoDF when phase 2 begins
    this.URtoUL = cube.URtoUL();
    this.UBtoDF = cube.UBtoDF();

    return this;
  }

  solution() {
    if (this.parent) {
      return this.parent.solution() + moveNames[this.lastMove] + ' ';
    } else {
      return '';
    }
  }

  //# Helpers

  move(table: string, index: number, move: string | number) {
    return Cube.moveTables[table][index][move];
  }

  pruning(table: string, index: any) {
    return pruning(Cube.pruningTables[table], index);
  }

  //# Phase 1

  // Return the next valid phase 1 moves for this state
  moves1() {
    if (this.lastMove !== null) {
      return nextMoves1[(this.lastMove / 3) | 0];
    } else {
      return allMoves1;
    }
  }

  // Compute the minimum number of moves to the end of phase 1
  minDist1() {
    // The maximum number of moves to the end of phase 1 wrt. the
    // combination flip and slice coordinates only
    const d1 = this.pruning('sliceFlip', N_SLICE1 * this.flip + this.slice);

    // The combination of twist and slice coordinates
    const d2 = this.pruning('sliceTwist', N_SLICE1 * this.twist + this.slice);

    // The true minimal distance is the maximum of these two
    return max(d1, d2);
  }

  // Compute the next phase 1 state for the given move
  next1(move: any) {
    const next = freeStates.pop();
    next.parent = this;
    next.lastMove = move;
    next.depth = this.depth + 1;

    next.flip = this.move('flip', this.flip, move);
    next.twist = this.move('twist', this.twist, move);
    next.slice = (this.move('FRtoBR', this.slice * 24, move) / 24) | 0;

    return next;
  }

  //# Phase 2

  // Return the next valid phase 2 moves for this state
  moves2() {
    if (this.lastMove !== null) {
      return nextMoves2[(this.lastMove / 3) | 0];
    } else {
      return allMoves2;
    }
  }

  // Compute the minimum number of moves to the solved cube
  minDist2() {
    const index1 = (N_SLICE2 * this.URtoDF + this.FRtoBR) * N_PARITY + this.parity;
    const d1 = this.pruning('sliceURtoDFParity', index1);

    const index2 = (N_SLICE2 * this.URFtoDLF + this.FRtoBR) * N_PARITY + this.parity;
    const d2 = this.pruning('sliceURFtoDLFParity', index2);

    return max(d1, d2);
  }

  // Initialize phase 2 coordinates
  init2(top: boolean | null = null) {
    if (top == null) {
      top = true;
    }
    if (this.parent === null) {
      // Already assigned for the initial state
      return;
    }

    // For other states, the phase 2 state is computed based on
    // parent's state.
    this.parent.init2(false);

    this.URFtoDLF = this.move('URFtoDLF', this.parent.URFtoDLF, this.lastMove);
    this.FRtoBR = this.move('FRtoBR', this.parent.FRtoBR, this.lastMove);
    this.parity = this.move('parity', this.parent.parity, this.lastMove);
    this.URtoUL = this.move('URtoUL', this.parent.URtoUL, this.lastMove);
    this.UBtoDF = this.move('UBtoDF', this.parent.UBtoDF, this.lastMove);

    if (top) {
      // This is the initial phase 2 state. Get the URtoDF coordinate
      // by merging URtoUL and UBtoDF
      return (this.URtoDF = this.move('mergeURtoDF', this.URtoUL, this.UBtoDF));
    }
  }

  // Compute the next phase 2 state for the given move
  next2(move: any) {
    const next = freeStates.pop();
    next.parent = this;
    next.lastMove = move;
    next.depth = this.depth + 1;

    next.URFtoDLF = this.move('URFtoDLF', this.URFtoDLF, move);
    next.FRtoBR = this.move('FRtoBR', this.FRtoBR, move);
    next.parity = this.move('parity', this.parity, move);
    next.URtoDF = this.move('URtoDF', this.URtoDF, move);

    return next;
  }
}
