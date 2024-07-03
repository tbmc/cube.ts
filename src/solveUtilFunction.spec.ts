import { describe, expect, test } from 'vitest';
import { rotateLeft } from './solveUtilFunction';

describe('solveUtilFunction', () => {
  describe('rotateLeft', () => {
    test('should rotate 4 first values', () => {
      const data = [1, 2, 3, 4, 5, 6];
      rotateLeft(data, 1, 3);
      expect(data).toEqual([1, 3, 4, 2, 5, 6]);
    });
  });
});
