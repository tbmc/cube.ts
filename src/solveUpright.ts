import { State } from './state';
import { range } from './range';
import { allMoves2, faceNames, powerName } from './contants';
import type Cube from './cube';

export function solveUpright(cube: Cube, maxDepth: number | null = null) {
  // Names for all moves, i.e. U, U2, U', F, F2, ...
  if (maxDepth == null) {
    maxDepth = 22;
  }
  const moveNames: string[] = [];

  for (let face = 0; face <= 5; face++) {
    for (let power = 0; power <= 2; power++) {
      moveNames.push(faceNames[face] + powerName[power]);
    }
  }

  let solution: string | null = null;

  function phase1search(state: State) {
    const result = [];
    for (let depth = 1; depth <= maxDepth!; depth++) {
      phase1(state, depth);
      if (solution !== null) {
        break;
      } else {
        result.push(undefined);
      }
    }
    return result;
  }

  function phase1(state: State, depth: number) {
    if (depth === 0) {
      if (state.minDist1() === 0) {
        // Make sure we don't start phase 2 with a phase 2 move as the
        // last move in phase 1, because phase 2 would then repeat the
        // same move.
        if (state.lastMove === null || !allMoves2.includes(state.lastMove)) {
          return phase2search(state);
        }
      }
    } else if (depth > 0) {
      if (state.minDist1() <= depth) {
        const result = [];
        for (let move of state.moves1()) {
          const next = state.next1(freeStates, move);
          phase1(next, depth - 1);
          freeStates.push(next);
          if (solution !== null) {
            break;
          } else {
            result.push(undefined);
          }
        }
        return result;
      }
    }
  }

  function phase2search(state: State) {
    // Initialize phase 2 coordinates
    state.init2();

    const result = [];
    for (let depth = 1; depth <= maxDepth!; depth++) {
      phase2(state, depth);
      if (solution !== null) {
        break;
      } else {
        result.push(undefined);
      }
    }
    return result;
  }

  function phase2(state: State, depth: number) {
    if (depth === 0) {
      if (state.minDist2() === 0) {
        return (solution = state.solution(moveNames));
      }
    } else if (depth > 0) {
      if (state.minDist2() <= depth) {
        const result = [];
        for (let move of state.moves2()) {
          const next = state.next2(freeStates, move);
          phase2(next, depth - 1);
          freeStates.push(next);
          if (solution !== null) {
            break;
          } else {
            result.push(undefined);
          }
        }
        return result;
      }
    }
  }

  const freeStates = range(0, maxDepth + 1, true).map((x: number) => new State());
  const newState = freeStates.pop()!.init(cube);
  phase1search(newState);
  freeStates.push(newState);

  if (solution == null) {
    return null;
  }
  // Trim the trailing space and return
  return (solution as string).trim();
}
