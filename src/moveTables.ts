export const N_TWIST = 2187; // 3^7 corner orientations
export const N_FLIP = 2048; // 2^11 possible edge flips
export const N_PARITY = 2; // 2 possible parities

export const N_FRtoBR = 11880; // 12!/(12-4)! permutations of FR..BR edges
export const N_SLICE1 = 495; // (12 choose 4) possible positions of FR..BR edges
export const N_SLICE2 = 24; // 4! permutations of FR..BR edges in phase 2

export const N_URFtoDLF = 20160; // 8!/(8-6)! permutations of URF..DLF corners

// The URtoDF move table is only computed for phase 2 because the full
// table would have >650000 entries
export const N_URtoDF = 20160; // 8!/(8-6)! permutation of UR..DF edges in phase 2

export const N_URtoUL = 1320; // 12!/(12-3)! permutations of UR..UL edges
export const N_UBtoDF = 1320; // 12!/(12-3)! permutations of UB..DF edges

// Other move tables are computed on the fly
export const moveTableParams = {
  // name: [scope, size]
  twist: ['corners', N_TWIST],
  flip: ['edges', N_FLIP],
  FRtoBR: ['edges', N_FRtoBR],
  URFtoDLF: ['corners', N_URFtoDLF],
  URtoDF: ['edges', N_URtoDF],
  URtoUL: ['edges', N_URtoUL],
  UBtoDF: ['edges', N_UBtoDF],
  mergeURtoDF: [], // handled specially
};
