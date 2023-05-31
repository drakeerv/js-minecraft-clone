"use strict";

const subchunkWidth = 4;
const subchunkHeight = 4;
const subchunkLength = 4;

class Subchunk {
    constructor(parent, subchunkPosition) {
        this.parent = parent;
        this.world = this.parent.world;

        this.subchunkPosition = subchunkPosition;

        this.worker = new Worker("./src/subchunkworker.js");

        this.awaitingUpdates = {}
        this.worker.addEventListener("message", (event) => {
            const type = event.data.type;

            if (type === "updateMesh") {
                this.meshVertexPositions = event.data.meshVertexPositions;
                this.meshTexCoords = event.data.meshTexCoords;
                this.meshShadingValues = event.data.meshShadingValues;
                this.meshIndexCounter = event.data.meshIndexCounter;
                this.meshIndices = event.data.meshIndices;

                this.awaitingUpdates[event.data.id]();
            } else if (type === "functionCall") {
                const name = event.data.name;
                const args = event.data.args;
                const id = event.data.id;

                if (name === "isOpaqueBlock") {
                    this.world.isOpaqueBlock(args[0]).then((result) => {
                        this.worker.postMessage({
                            type: "functionResponse",
                            id: id,
                            result: result
                        });
                    });
                } else if (name === "getBlockNumber") {
                    this.world.getBlockNumber(args[0], args[1], args[2]).then((result) => {
                        this.worker.postMessage({
                            type: "functionResponse",
                            id: id,
                            result: result
                        });
                    });
                }
            }
        });

        this.localPosition = [
            this.subchunkPosition[0] * subchunkWidth,
            this.subchunkPosition[1] * subchunkHeight,
            this.subchunkPosition[2] * subchunkLength
        ];

        this.position = [
            this.parent.position[0] + this.localPosition[0],
            this.parent.position[1] + this.localPosition[1],
            this.parent.position[2] + this.localPosition[2]
        ];

        // mesh variables

        this.meshVertexPositions = [];
        this.meshTexCoords = [];
        this.meshShadingValues = [];

        this.meshIndexCounter = 0;
        this.meshIndices = [];
    }

    async updateMesh() {
        const id = Math.random();

        this.worker.postMessage({
            type: "updateMesh",
            subchunkWidth: subchunkWidth,
            subchunkHeight: subchunkHeight,
            subchunkLength: subchunkLength,
            localPosition: this.localPosition,
            parentBlocks: this.parent.blocks,
            blockTypes: this.world.blockTypes,
            id: id
        });

        return new Promise((resolve) => {
            this.awaitingUpdates[id] = resolve;
        });
    }
}

export default Subchunk;
export { subchunkWidth, subchunkHeight, subchunkLength };