"use strict";

import * as Numbers from "./numbers.js";

class BlockType {
    constructor(
        textureManager,
        name = "uknown",
        blockFaceTextures = { all: "cobblestone" }
    ) {
        this.name = name;

        this.vertexPositions = Numbers.vertexPositions;
        this.texCoords = Numbers.texCoords.slice();
        this.indices = Numbers.indices;
        this.shadingValues = Numbers.shadingValues; // set shading values

        const setBlockFace = (face, texture) => {
            for (let vertex = 0; vertex < 4; vertex++) {
                this.texCoords[face * 12 + vertex * 3 + 2] = texture;
            }
        };

        for (let face in blockFaceTextures) {
            let texture = blockFaceTextures[face];
            textureManager.addTexture(texture);

            const textureIndex = textureManager.textures.indexOf(texture);

            if (face == "all") {
                setBlockFace(0, textureIndex);
                setBlockFace(1, textureIndex);
                setBlockFace(2, textureIndex);
                setBlockFace(3, textureIndex);
                setBlockFace(4, textureIndex);
                setBlockFace(5, textureIndex);
            } else if (face == "sides") {
                setBlockFace(0, textureIndex);
                setBlockFace(1, textureIndex);
                setBlockFace(4, textureIndex);
                setBlockFace(5, textureIndex);
            } else {
                setBlockFace(["right", "left", "top", "bottom", "front", "back"].indexOf(face), textureIndex);
            }
        }
    }
}

export default BlockType;