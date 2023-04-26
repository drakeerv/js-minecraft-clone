const transparent = true
const isCube = false
const glass = false

const vertexPositions = [
    [ 0.5, -0.4375,  0.5,   0.5, -0.4375, -0.5,  -0.5, -0.4375, -0.5,  -0.5, -0.4375,  0.5], // top
    [-0.5, -0.4375,  0.5,  -0.5, -0.4375, -0.5,   0.5, -0.4375, -0.5,   0.5, -0.4375,  0.5], // bottom
]

const texCoords = [
    [0.0, 1.0, 0.0,  0.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 1.0, 0.0],
    [0.0, 1.0, 0.0,  0.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 1.0, 0.0],
]

const shadingValues = [
    [1.0, 1.0, 1.0, 1.0],
    [0.4, 0.4, 0.4, 0.4],
]

export { transparent, isCube, glass, vertexPositions, texCoords, shadingValues };