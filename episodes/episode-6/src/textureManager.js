"use strict";

import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

class TextureManager {
    constructor(textureWidth, textureHeight, maxTextures) {
        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;

        this.maxTextures = maxTextures;

        this.textures = []; // an array to keep track of the textures we've already added

        this.textureArray = gl.createTexture(); // create our texture array
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.textureArray);

        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage3D( // set the dimensions of our texture array
            gl.TEXTURE_2D_ARRAY,
            0,
            gl.RGBA,
            this.textureWidth,
            this.textureHeight,
            this.maxTextures,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );
    }

    generateMipmaps() {
        gl.generateMipmap(gl.TEXTURE_2D_ARRAY); // generate mipmaps for our texture
    }

    addTexture(texture) {
        if (!this.textures.includes(texture)) { // check to see if our texture has not yet been added
            this.textures.push(texture); // add it to our textures list if not
        }
    }

    async loadTexture(texture) {
        const textureImage = await pygletAdapter.image.load(`src/textures/${texture}.png`); // load and get the image data of the texture we want

        gl.texSubImage3D( // paste our texture's image data in the appropriate spot in our texture array
            gl.TEXTURE_2D_ARRAY, 0,
            0, 0, this.textures.indexOf(texture),
            this.textureWidth, this.textureHeight, 1,
            gl.RGBA, gl.UNSIGNED_BYTE,
            textureImage
        ); 
    }

    async loadTextures() {
        await Promise.all(this.textures.map(this.loadTexture.bind(this)));
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.textureArray);
    }
}

export default TextureManager;