class TextureManager {
    constructor(gl, textureWidth, textureHeight, maxTextures) {
        this.gl = gl;
        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;

        this.maxTextures = maxTextures;

        this.textures = []; // an array to keep track of the textures we've already added

        this.textureArray = this.gl.createTexture(); // create our texture array
        this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.textureArray);

        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        this.gl.texImage3D( // set the dimensions of our texture array
            gl.TEXTURE_2D_ARRAY,
            0,
            gl.RGBA,
            this.textureWidth,
            this.textureHeight,
            this.maxTextures,
            0,
            gl.RGBA,
            gl.GL_UNSIGNED_BYTE,
            null
        );
    }

    generateMipmaps() {
		this.gl.glBindTexture(this.gl.TEXTURE_2D_ARRAY, this.textureArray) // make sure our texture is bound
		this.gl.glGenerateMipmap(this.gl.TEXTURE_2D_ARRAY) // generate mipmaps for our texture
    }

    addTexture(self, texture) {
        if (!this.textures.includes(texture)) { // check to see if our texture has not yet been added
			self.textures.push(texture) // add it to our textures list if not

			const textureImage = pyglet.image.load(f"textures/{texture}.png").get_image_data() # load and get the image data of the texture we want
			this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.textureArray) // make sure our texture array is bound

			this.gl.texSubImage3D( // paste our texture's image data in the appropriate spot in our texture array
				this.gl.TEXTURE_2D_ARRAY, 0,
				0, 0, this.textures.indexOf(texture),
				this.textureWidth, this.textureHeight, 1,
				this.gl.RGBA, this.gl.UNSIGNED_BYTE,
				textureImage.get_data("RGBA", textureImage.width * 4))
        }
    }
}