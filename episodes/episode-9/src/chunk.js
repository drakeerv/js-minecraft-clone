"use strict";

import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

// define constant values for the chunk's dimensions

const chunkWidth = 16
const chunkHeight = 16
const chunkLength = 16

class Chunk {
    constructor(world, chunkPosition) {
        this.chunkPosition = chunkPosition;

        this.position = [
            this.chunkPosition[0] * chunkWidth,
            this.chunkPosition[1] * chunkHeight,
            this.chunkPosition[2] * chunkLength];

        this.world = world;

        this.blocks = Array.from({ length: chunkWidth }, () => Array.from({ length: chunkHeight }, () => Array.from({ length: chunkLength }, () => 0)));

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
        this.hasMesh = true;

        this.meshVertexPositions = [];
        this.meshTexCoords = [];
        this.meshShadingValues = [];

        this.meshIndexCounter = 0;
        this.meshIndices = [];

        const addFace = (blockType, position, face) => {
            let vertexPositions = blockType.vertexPositions[face].slice();

            for (let i = 0; i < 4; i++) {
                vertexPositions[i * 3 + 0] += position[0];
                vertexPositions[i * 3 + 1] += position[1];
                vertexPositions[i * 3 + 2] += position[2];
            }

            this.meshVertexPositions.push(...vertexPositions);

            let indices = [0, 1, 2, 0, 2, 3];
            for (let i = 0; i < 6; i++) {
                indices[i] += this.meshIndexCounter;
            }

            this.meshIndices.push(...indices);
            this.meshIndexCounter += 4;

            this.meshTexCoords.push(...blockType.texCoords[face]);
            this.meshShadingValues.push(...blockType.shadingValues[face]);
        }

        for (let localX = 0; localX < chunkWidth; localX++) {
            for (let localY = 0; localY < chunkHeight; localY++) {
                for (let localZ = 0; localZ < chunkLength; localZ++) {
                    const blockNumber = this.blocks[localX][localY][localZ];

                    if (blockNumber) {
                        const blockType = this.world.blockTypes[blockNumber];

                        const x = this.position[0] + localX;
                        const y = this.position[1] + localY;
                        const z = this.position[2] + localZ;
                        const position = [x, y, z];

                        // if block is cube, we want it to check neighbouring blocks so that we don't uselessly render faces
						// if block isn't a cube, we just want to render all faces, regardless of neighbouring blocks
						// since the vast majority of blocks are probably anyway going to be cubes, this won't impact performance all that much; the amount of useless faces drawn is going to be minimal

                        if (blockType.isCube) {
                            if (!this.world.getBlockNumber([x + 1, y, z])) addFace(blockType, position, 0);
                            if (!this.world.getBlockNumber([x - 1, y, z])) addFace(blockType, position, 1);
                            if (!this.world.getBlockNumber([x, y + 1, z])) addFace(blockType, position, 2);
                            if (!this.world.getBlockNumber([x, y - 1, z])) addFace(blockType, position, 3);
                            if (!this.world.getBlockNumber([x, y, z + 1])) addFace(blockType, position, 4);
                            if (!this.world.getBlockNumber([x, y, z - 1])) addFace(blockType, position, 5);
                        } else {
                            for (let i = 0; i < blockType.vertexPositions.length; i++) {
                                addFace(blockType, position, i);
                            }
                        }
                    }
                }
            }
        }


        // pass mesh data to gpu

        if (!this.meshIndexCounter) return;

        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionVbo);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            Float32Array.from(this.meshVertexPositions),
            gl.STATIC_DRAW);
        

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordVbo);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            Float32Array.from(this.meshTexCoords),
            gl.STATIC_DRAW);

        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.shadingValuesVbo);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            Float32Array.from(this.meshShadingValues),
            gl.STATIC_DRAW);

        gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            Uint32Array.from(this.meshIndices),
            gl.STATIC_DRAW);
    }

    draw() {
        if (!this.meshIndexCounter) return;

        gl.bindVertexArray(this.vao);

        gl.drawElements(
            gl.TRIANGLES,
            this.meshIndices.length,
            gl.UNSIGNED_INT,
            0);
    }
}

export default Chunk;
export { chunkWidth, chunkHeight, chunkLength };