import { range } from './range';
import { faceNums } from './contants';
import type Cube from './cube';

export const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

// Fisher-Yates shuffle adapted from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array: number[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    const randomIndex = randInt(0, currentIndex - 1);
    currentIndex -= 1;

    // And swap it with the current element.
    const temporaryValue = array[currentIndex];
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}

export function getNumSwaps(arr: number[]) {
  let numSwaps = 0;
  const seen = range(0, arr.length - 1, true).map((x: any) => false);
  // We compute the cycle decomposition
  while (true) {
    let cur = -1;
    for (let i = 0; i < arr.length; i++) {
      if (!seen[i]) {
        cur = i;
        break;
      }
    }
    if (cur === -1) {
      break;
    }
    let cycleLength = 0;
    while (!seen[cur]) {
      seen[cur] = true;
      cycleLength++;
      cur = arr[cur];
    }
    // A cycle is equivalent to cycleLength + 1 swaps
    numSwaps += cycleLength + 1;
  }
  return numSwaps;
}

export function arePermutationsValid(cp: number[], ep: number[]) {
  const numSwaps = getNumSwaps(ep) + getNumSwaps(cp);
  return numSwaps % 2 === 0;
}

export function generateValidRandomPermutation(cp: number[], ep: number[]) {
  // Each shuffle only takes around 12 operations and there's a 50%
  // chance of a valid permutation, so it'll finish in very good time
  shuffle(ep);
  shuffle(cp);
  while (!arePermutationsValid(cp, ep)) {
    shuffle(ep);
    shuffle(cp);
  }
}

export function randomizeOrientation(arr: number[], numOrientations: number) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = randInt(0, numOrientations - 1);
  }
}

export const isOrientationValid = (arr: number[], numOrientations: number) =>
  arr.reduce((a: any, b: any) => a + b) % numOrientations === 0;

export function generateValidRandomOrientation(co: number[], eo: number[]) {
  // There is a 1/2 and 1/3 probably respectively of each of these
  // succeeding so the probability of them running 10 times before
  // success is already only 1% and only gets exponentially lower
  // and each generation is only in the 10s of operations which is nothing
  randomizeOrientation(co, 3);
  while (!isOrientationValid(co, 3)) {
    randomizeOrientation(co, 3);
  }

  randomizeOrientation(eo, 2);
  while (!isOrientationValid(eo, 2)) {
    randomizeOrientation(eo, 2);
  }
}

export function parseAlg(arg: string | Cube | number[] | number): number[] {
  if (typeof arg === 'string') {
    // String
    const result: number[] = [];
    for (let part of arg.split(/\s+/)) {
      let power: number;
      if (part.length === 0) {
        // First and last can be empty
        continue;
      }

      if (part.length > 2) {
        throw new Error(`Invalid move: ${part}`);
      }

      const move = faceNums[part[0]];
      if (move === undefined) {
        throw new Error(`Invalid move: ${part}`);
      }

      if (part.length === 1) {
        power = 0;
      } else {
        if (part[1] === '2') {
          power = 1;
        } else if (part[1] === "'") {
          power = 2;
        } else {
          throw new Error(`Invalid move: ${part}`);
        }
      }

      result.push(move * 3 + power);
    }
    return result;
  } else if ((arg as number[]).length != null) {
    // Already an array
    return arg as number[];
  } else {
    // A single move
    return [arg as number];
  }
}
