import { describe, it, expect } from 'vitest';
import Cube from './cube';

describe('Cube', function () {
  it('should serialize a cube to string for a default cube', function () {
    const cube = new Cube();
    return expect(cube.asString()).toBe('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
  });

  it('should initiate a cube when provide a String', function () {
    const cube = Cube.fromString('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
    return expect(cube.asString()).toBe('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
  });

  it('should serialize a cube to JSON for a default cube', function () {
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

  it('should rotate U face when move U', function () {
    const cube = new Cube();
    cube.move('U');
    return expect(cube.asString()).toBe('UUUUUUUUUBBBRRRRRRRRRFFFFFFDDDDDDDDDFFFLLLLLLLLLBBBBBB');
  });

  it('should rotate cuve face when apply a moves sequence', function () {
    const cube = new Cube();
    cube.move("U R F' L'");
    return expect(cube.asString()).toBe('DURRUFRRRBRBDRBDRBFDDDFFDFFBLLBDBLDLFUUFLLFLLULRUBUUBU');
  });

  it('should rotate cuve face when apply a moves sequence includes additional notation', function () {
    const cube = new Cube();
    cube.move("M' u2 z' S");
    return expect(cube.asString()).toBe('LLRUFULLRDLDBLBDRDBBFUUDBBFRRLDBDRRLURUFRFULUBFFUDDBFF');
  });

  it('should resets the cube to the identity cube', function () {
    const cube = new Cube();
    cube.move("U R F' L'");
    cube.identity();
    return expect(cube.asString()).toBe('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
  });

  it('should return true when the cube is solved (default cube)', function () {
    const cube = new Cube();
    return expect(cube.isSolved()).toBe(true);
  });

  it('should return false when the cube is not solved (random cube), and runs without errors in normal time', function () {
    const cube = Cube.random();
    return expect(cube.isSolved()).toBe(false);
  });

  it('should return inverse moves', function () {
    const moves = Cube.inverse("F B' R");
    return expect(moves).toBe("R' B F'");
  });

  // ignore because Travis is slow
  it.skip('should solve a solved cube :) ', function () {
    Cube.initSolver();
    const cube = new Cube();
    return expect(cube.solve()).toBe('R L U2 R L F2 R2 U2 R2 F2 R2 U2 F2 L2');
  });

  // ignore because Travis is slow
  it.skip('should return null if no solution is found (maxDepth too low)', function () {
    Cube.initSolver();
    const cube = Cube.random();
    return expect(cube.solve(1)).toBe(null);
  });
});
