"use strict";

import * as Cube from "./models/cube.js";

class BlockType {
    // new optional model argument (cube model by default)
    constructor(
        textureManager,
        name = "unknown",
        blockFaceTextures = { all: "cobblestone" },
        model = Cube
    ) {
        this.name = name;

        // create members based on model attributes

        this.transparent = model.transparent;
        this.isCube = model.isCube;

        // replace data contained in numbers.py with model specific data

        this.vertexPositions = model.vertexPositions;
        this.texCoords = model.texCoords.slice();
        this.shadingValues = model.shadingValues;

        const setBlockFace = (face, texture) => {
            // make sure we don't add inexistent faces
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