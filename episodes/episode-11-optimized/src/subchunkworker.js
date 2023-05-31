"use strict";

let awaitingResponse = {};

function createCallObject(name, args) {
    return { type: "functionCall", name: name, args: args, id: crypto.randomUUID() };
}

async function isOpaqueBlock(blockNumber) {
    // postmessage to talk to main thread:
    const callObject = createCallObject("isOpaqueBlock", [blockNumber]);
    postMessage(callObject);

    // add to awaitingResponse:
    return new Promise((resolve) => {
        awaitingResponse[callObject.id] = resolve;
    });
}

async function getBlockNumber(x, y, z) {
    // postmessage to talk to main thread:
    const callObject = createCallObject("getBlockNumber", [x, y, z]);
    postMessage(callObject);

    // add to awaitingResponse:
    return new Promise((resolve) => {
        awaitingResponse[callObject.id] = resolve;
    });
}


addEventListener("message", async (event) => {
    const type = event.data.type;

    if (type === "functionResponse") {
        const id = event.data.id;
        const result = event.data.result;

        awaitingResponse[id](result);
        delete awaitingResponse[id];
    } else if (type === "updateMesh") {
        const subchunkWidth = event.data.subchunkWidth;
        const subchunkHeight = event.data.subchunkHeight;
        const subchunkLength = event.data.subchunkLength;

        const localPosition = event.data.localPosition;
        const parentBlocks = event.data.parentBlocks;

        const blockTypes = event.data.blockTypes;

        const id = event.data.id;

        let meshVertexPositions = [];
        let meshTexCoords = [];
        let meshShadingValues = [];

        let meshIndexCounter = 0;
        let meshIndices = [];

        const addFace = (blockType, position, face) => {
            const vertexPositions = blockType.vertexPositions[face].slice();

            for (let i = 0; i < 4; i++) {
                vertexPositions[i * 3 + 0] += position[0];
                vertexPositions[i * 3 + 1] += position[1];
                vertexPositions[i * 3 + 2] += position[2];
            }

            meshVertexPositions.push(...vertexPositions);

            let indices = [0, 1, 2, 0, 2, 3];
            for (let i = 0; i < 6; i++) {
                indices[i] += meshIndexCounter;
            }

            meshIndices.push(...indices);
            meshIndexCounter += 4;

            meshTexCoords.push(...blockType.texCoords[face]);
            meshShadingValues.push(...blockType.shadingValues[face]);
        };

        for (let localX = 0; localX < subchunkWidth; localX++) {
            for (let localY = 0; localY < subchunkHeight; localY++) {
                for (let localZ = 0; localZ < subchunkLength; localZ++) {
                    const parentlx = localPosition[0] + localX;
                    const parently = localPosition[1] + localY;
                    const parentlz = localPosition[2] + localZ;

                    const blockNumber = parentBlocks[parentlx][parently][parentlz];

                    if (blockNumber) {
                        const blockType = blockTypes[blockNumber];

                        let x, y, z;
                        [x, y, z] = [
                            this.position[0] + localX,
                            this.position[1] + localY,
                            this.position[2] + localZ
                        ]

                        const canRenderFace = (position) => {
                            if (!isOpaqueBlock(position)) {
                                if (blockType.glass && getBlockNumber(position) == blockNumber) {
                                    return false;
                                }

                                return true;
                            }

                            return false;
                        };

                        if (blockType.isCube) {
                            if (canRenderFace([x + 1, y, z])) addFace(blockType, [x, y, z], 0);
                            if (canRenderFace([x - 1, y, z])) addFace(blockType, [x, y, z], 1);
                            if (canRenderFace([x, y + 1, z])) addFace(blockType, [x, y, z], 2);
                            if (canRenderFace([x, y - 1, z])) addFace(blockType, [x, y, z], 3);
                            if (canRenderFace([x, y, z + 1])) addFace(blockType, [x, y, z], 4);
                            if (canRenderFace([x, y, z - 1])) addFace(blockType, [x, y, z], 5);
                        } else {
                            for (let face = 0; face < blockType.vertexPositions.length; face++) {
                                addFace(blockType, [x, y, z], face);
                            }
                        }
                    }
                }
            }
        }

        postMessage({
            type: "meshUpdate",
            vertexPositions: meshVertexPositions,
            texCoords: meshTexCoords,
            shadingValues: meshShadingValues,
            meshIndexCounter: meshIndexCounter,
            indices: meshIndices,
            id: id
        });
    }
});