"use strict";

import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

import Shader from "./shader.js";
import Camera from "./camera.js";
import World from "./world.js";
import Hit, {hitRange} from "./hit.js";

class Window extends pygletAdapter.window.Window {
    async init() {
        // create world

        this.world = new World();

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
        gl.enable(gl.CULL_FACE);

        // texture stuff

        gl.uniform1i(this.shaderSamplerLocation, 0);

        // set clear color
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // misc stuff

        this.holding = 7;
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
        this.world.draw();

        gl.finish();
    }

    // input functions
    
    async onResize(width, height) {
        console.log(`Resize ${width} * ${height}`);
        gl.viewport(0, 0, width, height);

        this.camera.width = width;
        this.camera.height = height;
    }

    async onMousePress(x, y, button, modifiers) {
        if (!this.mouseCaptured) {
            this.mouseCaptured = true;
            this.setExclusiveMouse(true);
            return;
        }

        // handle breaking/placing blocks

        const hitCallback = (currentBlock, nextBlock) => {
            if (button == 2) {
                this.world.setBlock(currentBlock, this.holding);
            } else if (button == 0) {
                this.world.setBlock(nextBlock, 0);
            } else if (button == 1) {
                this.holding = this.world.getBlockNumber(nextBlock);
            }
        }

        const hitRay = new Hit(this.world, this.camera.rotation, this.camera.position);

        while (hitRay.distance < hitRange) {
            if (hitRay.step(hitCallback)) {
                break;
            }
        }
    }

    async onMouseMotion(x, y, deltaX, deltaY) {
        if (this.mouseCaptured) {
            const sensetivity = 0.004;

            this.camera.rotation[0] += deltaX * sensetivity;
            this.camera.rotation[1] += deltaY * sensetivity;

            this.camera.rotation[1] = Math.max(-(Math.PI / 2), Math.min((Math.PI / 2), this.camera.rotation[1]));
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
        } else if (key == "Escape") {
            this.mouseCaptured = false;
            this.setExclusiveMouse(false);
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