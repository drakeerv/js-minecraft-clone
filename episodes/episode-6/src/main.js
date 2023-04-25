"use strict";

import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

import Shader from "./shader.js";
import Camera from "./camera.js";

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

        // load all at once
        await this.textureManager.loadTextures();
        this.textureManager.generateMipmaps();
        
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

        // create shader

        this.shader = new Shader("./src/vert.glsl", "./src/frag.glsl");
        await this.shader.loadShaders();
        this.shaderSamplerLocation = this.shader.findUniform("texture_array_sampler");
        this.shader.use();

        // pyglet stuff
        
        pygletAdapter.clock.scheduleInterval(this.update.bind(this), 1000 / 60);
        this.mouseCaptured = false;

        // camera stuff

        this.camera = new Camera(this.shader, 0, 0);

        // enable gl stuff

        gl.enable(gl.DEPTH_TEST);

        // texture stuff
        
        gl.uniform1i(this.shaderSamplerLocation, 0);

        // set clear color
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }

    async update(deltaTime) {
        if (!this.mouseCaptured) {
            this.camera.input = [0, 0, 0];
        }

        this.camera.updateCamera(deltaTime);
    }

    async onDraw() {
        this.camera.updateMatrices();

        // draw stuff

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawElements(
            gl.TRIANGLES,
            this.grass.indices.length,
            gl.UNSIGNED_INT,
            0);
    }

    // input functions
    
    async onResize(width, height) {
        console.log(`Resize ${width} * ${height}`);
        gl.viewport(0, 0, width, height);

        this.camera.width = width;
        this.camera.height = height;
    }

    async onMousePress() {
        this.mouseCaptured = !this.mouseCaptured;
        this.setExclusiveMouse(this.mouseCaptured);
    }

    async onMouseMotion(_, __, deltaX, deltaY) {
        if (this.mouseCaptured) {
            const sensetivity = 0.004;

            this.camera.rotation[0] -= deltaX * sensetivity; // this needs to be negative since turning to the left decreases delta_x while increasing the x rotation angle
            this.camera.rotation[1] += deltaY * sensetivity;

            this.camera.rotation[1] = Math.max(-(Math.PI / 2), Math.min((Math.PI / 2), this.camera.rotation[1])) // clamp the camera's up / down rotation so that you can't snap your neck
        }
    }

    async onKeyPress(key) {
        if (!this.mouseCaptured) {
            return;
        }

        if (key == "KeyD" && this.camera.input[0] <= 0) {
            this.camera.input[0] += 1;
        } else if (key == "KeyA" && this.camera.input[0] >= 0) {
            this.camera.input[0] -= 1;
        } else if (key == "KeyW" && this.camera.input[2] <= 0) {
            this.camera.input[2] += 1;
        } else if (key == "KeyS" && this.camera.input[2] >= 0) {
            this.camera.input[2] -= 1;
        } else if (key == "Space" && this.camera.input[1] <= 0) {
            this.camera.input[1] += 1;
        } else if ((key == "ShiftLeft" || key == "KeyC") && this.camera.input[1] >= 0) {
            this.camera.input[1] -= 1;
        }
    }

    async onKeyPress(key) {
        if (!this.mouseCaptured) {
            return;
        }

        if (key == "KeyD" && this.camera.input[0] <= 0) {
            this.camera.input[0] += 1;
        } else if (key == "KeyA" && this.camera.input[0] >= 0) {
            this.camera.input[0] -= 1;
        } else if (key == "KeyW" && this.camera.input[2] <= 0) {
            this.camera.input[2] += 1;
        } else if (key == "KeyS" && this.camera.input[2] >= 0) {
            this.camera.input[2] -= 1;
        } else if (key == "Space" && this.camera.input[1] <= 0) {
            this.camera.input[1] += 1;
        } else if ((key == "ShiftLeft" || key == "KeyC") && this.camera.input[1] >= 0) {
            this.camera.input[1] -= 1;
        }
    }

    async onKeyRelease(key) {
        if (!this.mouseCaptured) {
            return;
        }

        if (key == "KeyD") {
            this.camera.input[0] -= 1;
        } else if (key == "KeyA") {
            this.camera.input[0] += 1;
        } else if (key == "KeyW") {
            this.camera.input[2] -= 1;
        } else if (key == "KeyS") {
            this.camera.input[2] += 1;
        } else if (key == "Space") {
            this.camera.input[1] -= 1;
        } else if ((key == "ShiftLeft" || key == "KeyC") && this.camera.input[1] <= -1) {
            this.camera.input[1] += 1;
        }
    }

    async onPointerLockChange(captured) {
        this.mouseCaptured = captured;
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
