"use strict";

import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

class TextureManager {
    constructor(textureWidth, textureHeight, maxTextures) {
        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;

        this.maxTextures = maxTextures;

        this.textures = [];

        this.textureArray = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.textureArray);

        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage3D(
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
        gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    }

    addTexture(texture) {
        if (!this.textures.includes(texture)) {
            this.textures.push(texture);
        }
    }

    async loadTexture(texture) {
        const textureImage = await pygletAdapter.image.load(`src/textures/${texture}.png`);

        gl.texSubImage3D(
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