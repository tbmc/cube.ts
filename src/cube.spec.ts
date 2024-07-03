import { describe, test, expect } from 'vitest';
import Cube from './cube';

describe('Cube', function () {
  test('should serialize a cube to string for a default cube', function () {
    const cube = new Cube();
    const dat = cube.asString();
    const exp = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
    return expect(cube.asString()).toBe('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
  });

  test('should initiate a cube when provide a String', function () {
    const cube = Cube.fromString('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
    return expect(cube.asString()).toBe('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
  });

  test('should serialize a cube to JSON for a default cube', function () {
    const cube = new Cube();

    const expectedJSON = {
      center: [0, 1, 2, 3, 4, 5],
      cp: [0, 1, 2, 3, 4, 5, 6, 7],
      co: [0, 0, 0, 0, 0, 0, 0, 0],
      ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    return expect(cube.toJSON()).toEqual(expectedJSON);
  });

  test('should rotate U face when move U', function () {
    const cube = new Cube();
    cube.move('U');
    return expect(cube.asString()).toBe('UUUUUUUUUBBBRRRRRRRRRFFFFFFDDDDDDDDDFFFLLLLLLLLLBBBBBB');
  });

  test('should rotate cube face when apply a moves sequence', function () {
    const cube = new Cube();
    cube.move("U R F' L'");
    return expect(cube.asString()).toBe('DURRUFRRRBRBDRBDRBFDDDFFDFFBLLBDBLDLFUUFLLFLLULRUBUUBU');
  });

  test('should rotate cuve face when apply a moves sequence includes additional notation', function () {
    const cube = new Cube();
    cube.move("M' u2 z' S");
    return expect(cube.asString()).toBe('LLRUFULLRDLDBLBDRDBBFUUDBBFRRLDBDRRLURUFRFULUBFFUDDBFF');
  });

  test('should resets the cube to the identity cube', function () {
    const cube = new Cube();
    cube.move("U R F' L'");
    cube.identity();
    return expect(cube.asString()).toBe('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
  });

  test('should return true when the cube is solved (default cube)', function () {
    const cube = new Cube();
    return expect(cube.isSolved()).toBe(true);
  });

  test('should return false when the cube is not solved (random cube), and runs without errors in normal time', function () {
    const cube = Cube.random();
    return expect(cube.isSolved()).toBe(false);
  });

  test('should return inverse moves', function () {
    const moves = Cube.inverse("F B' R");
    return expect(moves).toBe("R' B F'");
  });

  // ignore because Travis is slow
  test.skip('should solve a solved cube :) ', function () {
    // todo: infinite loop
    Cube.initSolver();
    const cube = new Cube();
    return expect(cube.solve()).toBe('R L U2 R L F2 R2 U2 R2 F2 R2 U2 F2 L2');
  });

  // ignore because Travis is slow
  test.skip('should return null if no solution is found (maxDepth too low)', function () {
    // todo: infinite loop
    Cube.initSolver();
    const cube = Cube.random();
    return expect(cube.solve(1)).toBe(null);
  });
});
