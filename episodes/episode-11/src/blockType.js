"use strict";

import { Cube } from "./models/models.js";

class BlockType {
    // new optional model argument (cube model by default)
    constructor(
        textureManager,
        name = "uknown",
        blockFaceTextures = { all: "uknown" },
        model = Cube
    ) {
        this.name = name;
        this.model = model;
        this.blockFaceTextures = blockFaceTextures;

        // create members based on model attributes

        this.transparent = model.transparent;
        this.isCube = model.isCube;
        this.glass = model.glass;

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
                for (let i = 0; i < this.texCoords.length; i++) {
                    setBlockFace(i, textureIndex);
                }
            } else if (face == "sides") {
                setBlockFace(0, textureIndex);
                setBlockFace(1, textureIndex);
                setBlockFace(4, textureIndex);
                setBlockFace(5, textureIndex);
            } else if (face == "x") {
                setBlockFace(0, textureIndex);
                setBlockFace(1, textureIndex);
            } else if (face == "y") {
                setBlockFace(2, textureIndex);
                setBlockFace(3, textureIndex);
            } else if (face == "z") {
                setBlockFace(4, textureIndex);
                setBlockFace(5, textureIndex);
            } else {
                setBlockFace(["right", "left", "top", "bottom", "front", "back"].indexOf(face), textureIndex);
            }
        }
    }
}

export default BlockType;