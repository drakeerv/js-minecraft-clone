"use strict";

const transparent = true;
const isCube = false;
const glass = false;

const vertexPositions = [
    [ 0.4375,  0.5000,  0.5000,  0.4375, -0.5000,  0.5000,  0.4375, -0.5000, -0.5000,  0.4375,  0.5000, -0.5000], // right
    [-0.4375,  0.5000, -0.5000, -0.4375, -0.5000, -0.5000, -0.4375, -0.5000,  0.5000, -0.4375,  0.5000,  0.5000], // left
    [ 0.5000,  0.5000,  0.5000,  0.5000,  0.5000, -0.5000, -0.5000,  0.5000, -0.5000, -0.5000,  0.5000,  0.5000], // top
    [-0.5000, -0.5000,  0.5000, -0.5000, -0.5000, -0.5000,  0.5000, -0.5000, -0.5000,  0.5000, -0.5000,  0.5000], // bottom
    [-0.5000,  0.5000,  0.4375, -0.5000, -0.5000,  0.4375,  0.5000, -0.5000,  0.4375,  0.5000,  0.5000,  0.4375], // front
    [ 0.5000,  0.5000, -0.4375,  0.5000, -0.5000, -0.4375, -0.5000, -0.5000, -0.4375, -0.5000,  0.5000, -0.4375], // back
];

const texCoords = [
    [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0],
    [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0],
    [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0],
    [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0],
    [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0],
    [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0],
];

const shadingValues = [
    [0.6, 0.6, 0.6, 0.6],
    [0.6, 0.6, 0.6, 0.6],
    [1.0, 1.0, 1.0, 1.0],
    [0.4, 0.4, 0.4, 0.4],
    [0.8, 0.8, 0.8, 0.8],
    [0.8, 0.8, 0.8, 0.8],
];

export { transparent, isCube, glass, vertexPositions, texCoords, shadingValues };