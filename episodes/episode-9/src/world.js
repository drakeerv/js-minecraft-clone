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
                                currentChunk.blocks[i][j][k] = pygletAdapter.math.choice([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 11]);
                            } else if (j > 12) {
                                currentChunk.blocks[i][j][k] = pygletAdapter.math.choice([0, 6]);
                            } else {
                                currentChunk.blocks[i][j][k] = pygletAdapter.math.choice([0, 0, 5]);
                            }
                        }
                    }
                }

                this.chunks[chunkPosition] = currentChunk;
            }
        }

        Object.values(this.chunks).forEach((chunk) => {
            chunk.updateMesh();
        });
    }

    // could admittedly be named better, as it only returns the block number of opaque blocks
	// this'll be refactored in a future episode

    getBlockNumber(position) {
        const x = position[0];
        const y = position[1];
        const z = position[2];

        const chunkPosition = [
            Math.floor(x / chunkWidth),
            Math.floor(y / chunkHeight),
            Math.floor(z / chunkLength)
        ];

        if (!this.chunks[chunkPosition]) {
            return 0;
        }

        const localX = pygletAdapter.math.mod(x, chunkWidth);
        const localY = pygletAdapter.math.mod(y, chunkHeight);
        const localZ = pygletAdapter.math.mod(z, chunkLength);

        
		// get block type and check if it's transparent or not
		// if it is, return 0
		// if it isn't, return the block number

        const blockNumber = this.chunks[chunkPosition].blocks[localX][localY][localZ];
        const blockType = this.blockTypes[blockNumber];

        if (!blockType || blockType.transparent) return 0;
        return blockNumber;
    }

    draw() {
        Object.values(this.chunks).forEach((chunk) => {
            chunk.draw();
        });
    }
}

export default World;