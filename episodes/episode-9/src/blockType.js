"use strict";

import * as Cube from "./models/cube.js";

class BlockType {
    constructor(
        textureManager,
        name = "uknown",
        blockFaceTextures = { all: "cobblestone" },
        model = Cube
    ) {
        this.name = name;

        this.transparent = model.transparent;
        this.isCube = model.isCube;

        this.vertexPositions = model.vertexPositions;
        this.texCoords = model.texCoords.slice();
        this.shadingValues = model.shadingValues; // set shading values

        const setBlockFace = (face, texture) => {
            if (face > this.texCoords.length - 1) return;

            this.texCoords[face] = this.texCoords[face].slice();

            for (let vertex = 0; vertex < 4; vertex++) {
                this.texCoords[face][vertex * 3 + 2] = texture;
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