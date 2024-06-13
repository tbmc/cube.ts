// n choose k, i.e. the binomial coefficient
export function cnk(n: number, k: number): number {
  if (n < k) {
    return 0;
  }

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

// n!
export function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) {
    f *= i;
  }
  return f;
}

// Maximum of two values
export function max(a: number, b: number): number {
  return a > b ? a : b;
}

// Rotate elements between l and r left by one place
export function rotateLeft(array: number[], l: number, r: number) {
  const tmp = array[l];
  for (let i = l; i <= r - 1; i++) {
    array[i] = array[i + 1];
  }
  array[r] = tmp;
}

// Rotate elements between l and r right by one place
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
): (ibdex: number) => number {
  let maxAll: number, permName: string;

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

  return function (index: number) {
    if (index != null) {
      // Reset our to [start..end]
      for (let i = 0; i <= maxOur; i++) our[i] = i + start;

      let b = index % maxB; // permutation
      let a = (index / maxB) | 0; // combination

      // Invalidate all edges
      const perm = this[permName];
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

      return this;
    } else {
      const perm = this[permName];
      for (let i = 0; i <= maxOur; i++) {
        our[i] = -1;
      }
      let a = 0;
      let b = 0;
      let x = 0;

      // Compute the index a < ((maxAll + 1) choose (maxOur + 1)) and
      // the permutation
      if (fromEnd) {
        // todo: recheck
        for (let j = maxAll, asc7 = maxAll <= 0; asc7 ? j <= 0 : j >= 0; asc7 ? j++ : j--) {
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
      for (let j = maxOur, asc9 = maxOur <= 0; asc9 ? j <= 0 : j >= 0; asc9 ? j++ : j--) {
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
