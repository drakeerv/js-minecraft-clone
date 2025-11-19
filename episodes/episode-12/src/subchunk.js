"use strict";

const subchunkWidth = 4;
const subchunkHeight = 4;
const subchunkLength = 4;

class Subchunk {
    constructor(parent, subchunkPosition) {
        this.parent = parent;
        this.world = this.parent.world;

        this.subchunkPosition = subchunkPosition;

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

    updateMesh() {
        this.meshVertexPositions = [];
        this.meshTexCoords = [];
        this.meshShadingValues = [];

        this.meshIndexCounter = 0;
        this.meshIndices = [];

        const addFace = (blockType, position, face) => {
            const vertexPositions = blockType.vertexPositions[face].slice();

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
        };

        for (let localX = 0; localX < subchunkWidth; localX++) {
            for (let localY = 0; localY < subchunkHeight; localY++) {
                for (let localZ = 0; localZ < subchunkLength; localZ++) {
                    const parentlx = this.localPosition[0] + localX;
                    const parently = this.localPosition[1] + localY;
                    const parentlz = this.localPosition[2] + localZ;

                    const blockNumber = this.parent.blocks[parentlx][parently][parentlz];

                    if (blockNumber) {
                        const blockType = this.world.blockTypes[blockNumber];

                        let x, y, z;
                        [x, y, z] = [
                            this.position[0] + localX,
                            this.position[1] + localY,
                            this.position[2] + localZ
                        ]

                        const canRenderFace = (position) => {
                            if (!this.world.isOpaqueBlock(position)) {
                                if (blockType.glass && this.world.getBlockNumber(position) == blockNumber) {
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
    }
}

export default Subchunk;
export { subchunkWidth, subchunkHeight, subchunkLength };