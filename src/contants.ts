export const [U, R, F, D, L, B] = [0, 1, 2, 3, 4, 5];

// Corners
export const [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB] = [0, 1, 2, 3, 4, 5, 6, 7];

// Edges
export const [UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
];

export const [centerFacelet, cornerFacelet, edgeFacelet] = (function () {
  const _U = (x: number) => x - 1;
  const _R = (x: number) => _U(9) + x;
  const _F = (x: number) => _R(9) + x;
  const _D = (x: number) => _F(9) + x;
  const _L = (x: number) => _D(9) + x;
  const _B = (x: number) => _L(9) + x;
  return [
    // Centers
    [4, 13, 22, 31, 40, 49],
    // Corners
    [
      [_U(9), _R(1), _F(3)],
      [_U(7), _F(1), _L(3)],
      [_U(1), _L(1), _B(3)],
      [_U(3), _B(1), _R(3)],
      [_D(3), _F(9), _R(7)],
      [_D(1), _L(9), _F(7)],
      [_D(7), _B(9), _L(7)],
      [_D(9), _R(9), _B(7)],
    ],
    // Edges
    [
      [_U(6), _R(2)],
      [_U(8), _F(2)],
      [_U(4), _L(2)],
      [_U(2), _B(2)],
      [_D(6), _R(8)],
      [_D(2), _F(8)],
      [_D(4), _L(8)],
      [_D(8), _B(8)],
      [_F(6), _R(4)],
      [_F(4), _L(6)],
      [_B(6), _L(4)],
      [_B(4), _R(6)],
    ],
  ];
})();

export const centerColor = ['U', 'R', 'F', 'D', 'L', 'B'];

export const cornerColor = [
  ['U', 'R', 'F'],
  ['U', 'F', 'L'],
  ['U', 'L', 'B'],
  ['U', 'B', 'R'],
  ['D', 'F', 'R'],
  ['D', 'L', 'F'],
  ['D', 'B', 'L'],
  ['D', 'R', 'B'],
];

export const edgeColor = [
  ['U', 'R'],
  ['U', 'F'],
  ['U', 'L'],
  ['U', 'B'],
  ['D', 'R'],
  ['D', 'F'],
  ['D', 'L'],
  ['D', 'B'],
  ['F', 'R'],
  ['F', 'L'],
  ['B', 'L'],
  ['B', 'R'],
];

export const faceNums = {
  U: 0,
  R: 1,
  F: 2,
  D: 3,
  L: 4,
  B: 5,
  E: 6,
  M: 7,
  S: 8,
  x: 9,
  y: 10,
  z: 11,
  u: 12,
  r: 13,
  f: 14,
  d: 15,
  l: 16,
  b: 17,
};

export const faceNames = {
  0: 'U',
  1: 'R',
  2: 'F',
  3: 'D',
  4: 'L',
  5: 'B',
  6: 'E',
  7: 'M',
  8: 'S',
  9: 'x',
  10: 'y',
  11: 'z',
  12: 'u',
  13: 'r',
  14: 'f',
  15: 'd',
  16: 'l',
  17: 'b',
};

export const powerName = ['', '2', "'"];

// Phase 1: All moves are valid
export const allMoves1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

// Phase 2: Double moves of all faces plus quarter moves of U and D
export const allMoves2 = [0, 1, 2, 4, 7, 9, 10, 11, 13, 16];
