// 8 values are encoded in one number
import { range } from './range';
import { allMoves2 } from './contants';
import { Vector2Or3 } from './types';

// Phase 1: All moves are valid
const allMoves1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

// The list of next valid phase 1 moves when the given face was turned
// in the last move
const nextMoves1 = (() => {
  const result = [];
  for (let lastFace = 0; lastFace <= 5; lastFace++) {
    const next = [];
    // Don't allow commuting moves, e.g. U U'. Also make sure that
    // opposite faces are always moved in the same order, i.e. allow
    // U D but no D U. This avoids sequences like U D U'.
    for (let face = 0; face <= 5; face++) {
      if (face !== lastFace && face !== lastFace - 3) {
        for (let power = 0; power <= 2; power++) {
          // single, double or inverse move
          next.push(face * 3 + power);
        }
      }
    }
    result.push(next);
  }
  return result;
})();

const nextMoves2 = (() => {
  const result = [];
  for (let lastFace = 0; lastFace <= 5; lastFace++) {
    const next = [];
    for (let face = 0; face <= 5; face++) {
      // Allow all moves of U and D and double moves of others
      if (face !== lastFace && face !== lastFace - 3) {
        const powers = [0, 3].includes(face) ? [0, 1, 2] : [1];
        for (let power of powers) {
          next.push(face * 3 + power);
        }
      }
    }
    result.push(next);
  }
  return result;
})();

function pruning(table: number[], index: number, value: number | null = null) {
  const pos = index % 8;
  const slot = index >> 3;
  const shift = pos << 2;

  if (value != null) {
    // Set
    table[slot] &= ~(0xf << shift);
    table[slot] |= value << shift;
    return value;
  } else {
    // Get
    return (table[slot] & (0xf << shift)) >>> shift;
  }
}

export function computePruningTable(
  phase: number,
  size: number,
  currentCoords: (coordonate: number) => Vector2Or3,
  nextIndex: (current: Vector2Or3, move: number) => number,
): number[] {
  // Initialize all values to 0xF
  let moves: number[];
  const table = range(0, Math.ceil(size / 8) - 1, true).map((x: any) => 0xffffffff);

  if (phase === 1) {
    moves = allMoves1;
  } else {
    moves = allMoves2;
  }

  let depth = 0;
  pruning(table, 0, depth);
  let done = 1;

  // In each iteration, take each state found in the previous depth and
  // compute the next state. Stop when all states have been assigned a
  // depth.
  while (done !== size) {
    for (
      let index = 0, end = size - 1, asc = 0 <= end;
      asc ? index <= end : index >= end;
      asc ? index++ : index--
    ) {
      if (pruning(table, index) === depth) {
        const current = currentCoords(index);
        for (let move of moves) {
          const next = nextIndex(current, move);
          if (pruning(table, next) === 0xf) {
            pruning(table, next, depth + 1);
            done++;
          }
        }
      }
    }
    depth++;
  }

  return table;
}
