"use strict";

import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

import Subchunk, { subchunkWidth, subchunkHeight, subchunkLength } from "./subchunk.js";

const chunkWidth = 16
const chunkHeight = 128
const chunkLength = 16

class Chunk {
    constructor(world, chunkPosition) {
        this.world = world;

        this.modified = false;
        this.chunkPosition = chunkPosition;

        this.position = [
            this.chunkPosition[0] * chunkWidth,
            this.chunkPosition[1] * chunkHeight,
            this.chunkPosition[2] * chunkLength];

        this.blocks = Array.from({ length: chunkWidth }, () => Array.from({ length: chunkHeight }, () => Array.from({ length: chunkLength }, () => 0)));

        this.subchunks = {};

        for (let x = 0; x < chunkWidth / subchunkWidth; x++) {
            for (let y = 0; y < chunkHeight / subchunkHeight; y++) {
                for (let z = 0; z < chunkLength / subchunkLength; z++) {
                    this.subchunks[[x, y, z]] = new Subchunk(this, [x, y, z]);
                }
            }
        }

        // mesh variables

        this.meshVertexPositions = [];
        this.meshTexCoords = [];
        this.meshShadingValues = [];

        this.meshIndexCounter = 0;
        this.meshIndices = [];

        // create VAO and VBO's

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vertexPositionVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionVbo);

        this.texCoordVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordVbo);

        this.shadingValuesVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.shadingValuesVbo);

        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    }

    updateSubchunkMeshes() {
        Object.values(this.subchunks).forEach(subchunk => subchunk.updateMesh());
    }

    updateAtPosition(position) {
        let x, y, z;
        [x, y, z] = position;

        const lx = pygletAdapter.math.mod(x, subchunkWidth);
        const ly = pygletAdapter.math.mod(y, subchunkHeight);
        const lz = pygletAdapter.math.mod(z, subchunkLength);

        let clx, cly, clz;
        [clx, cly, clz] = this.world.getLocalPosition(position);

        const sx = Math.floor(clx / subchunkWidth);
        const sy = Math.floor(cly / subchunkHeight);
        const sz = Math.floor(clz / subchunkLength);

        this.subchunks[[sx, sy, sz]].updateMesh();

        const tryUpdateSubchunkMesh = (subchunkPosition) => {
            if (subchunkPosition in this.subchunks) {
                this.subchunks[subchunkPosition].updateMesh();
            }
        }

        if (lx == subchunkWidth - 1) {
            tryUpdateSubchunkMesh([sx + 1, sy, sz]);
        } else if (lx == 0) {
            tryUpdateSubchunkMesh([sx - 1, sy, sz]);
        }

        if (ly == subchunkHeight - 1) {
            tryUpdateSubchunkMesh([sx, sy + 1, sz]);
        } else if (ly == 0) {
            tryUpdateSubchunkMesh([sx, sy - 1, sz]);
        }

        if (lz == subchunkLength - 1) {
            tryUpdateSubchunkMesh([sx, sy, sz + 1]);
        } else if (lz == 0) {
            tryUpdateSubchunkMesh([sx, sy, sz - 1]);
        }
    }

    updateMesh() {
        // combine all the small subchunk meshes into one big chunk mesh

        this.meshVertexPositions = [];
        this.meshTexCoords = [];
        this.meshShadingValues = [];

        this.meshIndexCounter = 0;
        this.meshIndices = [];

        Object.values(this.subchunks).forEach(subchunk => {
            this.meshVertexPositions.push(...subchunk.meshVertexPositions);
            this.meshTexCoords.push(...subchunk.meshTexCoords);
            this.meshShadingValues.push(...subchunk.meshShadingValues);

            const meshIndices = subchunk.meshIndices.map(index => index + this.meshIndexCounter);

            this.meshIndices.push(...meshIndices);
            this.meshIndexCounter += subchunk.meshIndexCounter;
        });

        // send the full mesh data to the GPU and free the memory used client-side (we don't need it anymore)
        // don't forget to save the length of 'self.mesh_indices' before freeing

        this.meshIndicesLength = this.meshIndices.length;
        this.sendMeshDataToGpu();

        delete this.meshVertexPositions;
        delete this.meshTexCoords;
        delete this.meshShadingValues;

        delete this.meshIndices;
    }

    sendMeshDataToGpu() {
        if (!this.meshIndexCounter) return;

        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshVertexPositions), gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshTexCoords), gl.STATIC_DRAW);

        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.shadingValuesVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshShadingValues), gl.STATIC_DRAW);

        gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.meshIndices), gl.STATIC_DRAW);
    }

    draw() {
        if (!this.meshIndexCounter) return;

        gl.bindVertexArray(this.vao);

        gl.drawElements(
            gl.TRIANGLES,
            this.meshIndicesLength,
            gl.UNSIGNED_INT,
            0);
    }
}

export default Chunk;
export { chunkWidth, chunkHeight, chunkLength };