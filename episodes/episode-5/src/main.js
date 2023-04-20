"use strict";

import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

import Shader from "./shader.js";
import Matrix from "./matrix.js";

import BlockType from "./blockType.js";
import TextureManager from "./textureManager.js";

class Window extends pygletAdapter.window.Window {
    async init() {
        // create blocks

        this.textureManager = new TextureManager(16, 16, 256); // create our texture manager (256 textures that are 16 x 16 pixels each)

        this.cobblestone = new BlockType(this.textureManager, "cobblestone", { "all": "cobblestone" }); // create each one of our blocks with the texture manager and a list of textures per face
        this.grass = new BlockType(this.textureManager, "grass", { "top": "grass", "bottom": "dirt", "sides": "grass_side" });
        this.dirt = new BlockType(this.textureManager, "dirt", { "all": "dirt" });
        this.stone = new BlockType(this.textureManager, "stone", { "all": "stone" });
        this.sand = new BlockType(this.textureManager, "sand", { "all": "sand" });
        this.planks = new BlockType(this.textureManager, "planks", { "all": "planks" });
        this.log = new BlockType(this.textureManager, "log", { "top": "log_top", "bottom": "log_top", "sides": "log_side" });

        this.textureManager.generateMipmaps() // generate mipmaps for our texture manager's texture

        // create vertex array object

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // create vertex position vbo

        this.vertexPositionVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionVbo);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.grass.vertexPositions), gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        // create tex coord vbo

        this.texCoordVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordVbo);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.grass.texCoords), gl.STATIC_DRAW);

        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        // create index buffer object

        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.grass.indices), gl.STATIC_DRAW);

        // enable gl stuff

        gl.enable(gl.DEPTH_TEST); // enable depth testing so faces are drawn in the right order

        // create shader

        this.shader = new Shader("./src/vert.glsl", "./src/frag.glsl");
        await this.shader.loadShaders();
        this.shaderMatrixLocation = this.shader.findUniform("matrix");
        this.shaderSamplerLocation = this.shader.findUniform("texture_array_sampler");
        this.shader.use();

        // create matrices

        this.mvMatrix = new Matrix(); // modelview
        this.pMatrix = new Matrix(); // projection

        this.x = 0; // temporary variable

        pygletAdapter.clock.scheduleInterval(this.update.bind(this), 1000 / 60);
    }

    async update(deltaTime) {
        this.x += deltaTime;
    }

    async onDraw() {
        // create projection matrix

        this.pMatrix.loadIdentity();
        this.pMatrix.perspective(90, gl.canvas.width / gl.canvas.height, 0.1, 500);

        // create model view matrix

        this.mvMatrix.loadIdentity();
        this.mvMatrix.translate(0, 0, -3);
        this.mvMatrix.rotate2d(this.x, Math.sin(this.x / 3 * 2) / 2);

        // modelviewprojection matrix

        const mvpMatrix = this.pMatrix.multiply(this.mvMatrix);
        this.shader.uniformMatrix(this.shaderMatrixLocation, mvpMatrix.data);

        // bind textures

        gl.activeTexture(gl.TEXTURE0); // set our active texture unit to the first texture unit
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.textureManager.textureArray); // bind our texture manager's texture
        gl.uniform1i(this.shaderSamplerLocation, 0); // tell our sampler our texture is bound to the first texture unit

        // draw stuff

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawElements(
            gl.TRIANGLES,
            this.grass.indices.length,
            gl.UNSIGNED_INT,
            0);
    }

    async onResize(width, height) {
        console.log(`Resize ${width} * ${height}`);
        gl.viewport(0, 0, width, height);
    }
}

class Game {
    constructor() {
        this.window = new Window();
    }

    run() {
        this.window.run();
    }
}

const game = new Game();
game.run();