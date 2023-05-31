"use strict";

import * as NBT from "//cdn.jsdelivr.net/npm/nbtify/dist/index.min.js";
import pygletAdapter from "../../adapter.js";

import Chunk, {chunkWidth, chunkHeight, chunkLength} from "./chunk.js";

function dirname(path) {
    return path.substring(0, path.lastIndexOf("/"));
}

function rmdirr(path, fs) {
    if (path === "/") return;

    if (fs.readdirSync(path).length === 0) {
        fs.rmdirSync(path);
        rmdirr(dirname(path));
    }
}

let bfs = {};
BrowserFS.install(bfs);

class Save {
    constructor(world, path = "/world") {
        this.world = world;
        this.path = path;
        this.fs = null;
    }

    async loadFs() {
        let promise = new Promise((resolve, reject) => {
            BrowserFS.configure({
                fs: "LocalStorage"
            }, async (e) => {
                if (e) {
                    reject(e);
                    return;
                }

                this.fs = bfs.require("fs");

                if (!this.fs.existsSync("/world")) {
                    const data = await fetch("./src/save/world.zip").then(r => r.blob());
                    const zip = await JSZip.loadAsync(data);

                    const saveFile = async (path, unzip) => {
                        const fullPath = "/" + path;
                        const dir = dirname(fullPath);

                        if (!await this.fs.exists(dir)) await this.fs.mkdir(dir, { recursive: true });
                        if (unzip.dir) return;

                        await this.fs.writeFile(fullPath, await unzip.async("base64"), "base64");
                    };

                    this.fs.mkdirSync("/world");
                    await Promise.all(Object.entries(zip.files).map(([path, unzip]) => saveFile(path, unzip)));
                }

                resolve();
            });
        });

        await promise;
    }

    chunkPositionToPath(chunkPosition) {
        let x, y, z;
        [x, y, z] = chunkPosition;

        const chunkPath = [
            this.path,
            (pygletAdapter.math.mod(x, 64)).toString(36),
            (pygletAdapter.math.mod(z, 64)).toString(36),
            `c.${x.toString(36)}.${z.toString(36)}.dat`
        ].join("/");

        return chunkPath;
    }

    async loadChunk(chunkPosition) {
        // load the chunk file

        const chunkPath = this.chunkPositionToPath(chunkPosition);
        let chunkBlocks = null;

        try {
            chunkBlocks = (await NBT.read(this.fs.readFileSync(chunkPath))).data.Level.Blocks;
        } catch (e) {
            return;
        }

        // create chunk and fill it with the blocks from our chunk file

        let newChunk = new Chunk(this.world, chunkPosition);

        Promise.all(
            Array.from({length: chunkWidth}, (_, x) => x).map(x => {
                return Promise.all(
                    Array.from({length: chunkHeight}, (_, y) => y).map(y => {
                        return Promise.all(
                            Array.from({length: chunkLength}, (_, z) => z).map(z => {
                                newChunk.blocks[x][y][z] = chunkBlocks[x * chunkLength * chunkHeight + z * chunkHeight + y];
                            })
                        );
                    })
                );
            })
        );

        this.world.chunks[chunkPosition] = newChunk;
    }

    async saveChunk(chunkPosition) {
        let x, y, z;
        [x, y, z] = chunkPosition;

        // try to load the chunk file
        // if it doesn't exist, create a new one

        const chunkPath = this.chunkPositionToPath(chunkPosition);
        let chunkData = null;
        
        try {
            chunkData = await NBT.read(this.fs.readFileSync(chunkPath));
        } catch (e) {
            chunkData = new NBT.NBTData({
                Level: {
                    xPos: x,
                    zPos: z
                }
            }, {
                compression: "gzip"
            })
        }

        // fill in the chunk file with the blocks from our chunk (array buffer)

        let chunkBlocks = new Uint8Array(chunkWidth * chunkHeight * chunkLength);

        await Promise.all(
            Array.from({length: chunkWidth}, (_, x) => x).map(x => {
                return Promise.all(
                    Array.from({length: chunkHeight}, (_, y) => y).map(y => {
                        return Promise.all(
                            Array.from({length: chunkLength}, (_, z) => z).map(z => {
                                chunkBlocks[x * chunkLength * chunkHeight + z * chunkHeight + y] = this.world.chunks[chunkPosition].blocks[x][y][z];
                            })
                        );
                    })
                );
            })
        );

        chunkData.data.Level.Blocks = chunkBlocks;

        // write the chunk file

        NBT.write(chunkData).then(dataArray => {
            const data = btoa(String.fromCharCode.apply(null, dataArray));

            if (!this.fs.existsSync(dirname(chunkPath))) this.fs.mkdirSync(dirname(chunkPath), { recursive: true });
            this.fs.writeFileSync(chunkPath, data, "base64");
        });
    }

    async load() {
        await Promise.all(
            [-4, -3, -2, -1, 0, 1, 2, 3, 4].map(x => {
                return Promise.all(
                    [-4, -3, -2, -1, 0, 1, 2, 3, 4].map(y => {
                        return this.loadChunk([x, 0, y]);
                    })
                );
            }
        ));
    }

    save() {
        Promise.all(
            Object.entries(this.world.chunks).map(async ([chunkPosition, chunk]) => {
                const chunkPositionArray = chunkPosition.split(",").map(Number);

                if (chunkPositionArray[1] !== 0) return; // reject all chunks above and below the world limit

                if (chunk.modified) {
                    chunk.modified = false;
                    return this.saveChunk(chunkPositionArray);
                }
            }
        ));
    }
}

export default Save;
