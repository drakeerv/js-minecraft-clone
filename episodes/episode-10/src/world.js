"use strict";

import TextureManager from "./textureManager.js";
import BlockType from "./blockType.js";
import Chunk, { chunkWidth, chunkHeight, chunkLength } from "./chunk.js";
import pygletAdapter from "../../adapter.js";

import * as Plant from "./models/plant.js";
import * as Cactus from "./models/cactus.js";

class World {
    constructor() {
        this.textureManager = new TextureManager(16, 16, 256);
        this.blockTypes = [null];

        this.blockTypes.push(new BlockType(this.textureManager, "cobblestone", { "all": "cobblestone" }));
        this.blockTypes.push(new BlockType(this.textureManager, "grass", { "top": "grass", "bottom": "dirt", "sides": "grass_side" }));
        this.blockTypes.push(new BlockType(this.textureManager, "grass_block", { "all": "grass" }));
        this.blockTypes.push(new BlockType(this.textureManager, "dirt", { "all": "dirt" }));
        this.blockTypes.push(new BlockType(this.textureManager, "stone", { "all": "stone" }));
        this.blockTypes.push(new BlockType(this.textureManager, "sand", { "all": "sand" }));
        this.blockTypes.push(new BlockType(this.textureManager, "planks", { "all": "planks" }));
        this.blockTypes.push(new BlockType(this.textureManager, "log", { "top": "log_top", "bottom": "log_top", "sides": "log_side" }));
        this.blockTypes.push(new BlockType(this.textureManager, "daisy", {"all": "daisy"}, Plant))
    this.blockTypes.push(new BlockType(this.textureManager, "rose", {"all": "rose"}, Plant))
    this.blockTypes.push(new BlockType(this.textureManager, "cactus", {"top": "cactus_top", "bottom": "cactus_bottom", "sides": "cactus_side"}, Cactus))
    this.blockTypes.push(new BlockType(this.textureManager, "dead_bush", {"all": "dead_bush"}, Plant))

        this.textureManager.loadTextures().then(() => {
            this.textureManager.generateMipmaps();
        });

        this.chunks = {};

        for (let x = -4; x < 4; x++) {
            for (let z = -4; z < 4; z++) {
                const chunkPosition = [x, -1, z];
                const currentChunk = new Chunk(this, chunkPosition);

                for (let i = 0; i < chunkWidth; i++) {
                    for (let j = 0; j < chunkHeight; j++) {
                        for (let k = 0; k < chunkLength; k++) {
                            if (j == 15) {
                                currentChunk.blocks[i][j][k] = pygletAdapter.math.choices([0, 9, 10], [20, 2, 1])[0];
                            } else if (j == 14) {
                                currentChunk.blocks[i][j][k] = 2;
                            } else if (j > 10) {
                                currentChunk.blocks[i][j][k] = 4;
                            } else {
                                currentChunk.blocks[i][j][k] = 5;
                            }
                        }
                    }
                }

                this.chunks[chunkPosition] = currentChunk;
            }
        }

        Object.values(this.chunks).forEach((chunk) => {
            chunk.updateSubchunkMeshes();
            chunk.updateMesh();
        });
    }

    // create functions to make things a bit easier

    getChunkPosition(position) {
        const x = position[0];
        const y = position[1];
        const z = position[2];

        return [
            Math.floor(x / chunkWidth),
            Math.floor(y / chunkHeight),
            Math.floor(z / chunkLength)
        ];
    }

    getLocalPosition(position) {
        const x = position[0];
        const y = position[1];
        const z = position[2];

        return [
            pygletAdapter.math.mod(x, chunkWidth),
            pygletAdapter.math.mod(y, chunkHeight),
            pygletAdapter.math.mod(z, chunkLength)
        ];
    }

    getBlockNumber(position) {
        const chunkPosition = this.getChunkPosition(position);

        if (!this.chunks[chunkPosition]) {
            return 0;
        }

        let lx, ly, lz;
        [lx, ly, lz] = this.getLocalPosition(position);


        const blockNumber = this.chunks[chunkPosition].blocks[localX][localY][localZ];
        return blockNumber;
    }

    isOpaqueBlock(position) {
        // get block type and check if it's opaque or not
        // air counts as a transparent block, so test for that too

        const blockType = this.blockTypes[this.getBlockNumber(position)];

        if (!blockType) {
            return false;
        }

        return !blockType.transparent;
    }

    setBlock(position, number) { // set number to 0 (air) to remove block
        let x, y, z;
        [x, y, z] = position;
        const chunkPosition = this.getChunkPosition(position);

        if (!this.chunks.includes(chunkPosition)) { // if no chunks exist at this position, create a new one
            if (number == 0) {
                return; // no point in creating a whole new chunk if we're not gonna be adding anything
            }

            this.chunks[chunkPosition] = new Chunk(this, chunkPosition);
        }

        if (this.getBlockNumber(position) == number) { // no point updating mesh if the block is the same
            return; 
        }

        let lx, ly, lz;
        [lx, ly, lz] = this.getLocalPosition(position);

        this.chunks[chunkPosition].blocks[lx][ly][lz] = number;
        this.chunks[chunkPosition].updateAtPosition(position);
        this.chunks[chunkPosition].updateMesh();

        let cx, cy, cz;
        [cx, cy, cz] = chunkPosition;

        const tryUpdateChunkAtPosition = (chunkPosition, position) => {
            if (!this.chunks.includes(chunkPosition)) {
                this.chunks[chunkPosition].updateAtPosition(position);
                this.chunks[chunkPosition].updateMesh();
            }
        }

        if (lx == chunkWidth - 1) {
            tryUpdateChunkAtPosition([cx + 1, cy, cz], [x + 1, y, z]);
        } else if (lx == 0) {
            tryUpdateChunkAtPosition([cx - 1, cy, cz], [x - 1, y, z]);
        }

        if (ly == chunkHeight - 1) {
            tryUpdateChunkAtPosition([cx, cy + 1, cz], [x, y + 1, z]);
        } else if (ly == 0) {
            tryUpdateChunkAtPosition([cx, cy - 1, cz], [x, y - 1, z]);
        }

        if (lz == chunkLength - 1) {
            tryUpdateChunkAtPosition([cx, cy, cz + 1], [x, y, z + 1]);
        } else if (lz == 0) {
            tryUpdateChunkAtPosition([cx, cy, cz - 1], [x, y, z - 1]);
        }
    }

    draw() {
        Object.values(this.chunks).forEach((chunk) => {
            chunk.draw();
        });
    }
}

export default World;