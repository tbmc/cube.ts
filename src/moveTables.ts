import type Cube from './cube';

export const N_TWIST = 2_187; // 3^7 corner orientations
export const N_FLIP = 2_048; // 2^11 possible edge flips
export const N_PARITY = 2; // 2 possible parities

export const N_FRtoBR = 11_880; // 12!/(12-4)! permutations of FR..BR edges
export const N_SLICE1 = 495; // (12 choose 4) possible positions of FR..BR edges
export const N_SLICE2 = 24; // 4! permutations of FR..BR edges in phase 2

export const N_URFtoDLF = 20_160; // 8!/(8-6)! permutations of URF..DLF corners

// The URtoDF move table is only computed for phase 2 because the full
// table would have >650000 entries
export const N_URtoDF = 20_160; // 8!/(8-6)! permutation of UR..DF edges in phase 2

export const N_URtoUL = 1_320; // 12!/(12-3)! permutations of UR..UL edges
export const N_UBtoDF = 1_320; // 12!/(12-3)! permutations of UB..DF edges

export type AllMoveTablePossibleTypes =
  | number
  | Cube
  | null
  | ((index?: number | undefined) => number);
type MoveTablesType = {
  parity: [number[], number[]];
  twist: number | Cube | null | AllMoveTablePossibleTypes[][];
  flip: number | Cube | null | AllMoveTablePossibleTypes[][];
  FRtoBR: ((index?: number | undefined) => number) | null | AllMoveTablePossibleTypes[][];
  URFtoDLF: ((index?: number | undefined) => number) | null | AllMoveTablePossibleTypes[][];
  URtoDF: ((index?: number | undefined) => number) | null | AllMoveTablePossibleTypes[][];
  URtoUL: ((index?: number | undefined) => number) | null | AllMoveTablePossibleTypes[][];
  UBtoDF: ((index?: number | undefined) => number) | null | AllMoveTablePossibleTypes[][];
  mergeURtoDF: any;
};

export const moveTables: MoveTablesType = {
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
