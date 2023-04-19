"use strict";

import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

class Window extends pygletAdapter.window.Window {
    async onDraw() {
        gl.clearColor(1.0, 0.5, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    async onResize(width, height) {
        console.log(`Resize ${width} * ${height}`);
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