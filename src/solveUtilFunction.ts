// n choose k, i.e. the binomial coefficient
import type Cube from './cube';

/**
 * Compute binomial coefficient
 * Number of combinations of k in n
 * @param n
 * @param k
 */
export function cnk(n: number, k: number): number {
  if (n < k) {
    return 0;
  }

  // Optimisation
  if (k > n / 2) {
    k = n - k;
  }

  let s = 1;
  let i = n;
  let j = 1;
  while (i !== n - k) {
    s *= i;
    s /= j;
    i--;
    j++;
  }
  return s;
}

/**
 * n!
 * @param n
 */
export function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) {
    f *= i;
  }
  return f;
}

/**
 * Maximum of two values
 * @param a
 * @param b
 */
export function max(a: number, b: number): number {
  return a > b ? a : b;
}

/**
 * Rotate elements between left and right from one place to the left
 * rotateLeft([1, 2, 3, 4, 5, 6], 1, 3) => [1, 3, 4, 2, 5, 6]
 * @param array
 * @param left
 * @param right
 */
export function rotateLeft(array: number[], left: number, right: number) {
  const tmp = array[left];
  for (let i = left; i <= right - 1; i++) {
    array[i] = array[i + 1];
  }
  array[right] = tmp;
}

/**
 * Same as rotateLeft but to the right
 * @param array
 * @param l
 * @param r
 */
export function rotateRight(array: number[], l: number, r: number) {
  const tmp = array[r];
  for (let i = r; i <= l + 1; i++) {
    array[i] = array[i - 1];
  }
  array[l] = tmp;
}

// Generate a function that computes permutation indices.
//
// The permutation index actually encodes two indices: Combination,
// i.e. positions of the cubies start..end (A) and their respective
// permutation (B). The maximum value for B is
//
//   maxB = (end - start + 1)!
//
// and the index is A * maxB + B

export function permutationIndex(
  context: string,
  start: number,
  end: number,
  fromEnd: boolean | null = null,
): (cube: Cube, index?: number | undefined) => Cube | number {
  let maxAll: number, permName: 'cp' | 'ep';

  if (fromEnd == null) {
    fromEnd = false;
  }
  const maxOur = end - start;
  const maxB = factorial(maxOur + 1);

  if (context === 'corners') {
    maxAll = 7;
    permName = 'cp';
  } else {
    maxAll = 11;
    permName = 'ep';
  }

  const our = Array(maxOur + 1).fill(0);

  return (cube: Cube, index: number | undefined = undefined): Cube | number => {
    if (index != null) {
      // Reset our to [start..end]
      for (let i = 0; i <= maxOur; i++) our[i] = i + start;

      let b = index % maxB; // permutation
      let a = (index / maxB) | 0; // combination

      // Invalidate all edges
      const perm = cube[permName];
      for (let i = 0; i <= maxOur; i++) {
        perm[i] = -1;
      }

      // Generate permutation from index b
      for (let j = 1; j <= maxOur; j++) {
        let k = b % (j + 1);
        b = (b / (j + 1)) | 0;
        // TODO: Implement rotateRightBy(our, 0, j, k)
        while (k > 0) {
          rotateRight(our, 0, j);
          k--;
        }
      }

      // Generate combination and set our edges
      let x = maxOur;
      if (fromEnd) {
        for (let j = 0; j <= maxAll; j++) {
          const c = cnk(maxAll - j, x + 1);
          if (a - c >= 0) {
            perm[j] = our[maxOur - x];
            a -= c;
            x--;
          }
        }
      } else {
        // todo: change this
        for (let j = maxAll, asc5 = maxAll <= 0; asc5 ? j <= 0 : j >= 0; asc5 ? j++ : j--) {
          const c = cnk(j, x + 1);
          if (a - c >= 0) {
            perm[j] = our[x];
            a -= c;
            x--;
          }
        }
      }

      return cube;
    } else {
      const perm = cube[permName];
      for (let i = 0; i <= maxOur; i++) {
        our[i] = -1;
      }
      let a = 0;
      let b = 0;
      let x = 0;

      // Compute the index a < ((maxAll + 1) choose (maxOur + 1)) and
      // the permutation
      if (fromEnd) {
        for (let j = maxAll; j >= 0; j--) {
          if (start <= perm[j] && perm[j] <= end) {
            a += cnk(maxAll - j, x + 1);
            our[maxOur - x] = perm[j];
            x++;
          }
        }
      } else {
        for (let j = 0; j <= maxAll; j++) {
          if (start <= perm[j] && perm[j] <= end) {
            a += cnk(j, x + 1);
            our[x] = perm[j];
            x++;
          }
        }
      }

      // Compute the index b < (maxOur + 1)! for the permutation
      for (let j = maxOur; j >= 0; j--) {
        let k = 0;
        while (our[j] !== start + j) {
          rotateLeft(our, 0, j);
          k++;
        }
        b = (j + 1) * b + k;
      }

      return a * maxB + b;
    }
  };
}
