"use strict";

import * as Numbers from "./numbers.js"; // import numbers.js file

class BlockType {
    constructor(
        textureManager,
        name = "uknown",
        blockFaceTextures = { all: "cobblestone" }
    ) {
        this.name = name;

        // set our block type's vertex positions, texture coordinates, and indices to the default values in our numbers.js file

        this.vertexPositions = Numbers.vertexPositions;
        this.texCoords = Numbers.texCoords.slice(); // we need to create a copy of this, since we need to modify our texture coordinates in a different way for each block type (to have different textures per block)
        this.indices = Numbers.indices;

        const setBlockFace = (face, texture) => {
            // set a specific face of the block to a certain texture
            for (let vertex = 0; vertex < 4; vertex++) {
                this.texCoords[face * 12 + vertex * 3 + 2] = texture;
                // invert y axis
                this.texCoords[face * 12 + vertex * 3 + 1] = 1 - this.texCoords[face * 12 + vertex * 3 + 1];
            }
        };

        for (let face in blockFaceTextures) { // go through all the block faces we specified a texture for
            let texture = blockFaceTextures[face]; // get that face's texture
            textureManager.addTexture(texture); // add that texture to our texture manager (the texture manager will make sure it hasn't already been added itself)

            const textureIndex = textureManager.textures.indexOf(texture); // find that texture's index (texture's Z component in our texture array) so that we can modify the texture coordinates of each face appropriately

            if (face == "all") { // set the texture for all faces if "all" is specified
                setBlockFace(0, textureIndex);
                setBlockFace(1, textureIndex);
                setBlockFace(2, textureIndex);
                setBlockFace(3, textureIndex);
                setBlockFace(4, textureIndex);
                setBlockFace(5, textureIndex);
            } else if (face == "sides") { // set the texture for only the sides if "sides" is specified
                setBlockFace(0, textureIndex);
                setBlockFace(1, textureIndex);
                setBlockFace(4, textureIndex);
                setBlockFace(5, textureIndex);
            } else { // set the texture for only one of the sides if one of the sides is specified
                setBlockFace(["right", "left", "top", "bottom", "front", "back"].indexOf(face), textureIndex);
            }
        }
    }
}

export default BlockType;