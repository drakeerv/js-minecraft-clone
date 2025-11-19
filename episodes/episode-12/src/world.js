"use strict";

import TextureManager from "./textureManager.js";
import BlockType from "./blockType.js";
import Chunk, { chunkWidth, chunkHeight, chunkLength } from "./chunk.js";
import pygletAdapter from "../../adapter.js";

import * as Models from "./models/models.js";

import Save from "./save.js";

class World {
    constructor() {
        this.textureManager = new TextureManager(16, 16, 256);
        this.blockTypes = [null];
        this.hasMap = false;
        this.chunks = {};
        this.save = new Save(this);

        fetch("./src/data/blocks.mcpy").then(response => response.text()).then(blocksDataFile => {
            const blocksData = blocksDataFile.split("\n");

            for (const block of blocksData) {
                if (block.startsWith("#") || block.trim().length == 0) { // skip if empty line or comment
                    continue;
                }

                const split = block.trim().split(":", 2);
                const number = parseInt(split[0].trim());
                const props = split[1].trim();

                // default black

                let name = "Uknown";
                let model = Models.Cube;
                let texture = { "all": "uknown" };

                // parse properties
                for (let prop of props.split(",")) {
                    prop = prop.trim();
                    prop = prop.split(" ", 2).filter(entry => { return entry.trim() != ""; });

                    if (prop[0] == "sameas") {
                        const sameasNumber = parseInt(prop[1]);
                        const sameasBlock = this.blockTypes[sameasNumber];

                        name = sameasBlock.name;
                        model = sameasBlock.model;
                        texture = sameasBlock.blockFaceTextures;
                    } else if (prop[0] == "name") {
                        name = prop[1];
                    } else if (prop[0].startsWith("texture")) {
                        const side = prop[0].split(".")[1];
                        texture[side] = prop[1].trim();
                    } else if (prop[0] == "model") {
                        const modelName = prop[1].split(".")[1].split("_").map(word => { return word[0].toUpperCase() + word.slice(1); }).join("");
                        model = Models[modelName];
                    }
                }

                // add block type

                const blockType = new BlockType(this.textureManager, name, texture, model);

                if (number < this.blockTypes.length) {
                    this.blockTypes[number] = blockType;
                } else {
                    this.blockTypes.push(blockType);
                }
            }

            this.textureManager.loadTextures().then(() => {
                this.textureManager.generateMipmaps();
                this.loadWorld();
            });
        });
    }

    async loadWorld() {
        if (this.hasMap) return;

        this.hasMap = true;

        await this.save.loadFs();
        await this.save.load();

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

        const blockNumber = this.chunks[chunkPosition].blocks[lx][ly][lz];
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


        if (!(chunkPosition in this.chunks)) { // if no chunks exist at this position, create a new one
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

        const chunkPositionString = chunkPosition.join(",");

        this.chunks[chunkPositionString].blocks[lx][ly][lz] = number;
        this.chunks[chunkPositionString].modified = true;

        this.chunks[chunkPositionString].updateAtPosition(position);
        this.chunks[chunkPositionString].updateMesh();

        let cx, cy, cz;
        [cx, cy, cz] = chunkPosition;

        const tryUpdateChunkAtPosition = (chunkPosition, position) => {
            if (chunkPosition in this.chunks) {
                const chunkPositionString = chunkPosition.join(",");

                this.chunks[chunkPositionString].updateAtPosition(position);
                this.chunks[chunkPositionString].updateMesh();
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

    trySetBlock(pos, num, collider) {
        // if we're trying to remove a block, whatever let it go through

        if (!num) {
            return this.setBlock(pos, 0);
        }

        // make sure the block doesn't intersect with the passed collider

        for (const blockCollider of this.blockTypes[num].model.colliders) {
            if (collider.and(blockCollider.add(pos))) {
                return;
            }
        }

        this.setBlock(pos, num);
    }

    draw() {
        Object.values(this.chunks).forEach((chunk) => {
            chunk.draw();
        });
    }
}

export default World;