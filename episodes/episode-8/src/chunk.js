"use strict";

import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

// define constant values for the chunk's dimensions

const chunkWidth = 16;
const chunkHeight = 16;
const chunkLength = 16;

class Chunk {
    constructor(world, chunkPosition) {
        this.chunkPosition = chunkPosition;

        this.position = [ // get a world-space position for the chunk
            this.chunkPosition[0] * chunkWidth,
            this.chunkPosition[1] * chunkHeight,
            this.chunkPosition[2] * chunkLength];

        this.world = world;

        this.blocks = Array.from({ length: chunkWidth }, () => Array.from({ length: chunkHeight }, () => Array.from({ length: chunkLength }, () => 0))); // create an array of blocks filled with "air" (block number 0)

        // mesh variables

        this.hasMesh = false;

        this.meshVertexPositions = [];
        this.meshTexCoords = [];
        this.meshShadingValues = [];

        this.meshIndexCounter = 0;
        this.meshIndices = [];

        // create vertex array object

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // create vertex position vbo

        this.vertexPositionVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionVbo);

        // create tex coord vbo

        this.texCoordVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordVbo);

        // create shading values vbo

        this.shadingValuesVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.shadingValuesVbo);

        // create index buffer object

        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    }

    updateMesh() {
        // reset all the mesh-related values

        this.hasMesh = true;

        this.meshVertexPositions = [];
        this.meshTexCoords = [];
        this.meshShadingValues = [];

        this.meshIndexCounter = 0;
        this.meshIndices = [];

        const addFace = (blockType, position, face) => { // add a face to the chunk mesh
            let vertexPositions = blockType.vertexPositions[face].slice(); // get the vertex positions of the face to be added

            for (let i = 0; i < 4; i++) { // add the world-space position of the face to it's vertex positions
                vertexPositions[i * 3 + 0] += position[0];
                vertexPositions[i * 3 + 1] += position[1];
                vertexPositions[i * 3 + 2] += position[2];
            }

            this.meshVertexPositions.push(...vertexPositions); // add those vertex positions to the chunk mesh's vertex positions

            let indices = [0, 1, 2, 0, 2, 3]; // create a list of indices for the face's vertices
            for (let i = 0; i < 6; i++) { // shift each index by the chunk mesh's index counter so that no two faces share the same indices
                indices[i] += this.meshIndexCounter;
            }

            this.meshIndices.push(...indices); // add those indices to the chunk mesh's indices
            this.meshIndexCounter += 4; // add 4 (the amount of vertices in a face) to the chunk mesh's index counter

            this.meshTexCoords.push(...blockType.texCoords[face]); // add the face's texture coordinates to the chunk mesh's texture coordinates
            this.meshShadingValues.push(...blockType.shadingValues[face]); // add the face's shading values to the chunk mesh's shading values
        }

        // iterate through all local block positions in the chunk

        for (let localX = 0; localX < chunkWidth; localX++) {
            for (let localY = 0; localY < chunkHeight; localY++) {
                for (let localZ = 0; localZ < chunkLength; localZ++) {
                    const blockNumber = this.blocks[localX][localY][localZ]; // get the block number of the block at that local position

                    if (blockNumber) { // check if the block is not air
                        const blockType = this.world.blockTypes[blockNumber]; // get the block type

                        const x = this.position[0] + localX; // get the world-space position of the block
                        const y = this.position[1] + localY;
                        const z = this.position[2] + localZ;
                        const position = [x, y, z];

                        // check for each block face if it's hidden by another block, and add that face to the chunk mesh if not

                        if (!this.world.getBlockNumber([x + 1, y, z])) addFace(blockType, position, 0);
                        if (!this.world.getBlockNumber([x - 1, y, z])) addFace(blockType, position, 1);
                        if (!this.world.getBlockNumber([x, y + 1, z])) addFace(blockType, position, 2);
                        if (!this.world.getBlockNumber([x, y - 1, z])) addFace(blockType, position, 3);
                        if (!this.world.getBlockNumber([x, y, z + 1])) addFace(blockType, position, 4);
                        if (!this.world.getBlockNumber([x, y, z - 1])) addFace(blockType, position, 5);
                    }
                }
            }
        }


        // pass mesh data to gpu

        if (!this.meshIndexCounter) return; // make sure there actually is data in the mesh

        gl.bindVertexArray(this.vao); // bind the VAO

        // pass the mesh data to the vertex position VBO

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionVbo);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            Float32Array.from(this.meshVertexPositions),
            gl.STATIC_DRAW);
        

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        // pass the mesh data to the texture coordinates VBO

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordVbo);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            Float32Array.from(this.meshTexCoords),
            gl.STATIC_DRAW);

        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        // pass the mesh data to the shading values VBO

        gl.bindBuffer(gl.ARRAY_BUFFER, this.shadingValuesVbo);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            Float32Array.from(this.meshShadingValues),
            gl.STATIC_DRAW);

        gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);

        // pass the mesh data to the IBO

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            Uint32Array.from(this.meshIndices),
            gl.STATIC_DRAW);
    }

    draw() {
        if (!this.meshIndexCounter) return; // make sure there actually is data in the mesh

        gl.bindVertexArray(this.vao); // bind the VAO

        gl.drawElements(
            gl.TRIANGLES,
            this.meshIndices.length,
            gl.UNSIGNED_INT,
            0);
    }
}

export default Chunk;
export { chunkWidth, chunkHeight, chunkLength };