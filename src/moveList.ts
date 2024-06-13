import {
  B,
  BL,
  BR,
  D,
  DB,
  DBL,
  DF,
  DFR,
  DL,
  DLF,
  DR,
  DRB,
  F,
  FL,
  FR,
  L,
  R,
  U,
  UB,
  UBR,
  UF,
  UFL,
  UL,
  ULB,
  UR,
  URF,
} from './contants';
import Cube from './cube';

export interface Move {
  center: number[];
  cp: number[];
  co: number[];
  ep: number[];
  eo: number[];
}

export const moveList: Move[] = [
  // U
  {
    center: [0, 1, 2, 3, 4, 5],
    cp: [UBR, URF, UFL, ULB, DFR, DLF, DBL, DRB],
    co: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [UB, UR, UF, UL, DR, DF, DL, DB, FR, FL, BL, BR],
    eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },

  // R
  {
    center: [0, 1, 2, 3, 4, 5],
    cp: [DFR, UFL, ULB, URF, DRB, DLF, DBL, UBR],
    co: [2, 0, 0, 1, 1, 0, 0, 2],
    ep: [FR, UF, UL, UB, BR, DF, DL, DB, DR, FL, BL, UR],
    eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },

  // F
  {
    center: [0, 1, 2, 3, 4, 5],
    cp: [UFL, DLF, ULB, UBR, URF, DFR, DBL, DRB],
    co: [1, 2, 0, 0, 2, 1, 0, 0],
    ep: [UR, FL, UL, UB, DR, FR, DL, DB, UF, DF, BL, BR],
    eo: [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0],
  },

  // D
  {
    center: [0, 1, 2, 3, 4, 5],
    cp: [URF, UFL, ULB, UBR, DLF, DBL, DRB, DFR],
    co: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [UR, UF, UL, UB, DF, DL, DB, DR, FR, FL, BL, BR],
    eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },

  // L
  {
    center: [0, 1, 2, 3, 4, 5],
    cp: [URF, ULB, DBL, UBR, DFR, UFL, DLF, DRB],
    co: [0, 1, 2, 0, 0, 2, 1, 0],
    ep: [UR, UF, BL, UB, DR, DF, FL, DB, FR, UL, DL, BR],
    eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },

  // B
  {
    center: [0, 1, 2, 3, 4, 5],
    cp: [URF, UFL, UBR, DRB, DFR, DLF, ULB, DBL],
    co: [0, 0, 1, 2, 0, 0, 2, 1],
    ep: [UR, UF, UL, BR, DR, DF, DL, BL, FR, FL, UB, DB],
    eo: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1],
  },

  // E
  {
    center: [U, F, L, D, B, R],
    cp: [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB],
    co: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [UR, UF, UL, UB, DR, DF, DL, DB, FL, BL, BR, FR],
    eo: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  },

  // M
  {
    center: [B, R, U, F, L, D],
    cp: [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB],
    co: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [UR, UB, UL, DB, DR, UF, DL, DF, FR, FL, BL, BR],
    eo: [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
  },

  // S
  {
    center: [L, U, F, R, D, B],
    cp: [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB],
    co: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [UL, UF, DL, UB, UR, DF, DR, DB, FR, FL, BL, BR],
    eo: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  },
];

// x
moveList.push(new Cube().move("R M' L'").toJSON());
// y
moveList.push(new Cube().move("U E' D'").toJSON());
// z
moveList.push(new Cube().move("F S B'").toJSON());
// u
moveList.push(new Cube().move("U E'").toJSON());
// r
moveList.push(new Cube().move("R M'").toJSON());
// f
moveList.push(new Cube().move('F S').toJSON());
// d
moveList.push(new Cube().move('D E').toJSON());
// l
moveList.push(new Cube().move('L M').toJSON());
// b
moveList.push(new Cube().move("B S'").toJSON());
