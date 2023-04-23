"use strict";

import TextureManager from "./textureManager.js";
import BlockType from "./blockType.js";
import Chunk, { chunkWidth, chunkHeight, chunkLength } from "./chunk.js";
import pygletAdapter from "../../adapter.js";

class World {
    constructor() {
        // create list of block types

        this.textureManager = new TextureManager(16, 16, 256);
        this.blockTypes = [null]; // "null" is the block type for air

        this.blockTypes.push(new BlockType(this.textureManager, "cobblestone", { "all": "cobblestone" }));
        this.blockTypes.push(new BlockType(this.textureManager, "grass", { "top": "grass", "bottom": "dirt", "sides": "grass_side" }));
        this.blockTypes.push(new BlockType(this.textureManager, "grass_block", { "all": "grass" }));
        this.blockTypes.push(new BlockType(this.textureManager, "dirt", { "all": "dirt" }));
        this.blockTypes.push(new BlockType(this.textureManager, "stone", { "all": "stone" }));
        this.blockTypes.push(new BlockType(this.textureManager, "sand", { "all": "sand" }));
        this.blockTypes.push(new BlockType(this.textureManager, "planks", { "all": "planks" }));
        this.blockTypes.push(new BlockType(this.textureManager, "log", { "top": "log_top", "bottom": "log_top", "sides": "log_side" }));

        this.textureManager.loadTextures().then(() => {
            this.textureManager.generateMipmaps();
        });

        // create chunks with very crude terrain generation

        this.chunks = {};

        for (let x = -4; x < 4; x++) {
            for (let z = -4; z < 4; z++) {
                const chunkPosition = [x, -1, z];
                const currentChunk = new Chunk(this, chunkPosition);

                for (let i = 0; i < chunkWidth; i++) {
                    for (let j = 0; j < chunkHeight; j++) {
                        for (let k = 0; k < chunkLength; k++) {
                            if (j > 13) {
                                currentChunk.blocks[i][j][k] = [0, 3][Math.floor(Math.random() * 2)];
                            } else {
                                currentChunk.blocks[i][j][k] = [0, 0, 1][Math.floor(Math.random() * 3)];
                            }
                        }
                    }
                }

                this.chunks[chunkPosition] = currentChunk;
            }
        }

        // update each chunk's mesh

        Object.values(this.chunks).forEach((chunk) => {
            chunk.updateMesh();
        });
    }

    getBlockNumber(position) { // get the index in the block_types array of the block at a certain position
        const x = position[0];
        const y = position[1];
        const z = position[2];

        const chunkPosition = [
            Math.floor(x / chunkWidth),
            Math.floor(y / chunkHeight),
            Math.floor(z / chunkLength)
        ];

        if (!this.chunks[chunkPosition]) { // return "air" if the chunk doesn't exist
            return 0;
        }

        const localX = pygletAdapter.math.mod(x, chunkWidth);
        const localY = pygletAdapter.math.mod(y, chunkHeight);
        const localZ = pygletAdapter.math.mod(z, chunkLength);

        return this.chunks[chunkPosition].blocks[localX][localY][localZ]; // return the block number at the local position in the correct chunk
    }

    draw() {
        Object.values(this.chunks).forEach((chunk) => {
            chunk.draw();
        });
    }
}

export default World;