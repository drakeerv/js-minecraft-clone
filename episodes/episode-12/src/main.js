"use strict";

import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

import Shader from "./shader.js";
import Player, { WALKING_SPEED, SPRINTING_SPEED } from "./player.js";
import Chunk from "./chunk.js";
import World from "./world.js";
import Hit, { hitRange } from "./hit.js";

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

        pygletAdapter.updater.schedule(this.update.bind(this));
        this.mouseCaptured = false;

        // player stuff

        this.player = new Player(this.world, this.shader, this.width, this.height);

        // misc stuff

        this.holding = 44; // 5

        // enable gl stuff

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        // texture stuff

        gl.uniform1i(this.shaderSamplerLocation, 0);

        // set clear color

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // misc stuff

        this.holding = 5;
    }

    async update(deltaTime) {
        if (!this.mouseCaptured) {
            this.player.input = [0, 0, 0];
        }

        this.player.update(deltaTime);
    }

    async onDraw() {
        this.player.updateMatrices();

        // draw stuff

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.world.draw();

        gl.finish();
    }

    // input functions

    async onResize(width, height) {
        console.log(`Resize ${width} * ${height}`);
        gl.viewport(0, 0, width, height);

        this.player.view_width = width;
        this.player.view_height = height;
    }

    async onMousePress(_x, _y, button, modifiers) {
        if (!this.mouseCaptured) {
            this.mouseCaptured = true;
            this.setExclusiveMouse(true);
            return;
        }

        // handle breaking/placing blocks

        const hitCallback = (currentBlock, nextBlock) => {
            if (button == 2) {
                this.world.try_set_block(currentBlock, this.holding, this.player.collider);
            } else if (button == 0) {
                this.world.setBlock(nextBlock, 0);
            } else if (button == 1) {
                this.holding = this.world.getBlockNumber(nextBlock);
            }
        }

        let [x, y, z] = this.player.position;
        y += this.player.eyelevel;

        const hitRay = new Hit(this.world, this.player.rotation, (x, y, z));

        while (hitRay.distance < hitRange) {
            if (hitRay.step(hitCallback)) {
                break;
            }
        }
    }

    async onMouseMotion(_x, _y, deltaX, deltaY) {
        if (this.mouseCaptured) {
            const sensetivity = 0.004;

            this.player.rotation[0] += deltaX * sensetivity;
            this.player.rotation[1] += deltaY * sensetivity;

            this.player.rotation[1] = Math.max(-(Math.PI / 2), Math.min((Math.PI / 2), this.player.rotation[1]));
        }
    }

    async onKeyPress(key) {
        if (!this.mouseCaptured) {
            return;
        }

        if (key == "KeyD" && this.player.input[0] <= 0) {
            this.player.input[0] += 1;
        } else if (key == "KeyA" && this.player.input[0] >= 0) {
            this.player.input[0] -= 1;
        } else if (key == "KeyW" && this.player.input[2] <= 0) {
            this.player.input[2] += 1;
        } else if (key == "KeyS" && this.player.input[2] >= 0) {
            this.player.input[2] -= 1;
        } else if (key == "Space" && this.player.input[1] <= 0) {
            this.player.input[1] += 1;
        } else if ((key == "ShiftLeft" || key == "KeyC") && this.player.input[1] >= 0) {
            this.player.input[1] -= 1;
        } else if ((key == "ControlLeft" || key == "KeyV")) {
            this.player.target_speed = SPRINTING_SPEED;
        } else if (key == "KeyF") {
            this.player.flying = !this.player.flying;
        } else if (key == "KeyG") {
            this.holding = pygletAdapter.math.randint(1, this.world.blockTypes.length - 1);
        } else if (key == "KeyO") {
            this.world.save.save();
        } else if (key == "KeyR") {
            // how large is the world?

            let maxY = 0;

            let [maxX, maxZ] = [0, 0];
            let [minX, minZ] = [0, 0];

            for (let pos in this.world.chunks) {
                let [x, y, z] = pos.split(",").map(Number);

                maxY = Math.max(maxY, (y + 1) * Chunk.CHUNK_HEIGHT);

                maxX = Math.max(maxX, (x + 1) * Chunk.CHUNK_WIDTH);
                minX = Math.min(minX, x * Chunk.CHUNK_WIDTH);

                maxZ = Math.max(maxZ, (z + 1) * Chunk.CHUNK_LENGTH);
                minZ = Math.min(minZ, z * Chunk.CHUNK_LENGTH);
            }

            // get random X & Z coordinates to teleport the player to

            const x = pygletAdapter.math.randint(minX, maxX);
            const z = pygletAdapter.math.randint(minZ, maxZ);

            // find height at which to teleport to, by finding the first non-air block from the top of the world

            for (let y = Chunk.CHUNK_HEIGHT - 1; y >= 0; y--) {
                if (!this.world.getBlockNumber([x, y, z])) {
                    continue;
                }
                this.player.teleport([x, y + 1, z]);
                break;
            }
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
            this.player.input[0] -= 1;
        } else if (key == "KeyA") {
            this.player.input[0] += 1;
        } else if (key == "KeyW") {
            this.player.input[2] -= 1;
        } else if (key == "KeyS") {
            this.player.input[2] += 1;
        } else if (key == "Space") {
            this.player.input[1] -= 1;
        } else if ((key == "ShiftLeft" || key == "KeyC") && this.player.input[1] <= -1) {
            this.player.input[1] += 1;
        } else if ((key == "ControlLeft" || key == "KeyV")) {
            this.player.target_speed = WALKING_SPEED;
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